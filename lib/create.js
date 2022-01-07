const inquirer = require('inquirer') // 实现交互式命令行
const chalk = require('chalk') // 给命令行设置颜色
const fs = require('fs-extra')

/**
 * 询问项目是否存在
 * @param {*} projectName 
 */
async function askConfig(projectName) {
    const isExist = await fs.pathExists(projectName)
    console.log(isExist)
}

/**
 * projectName： 项目名字
 * 创建项目有两种形式： 
 * （1）jz create projectName
 * （2）jz create， 然后交互式
 * @param {*} projectName 
 */
async function init(projectName) {
    console.log('projectName: ', projectName)
    askConfig(projectName)
}

module.exports = (...args) => {
    return init(...args).catch(err => {
        console.error(err)
        process.exit(1) // 抛出异常
    }) 
}
