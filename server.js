import express from 'express'
import fs from 'fs'
import serveStatic from 'serve-static'
const compression = import('compression')
// import { fileURLToPath } from 'url'
import path, { dirname } from 'path'
const isTest = process.env.NODE_ENV === 'test' || !!process.env.VITE_TEST_BUILD
const serialize = import('serialize-javascript')
import { createServer as createViteServer } from 'vite'
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename)


async function createSeaver(root = process.cwd(), isProd = process.env.NODE_ENV === 'production') {
  const app = express()
  const resolve = p => path.resolve(__dirname, p)
  const manifest = isProd ? await import('./dist/client/ssr-manifest.json') : {}
  const indexProd = isProd ? fs.readFileSync(resolve('./dist/client/index.html'), 'utf-8') : ''
  let vite
  if (!isProd) {
      vite = await createViteServer({
        root,
        logLevel: isTest ? 'error' : 'info',
        server: {
            middlewareMode: 'ssr',
            watch: {
              usePolling: true,
              interval: 100
            }
        }
      })
      app.use(vite.middlewares)
  } else {
      app.use(compression())
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
      // // 调用服务端渲染方法，将vue组件渲染成dom结构，顺带分析出需要预加载的js，css等文件。
      const [appHtml, preloadLinks, store] = await render(url, manifest)
       // 新加 + 将服务端预取数据的store，插入html模板文件
      const state = ("<script>window.__INIT_STATE__" + "=" + serialize(store, { isJSON: true }) + "</script>");

      // 5. 注入渲染后的应用程序 HTML 到模板中。
      // 把html中的展位符替换成相对应的资源文件
      const html = template
        .replace(`<!--preload-links-->`, preloadLinks)
        .replace(`<!--app-html-->`, appHtml)
        .replace(`<!--app-store-->`, state)
      // // 6. 返回渲染后的 HTML。
      res.status(200)
      res.setHeader('Content-Type', 'text/html')
      res.end(html)
    } catch (e) {
      vite && vite.ssrFixStacktrace(e)
      res.status(500).end(e.stack)
    }

  })
  return { app, vite }
}

if (!isTest) {
  createSeaver().then(({app}) => {
    app.listen(3099, () => {
      console.log('http://localhost:3000')
    })
  })
}

exports.createSeaver = createSeaver
