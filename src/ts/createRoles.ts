

class PublicRules {
    w: number // 角色的宽度
    h: number // 角色的高度
    cone: THREE.Mesh // 创建的角色
    tween = null // 创建补间动画
    track: boolean = false // 是否为追踪蛋
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

    create(): THREE.Mesh {
        const geometry = new THREE.ConeGeometry(this.w, this.h, 4);
        const material = new THREE.MeshNormalMaterial();
        const cone = new THREE.Mesh(geometry, material);
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
            const end = p.clone().setX(p.x + steep)
            // 定义动画。用于取消角色运动
            this.tween = run(p, end, 100) // 主角运动
        } else if (this.cone.name === 'enemy') {
            const end = p.clone().setY(0)
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

    if (object.parent) {

        object.parent.remove(object) // 通过元素的父元素删除元素

    }
}
module.exports = {

    lead: class Lead extends PublicRules {


        bulletRunTime: number = 2000

        launchTime: number = 500 // 子弹创建时间间隔

        launchInterval = null // 创建子弹的循环  判定游戏结束后要清掉

        constructor() {

            super(10, 50)

            this.launch() // 创建角色后  创建子弹

        }
        // 主角发射子弹   
        /**
         * 
         * @param bulletRunTime 子弹运行时间
         */
        launch() {
            // 创建子弹
            this.createInterval()
        }
        // 高速发射
        speetUp() {
            this.launchTime = 50
            if (this.launchInterval) clearInterval(this.launchInterval)
            this.createInterval()
        }
        // 追踪蛋
        trackBullet() {
            this.track = true
        }
        // 寻找最近的敌人
        findNearestEnemy(group: THREE.Group): THREE.Vector3 {
            // console.log(this.cone)
            const p = new THREE.Vector3()

            // 按理说 第一个就是最近的
            if (group.children[0]) { // 判断是否有最近的，高速发射的情况下 会出现没有敌人的情况

                group.children[0].getWorldPosition(p)

            }

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

            p.setLength(1000) // 延长一段距离 省的够不到敌人
            return p
        }
        // 创建interval
        createInterval() {

            this.launchInterval = setInterval(() => {

                const s = (window as any).s

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
                const tween = run(bp, end, this.bulletRunTime, this.testing, removeObject.bind(this, bullet)) // 子弹开始运动

            }, this.launchTime)
        }

    },
    enemy: class Enemy extends PublicRules {
        constructor() {
            super(5, 25)
        }
    }
}
