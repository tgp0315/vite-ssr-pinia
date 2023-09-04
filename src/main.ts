import { createSSRApp } from 'vue'
import createRoute from './router'
import createStore from './store'
// import './style.css'
import App from './App.vue'

export const createApp =() => {
    const app = createSSRApp(App)
    const router = createRoute()
    const store = createStore()
    app.use(router)
    app.use(store)
    // app.mount('#app')
    return  {
      app,
      router,
      store
    }
}
