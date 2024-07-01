const fs = require('node:fs/promises');
async function read(filename) {
    try {
        const data = await fs.readFile(filename, {encoding: 'utf8'})
        const lines = data.split('\n')
        return lines
    } catch (e) {
        console.log({ e })
    }
}

async function write(filename, content) {
    try {
        await fs.appendFile(filename, content)
    } catch (e) {
        console.log({e})
    }
}

module.exports = {
    write,
    read
}