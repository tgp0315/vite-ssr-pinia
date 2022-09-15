import { createSSRApp } from 'vue'
import createRoute from './router/routes.js'
// import './style.css'
import App from './App.vue'

export const createApp =() => {
    const app = createSSRApp(App)
    const router = createRoute()
    app.use(router)
    // app.mount('#app')
    return  {
        app,
        router
    }
}
