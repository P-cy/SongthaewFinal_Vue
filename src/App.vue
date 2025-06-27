<template>
  <div id="app">
    <div class="container">
      <h1>Songthaew CNX Guide</h1>
      
      <!-- Navigation Buttons -->
      <div class="nav-buttons">
        <button 
          v-for="component in components" 
          :key="component.name"
          @click="activeComponent = component.name"
          :class="{ active: activeComponent === component.name }"
          class="nav-btn"
        >
          {{ component.label }}
        </button>
      </div>

      <!-- Component Display Area -->
      <div class="component-area">
        <div v-if="activeComponent" class="single-component">
          <component :is="activeComponent"></component>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Booking from './components/Booking.vue'
import HelloWorld from './components/HelloWorld.vue'
import Info from './components/Info.vue'
import Map from './components/Map.vue'
import Guilde from './components/Guilde.vue'

export default {
  name: 'App',
  components: {
    Booking,
    HelloWorld,
    Info,
    Map,
    Guilde
  },
  data() {
    return {
      activeComponent: 'Guilde',
      components: [
        { name: 'Guilde', label: 'นำทาง & แนะนำเที่ยว' },
        { name: 'Booking', label: 'Booking System' },
        { name: 'HelloWorld', label: 'Hello World' },
        { name: 'Info', label: 'Information' },
        { name: 'Map', label: 'Map View' }
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
#app {
  font-family: 'Kanit', 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

h1 {
  text-align: center;
  margin: 0;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2.7em;
  text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 2px;
  border-radius: 0 0 30px 30px;
}

.nav-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px 0 16px 0;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  justify-content: center;
}

.nav-btn {
  padding: 14px 28px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);
  font-size: 1.1em;
}

.nav-btn:hover {
  transform: translateY(-2px) scale(1.04);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.3);
}

.nav-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.component-area {
  padding: 36px 24px 36px 24px;
  min-height: 500px;
  background: #f4f7fb;
}

.single-component {
  padding: 24px;
  border: 2px solid #667eea;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
}

@import url('https://fonts.googleapis.com/css2?family=Kanit:wght@400;600&display=swap');
</style>