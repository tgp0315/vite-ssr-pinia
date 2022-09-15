import express from 'express'
import fs from 'fs'
import serveStatic from 'serve-static'
import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
import { createServer as createViteServer } from 'vite'
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename)


async function createSeaver(isProd = process.env.NODE_ENV === 'production') {
    const app = express()
    const resolve = p => path.resolve(__dirname, p)

    const indexProd = isProd ? fs.readFileSync(resolve('./dist/client/index.html'), 'utf-8') : ''
    let vite
    if (!isProd) {
        vite = await createViteServer({
            server: {
                middlewareMode: 'ssr'
            }
        })
        app.use(vite.middlewares)
    } else {
        app.use(serveStatic(resolve('dist/client'), {
            index: false
        }))
    }


    app.use('*', async (req, res) => {
        const url = req.originalUrl
        let template;
        let render;
        try {
            if (!isProd) {
                template = fs.readFileSync(resolve('./index.html'), 'utf-8')
                template = await vite.transformIndexHtml(url, template)
                render = (await vite.ssrLoadModule('./src/entry-server.js')).render
            } else {
                template = indexProd
                const entryServe = await import('./dist/server/entry-server.js')
                render = entryServe.render
            }
            const appHtml = await render(url)
            // 5. 注入渲染后的应用程序 HTML 到模板中。
            const html = template.replace(`<!--ssr-outlet-->`, appHtml)
            // // 6. 返回渲染后的 HTML。
            res.status(200)
            res.setHeader('Content-Type', 'text/html')
            res.end(html)
        } catch (e) {
            vite && vite.ssrFixStacktrace(e)
            res.status(500).end(e.message)
        }
        return
    })

    app.listen(3099, () => {
        console.log(3099)
    })
}

createSeaver()
