const fs = require('fs-extra')
const path = require('path')

/**
 * get all files that are not in the new filesystem and are still existing
 * delete filted files
 * @param {*} dir 
 * @param {*} newFiles 
 * @param {*} previousFiles 
 * @returns 
 */
async function deleteRemovedFiles (dir, newFiles, previousFiles) {
    const fileToDelete = Object.keys(previousFiles)
        .filter(filename => !newFiles[filename])
   
    return Promise.all(fileToDelete.map(filename => {
        return fs.unlink(path.join(dir, filename))
    }))
}

/**
 * 
 * @param {*} dir 目录路径
 * @param {*} files 文件对象内容
 * @param {*} previousFiles 过期的文件对象内容
 */
module.exports = async function writeFileTree(dir, files, previousFiles) {
    if (process.env.VUE_CLI_SKIP_WRITE) {
        return
    }
    if (previousFiles) {
        await deleteRemovedFiles(dir, files, previousFiles)
    }
    Object.keys(files).forEach((name) => {
        const filePath = path.join(dir, name)
        fs.ensureDirSync(path.dirname(filePath))
        fs.writeFileSync(filePath, files[name])
    })
}