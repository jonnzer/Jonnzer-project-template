#!/usr/bin/env node
const { program } = require('commander')
console.log('welcome to use JZ-cli 脚手架！')

const packageJson = require('../package.json')
program
    .version(packageJson.version) // version 赋予版本号
    .command('create [project]') // command：指令名字
    .description('初始化项目模板') // 对应 command指令的 描述
    .action(async (projectName) => { // action 对应 命令指定处理函数
        require('../lib/create')(projectName)
    })


program.parse(process.argv)





