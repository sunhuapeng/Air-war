// const TWEEN = require('@tweenjs/tween.js')

const S = require("../ts/createScene"); // 引入场景模块
const roles = require("../ts/createRoles") // 引入角色创建模块
const getRandomNumber = require('../utils/random') // 引入随机数方法
const s = new S() // 初始化场景

const steep = 1 // 主角与敌人的移动跨度

// 主角实例
const handleLead = new roles.lead()
const lead = handleLead.create() // 创建一个主角
lead.name = 'lead'
s.scene.add(lead)



const enemyGroup: THREE.Group = new THREE.Group() // 创建一个放敌人的group
enemyGroup.name = 'enemyGroup'
s.scene.add(enemyGroup)

const y = 600  // 敌人初始y轴位置
const maxX = 150
const minX = -150

// 随机创建一个敌人
function createEnemy() {
    // 敌人实例
    const handleEnemy = new roles.enemy()
    const enemy = handleEnemy.create()
    const x = getRandomNumber(minX, maxX)
    enemy.position.set(x, y, 0)
    enemy.rotation.x = Math.PI
    enemy.name = 'enemy'
    handleEnemy.move(steep)
    enemyGroup.add(enemy.clone())
}
createEnemy()
// 创建一个interval 在角色判定死亡销毁  
const createEnemyInterval = setInterval(createEnemy, 5000)

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





