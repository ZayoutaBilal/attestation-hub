import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { VueQueryPlugin } from '@tanstack/vue-query'
import App from './App.vue'
import Index from './pages/Index.vue'
import NotFound from './pages/NotFound.vue'
import './index.css'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Index },
    { path: '/:pathMatch(.*)*', component: NotFound }
  ]
})

const app = createApp(App)

app.use(router)
app.use(VueQueryPlugin)

app.mount('#root')
