const inquirer = require('inquirer') // 实现交互式命令行
const chalk = require('chalk') // 给命令行设置颜色
const fs = require('fs-extra') // 基于fs的额外补充版
const logSymbols = require('log-symbols') // 各种日志级别的彩色图标
const ora = require('ora') // 终端 loading
const download = require('download-git-repo') // download 对应 git 仓库
const mvdir = require('mvdir') // 迁移文件目录
const del = require('del') // 删除 文件 和 目录
const getPkg = require('./util/getPkg')
const writeFileTree = require('./util/writeFileTree')

const customChoices = [
    { name: 'H5通用模板', value: 1 },
    { name: 'PC通用模板', value: 2 },
    { name: 'Electron通用模板', value: 3 },
    { name: '小程序通用模板', value: 4 }
  ]

// 模板 对应的仓库名
const templateType = {
    h5: 'JZ-h5-template',
    vant: 'JZ-vant-template',
    vue2pc: 'JZ-pc-template',
    vue3pc: 'JZ-vue3-pc-template',
    electron: 'JZ-electron-template',
    mp: 'JZ-mp-template',
}

const askList = [
    {
      type: 'input',
      name: 'desc',
      message: '请输入你的项目描述'
    },
    {
      type: 'list',
      name: 'custom',
      message: '请选择你要创建的模板',
      choices: customChoices
    }
  ]

const TEMPLATE_HOST = `direct:https://github.com/jonnzer/project-temp.git#main`
  
/**
 * 写入配置
 * @param {*} projectName 
 * @param {*} params {name, description}
 */
async function writePkg (projectName, params) {
    let pkg = getPkg(projectName)
    const { name, description } = params
    pkg = Object.assign({}, pkg, {
        name,
        description
    })
    await writeFileTree(projectName, {
        'package.json': JSON.stringify(pkg, null ,2)
    })
    // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
}

/**
 * 下载模板到主目录
 * @param {*} downloadType 
 * @param {*} projectName 
 * @param {*} description 
 */
async function downloadTemp (downloadType, projectName, description) {
    const loading = ora('正在创建项目...').start()
    const tempPath = `${projectName}/temp`
    download(TEMPLATE_HOST, tempPath, { clone: true }, async err => {
        if (err) {
            loading.fail()
            console.log(logSymbols.error, chalk.red('项目创建失败，失败原因：' + err))
            return
        }
        // 迁移模版里对应的工程目录到主目录
        await mvdir(`${projectName}/temp/${downloadType}`, projectName, {
            copy: true
        })
        await mvdir(
            `${projectName}/temp/JZ-tool/lib/kstool.js`,
            `${projectName}/src/assets/js/utils.js`,
            {
                copy: true
            }
        ).catch(err => {
            console.log('mvdir tools :', err)
        })
        console.log(logSymbols.info, chalk.green(
            `\n自动集成公共库，路径：${projectName}/src/assets/js/utils.js`
        ))
        await del([tempPath])
        await writePkg(projectName, {
            name: projectName,
            description
        })
        loading.succeed()
        console.log(logSymbols.success, chalk.green('项目创建成功，建议执行'))
        console.log(logSymbols.info, `进入目录：${chalk.green('cd '+ projectName)}`)
        console.log(logSymbols.info, `安装依赖：${chalk.green('yarn install')}`)
    })
}

  /**
   *  H5 PC 小程序 Electron 各个模板对应的处理逻辑
   *  H5 ： 集成vant / 纯H5
   *  PC : 集成 element （ vue3 / vue2 ）
   * @param {*} answers { desc: 'desc', custom: 4, name: 'hello' }
   */
async function handleAnswers(answers) {
    let { value } = customChoices.find((item) => answers.custom === item.value)
    value = parseInt(value, 10)
    let downloadType = null
    const { name, desc } = answers
    switch (value) {
        case 1: // H5
            const vantAnswers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: 'isVant',
                    message: '是否集成Vant移动地'
                }
            ])
            downloadType = vantAnswers.isVant ? templateType.vant : templateType.h5
            break;
        case 2: // PC
            const VueAnswers = await inquirer.prompt([
                {
                    type: 'confirm',
                    name: '__version',
                    message: '是否使用Vue3最新模板'
                }
            ])
            downloadType = VueAnswers.__version ? templateType.vue3pc : templateType.vue2pc
            break;
        case 3: // Electron
            downloadType = templateType.electron
            break;
        case 4: // 小程序
            downloadType = templateType.mp
            break;
        default:
            downloadType = null
            console.log(logSymbols.error, chalk.red('模版开发中，构建失败'))
            break;
    }
    await downloadTemp(downloadType, name, desc)
    downloadType = null 
}


/**
 * （1）判断路径是否存在
 * （2）询问其他配置
 * @param {*} projectName 
 */
async function askConfig(projectName) {
    const isExist = await fs.pathExists(projectName)
    if (isExist) {
        console.log(logSymbols.error, chalk.red('创建的项目已存在'))
        return
    }
    const answers = await inquirer.prompt(askList)
    answers.name = projectName
    handleAnswers(answers)
}

/**
 * projectName： 项目名字
 * 调用方式：JZ create， 然后交互式
 * @param {*} projectName 
 */
async function init(projectName) {
    if (!projectName) {
        const answers = await inquirer.prompt([ // answers: { name: '1' }
            {
                type: 'input',
                name: 'name',
                message: '请输入你的项目名称'
            }
        ])
        if (!answers.name) {
            init('')
            return
        }
        askConfig(answers.name)
    } else {
        askConfig(projectName)
    }
}

module.exports = (...args) => {
    return init(...args).catch(err => {
        console.error(err)
        process.exit(1) // 抛出异常
    }) 
}
