<template>
  <div id="app">
    <div class="container">
      <header class="app-header">
        <div class="logo-section">
          <!--<div class="logo-icon">🚐</div>-->
          <h1>Songthaew CNX </h1>
          <p class="subtitle">เที่ยวทั่วเชียงใหม่ด้วยรถสองแถว</p>
        </div>
      </header>
      
      <!-- Navigation Buttons -->
      <nav class="nav-section">
        <div class="nav-buttons">
          <button 
            v-for="component in components" 
            :key="component.name"
            @click="activeComponent = component.name"
            :class="{ active: activeComponent === component.name }"
            class="nav-btn"
          >
            <span class="btn-icon">{{ component.icon }}</span>
            <span class="btn-text">{{ component.label }}</span>
          </button>
        </div>
      </nav>

      <!-- Component Display Area -->
      <main class="component-area">
        <div v-if="activeComponent" class="single-component">
          <component :is="activeComponent"></component>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import Booking from './components/Booking.vue'
import Info from './components/Info.vue'
import Guilde from './components/Guilde.vue'
import Route from './components/Route.vue'

export default {
  name: 'App',
  components: {
    Booking,
    Info,
    Guilde,
  },
  data() {
    return {
      activeComponent: 'Guilde',
      components: [
        { name: 'Guilde', label: 'นำทาง & แนะนำเที่ยว', icon: '🗺️' },
        { name: 'Booking', label: 'Booking System', icon: '📅' },
        { name: 'Info', label: 'Information', icon: 'ℹ️' },
      ]
    }
  },
  methods: {
    getComponentLabel(componentName) {
      const component = this.components.find(c => c.name === componentName)
      return component ? component.label : componentName
    }
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

#app {
  font-family: 'Kanit', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-attachment: fixed;
  padding: 20px;
}

.container {
  max-width: 1200px;
  min-height: calc(100vh - 40px);
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* Header Styles */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="0.5" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
  opacity: 0.3;
}

.logo-section {
  position: relative;
  z-index: 1;
}

.logo-icon {
  font-size: 4em;
  margin-bottom: 15px;
  filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

h1 {
  color: white;
  font-size: 3.2em;
  font-weight: 700;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.3);
  letter-spacing: 3px;
  margin-bottom: 10px;
}

.subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.2em;
  font-weight: 300;
  text-shadow: 1px 1px 4px rgba(0, 0, 0, 0.2);
}

/* Navigation Styles */
.nav-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 30px 20px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.1);
}

.nav-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
}

.nav-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 30px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
  font-size: 1em;
  min-width: 140px;
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.nav-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.4);
  transform: translateY(-2px);
}

.btn-icon {
  font-size: 2em;
  filter: drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.2));
}

.btn-text {
  font-size: 0.9em;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
}

/* Component Area Styles */
.component-area {
  flex: 1;
  padding: 40px 30px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  min-height: 600px;
  display: flex;
  justify-content: center;
}

.single-component {
  width: 100%;
  max-width: 800px;
  padding: 30px;
  border: 2px solid rgba(102, 126, 234, 0.1);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(102, 126, 234, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.single-component:hover {
  border-color: rgba(102, 126, 234, 0.3);
  box-shadow: 0 15px 40px rgba(102, 126, 234, 0.15);
}

/* Ensure all child components have consistent width */
.single-component > * {
  width: 100% !important;
  max-width: 100% !important;
}

/* Override any component-specific max-width */
.single-component .guilde-container,
.single-component .booking-form,
.single-component #app-container {
  width: 100% !important;
  max-width: 100% !important;
  margin: 0 !important;
}

/* Footer Styles */
.app-footer {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  padding: 20px;
  font-size: 0.9em;
  font-weight: 300;
}

/* Responsive Design */
@media (max-width: 768px) {
  #app {
    padding: 10px;
  }
  
  .container {
    border-radius: 15px;
  }
  
  h1 {
    font-size: 2.2em;
    letter-spacing: 2px;
  }
  
  .subtitle {
    font-size: 1em;
  }
  
  .nav-buttons {
    gap: 15px;
  }
  
  .nav-btn {
    padding: 15px 20px;
    min-width: 120px;
  }
  
  .btn-icon {
    font-size: 1.5em;
  }
  
  .btn-text {
    font-size: 0.8em;
  }
  
  .component-area {
    padding: 20px 15px;
  }
  
  .single-component {
    padding: 20px;
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .nav-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-btn {
    width: 100%;
    max-width: 280px;
    flex-direction: row;
    justify-content: center;
    gap: 15px;
  }
  
  h1 {
    font-size: 1.8em;
  }
  
  .logo-icon {
    font-size: 3em;
  }
  
  .component-area {
    padding: 15px 10px;
  }
  
  .single-component {
    padding: 15px;
    border-radius: 15px;
  }
}

/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
}
</style>