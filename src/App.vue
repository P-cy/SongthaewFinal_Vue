<template>
  <div id="app">
    <div class="container">
      <h1>Vue Components Dashboard</h1>
      
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
        <button 
          @click="showAll = !showAll"
          :class="{ active: showAll }"
          class="nav-btn show-all-btn"
        >
          {{ showAll ? 'Hide All' : 'Show All' }}
        </button>
      </div>

      <!-- Component Display Area -->
      <div class="component-area">
        <!-- Show All Components -->
        <div v-if="showAll" class="all-components">
          <div v-for="component in components" :key="component.name" class="component-section">
            <h2>{{ component.label }}</h2>
            <component :is="component.name"></component>
          </div>
        </div>

        <!-- Show Single Component -->
        <div v-else-if="activeComponent" class="single-component">
          <h2>{{ getComponentLabel(activeComponent) }}</h2>
          <component :is="activeComponent"></component>
        </div>

        <!-- Welcome Message -->
        <div v-else class="welcome">
          <h2>Welcome to Vue Components Dashboard</h2>
          <p>Select a component from the buttons above to view it</p>
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

export default {
  name: 'App',
  components: {
    Booking,
    HelloWorld,
    Info,
    Map
  },
  data() {
    return {
      activeComponent: null,
      showAll: false,
      components: [
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
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

h1 {
  text-align: center;
  margin: 0;
  padding: 30px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 2.5em;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.nav-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  justify-content: center;
}

.nav-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.nav-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.nav-btn.active {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
}

.show-all-btn.active {
  background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
  box-shadow: 0 4px 15px rgba(81, 207, 102, 0.4);
}

.component-area {
  padding: 30px;
  min-height: 400px;
}

.component-section {
  margin-bottom: 40px;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: #f8f9fa;
}

.component-section h2 {
  margin-top: 0;
  color: #495057;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.single-component {
  padding: 20px;
  border: 2px solid #667eea;
  border-radius: 10px;
  background: #f8f9fa;
}

.single-component h2 {
  margin-top: 0;
  color: #495057;
  border-bottom: 2px solid #667eea;
  padding-bottom: 10px;
}

.welcome {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.welcome h2 {
  color: #495057;
  margin-bottom: 20px;
}

.welcome p {
  font-size: 1.2em;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .nav-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .nav-btn {
    width: 100%;
    max-width: 250px;
  }
  
  h1 {
    font-size: 2em;
    padding: 20px;
  }
  
  .component-area {
    padding: 20px;
  }
}
</style>