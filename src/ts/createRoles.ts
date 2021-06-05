class PublicRules {
    w: number
    h: number
    cone: THREE.Mesh

    constructor(w: number, h: number) {
        this.w = w
        this.h = h
    }

    // 创建角色的公共方法
    create(): THREE.Mesh {
        const geometry = new THREE.ConeGeometry(this.w, this.h, 4);
        const material = new THREE.MeshNormalMaterial();
        const cone = new THREE.Mesh(geometry, material);
        this.cone = cone
        return cone
    }

    // 移动的公共方法
    move(steep: number) {
        const p = this.cone.position
        if (this.cone.name === 'lead') {
            const end = p.clone().setX(p.x + steep)
            const tween = run(p, end, 100) // 主角运动
        } else if (this.cone.name === 'enemy') {
            const end = p.clone().setY(0)
            const tween = run(p, end, 10000, undefined, this.removeObject.bind(this, this.cone)) // 敌人运动
        }
    }

    // 创建子弹
    createBullet(position: THREE.Vector3) {
        const geometry = new THREE.SphereGeometry(2, 32, 32);
        const material = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const bullet = new THREE.Mesh(geometry, material);
        bullet.position.copy(position.clone())
        return bullet
    }

    // 从组中删除某一项元素
    removeObject(object: THREE.Object3D) {
        if (object.parent) {
            object.parent.remove(object)
        }
    }
}

// 运动函数
function run(start: THREE.Vector3, end: THREE.Vector3, time: number, updateCb?: Function | null | undefined, endCb?: Function | null | undefined) {
    const tween = new TWEEN.Tween(start)
        .to(end, time)

    tween.start()

    if (updateCb) { // 过程中的回调
        tween.update((e: THREE.Vector3) => {
            updateCb(e)
        })
    }

    // 结束的回调
    if (endCb) {
        tween.onComplete((object: THREE.Object3D) => {
            endCb(object)
        })
    }
    return tween
}

module.exports = {
    /**
     * name
     */
    lead: class Lead extends PublicRules {
        launchTime: number = 500 // 子弹创建时间间隔
        launchInterval = null
        constructor() {
            super(10, 50)
            this.launch(2000)
        }
        // 主角发射子弹   子弹运行时间
        launch(bulletRunTime: number) {
            this.launchInterval = setInterval(() => {
                const s = (window as any).s
                // 创建一发子弹
                const bullet = this.createBullet(this.cone.position.clone());

                // 将子弹添加到子弹组中
                const bulletGroup = s.scene.getObjectByName('bulletGroup')
                bulletGroup.add(bullet) // 将子弹添加到子弹的组里

                const bp = bullet.position  // 获取子弹初始位置
                const end = bp.clone().setY(s.y) // 设置子弹目标位置
                const tween = run(bp, end, bulletRunTime, undefined, this.removeObject.bind(this, bullet)) // 子弹开始运动
            }, this.launchTime)
        }

    },
    enemy: class Enemy extends PublicRules {
        constructor() {
            super(5, 25)
        }
    }
}
