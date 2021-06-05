const { TWEEN,w } = require('../utils/import')
const S = require("../ts/createScene"); // 引入场景模块
const roles = require("../ts/createRoles") // 引入角色创建模块
const getRandomNumber = require('../utils/random') // 引入随机数方法
const s = new S(); // 初始化场景
(window as any).s = s
const steep = 10 // 主角与敌人的移动跨度
const createEnemyTime = 1000 // 创建敌人的时间间隔
// 主角实例
const handleLead = new roles.lead()
const lead = handleLead.create() // 创建一个主角
lead.name = 'lead'
s.scene.add(lead)


const enemyGroup: THREE.Group = new THREE.Group() // 创建一个放敌人的group
enemyGroup.name = 'enemyGroup'
s.scene.add(enemyGroup)

const bulletGroup: THREE.Group = new THREE.Group() // 创建一个放子弹的group
bulletGroup.name = 'bulletGroup'
s.scene.add(bulletGroup)



// 随机创建一个敌人
function createEnemy() {
    // 敌人实例
    const handleEnemy = new roles.enemy()
    const enemy = handleEnemy.create()
    const x = getRandomNumber(s.minX, s.maxX)
    enemy.position.set(x, s.y, 0)
    enemy.rotation.x = Math.PI
    enemy.name = 'enemy'
    handleEnemy.move(steep)
    enemyGroup.add(enemy)
}
createEnemy()
// 创建一个interval 在角色判定死亡销毁  
const createEnemyInterval = setInterval(createEnemy, createEnemyTime)

// 移动主角
function moveLead(e: KeyboardEvent) {
    switch (e.keyCode) {
        case 37:
            handleLead.move(-steep)
            break
        case 39:
            handleLead.move(steep)
            break
    }
}

// 监听键盘 移动主角
window.addEventListener('keydown', moveLead)





