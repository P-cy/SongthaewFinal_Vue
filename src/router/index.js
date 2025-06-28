import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/map'
  },
  {
    path: '/map',
    name: 'Map',
    component: () => import('../components/Guilde.vue')
  },
  {
    path: '/booking',
    name: 'Booking',
    // ใช้เทคนิค lazy-loading เพื่อให้แอปโหลดเร็วขึ้น
    // Component จะถูกโหลดก็ต่อเมื่อผู้ใช้เข้ามาที่หน้านี้
    component: () => import('../components/Booking.vue')
  },
  {
    path: '/info',
    name: 'Info',
    component: () => import('../components/Info.vue')
  },
  {
    path: '/route/:id',
    name: 'Route',
    component: () => import('../components/Route.vue')
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
