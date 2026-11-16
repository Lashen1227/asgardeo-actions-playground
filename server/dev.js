import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const children = [
  spawn(process.execPath, [resolve(root, 'server/action-runtime.js')], { cwd: root, stdio: 'inherit', env: process.env }),
  spawn(process.execPath, [resolve(root, 'node_modules/vite/bin/vite.js')], { cwd: root, stdio: 'inherit', env: process.env }),
]

for (const child of children) {
  child.on('exit', code => {
    if (code && code !== 0) process.exitCode = code
    for (const other of children) if (other !== child && !other.killed) other.kill()
  })
}

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  for (const child of children) if (!child.killed) child.kill(signal)
})
