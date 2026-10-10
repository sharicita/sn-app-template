// Compiles the server modules needed by the offline tests to .test-build (CommonJS) and runs every
// *.test.js file in this folder. Type errors about @servicenow/glide sub-path resolution are
// expected and ignored: the tests replace every Glide API with fakes.
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const here = path.join(root, 'tests', 'offline')
const out = path.join(root, '.test-build')
// add each server module that has tests here
const sources = ['lib/search.ts', 'lib/glide.ts'].map((f) => path.join(root, 'src', 'server', f))
const tsc = path.join(root, 'node_modules', 'typescript', 'bin', 'tsc')
if (!fs.existsSync(tsc)) {
    console.error('TypeScript is not installed. Run "npm ci" first.')
    process.exit(1)
}
fs.rmSync(out, { recursive: true, force: true })
spawnSync(process.execPath, [tsc, ...sources, '--outDir', out, '--rootDir', path.join(root, 'src', 'server'), '--module', 'commonjs', '--target', 'es2020', '--skipLibCheck', '--noEmitOnError', 'false'], {
    stdio: 'ignore',
})

let failed = false
for (const t of fs.readdirSync(here).filter((f) => f.endsWith('.test.js')).sort()) {
    const r = spawnSync(process.execPath, [path.join(here, t)], { stdio: 'inherit' })
    if (r.status !== 0) failed = true
}
process.exit(failed ? 1 : 0)
