/// <reference types="vite/client" />

declare module '*.vue,*.js,*.ts' { 
    import { createRoute } from './router/routes.js'
    export default createRoute
}
// declare module './router/routes.js'