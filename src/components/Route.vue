<script setup>
import { ref, computed } from 'vue'
import icon from '../assets/icon.svg'
import iconpng from '../assets/icon.png'

// --- Reactive State ---
const searchQuery = ref('')

// Route data now includes a color property for the SVG
const routes = ref([
  { id: 2, name: 'สาย 2', destination: 'บ้านโคกฟันโปง - บ้านโคกน้อย', color: 'red' },
  { id: 3, name: 'สาย 3', destination: 'บขส.3 - บ้านพรหมนิมิตร', color: 'red' },
  { id: 4, name: 'สาย 4', destination: 'บขส.3 - บ้านหนองน้ำเกลี้ยง', color: 'green' },
  { id: 5, name: 'สาย 5', destination: 'ตลาดหนองไผ่ล้อม - บ้านทุ่ม', color: 'green' },
  { id: 6, name: 'สาย 6', destination: 'ตลาดเทศบาล 1 - บ้านเหล่านาดี', color: 'yellow' },
  { id: 8, name: 'สาย 8', destination: 'บขส.3 - บ้านโคกท่า', color: 'yellow' }
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
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
  <div id="app-container">
    <!-- Header Section -->
    <header class="header">
      <div class="header-icon-wrapper">
        <!-- Embedded SVG for the header icon -->
        <img :src="iconpng" width="60px">
      </div>
      <span class="header-text">สายรถสองแถว</span>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <h2 class="section-title">ค้นหาสายรถ</h2>
      <div class="search-container">
        <!-- Make sure you have Font Awesome linked in your project for this icon -->
        <i class="fas fa-search search-icon "></i>
        <input type="text" v-model="searchQuery" class="search-input" placeholder="ตัวอย่าง: กัลยาณวัตร">
      </div>

      <!-- List of Bus Routes -->
      <div class="route-list">
        <div v-for="route in filteredRoutes" :key="route.id" class="route-card">
          <div class="route-card-content">
            <div class="route-icon" :style="{backgroundColor: route.color}">
              <img :src="icon" class="img-icon">
            </div>
            <div class="route-info">
              <span class="route-name">{{ route.name }}</span>
              <span class="route-destination">{{ route.destination }}</span>
            </div>
          </div>
          <!-- Make sure you have Font Awesome linked for this icon -->
          <i class="fas fa-chevron-right route-arrow"></i>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>

/*
  IMPORTANT: For the icons to work, you MUST link to Font Awesome in your main public/index.html file.
  Add this line inside the <head> section of your index.html:
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

  And for the Thai font, add this in the <head> section as well:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
*/

:root {
  --primary-color: #4A4E69; /* Dark blue-gray for header/active nav */
  --background-color: #F8F9FA; /* Off-white for the main background */
  --card-bg-color: #FFF9F2; /* Creamy color for cards */
  --text-color: #22223B; /* Dark text */
  --border-color: #EAEAEA; /* Light gray for borders */
}

#app-container {
  font-family: 'Sarabun', sans-serif;
  max-width: 420px;
  margin: 0 auto;
  background-color: white;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  padding-bottom: 80px; /* Space for bottom nav */
  color: var(--text-color);
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

.search-input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.8rem;
  border-radius: 16px;
  border: 1px solid black;
  font-size: 1rem;
  background-color: white;
  box-sizing: border-box;
  color: black;
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
}

.route-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.route-card {
  background-color: var(--card-bg-color); 
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.route-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.07);
}

.route-card-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.route-icon {
  width: 70px;
  height: 70px;
  display: flex;
  border-radius: 100%;
  flex-shrink: 0;
}

.route-info {
  display: flex;
  flex-direction: column;
}

.route-name {
  align-self: flex-start;
  font-weight: 700;
  font-size: 1rem;
}

.route-destination {
  font-size: 0.85rem;
  color: #666;
}

.route-arrow {
  font-size: 1.2rem;
  color: #AAAAAA;
}

.img-icon {
  height: 70px;
  width: 70px;
  border-radius: 100%;
}

</style>