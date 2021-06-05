module.exports = function getRandomNumber <T>(min:T,max:T):number {
    let num = Math.floor(Math.random() * (Number(max) - Number(min) + 1) + Number(min));
    return num
}