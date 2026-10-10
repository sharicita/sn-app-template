// Offline tests for the app-wide ranked search and the encoded-query sanitizer.
// Run with: npm test
const assert = require('assert')
const path = require('path')
const state = require('./glide-fakes').install()
const BUILD = path.join(__dirname, '..', '..', '.test-build')
const { queryText, rankedSearch } = require(path.join(BUILD, 'lib', 'search.js'))

let passed = 0
function test(name, fn) {
    try {
        fn()
        passed++
    } catch (e) {
        console.error(`FAIL ${name}\n  ${e.message}`)
        process.exitCode = 1
    }
}

test('queryText strips characters that would start a new encoded-query condition', () => {
    assert.strictEqual(queryText('abc^ORactive=false'), 'abc ORactive=false')
    assert.strictEqual(queryText('line1\r\nline2'), 'line1  line2')
    assert.strictEqual(queryText('  x  '), 'x')
    assert.strictEqual(queryText('a'.repeat(200)).length, 100)
    assert.strictEqual(queryText(undefined), '')
})

test('rankedSearch puts key-field prefix matches first, then other prefixes, then contains', () => {
    state.tables.sys_user_group = [
        { sys_id: '1', name: 'Network', description: 'Service desk escalations' },
        { sys_id: '2', name: 'Service Desk', description: 'First line' },
        { sys_id: '3', name: 'Hardware', description: 'Laptops' },
        { sys_id: '4', name: 'Customer Service', description: 'Calls' },
    ]
    const names = rankedSearch({ table: 'sys_user_group', fields: ['name', 'description'], text: 'serv', limit: 10, secure: true, orderBy: 'name' }, (r) => r.getValue('name'))
    assert.deepStrictEqual(names, ['Service Desk', 'Network', 'Customer Service'])
})

test('rankedSearch never lets user text add conditions to the query', () => {
    state.queries = []
    rankedSearch({ table: 'sys_user_group', fields: ['name'], text: 'x^ORsys_id!=0', limit: 5, secure: true, orderBy: 'name' }, (r) => r)
    for (const q of state.queries) assert.ok(!q.query.includes('^ORsys_id'), q.query)
})

test('rankedSearch respects the limit', () => {
    const all = rankedSearch({ table: 'sys_user_group', fields: ['name'], text: '', limit: 2, secure: true, orderBy: 'name' }, (r) => r.getUniqueValue())
    assert.strictEqual(all.length, 2)
})

console.log(`search: ${passed} passed${process.exitCode ? ', some failed' : ''}`)
