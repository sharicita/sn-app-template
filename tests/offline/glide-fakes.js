// Minimal fakes for @servicenow/glide, so server modules run under plain Node.
// Install with require('./glide-fakes').install(); then require the compiled modules.
const Module = require('module')

const state = { tables: {}, queries: [], props: {}, roles: [] }

class FakeRecord {
    constructor(table) {
        this.table = table
        this.encoded = []
        this.rows = []
        this.i = -1
        this.limit = Infinity
    }
    addEncodedQuery(q) {
        this.encoded.push(q)
    }
    orderBy() {}
    setLimit(n) {
        this.limit = n
    }
    query() {
        const q = this.encoded.join('^')
        state.queries.push({ table: this.table, query: q })
        this.rows = (state.tables[this.table] || []).filter((r) => matches(r, q)).slice(0, this.limit)
    }
    next() {
        this.i++
        return this.i < this.rows.length
    }
    getUniqueValue() {
        return this.rows[this.i].sys_id
    }
    getValue(f) {
        const v = this.rows[this.i][f]
        return v === undefined ? null : String(v)
    }
}

/** Supports the operators the tests use: =, STARTSWITH, LIKE, ^ (and) and ^OR (or). */
function matches(row, encoded) {
    if (!encoded) return true
    // AND groups; a part starting with OR joins the group before it
    const groups = []
    for (const part of encoded.split('^')) {
        if (part.startsWith('OR') && groups.length) groups[groups.length - 1].push(part.slice(2))
        else groups.push([part])
    }
    return groups.every((terms) => terms.some((t) => term(row, t)))
}

function term(row, t) {
    const m = t.match(/^(\w+?)(STARTSWITH|LIKE|=)(.*)$/)
    if (!m) return true
    const v = String(row[m[1]] || '').toLowerCase()
    const want = m[3].toLowerCase()
    return m[2] === 'STARTSWITH' ? v.startsWith(want) : m[2] === 'LIKE' ? v.includes(want) : v === want
}

const glide = {
    GlideRecord: FakeRecord,
    GlideRecordSecure: FakeRecord,
    gs: {
        getProperty: (name, fallback) => (name in state.props ? state.props[name] : fallback),
        hasRole: (role) => state.roles.includes(role) || state.roles.includes('admin'),
        getUserName: () => 'test.user',
        info: () => {},
    },
}

function install() {
    const load = Module._load
    Module._load = function (req, ...rest) {
        if (req === '@servicenow/glide') return glide
        return load.call(this, req, ...rest)
    }
    // server modules import each other as './x.ts'; the compiled files are './x.js'
    const resolve = Module._resolveFilename
    Module._resolveFilename = function (req, ...rest) {
        return resolve.call(this, req.endsWith('.ts') ? req.replace(/\.ts$/, '.js') : req, ...rest)
    }
    return state
}

module.exports = { install, state }
