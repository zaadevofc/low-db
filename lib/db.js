exports.db = (options = {}) => {
    var low = require('../utils/lowdb')
    const _ = require('lodash')
    const {
        Low,
        JSONFile
    } = low
    const mongoDB = require('../utils/mongoDB')
    const opts = options
    const db = new Low(/https?:\/\//.test(opts['db'] || '') ?
        new cloudDBAdapter(opts['db']): /mongodb/.test(opts['db']) ?
        new mongoDB(opts['db']): new JSONFile(opts['path'])
    )
    const DATABASE = db
    const loadDatabase = async function loadDatabase() {
        if (db.READ) return new Promise((resolve) => setInterval(async function () {
            if (!db.READ) {
                clearInterval(this)
                resolve(db.data == null ? loadDatabase(): db.data)
            }
        },
            1 * 1000))
        if (db.data !== null) return
        db.READ = true
        await db.read().catch(console.error)
        db.READ = null
        db.data = {
            ...opts['schema'],
            ...(db.data || {})
        }
        db.chain = _.chain(db.data)
    }
    return {db, loadDatabase}
}