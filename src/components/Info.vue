<script setup>
import { ref, computed } from 'vue'
import icon from '../assets/icon.svg'
import iconpng from '../assets/icon.png'

// --- Reactive State ---
const searchQuery = ref('')

// Route data now includes a color property for the SVG
const routes = ref([
  { id: 2, name: 'สาย 2', destination: 'บ้านโคกฟันโปง - บ้านโคกน้อย', color: '#FF6B6B' },
  { id: 3, name: 'สาย 3', destination: 'บขส.3 - บ้านพรหมนิมิตร', color: '#FF8E53' },
  { id: 4, name: 'สาย 4', destination: 'บขส.3 - บ้านหนองน้ำเกลี้ยง', color: '#4ECDC4' },
  { id: 5, name: 'สาย 5', destination: 'ตลาดหนองไผ่ล้อม - บ้านทุ่ม', color: '#45B7D1' },
  { id: 6, name: 'สาย 6', destination: 'ตลาดเทศบาล 1 - บ้านเหล่านาดี', color: '#96CEB4' },
  { id: 8, name: 'สาย 8', destination: 'บขส.3 - บ้านโคกท่า', color: '#FFEAA7' }
])

// --- Computed Property for Filtering ---
const filteredRoutes = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return routes.value
  return routes.value.filter(route =>
    route.name.toLowerCase().includes(query) ||
    route.destination.toLowerCase().includes(query)
  )
})
</script>

<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <div id="app-container">
    <!-- Background Gradient -->
    <div class="background-gradient"></div>
    
    <!-- Header Section -->
    <header class="header">
     
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <!-- Search Section -->
      <section class="search-section">
        <!-- <h2 class="section-title">
          <i class="fas fa-search title-icon"></i>
          ค้นหาสายรถ
        </h2> -->
        <div class="search-container">
          <div class="search-input-wrapper">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              v-model="searchQuery" 
              class="search-input" 
              placeholder="ค้นหาสายรถหรือปลายทาง..."
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

        <!-- List of Bus Routes -->
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
                  <div class="route-destination">
                    <i class="fas fa-map-marker-alt destination-icon"></i>
                    {{ route.destination }}
                  </div>
                </div>
              </div>
              <button class="route-action-btn">
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
  --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --secondary-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  --background-color: #f8fafc;
  --card-bg-color: #ffffff;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --border-color: #e2e8f0;
  --shadow-sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --border-radius: 16px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

#app-container {
  font-family: 'Sarabun', sans-serif;
  width: 100%;
  margin: 0;
  background-color: var(--background-color);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  color: var(--text-primary);
  overflow-x: hidden;
}

.background-gradient {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 300px;
  background: var(--primary-gradient);
  z-index: -1;
}

.header {
  background: transparent;
  padding: 2rem 1rem 1rem;
  position: relative;
  z-index: 10;
  width: 100%;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon-wrapper {
  position: relative;
}

.header-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  box-shadow: var(--shadow-lg);
  background: white;
  padding: 4px;
}

.header-text-wrapper {
  flex: 1;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.header-subtitle {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.9);
  margin: 0.25rem 0 0 0;
  font-weight: 400;
}

.main-content {
  flex: 1;
  padding: 0 1rem 2rem;
  position: relative;
  z-index: 5;
  margin-top: -20px;
  max-width: 100%;
}

.search-section {
  background: var(--card-bg-color);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-lg);
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-primary);
}

.title-icon {
  color: #667eea;
  font-size: 1.1rem;
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  font-size: 1rem;
  background-color: #f7fafc;
  transition: var(--transition);
  color: var(--text-primary);
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.search-icon {
  position: absolute;
  left: 1rem;
  color: var(--text-secondary);
  font-size: 1rem;
  z-index: 2;
}

.clear-btn {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: var(--transition);
}

.clear-btn:hover {
  background-color: #f1f5f9;
  color: var(--text-primary);
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
  color: var(--text-primary);
}

.route-icon-header {
  color: #4ECDC4;
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.route-card {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: var(--transition);
  position: relative;
  overflow: hidden;
}

.route-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transform: scaleX(0);
  transform-origin: left;
  transition: var(--transition);
}

.route-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.route-card:hover::before {
  transform: scaleX(1);
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
  flex-direction: column;
  align-items: center;
}

.route-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.route-bus-icon {
  width: 32px;
  height: 32px;
  filter: brightness(0) invert(1);
}

.route-line {
  width: 3px;
  height: 20px;
  margin-top: 4px;
  border-radius: 2px;
  opacity: 0.6;
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
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
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
}

.route-destination {
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  line-height: 1.4;
}

.destination-icon {
  flex-shrink: 0;
  color: #FF6B6B;
  font-size: 0.8rem;
}

.route-action-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.2rem;
  padding: 0.5rem;
  border-radius: 50%;
  cursor: pointer;
  transition: var(--transition);
}

.route-action-btn:hover {
  background-color: #f1f5f9;
  color: var(--text-primary);
  transform: translateX(2px);
}

.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
}

.empty-state p {
  font-size: 0.9rem;
  line-height: 1.5;
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
@media (min-width: 481px) {
  .main-content {
    padding: 0 2rem 2rem;
  }
  
  .header {
    padding: 2rem 2rem 1rem;
  }
  
  .search-section,
  .results-section {
    padding: 2rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 0 1rem 2rem;
  }
  
  .search-section,
  .results-section {
    padding: 1rem;
  }
  
  .header {
    padding: 1.5rem 1rem 1rem;
  }
  
  .header-title {
    font-size: 1.5rem;
  }
}
</style>