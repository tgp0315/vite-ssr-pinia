import {
    createRouter as _createRouter,
    createMemoryHistory,
    createWebHistory
} from 'vue-router'

const pages = import.meta.glob('../pages/*.vue')
const routes = Object.keys(pages).map(path => {
    const name = path.match(/\.\/pages(.*)\.vue$/)[1].toLowerCase()
    return {
        path: name === '/home' ? '/' : name,
        component: pages[path] // () => import('./pages/*.vue')
    }
})
console.log(routes, import.meta.env.SSR, 'routes')
export default function createRouter() {
    return _createRouter({
        history: import.meta.env.SSR ? createMemoryHistory() : createWebHistory(),
        routes
    })
}
