const { OrbitControls } = require('three/examples/jsm/controls/OrbitControls')

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
    i = 0
    y = 600  // 敌人初始y轴位置
    maxX = 150
    minX = -150
    cordonLine = null
    createEnemyInterval = null // 创建敌人的interval
    cordonY = 35 // 警戒线高度  随着警戒线高度的提高，难度增加，飞机运行距离缩短
    constructor() {
        console.log(TWEEN)
        this.init()
    }
    init(): void {

        this.create()
    }
    create(): void {
        this.initScene() // 初始化场景

        this.initCamera() // 初始化相机

        this.initRender()  // 初始化渲染器

        // this.initControls() // 初始化控制器

        // this.axesHelper(300) // 初始化坐标轴辅助线

        this.animate() // 循环渲染

        this.initCordon() // 创建主角失败区域

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
    // 初始化警戒线
    initCordon(): void {
        const material = new THREE.LineBasicMaterial({
            color: 0xff0000
        });

        const points = [];
        points.push(new THREE.Vector3(this.minX, this.cordonY, 0));
        points.push(new THREE.Vector3(this.maxX, this.cordonY, 0));

        const geometry = new THREE.BufferGeometry().setFromPoints(points);

        this.cordonLine = new THREE.Line(geometry, material);
        this.scene.add(this.cordonLine);
    }
    moveLine(y:number){
        this.cordonLine.position.setY(y)
    }
    // 初始化控制器
    initControls(): void {
        this.controls = new OrbitControls(
            this.camera,
            this.renderer.domElement
        );
        this.controls.screenSpacePanning = true
    }
    // 渲染动画
    animate(): void {
        requestAnimationFrame(this.animate.bind(this));  // requestAnimationFrame方法接受的是一个方法，在内部this指针改变了，所以要将this指针指向当前实例

        TWEEN.update() // 更新补间动画

        this.renderer.render(this.scene, this.camera);
    }
}
