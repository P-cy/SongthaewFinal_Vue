import { createRouter, createWebHistory } from 'vue-router'
// Import component หลักที่อาจจะเป็นหน้า Home หรือแผนที่
import MapView from '../components/Map.vue'

const routes = [
  {
    path: '/map',
    name: 'Map',
    component: () => import('../components/Map.vue')
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
  // คุณสามารถเพิ่ม Route สำหรับ HelloWorld หรือ Component อื่นๆ ได้ที่นี่
  {
    path: '/hello',
    name: 'HelloWorld',
    component: () => import('../components/HelloWorld.vue')
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
