const O = require('three/examples/jsm/controls/OrbitControls')

module.exports = class S {
    scene: THREE.Scene = new THREE.Scene()
    camera: THREE.OrthographicCamera
    renderer: THREE.WebGLRenderer
    dom: HTMLDivElement = document.querySelector('#dom') // 渲染3d世界的容器
    width: number = this.dom.offsetWidth // 渲染dom的宽度
    height: number = this.dom.offsetHeight // 渲染dom的高度
    frustumSize: number = 2000 // 远端面
    controls: any
    cameraH: number = 300
    constructor() {
        this.init()
    }
    init(): void {
        // console.log(TWEEN)
        this.create()
    }
    create(): void {
        this.initScene() // 初始化场景

        this.initCamera() // 初始化相机

        this.initRender()  // 初始化渲染器

        // this.initControls() // 初始化控制器

        this.axesHelper(300) // 初始化坐标轴辅助线

        this.animate() // 循环渲染

    }

    // 创建坐标轴辅助线
    axesHelper(len: number): void {
        const axesHelper = new THREE.AxesHelper(len);
        this.scene.add(axesHelper);
    }

    // 初始化场景
    initScene(): void {
        this.scene.background = new THREE.Color(0xdedede)
    }

    // 渲染器
    initRender(): void {

        this.renderer = new THREE.WebGLRenderer();

        this.renderer.setPixelRatio(window.devicePixelRatio); // 设置设备像素比。通常用于避免HiDPI设备上绘图模糊

        this.renderer.setSize(this.width, this.height);

        this.dom.appendChild(this.renderer.domElement);

        if (this.controls) {
            this.controls.update()
        }
    }

    // 初始化相机
    initCamera(): void {
        this.camera = new THREE.OrthographicCamera(this.width / - 2, this.width / 2, this.height / 2, this.height / - 2, 1, this.frustumSize);
        this.camera.zoom = 1
        this.camera.position.set(0, this.cameraH, 100) // 将视角调整为平视y为250的高度
        this.scene.add(this.camera);
        this.camera.lookAt(0, this.cameraH, 0)
        this.camera.updateProjectionMatrix()
    }

    // 初始化控制器
    initControls(): void {
        this.controls = new O.OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.screenSpacePanning = true
    }
    // 渲染动画
    animate(): void {
        requestAnimationFrame(this.animate.bind(this));  // requestAnimationFrame方法接受的是一个方法，在内部this指针改变了，所以要将this指针指向当前实例
        // TWEEN.update()
        // const enemyGroup = this.scene.getObjectByName('enemyGroup') // 通过名字查找敌人的组
        // const lead = this.scene.getObjectByName('lead') // 通过名字查找主角
        // if(enemyGroup&&enemyGroup.children.length!==0) {
        //     for(let i=0; i<enemyGroup.children.length; i++) {
        //         const e = enemyGroup.children[i] as THREE.Mesh
        //         if(e.isMesh && lead) {
        //             const lP = lead.position
        //             e.lookAt(0,0,0)
        //         }
        //     }
        // }
        this.renderer.render(this.scene, this.camera);
    }
}
