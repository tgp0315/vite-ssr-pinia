import fs from 'fs'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)
const resolve = p => path.resolve(__dirname, p)
var text = fs.readFileSync('./dist/static/ssr-manifest.json', 'utf8')
const manifest = JSON.parse(text)


const template = fs.readFileSync(resolve('dist/static/index.html'), 'utf-8')

import { render } from './dist/server/entry-server.js'

const routesToPrerender = fs.readdirSync(resolve('src/pages')).map(file => {
  console.log(file.replace(/\.vue$/, ''), 'file')
  const name = file.replace(/\.vue$/, '').toLowerCase()
  return name === 'home' ? '/' : `/${name}`
})

;(() => {
  routesToPrerender.forEach(async url => {
    const appHtml = await render(url, manifest)
    const html = template.replace('<!--ssr-outlet-->', appHtml)
    const filePath = `dist/static${url === '/' ? '/index' : url}.html`
    fs.writeFileSync(resolve(filePath), html)
  })

  fs.unlinkSync(resolve('dist/static/ssr-manifest.json'))
})()
