class PublicRules {
    w: number
    h: number
    cone: THREE.Mesh

    constructor(w: number, h: number) {
        this.w = w
        this.h = h
    }
    create(): THREE.Mesh {
        const geometry = new THREE.ConeGeometry(this.w, this.h, 4);
        const material = new THREE.MeshNormalMaterial();
        const cone = new THREE.Mesh(geometry, material);
        this.cone = cone
        return cone
    }
    move(steep: number) {
        if (this.cone.name === 'lead') {
            this.cone.position.setX(this.cone.position.x + steep)
        } else if (this.cone.name === 'enemy') {
            // console.log(TWEEN)
            this.cone.position.setY(this.cone.position.y - steep)
        }
    }
}

module.exports = {
    /**
     * name
     */
    lead: class Lead extends PublicRules {
        constructor() {
            super(10, 50)
        }

    },
    enemy: class Enemy extends PublicRules {
        constructor() {
            super(5, 25)
        }
    }
}