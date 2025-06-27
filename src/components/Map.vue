<template>
  <div class="map-container">
    <div class="header">
      <h1>🏔️ แมพจังหวัดเชียงใหม่</h1>
      <p>สำรวจเมืองหลวงภาคเหนือของไทย</p>
    </div>
    
    <div class="map-wrapper">
      <div class="controls">
        <button class="control-btn" @click="goToChiangMai">🏛️ ตัวเมืองเชียงใหม่</button>
        <button class="control-btn" @click="goToDoi">🏔️ ดอยสุเทพ</button>
        <button class="control-btn" @click="goToOldCity">🏮 เมืองเก่า</button>
        <button class="control-btn" @click="goToNightBazaar">🛍️ ไนท์บาซาร์</button>
        <button class="control-btn" @click="toggleTrafficLayer">
          🚦 การจราจร {{ showTraffic ? '(เปิด)' : '(ปิด)' }}
        </button>
      </div>
      
      <div class="map-content">
        <div v-if="!mapLoaded" class="loading">
          กำลังโหลดแมพ...
        </div>
        <div ref="mapElement" class="map-element" v-show="mapLoaded"></div>
      </div>
    </div>
    
    <div class="info-panel">
      <h3>ข้อมูลจังหวัดเชียงใหม่</h3>
      <div class="location-info">
        <div class="info-card">
          <h4>🗺️ พื้นที่</h4>
          <p>20,107 ตร.กม.</p>
        </div>
        <div class="info-card">
          <h4>👥 ประชากร</h4>
          <p>~1.7 ล้านคน</p>
        </div>
        <div class="info-card">
          <h4>🏛️ อำเภอ</h4>
          <p>25 อำเภอ</p>
        </div>
        <div class="info-card">
          <h4>🏔️ ดอยสูงสุด</h4>
          <p>ดอยอินทนนท์</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Props
defineProps({
  msg: String,
})

// Reactive data
const mapElement = ref(null)
const mapLoaded = ref(false)
const showTraffic = ref(false)

// Google Maps objects
let map = null
let trafficLayer = null
let markers = []

// Location data
const locations = {
  chiangmai: { lat: 18.7883, lng: 98.9853, title: 'เชียงใหม่' },
  doi: { lat: 18.8042, lng: 98.9217, title: 'ดอยสุเทพ' },
  oldcity: { lat: 18.7912, lng: 98.9847, title: 'เมืองเก่าเชียงใหม่' },
  nightbazaar: { lat: 18.7882, lng: 99.0008, title: 'ไนท์บาซาร์' }
}

// API Key - ใส่ API Key ของคุณที่นี่
const GOOGLE_MAPS_API_KEY = 'AIzaSyAYer7PyjzNfQS6ekM4xb25emuhFLl661U'

// Methods
const loadGoogleMaps = () => {
  if (window.google && window.google.maps) {
    initMap()
    return
  }
  
  const script = document.createElement('script')
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry`
  script.async = true
  script.defer = true
  script.onload = () => {
    initMap()
  }
  script.onerror = () => {
    console.error('Failed to load Google Maps API')
    alert('ไม่สามารถโหลด Google Maps ได้ กรุณาตรวจสอบ API Key')
  }
  document.head.appendChild(script)
}

const initMap = () => {
  if (!mapElement.value) return
  
  map = new window.google.maps.Map(mapElement.value, {
    center: locations.chiangmai,
    zoom: 11,
    styles: [
      {
        featureType: 'water',
        elementType: 'geometry',
        stylers: [{ color: '#4fc3f7' }]
      },
      {
        featureType: 'landscape',
        elementType: 'geometry',
        stylers: [{ color: '#e8f5e8' }]
      },
      {
        featureType: 'road',
        elementType: 'geometry',
        stylers: [{ color: '#ffffff' }]
      },
      {
        featureType: 'poi.park',
        elementType: 'geometry',
        stylers: [{ color: '#c8e6c9' }]
      }
    ],
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    zoomControl: true,
    mapTypeControlOptions: {
      style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: window.google.maps.ControlPosition.TOP_CENTER,
    }
  })
  
  addMarkers()
  mapLoaded.value = true
}

const addMarkers = () => {
  Object.keys(locations).forEach(key => {
    const location = locations[key]
    const marker = new window.google.maps.Marker({
      position: { lat: location.lat, lng: location.lng },
      map: map,
      title: location.title,
      animation: window.google.maps.Animation.DROP
    })
    
    const infoWindow = new window.google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; text-align: center;">
          <h3 style="color: #333; margin-bottom: 5px;">${location.title}</h3>
          <p style="color: #666;">Lat: ${location.lat.toFixed(4)}, Lng: ${location.lng.toFixed(4)}</p>
        </div>
      `
    })
    
    marker.addListener('click', () => {
      markers.forEach(m => m.infoWindow.close())
      infoWindow.open(map, marker)
    })
    
    markers.push({ marker, infoWindow })
  })
}

const panToLocation = (location, zoom = 13) => {
  if (!map) return
  
  map.panTo(location)
  map.setZoom(zoom)
  
  // เพิ่มเอฟเฟกต์ bounce ให้ marker
  const marker = markers.find(m => 
    Math.abs(m.marker.getPosition().lat() - location.lat) < 0.001 &&
    Math.abs(m.marker.getPosition().lng() - location.lng) < 0.001
  )
  
  if (marker) {
    marker.marker.setAnimation(window.google.maps.Animation.BOUNCE)
    setTimeout(() => {
      marker.marker.setAnimation(null)
    }, 2000)
  }
}

const goToChiangMai = () => {
  panToLocation(locations.chiangmai, 12)
}

const goToDoi = () => {
  panToLocation(locations.doi, 14)
}

const goToOldCity = () => {
  panToLocation(locations.oldcity, 15)
}

const goToNightBazaar = () => {
  panToLocation(locations.nightbazaar, 16)
}

const toggleTrafficLayer = () => {
  if (!map) return
  
  if (!trafficLayer) {
    trafficLayer = new window.google.maps.TrafficLayer()
  }
  
  if (showTraffic.value) {
    trafficLayer.setMap(null)
    showTraffic.value = false
  } else {
    trafficLayer.setMap(map)
    showTraffic.value = true
  }
}

// Lifecycle hooks
onMounted(() => {
  loadGoogleMaps()
})

onUnmounted(() => {
  // Cleanup if needed
  if (trafficLayer) {
    trafficLayer.setMap(null)
  }
  markers.forEach(marker => {
    marker.marker.setMap(null)
  })
  markers = []
})
</script>

<style scoped>
.map-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Sarabun', Arial, sans-serif;
}

.header {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header p {
  font-size: 1.2rem;
  color: #666;
}

.map-wrapper {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}

.controls {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  justify-content: center;
}

.control-btn {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255,107,107,0.4);
}

.control-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255,107,107,0.6);
}

.control-btn:active {
  transform: translateY(0);
}

.map-content {
  position: relative;
  width: 100%;
  height: 600px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.map-element {
  width: 100%;
  height: 100%;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #666;
  font-size: 1.2rem;
}

.loading::after {
  content: '';
  width: 30px;
  height: 30px;
  border: 3px solid #ddd;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 15px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.info-panel {
  background: white;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.info-panel h3 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.5rem;
  text-align: center;
}

.location-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-card {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  padding: 15px;
  border-radius: 10px;
  text-align: center;
  transition: transform 0.3s ease;
}

.info-card:hover {
  transform: translateY(-5px);
}

.info-card h4 {
  margin-bottom: 5px;
  font-size: 1.1rem;
}

.info-card p {
  margin: 0;
  font-size: 0.9rem;
}

.read-the-docs {
  color: #888;
}

@media (max-width: 768px) {
  .map-container {
    padding: 10px;
  }
  
  .header h1 {
    font-size: 2rem;
  }
  
  .map-content {
    height: 400px;
  }
  
  .control-btn {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  .controls {
    gap: 10px;
  }
}
</style>