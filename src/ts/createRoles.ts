let launchInterval = null // 创建子弹的循环  判定游戏结束后要清掉
class PublicRules {
    w: number // 角色的宽度
    h: number // 角色的高度
    cone: THREE.Mesh // 创建的角色
    tween = null // 创建补间动画
    track: boolean = false // 是否为追踪蛋
    shrapnel: boolean = false // 是否为霰弹
    /**
     * 
     * @param w 角色的宽度
     * @param h 角色的高度
     */
    constructor(w: number, h: number) {
        this.w = w
        this.h = h
    }


    // 创建角色的公共方法
    /**
     * 
     * @returns 返回角色几何体实例
     */

    create(name?: string): THREE.Mesh {
        const geometry = new THREE.CylinderGeometry(0, this.w, this.h, 4);
        const material = new THREE.MeshNormalMaterial();
        const cone = new THREE.Mesh(geometry, material);
        cone.name = name
        this.cone = cone
        /**
         * todo 没找到怎么向一个已有的数据格式添加新的属性，用过interface 加extends 不好使
         * 原有的THREE.Mesh不存在box属性
         */
        cone['box'] = new THREE.Box3() as THREE.Box3 // 创建用于检测角色之间是否有相交点的包围盒
        return cone
    }

    // 移动的公共方法
    /**
     * 
     * @param steep 物体移动的步幅
     */
    move(steep: number) {
        const p = this.cone.position
        if (this.cone.name === 'lead') {

            const s = (window as any).s

            // 判定主角移动位置  超出 范围 不执行移动动画
            if (p.x < s.maxX - steep && p.x > s.minX - steep) {

                if (p.x <= s.minX + steep) p.x = s.minX + steep

                if (p.x >= s.maxX + steep) p.x = s.maxX + steep

                const end = p.clone().setX(p.x + steep)

                // 定义动画。用于取消角色运动
                this.tween = run(p, end, 100) // 主角运动
            }
        } else if (this.cone.name === 'enemy') {
            const end = p.clone().setY(s.cordonY)
            this.tween = run(p, end, 10000, undefined, removeObject.bind(this, this.cone)) // 敌人运动
        }
    }

    // 创建子弹
    /**
     * 
     * @param position 创建子弹的位置  来源于主角移动后的位置
     * @returns        返回子弹几何体实例
     */
    createBullet(position: THREE.Vector3): THREE.Mesh {
        const geometry = new THREE.SphereGeometry(2, 32, 32);

        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });

        const bullet = new THREE.Mesh(geometry, material);

        bullet.position.copy(position.clone())

        bullet['box'] = new THREE.Box3() as THREE.Box3 // 创建用于检测角色之间是否有相交点的包围盒

        return bullet
    }

    /**
     检测相交方法
     检测一对多，一个子弹检测多个敌人 ， 
     * @param position    检测的点位
     * @param child       被检测的主体集合
     * @returns           option {isIn: boolean, mesh: 有交集的几何体}
     */
    testing(position: THREE.Vector3, group: THREE.Group): { isIn: boolean, mesh: THREE.Mesh } {

        let isIn: boolean = false // 如果有交集 返回true

        let mesh = null// 有交集的几何体

        for (let i = 0; i < group.children.length; i++) {

            const child = group.children[i]

            if (child instanceof THREE.Mesh) {

                child['box'].expandByObject(child) // 将包围盒设置为被检测主体

                // 检测主体是否经过
                const is = child['box'].containsPoint(position)

                if (is) {

                    isIn = is

                    mesh = child

                    break
                }
            }

        }
        return { isIn, mesh }
    }
    // 计算圆弧上的点
    computeArc(x: number, y: number): THREE.Vector3[] {
        // x起点，y起点，半径，圆弧起点  圆弧终点，是否逆时针角度
        var arc = new THREE.ArcCurve(x, y, 800, 0, -Math.PI, false);
        var points = arc.getPoints(60);//分段数60，返回61个顶
        let vArr = []
        points.forEach((v: THREE.Vector2) => {
            vArr.push(new THREE.Vector3(v.x, v.y, 0))
        })
        return vArr

    }
}

// 运动函数
/**
 * 
 * @param start     起始位置
 * @param end       结束位置
 * @param time      运动时间
 * @param updateCb  运动过程的回调
 * @param endCb     运动结束的回调
 * @returns 
 */
function run(start: THREE.Vector3, end: THREE.Vector3, time: number, updateCb?: Function | null | undefined, endCb?: Function | null | undefined) {
    // 获取敌人组
    const enemyGroup = s.scene.getObjectByName('enemyGroup')

    const tween = new TWEEN.Tween(start)
        .to(end, time)
    tween.start() // 动画开始

    if (updateCb) { // 过程中的回调

        tween.onUpdate((v3: THREE.Vector3) => {

            const { isIn, mesh } = updateCb(v3, enemyGroup)

            if (isIn) {
                mesh['die'] = true
                removeObject(mesh) // 删除敌人

                endCb(mesh) // 删除子弹 之前this重新绑定过，传来的参数就是子弹实例

                tween.stop() // 运动结束，取消动画 可用TWEEN.getAll()查看
            }
        })
    }

    // 结束的回调
    if (endCb) {

        tween.onComplete((object: THREE.Object3D) => {
            endCb(object)

            tween.stop() // 运动结束，取消动画 可用TWEEN.getAll()查看

        })
    }

    return tween

}

// 从组中删除某一项元素
/**
 * 
 * @param object 被删除的项
 */

function removeObject(object: THREE.Object3D) {
    const s = (window as any).s
    if (object.parent) {
        // 判断运动结束的敌人
        if (object.name === 'enemy' && !object['die']) {
            gameOver()
        }

        object.parent.remove(object) // 通过元素的父元素删除元素

    }
}

// 游戏结束
function gameOver() {

    TWEEN.removeAll() // 暂停所有补间动画

    clearInterval(s.createEnemyInterval) // 清除创建敌人的interval

    clearInterval(launchInterval) // 清除创建子弹发射的intaval

    const gameOver: HTMLDivElement = document.querySelector('#game-over') // 获取游戏结束dom
    
    if (gameOver) {

        gameOver.style.display = 'block' // 显示游戏结束dom

    }
}
module.exports = {

    lead: class Lead extends PublicRules {

        bulletRunTime: number = 2000

        launchTime: number = 500 // 子弹创建时间间隔

        constructor() {

            super(10, 50)

            this.launch() // 创建角色后  创建子弹

        }
        // 主角发射子弹   
        launch() {
            // 创建子弹
            this.createInterval()
        }
        // 高速发射
        speetUp() {
            this.changeSpeet(50)
        }

        // 改变发射子弹速度
        changeSpeet(speet: number) {
            this.launchTime = speet

            if (launchInterval) clearInterval(launchInterval)

            this.createInterval()
        }
        // 追踪蛋
        trackBullet() {
            this.track = true
        }
        // 霰弹突突突
        shrapnelBullet() {
            this.shrapnel = true
        }
        // 困难模式
        difficultyMode() {
            const s = (window as any).s
            s.cordonY = s.cordonY + s.y / 2
            s.moveLine(s.cordonY)
        }
        // 寻找最近的敌人
        findNearestEnemy(group: THREE.Group): THREE.Vector3 {

            const p = new THREE.Vector3()

            // 按理说 第一个就是最近的
            if (group.children[0]) { // 判断是否有最近的，高速发射的情况下 会出现没有敌人的情况

                p.copy(group.children[0].position)
                
            }
            // p.sub(this.cone.position.clone())
            /**
             // 这个方法是通过循环找到最近的敌人
             let minl = Number.MAX_VALUE
             let enemy: THREE.Mesh
             let leadP = this.cone.position
             for(let i=0;i<group.children.length; i++) {
                 const child = group.children[i] as THREE.Mesh
                 const childP = child.position
                 const length = childP.distanceTo(leadP)
                 if(length<minl) {
                     minl = length
                     enemy = child
                 }
             }
             enemy.getWorldPosition(p)
             */

            //  解直线方程，让终点值设置到从主角到敌人延长线的位置  
            //  避免子弹在敌人运动的时候够不着敌人
            let c = this.cone.position
            let x1 = c.x
            let y1 = c.y
            let x2 = p.x
            let y2 = p.y

            let A = y2 - y1
            let B = x1 - x2
            let C = x2 * y1 - x1 * y2

            let Y = p.clone().y + 200
            // A*X+B*Y+C=0
            let X = (0 - B * Y - C) / A

            p.x = X
            p.y = Y
            return p
        }
        // 创建interval
        createInterval() {

            const s = (window as any).s
            launchInterval = setInterval(() => {


                // 创建一发子弹
                const bullet = this.createBullet(this.cone.position.clone());

                // 将子弹添加到子弹组中
                const bulletGroup = s.scene.getObjectByName('bulletGroup')

                bulletGroup.add(bullet) // 将子弹添加到子弹的组里

                const bp = bullet.position  // 获取子弹初始位置
                // console.log(bp)
                let end = bp.clone().setY(s.y) // 设置子弹目标位置

                // this.track  如果true 追踪到最近的敌人  false 正常向前
                if (this.track) {
                    // 获取敌人组
                    const enemyGroup = s.scene.getObjectByName('enemyGroup')

                    end = this.findNearestEnemy(enemyGroup) // 获取到最近的敌人的坐标

                }
                // 如果是霰弹
                if (this.shrapnel) {
                    this.track = false // 如果是霰弹，取消追踪蛋buff 
                    this.launchTime = 500
                    this.changeSpeet(this.launchTime)
                    // 获取圆弧上的点集合
                    const vs = this.computeArc(this.cone.position.x, this.cone.position.y) as THREE.Vector3[]

                    for (let i = 0; i < vs.length; i++) {

                        const v = vs[i] // 获取每一个点

                        const newB = bullet.clone() // 新建一个子弹的副本

                        bulletGroup.add(newB)  // 将子弹添加到子弹组

                        const nbp = newB.position // 将子弹位置设置为起点  圆弧某一点设为终点

                        const tween = run(nbp, v, this.bulletRunTime, this.testing, removeObject.bind(this, newB)) // 子弹开始运动

                    }
                } else {
                    const tween = run(bp, end, this.bulletRunTime, this.testing, removeObject.bind(this, bullet)) // 子弹开始运动
                }


            }, this.launchTime)
        }

    },
    enemy: class Enemy extends PublicRules {
        constructor() {
            super(5, 25)
        }
    }
}
