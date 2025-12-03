import { createRouter, createWebHistory } from 'vue-router'
import ConvertidorView from '../views/ConvertidorView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'conversor',
      component: ConvertidorView
    }
  ]
})

export default router
