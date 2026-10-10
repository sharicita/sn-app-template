#!/usr/bin/env node
// Turns a fresh copy of the starter template into your own app, in place. Run it once, right after
// copying the template:
//
//   npm run new-app -- --scope x_myapp --name "My App" [--description "One line about it"] [--package my-app]
//
// --scope is the placeholder scope committed in your app's source (x_<short app code>, no company
// code: each install profile adds the real one). It changes the scope, app name, description and
// package name everywhere, gives the app a new scope ID, and removes the template's generated record
// keys so your app's first build creates its own.
import fs from 'node:fs'
import path from 'node:path'
import { APP, ROOT, SOURCE_SCOPE, newSysId, validateProfile } from './lib/profiles.mjs'

const args = process.argv.slice(2)
const opt = (f) => {
    const i = args.indexOf(f)
    return i >= 0 ? args[i + 1] : undefined
}
const scope = opt('--scope')
const name = (opt('--name') || '').trim()
const description = (opt('--description') || '').trim() || APP.description
const pkgName = opt('--package') || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const problems = scope ? validateProfile({ scope, scopeId: newSysId(), alias: 'unused' }) : ['Give the app scope: --scope x_myapp']
if (!name) problems.push('Give the app name: --name "My App"')
if (/["'`\\]/.test(name + description)) problems.push('Leave quotes and backslashes out of the name and description.')
if (!/^[a-z0-9][a-z0-9-]{0,213}$/.test(pkgName || '')) problems.push('The package name may use lowercase letters, numbers and dashes: --package my-app')
if (scope === SOURCE_SCOPE) problems.push(`The app already uses ${scope}.`)
if (problems.length) {
    console.error(problems.join('\n'))
    process.exit(1)
}

const swaps = [
    [SOURCE_SCOPE, scope],
    [APP.name, name],
    [APP.description, description],
]
const TEXT_EXT = new Set(['.ts', '.tsx', '.js', '.mjs', '.json', '.html', '.css', '.md', '.yml'])
const SKIP_DIRS = new Set(['node_modules', '.git', '.now', '.deploy', 'dist', 'target', '.test-build', 'generated'])
// the build standards and lessons stay as written: they describe the reference implementation
const SKIP_FILES = new Set(['README.md', 'new-app-build-standards.md', 'lessons-learned.md', 'package-lock.json', 'new-app.mjs'])
let changed = 0

function rewrite(file) {
    let s = fs.readFileSync(file, 'utf8')
    const before = s
    for (const [from, to] of swaps) if (from && from !== to) s = s.split(from).join(to)
    if (s !== before) {
        fs.writeFileSync(file, s)
        changed++
    }
}

function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name)
        if (e.isDirectory()) {
            if (!SKIP_DIRS.has(e.name)) walk(p)
        } else if (TEXT_EXT.has(path.extname(e.name)) && !SKIP_FILES.has(e.name)) rewrite(p)
    }
}

for (const dir of ['src', 'tests', 'docs', 'tools', '.github']) if (fs.existsSync(path.join(ROOT, dir))) walk(path.join(ROOT, dir))
for (const f of ['INSTALL.md', 'SECURITY.md', 'now.prebuild.mjs', 'now.dev.mjs']) if (fs.existsSync(path.join(ROOT, f))) rewrite(path.join(ROOT, f))

const configFile = path.join(ROOT, 'now.config.json')
const config = JSON.parse(fs.readFileSync(configFile, 'utf8'))
Object.assign(config, { scope, scopeId: newSysId(), name, description })
fs.writeFileSync(configFile, JSON.stringify(config, null, 4) + '\n')

const pkgFile = path.join(ROOT, 'package.json')
const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
const oldPkgName = pkg.name
Object.assign(pkg, { name: pkgName, version: '0.0.1', description })
delete pkg.scripts['new-app']
fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 4) + '\n')

const lockFile = path.join(ROOT, 'package-lock.json')
if (fs.existsSync(lockFile)) {
    const lock = JSON.parse(fs.readFileSync(lockFile, 'utf8'))
    lock.name = pkgName
    lock.version = '0.0.1'
    if (lock.packages && lock.packages['']) Object.assign(lock.packages[''], { name: pkgName, version: '0.0.1' })
    fs.writeFileSync(lockFile, JSON.stringify(lock, null, 4) + '\n')
}

// the template's record keys belong to the template: the app's first build makes its own
fs.rmSync(path.join(ROOT, 'src', 'fluent', 'generated'), { recursive: true, force: true })
fs.rmSync(path.join(ROOT, '.deploy'), { recursive: true, force: true })
const ignoreFile = path.join(ROOT, '.gitignore')
const ignore = fs.readFileSync(ignoreFile, 'utf8')
fs.writeFileSync(ignoreFile, ignore.replace(/\n# STARTER TEMPLATE ONLY:[\s\S]*?src\/fluent\/generated\/\n/, '\n'))
// a profile file named after the template would no longer be found
const oldProfiles = path.join(ROOT, `${oldPkgName}.local.json`)
if (fs.existsSync(oldProfiles)) fs.renameSync(oldProfiles, path.join(ROOT, `${pkgName}.local.json`))

console.log(`Now "${name}" (${scope}, package ${pkgName}); updated ${changed} files.
Next:
  1. Rewrite README.md for your app (keep the Development section).
  2. npm test && npx now-sdk build      (the build creates src/fluent/generated/keys.ts: commit it)
  3. npm run setup                      (guided install on your instance)`)
