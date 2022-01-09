const fs = require('fs')
const path = require('path')

function getPackageJson (projectPath) {
    const packagePath = path.join(projectPath, 'package.json')

    let packageJson
    try {
        packageJson = fs.readFileSync(packagePath, 'utf-8')
    } catch (error) {
        throw new Error(`The package.json file at '${packagePath}' does not exist`)
    }
    try {
        packageJson = JSON.parse(packageJson)
    } catch (error) {
        throw new Error('The package.json is malformed') // package.json 异常
    }
    return packageJson
}

module.exports = function (context) {
    const pkg = getPackageJson(context)
    //@todo vuePlugins
    return pkg
}