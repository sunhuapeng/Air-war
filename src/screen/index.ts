const { TWEEN, w } = require('../utils/import')
const S = require("../ts/createScene"); // 引入场景模块
const roles = require("../ts/createRoles") // 引入角色创建模块
const getRandomNumber = require('../utils/random') // 引入随机数方法
const s = new S(); // 初始化场景
(window as any).s = s
const steep = 10 // 主角与敌人的移动跨度
let createEnemyTime = 1000 // 创建敌人的时间间隔
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
    const enemy = handleEnemy.create('enemy')
    const x = getRandomNumber(s.minX, s.maxX)
    enemy.position.set(x, s.y, 0)
    enemy.rotation.x = Math.PI
    enemy.name = 'enemy'
    handleEnemy.move(steep)
    enemyGroup.add(enemy)
}
createEnemy()
// 创建一个interval 在角色判定死亡销毁  
s.createEnemyInterval = setInterval(createEnemy, createEnemyTime)

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

// 获取按钮dom
const highSpeed = document.querySelector('#high-speed') // 高速发射按钮

const trackBullet = document.querySelector('#track-bullet') // 高速发射按钮
const moreEnemy = document.querySelector('#more-enemy') // 很多敌人
const shrapnel = document.querySelector('#shrapnel') // 霰弹
const difficulty = document.querySelector('#difficulty') // 增加难度

let highspeedFlag = false
if (highSpeed) {
    highSpeed.addEventListener('click', () => {
        if (!highspeedFlag) {
            handleLead.speetUp()
            highspeedFlag = false
        }
    })
}
let trackBulletFlag = false
if (trackBullet) {
    trackBullet.addEventListener('click', () => {
        if (!trackBulletFlag) {
            handleLead.trackBullet()
            trackBulletFlag = false
        }
    })
}
let moreEnemyFlag = false
if (moreEnemy) {
    moreEnemy.addEventListener('click', () => {
        if (!moreEnemyFlag) {
            clearInterval(s.createEnemyInterval)
            createEnemyTime = 100
            s.createEnemyInterval = setInterval(createEnemy, createEnemyTime)
            moreEnemyFlag = false
        }
    })
}
let shrapnelFlag = false
if (shrapnel) {
    shrapnel.addEventListener('click', () => {
        if (!shrapnelFlag) {
            handleLead.shrapnelBullet()
            shrapnelFlag = false
        }
    })
}

if (difficulty) {
    difficulty.addEventListener('click', () => {
        handleLead.difficultyMode()
    })
}





