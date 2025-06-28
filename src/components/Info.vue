<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import icon from '../assets/icon.svg'
import iconpng from '../assets/icon.png'
import songthaewData from '../assets/songthaew_lines.json'

// --- Reactive State ---
const router = useRouter()
const searchQuery = ref('')
const routes = ref([])

// --- Color mapping for different songthaew colors ---
const colorMap = {
  'yellow': '#FFD700',
  'orange': '#FF8C00', 
  'blue': '#4169E1',
  'white': '#F5F5F5',
  'green': '#32CD32',
  'red': '#DC143C'
}

// --- Load and process data ---
onMounted(() => {
  routes.value = songthaewData.map((route, index) => ({
    id: index + 1,
    name: route.name,
    color: colorMap[route.color] || '#666666',
    pickup: route.pickup,
    service_time: route.service_time,
    fare: route.fare,
    destinations: route.destinations || [],
    note: route.note || '',
    key_stops: route.key_stops || []
  }))
})

// --- Computed Property for Filtering ---
const filteredRoutes = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return routes.value
  return routes.value.filter(route =>
    route.name.toLowerCase().includes(query) ||
    route.pickup.some(stop => stop.toLowerCase().includes(query)) ||
    route.destinations.some(dest => dest.toLowerCase().includes(query))
  )
})

// --- Navigation Method ---
const navigateToRoute = (routeId) => {
  router.push(`/route/${routeId}`)
}
</script>

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <div id="app-container">
    <!-- Main Content -->
    <main class="main-content">
      <!-- Search Section -->
      <section class="search-section">
        <h2 class="section-title">ค้นหาสายรถ</h2>
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="search-input" 
              placeholder="ค้นหาสายรถ, จุดรับ, หรือปลายทาง..."
            >
            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </section>

      <!-- Results Section -->
      <section class="results-section">
        <div class="results-header">
          <h3 class="results-title">
            <i class="fas fa-bus route-icon-header"></i>
            เส้นทางที่พบ ({{ filteredRoutes.length }})
          </h3>
        </div>

        <!-- List of Songthaew Routes -->
        <div class="route-list">
          <transition-group name="route" tag="div">
            <div 
              v-for="route in filteredRoutes" 
              :key="route.id" 
              class="route-card"
            >
              <div class="route-card-content">
                <div class="route-icon-container">
                  <div class="route-icon" :style="{backgroundColor: route.color}">
                    <img :src="icon" class="route-bus-icon" alt="Bus Icon">
                  </div>
                  <div class="route-line" :style="{backgroundColor: route.color}"></div>
                </div>
                <div class="route-info">
                  <div class="route-header">
                    <span class="route-name">{{ route.name }}</span>
                    <div class="route-badge" :style="{backgroundColor: route.color}">
                      <i class="fas fa-route"></i>
                    </div>
                  </div>
                  <div class="route-details">
                    <div class="route-pickup">
                      <i class="fas fa-map-marker-alt pickup-icon"></i>
                      <span class="pickup-text">{{ route.pickup.join(', ') }}</span>
                    </div>
                    <div class="route-time-fare">
                      <span class="service-time">
                        <i class="fas fa-clock"></i>
                        {{ route.service_time }}
                      </span>
                      <span v-if="route.fare" class="fare">
                        <i class="fas fa-money-bill-wave"></i>
                        {{ route.fare }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <button class="route-action-btn" @click="navigateToRoute(route.id)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </transition-group>
          
          <!-- Empty State --> 
          <div v-if="filteredRoutes.length === 0" class="empty-state">
            <i class="fas fa-search empty-icon"></i>
            <h3>ไม่พบเส้นทางที่ค้นหา</h3>
            <p>ลองค้นหาด้วยคำอื่น หรือตรวจสอบการสะกดอีกครั้ง</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
* {
  box-sizing: border-box;
}

:root {
  --primary-color: #4A4E69;
  --background-color: #F8F9FA;
  --card-bg-color: #FFF9F2;
  --text-color: #22223B;
  --border-color: #EAEAEA;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 8px 15px rgba(0,0,0,0.1);
  --border-radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

#app-container {
  font-family: 'Sarabun', sans-serif;
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(102,126,234,0.1);
  color: var(--text-color);
  overflow: hidden;
}

.header {
  width: 370px;
  background-color: #424578;
  color: #f9c1f4;
  padding: 1rem 1.5rem;
  display: flex;
  font-size: 1.5rem;
  font-weight: 700;
  gap: 1rem;
  align-items: center;
  border-radius: 12px 12px 0 0;
  margin-bottom: 1rem;
}

.header-text {
  display: flex;
  align-self: center;
}

.header-icon-wrapper {
  width: 50px;
  align-self: flex-start;
  height: auto;
}

.main-content {
  padding: 1.5rem;
  flex-grow: 1;
  background-color: var(--background-color);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.search-container {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-input-wrapper {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  border-radius: 16px;
  border: 1px solid black;
  font-size: 1rem;
  background-color: white;
  box-sizing: border-box;
  color: black;
  transition: var(--transition);
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(74, 78, 105, 0.1);
}

.search-input::placeholder {
  color: #AAAAAA;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: black;
  font-size: 1.1rem;
  z-index: 2;
}

.clear-btn {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #AAAAAA;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: var(--transition);
  z-index: 2;
}

.clear-btn:hover {
  background-color: #f1f5f9;
  color: var(--text-color);
}

.results-section {
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-md);
}

.results-header {
  margin-bottom: 1.5rem;
}

.results-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color);
}

.route-icon-header {
  color: var(--primary-color);
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.route-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: var(--border-radius);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
}

.route-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.route-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;
}

.route-icon-container {
  position: relative;
  display: flex;
  align-items: center;
}

.route-icon {
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.route-bus-icon {
  width: 35px;
  height: 35px;
  filter: brightness(0) invert(1);
}

.route-line {
  width: 4px;
  height: 40px;
  border-radius: 2px;
  margin-left: 8px;
}

.route-info {
  flex: 1;
  min-width: 0;
}

.route-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.route-name {
  font-weight: 700;
  font-size: 1rem;
  color: var(--text-color);
  flex: 1;
}

.route-badge {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 0.7rem;
  flex-shrink: 0;
}

.route-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.route-pickup {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #666;
}

.pickup-icon {
  color: #4ECDC4;
  font-size: 0.8rem;
}

.pickup-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.route-time-fare {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #888;
}

.service-time, .fare {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.route-action-btn {
  background: none;
  border: none;
  color: var(--text-color);
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
  flex-shrink: 0;
}

.route-action-btn:hover {
  background-color: #f1f5f9;
  color: var(--primary-color);
  transform: translateX(2px);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
  color: var(--primary-color);
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.empty-state p {
  font-size: 0.9rem;
  line-height: 1.5;
  color: #666;
}

/* Animations */
.route-enter-active,
.route-leave-active {
  transition: all 0.3s ease;
}

.route-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.route-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* Responsive adjustments */
@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }
  
  .header {
    padding: 1rem;
  }
  
  .header-text {
    font-size: 1.25rem;
  }
  
  .route-card {
    padding: 0.75rem;
  }
  
  .route-icon {
    width: 60px;
    height: 60px;
  }
  
  .route-bus-icon {
    width: 30px;
    height: 30px;
  }
}
</style>