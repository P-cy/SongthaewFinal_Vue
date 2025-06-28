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
          <router-link 
            v-for="component in components" 
            :key="component.name"
            :to="component.path"
            custom
            v-slot="{ navigate, isActive }"
          >
            <button 
              @click="navigate"
              :class="{ active: isActive }"
              class="nav-btn"
            >
              <span class="btn-icon">{{ component.icon }}</span>
              <span class="btn-text">{{ component.label }}</span>
            </button>
          </router-link>
        </div>
      </nav>

      <!-- Router View -->
      <main class="component-area">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      components: [
        { name: 'Guilde', label: 'นำทาง & แนะนำเที่ยว', icon: '🗺️', path: '/map' },
        { name: 'Booking', label: 'Booking System', icon: '📅', path: '/booking' },
        { name: 'Info', label: 'Information', icon: 'ℹ️', path: '/info' },
      ]
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
  font-family: 'Sarabun', sans-serif;
  color: #2c3e50;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  background-attachment: fixed;
  padding: 0;
}

.container {
  width: 1200px;
  max-width: 1200px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 25px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  min-height: 100vh;
  position: relative;
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
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
}

.nav-btn.active {
  background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
  box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
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

/* Component Area */
.component-area {
  width: 1160px;
  padding: 20px;
  overflow-y: auto;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  min-height: calc(100vh - 200px);
  position: relative;
}

.single-component {
  max-width: 100%;
  margin: 0 auto;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    max-width: 100%;
    border-radius: 15px;
  }
  
  .app-header {
    padding: 30px 20px;
  }
  
  h1 {
    font-size: 2.5em;
  }
  
  .subtitle {
    font-size: 1em;
  }
  
  .nav-section {
    padding: 20px 15px;
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
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .nav-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-btn {
    width: 100%;
    max-width: 200px;
  }
  
  h1 {
    font-size: 2em;
  }
}
</style>