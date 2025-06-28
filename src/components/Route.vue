<template>
  <div id="route-detail-container">
    <!-- Header -->
    <header class="route-header">
      <button @click="goBack" class="back-btn">
        <svg class="back-arrow" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="back-text">กลับ</span>
      </button>
      <h1 class="route-title">{{ routeData.name }}</h1>
    </header>

    <!-- Route Info Card -->
    <div class="route-info-card">
      <div class="route-color-indicator" :style="{backgroundColor: routeColor}"></div>
      <div class="route-details">
        <div class="route-basic-info">
          <h2>{{ routeData.name }}</h2>
          <div class="route-meta">
            <span class="service-time">
              <i class="fas fa-clock"></i>
              {{ routeData.service_time }}
            </span>
            <span v-if="routeData.fare" class="fare">
              <i class="fas fa-money-bill-wave"></i>
              {{ routeData.fare }}
            </span>
          </div>
        </div>
        
        <div class="pickup-points">
          <h3><i class="fas fa-map-marker-alt"></i> จุดรับผู้โดยสาร</h3>
          <ul>
            <li v-for="point in routeData.pickup" :key="point">{{ point }}</li>
          </ul>
        </div>

        <div class="destinations">
          <h3><i class="fas fa-flag-checkered"></i> ปลายทางและสถานที่ท่องเที่ยว</h3>
          <ul>
            <li v-for="dest in routeData.destinations" :key="dest">{{ dest }}</li>
          </ul>
        </div>

        <div v-if="routeData.note" class="route-note">
          <h3><i class="fas fa-info-circle"></i> หมายเหตุ</h3>
          <p>{{ routeData.note }}</p>
        </div>
      </div>
    </div>

    <!-- Map Section -->
    <div class="map-section">
      <h3><i class="fas fa-map"></i> แผนที่เส้นทาง</h3>
      <div v-if="!mapError" id="map" class="map-container"></div>
      <div v-else class="map-error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>ไม่สามารถโหลดแผนที่ได้</p>
        <button @click="retryLoadMap" class="retry-btn">
          <i class="fas fa-redo"></i> ลองใหม่
        </button>
      </div>
      <div v-if="!mapError" class="map-controls">
        <button @click="showRoute" class="map-btn" :disabled="!hasKeyStops">
          <i class="fas fa-route"></i> แสดงเส้นทาง
        </button>
        <button @click="showRouteAttractions" class="map-btn" :disabled="!hasKeyStops">
          <i class="fas fa-landmark"></i> สถานที่ท่องเที่ยวระหว่างเส้นทาง
        </button>
      </div>
    </div>

    <!-- Nearby Places Section -->
    <div v-if="routeAttractions.length > 0" class="nearby-places">
      <h3><i class="fas fa-landmark"></i> สถานที่ท่องเที่ยวระหว่างเส้นทาง</h3>
      <div class="places-list">
        <div v-for="place in routeAttractions" :key="place.id" class="place-card">
          <div class="place-image" v-if="place.picture">
            <img :src="place.picture" :alt="place.name" @error="handleImageError">
          </div>
          <div class="place-info">
            <h4>{{ place.name }}</h4>
            <p class="place-category">{{ place.category }}</p>
            <div class="place-distance">
              <i class="fas fa-route"></i>
              <span>ห่างจากเส้นทาง {{ place.distance.toFixed(1) }} กม.</span>
            </div>
          </div>
          <button @click="showPlaceOnMap(place)" class="show-on-map-btn">
            <i class="fas fa-map-marker-alt"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Error Message -->
    <div v-if="errorMessage" class="error-message">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import songthaewData from '../assets/songthaew_lines.json'

// --- Reactive State ---
const route = useRoute()
const router = useRouter()
const map = ref(null)
const directionsService = ref(null)
const directionsRenderer = ref(null)
const routeAttractions = ref([])
const mapError = ref(false)
const errorMessage = ref('')

// --- CSV Data ---
const attractionsData = ref([])

// --- Route Data ---
const routeData = computed(() => {
  const routeId = parseInt(route.params.id)
  return songthaewData[routeId - 1] || {}
})

const routeColor = computed(() => {
  const colorMap = {
    'yellow': '#FFD700',
    'orange': '#FF8C00', 
    'blue': '#4169E1',
    'white': '#F5F5F5',
    'green': '#32CD32',
    'red': '#DC143C'
  }
  return colorMap[routeData.value.color] || '#666666'
})

const hasKeyStops = computed(() => {
  return routeData.value.key_stops && routeData.value.key_stops.length >= 2
})

// --- Methods ---
const goBack = () => {
  router.go(-1)
}

const retryLoadMap = () => {
  mapError.value = false
  errorMessage.value = ''
  initMap()
}

const showError = (message) => {
  errorMessage.value = message
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}

const handleImageError = (event) => {
  event.target.style.display = 'none'
}

const loadAttractionsData = async () => {
  try {
    const response = await fetch('/src/assets/dat.csv')
    const csvText = await response.text()
    const lines = csvText.split('\n')
    const headers = lines[0].split(',')
    
    const attractions = []
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',')
        if (values.length >= 5) {
          attractions.push({
            id: i,
            name: values[0].replace(/"/g, ''),
            lat: parseFloat(values[1]),
            lng: parseFloat(values[2]),
            category: values[3].replace(/"/g, ''),
            picture: values[4].replace(/"/g, '')
          })
        }
      }
    }
    
    attractionsData.value = attractions
    console.log(`Loaded ${attractions.length} attractions from CSV`)
  } catch (error) {
    console.error('Error loading attractions data:', error)
    showError('ไม่สามารถโหลดข้อมูลสถานที่ท่องเที่ยวได้')
  }
}

const initMap = () => {
  try {
    console.log('Initializing map...')
    
    // Check if Google Maps API is available
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API not available')
      mapError.value = true
      showError('Google Maps API ไม่พร้อมใช้งาน')
      return
    }

    // Initialize Google Maps
    const mapElement = document.getElementById('map')
    if (!mapElement) {
      console.error('Map element not found')
      mapError.value = true
      showError('ไม่พบองค์ประกอบแผนที่')
      return
    }

    console.log('Creating map instance...')
    map.value = new google.maps.Map(mapElement, {
      zoom: 12,
      center: { lat: 18.7878, lng: 98.9935 }, // Chiang Mai center
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    console.log('Map created successfully')

    // Initialize services
    directionsService.value = new google.maps.DirectionsService()
    directionsRenderer.value = new google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: routeColor.value,
        strokeWeight: 6,
        strokeOpacity: 0.8
      }
    })
    directionsRenderer.value.setMap(map.value)

    console.log('Services initialized')

    // Add markers for key stops
    if (routeData.value.key_stops && routeData.value.key_stops.length > 0) {
      console.log('Adding markers for', routeData.value.key_stops.length, 'key stops')
      
      routeData.value.key_stops.forEach((stop, index) => {
        try {
          const marker = new google.maps.Marker({
            position: { lat: stop.lat, lng: stop.lng },
            map: map.value,
            title: stop.name,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: routeColor.value,
              fillOpacity: 1,
              strokeColor: '#FFFFFF',
              strokeWeight: 2
            },
            label: {
              text: (index + 1).toString(),
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 'bold'
            }
          })

          // Add info window
          const infoWindow = new google.maps.InfoWindow({
            content: `<div class="info-window">
              <h4>${stop.name}</h4>
              <p>จุดที่ ${index + 1}</p>
            </div>`
          })

          marker.addListener('click', () => {
            infoWindow.open(map.value, marker)
          })
          
          console.log('Marker added for:', stop.name)
        } catch (markerError) {
          console.error('Error adding marker for stop:', stop.name, markerError)
        }
      })
    } else {
      console.log('No key stops available')
    }

    console.log('Map initialization completed successfully')
    
  } catch (error) {
    console.error('Error initializing map:', error)
    mapError.value = true
    showError('เกิดข้อผิดพลาดในการโหลดแผนที่: ' + error.message)
  }
}

const showRoute = () => {
  if (!hasKeyStops.value) {
    showError('ไม่มีข้อมูลเส้นทางเพียงพอ')
    return
  }

  try {
    const waypoints = routeData.value.key_stops.slice(1, -1).map(stop => ({
      location: { lat: stop.lat, lng: stop.lng },
      stopover: true
    }))

    const request = {
      origin: { lat: routeData.value.key_stops[0].lat, lng: routeData.value.key_stops[0].lng },
      destination: { lat: routeData.value.key_stops[routeData.value.key_stops.length - 1].lat, lng: routeData.value.key_stops[routeData.value.key_stops.length - 1].lng },
      waypoints: waypoints,
      optimizeWaypoints: false,
      travelMode: google.maps.TravelMode.DRIVING
    }

    directionsService.value.route(request, (result, status) => {
      if (status === 'OK') {
        directionsRenderer.value.setDirections(result)
        
        // Fit map to show entire route
        const bounds = new google.maps.LatLngBounds()
        result.routes[0].legs.forEach(leg => {
          bounds.extend(leg.start_location)
          bounds.extend(leg.end_location)
        })
        map.value.fitBounds(bounds)
      } else {
        showError('ไม่สามารถแสดงเส้นทางได้')
      }
    })
  } catch (error) {
    console.error('Error showing route:', error)
    showError('เกิดข้อผิดพลาดในการแสดงเส้นทาง')
  }
}

const showRouteAttractions = () => {
  if (!hasKeyStops.value) {
    showError('ไม่มีข้อมูลจุดสำคัญ')
    return
  }

  try {
    // Clear previous attractions
    routeAttractions.value = []
    
    // Get route bounds
    const routeBounds = getRouteBounds()
    const routeCenter = getRouteCenter()
    
    // Filter attractions within route bounds
    const nearbyAttractions = attractionsData.value.filter(attraction => {
      return isWithinBounds(attraction, routeBounds) && 
             (attraction.category === 'ท่องเที่ยว' || 
              attraction.category === 'วัด' || 
              attraction.category === 'ตลาด' ||
              attraction.category === 'คาเฟ่' ||
              attraction.category === 'อาหาร')
    })
    
    // Calculate distances and sort by distance from route center
    nearbyAttractions.forEach(attraction => {
      attraction.distance = getDistance(routeCenter, { lat: attraction.lat, lng: attraction.lng })
    })
    
    nearbyAttractions.sort((a, b) => a.distance - b.distance)
    
    // Take top 10 attractions
    routeAttractions.value = nearbyAttractions.slice(0, 10)
    
    if (routeAttractions.value.length === 0) {
      showError('ไม่พบสถานที่ท่องเที่ยวระหว่างเส้นทาง')
    } else {
      console.log(`Found ${routeAttractions.value.length} attractions along route`)
      
      // Show the route on map
      showRoute()
      
      // Add markers for attractions
      routeAttractions.value.forEach((attraction, index) => {
        const marker = new google.maps.Marker({
          position: { lat: attraction.lat, lng: attraction.lng },
          map: map.value,
          title: attraction.name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
          }
        })

        const infoWindow = new google.maps.InfoWindow({
          content: `<div class="info-window">
            <div class="info-window-image">
              <img src="${attraction.picture}" alt="${attraction.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
            </div>
            <h4>${attraction.name}</h4>
            <p class="info-category">${attraction.category}</p>
            <p class="info-distance">ห่างจากเส้นทาง ${attraction.distance.toFixed(1)} กม.</p>
          </div>`
        })

        marker.addListener('click', () => {
          infoWindow.open(map.value, marker)
        })
      })
      
      showError(`พบสถานที่ท่องเที่ยว ${routeAttractions.value.length} แห่ง`)
      setTimeout(() => {
        errorMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    console.error('Error showing route attractions:', error)
    showError('เกิดข้อผิดพลาดในการแสดงสถานที่ท่องเที่ยว')
  }
}

const getRouteBounds = () => {
  if (!routeData.value.key_stops || routeData.value.key_stops.length === 0) {
    return null
  }
  
  let minLat = Infinity, maxLat = -Infinity
  let minLng = Infinity, maxLng = -Infinity
  
  routeData.value.key_stops.forEach(stop => {
    minLat = Math.min(minLat, stop.lat)
    maxLat = Math.max(maxLat, stop.lat)
    minLng = Math.min(minLng, stop.lng)
    maxLng = Math.max(maxLng, stop.lng)
  })
  
  // Add buffer around route
  const buffer = 0.02 // ~2km buffer
  return {
    minLat: minLat - buffer,
    maxLat: maxLat + buffer,
    minLng: minLng - buffer,
    maxLng: maxLng + buffer
  }
}

const getRouteCenter = () => {
  if (!routeData.value.key_stops || routeData.value.key_stops.length === 0) {
    return { lat: 18.7878, lng: 98.9935 } // Chiang Mai center
  }
  
  const totalLat = routeData.value.key_stops.reduce((sum, stop) => sum + stop.lat, 0)
  const totalLng = routeData.value.key_stops.reduce((sum, stop) => sum + stop.lng, 0)
  
  return {
    lat: totalLat / routeData.value.key_stops.length,
    lng: totalLng / routeData.value.key_stops.length
  }
}

const isWithinBounds = (attraction, bounds) => {
  if (!bounds) return false
  
  return attraction.lat >= bounds.minLat && 
         attraction.lat <= bounds.maxLat && 
         attraction.lng >= bounds.minLng && 
         attraction.lng <= bounds.maxLng
}

const getDistance = (point1, point2) => {
  const R = 6371 // Earth's radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLng = (point2.lng - point1.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const showPlaceOnMap = (place) => {
  try {
    const marker = new google.maps.Marker({
      position: { lat: place.lat, lng: place.lng },
      map: map.value,
      title: place.name,
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    })

    const infoWindow = new google.maps.InfoWindow({
      content: `<div class="info-window">
        <div class="info-window-image">
          <img src="${place.picture}" alt="${place.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;">
        </div>
        <h4>${place.name}</h4>
        <p class="info-category">${place.category}</p>
        <p class="info-distance">ห่างจากเส้นทาง ${place.distance ? place.distance.toFixed(1) : 'N/A'} กม.</p>
      </div>`
    })

    infoWindow.open(map.value, marker)
    map.value.setCenter({ lat: place.lat, lng: place.lng })
    map.value.setZoom(15)
  } catch (error) {
    console.error('Error showing place on map:', error)
    showError('เกิดข้อผิดพลาดในการแสดงสถานที่บนแผนที่')
  }
}

// --- Lifecycle ---
onMounted(async () => {
  console.log('Route component mounted, loading attractions data...')
  
  // Load attractions data first
  await loadAttractionsData()
  
  // Wait a bit for DOM to be ready
  setTimeout(() => {
    loadMapWithFallback()
  }, 100)
})

const loadMapWithFallback = () => {
  // Try multiple approaches to load the map
  if (window.google && window.google.maps) {
    console.log('Google Maps API already available')
    initMap()
  } else {
    console.log('Attempting to load Google Maps API...')
    loadGoogleMapsAPI()
  }
}

const loadGoogleMapsAPI = () => {
  try {
    // Remove any existing scripts to avoid conflicts
    const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]')
    existingScripts.forEach(script => script.remove())

    const script = document.createElement('script')
    
    // Try different API keys
    const apiKeys = [
      import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg',
      'AIzaSyC2P_cTmLikJ1HXACpVK5IMuobDq18hcgI'
    ]
    
    const apiKey = apiKeys.find(key => key) || 'AIzaSyB41DRUbKWJHPxaFjMAwdrzWzbVKartNGg'
    
    console.log('Using API key:', apiKey ? 'API key available' : 'No API key')
    
    // Use a simpler loading approach
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    
    script.onload = () => {
      console.log('Google Maps API loaded successfully via onload')
      setTimeout(() => {
        if (window.google && window.google.maps) {
          initMap()
        } else {
          console.error('Google Maps API not available after load')
          mapError.value = true
          showError('ไม่สามารถโหลดแผนที่ได้')
        }
      }, 500)
    }
    
    script.onerror = (error) => {
      console.error('Failed to load Google Maps API:', error)
      mapError.value = true
      showError('ไม่สามารถโหลดแผนที่ได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต')
    }
    
    document.head.appendChild(script)
    
    // Fallback timeout
    setTimeout(() => {
      if (!window.google || !window.google.maps) {
        console.error('Google Maps API failed to load within timeout')
        mapError.value = true
        showError('ไม่สามารถโหลดแผนที่ได้ กรุณาลองใหม่อีกครั้ง')
      }
    }, 15000) // 15 second timeout
    
  } catch (error) {
    console.error('Error loading Google Maps API:', error)
    mapError.value = true
    showError('เกิดข้อผิดพลาดในการโหลดแผนที่')
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

:root {
  --primary-color: #4A4E69;
  --background-color: #F8F9FA;
  --card-bg-color: #FFFFFF;
  --text-color: #22223B;
  --border-color: #EAEAEA;
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 8px 15px rgba(0,0,0,0.1);
  --border-radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

#route-detail-container {
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

/* Header */
.route-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
}

.back-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.8rem 1.2rem;
  border-radius: 25px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  font-weight: 600;
  font-size: 0.9rem;
  min-width: 80px;
  justify-content: center;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.back-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.back-arrow {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.back-btn:hover .back-arrow {
  transform: translateX(-3px);
}

.back-text {
  font-weight: 600;
  letter-spacing: 0.5px;
}

.route-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
  text-align: center;
}

/* Route Info Card */
.route-info-card {
  background: var(--card-bg-color);
  margin: 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.route-color-indicator {
  height: 8px;
  width: 100%;
}

.route-details {
  padding: 1.5rem;
}

.route-basic-info h2 {
  margin: 0 0 1rem 0;
  font-size: 1.4rem;
  color: #2C3E50;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.route-meta {
  margin-bottom: 1.5rem;
}

.service-time, .fare {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #34495E;
  font-weight: 500;
  background: #F8F9FA;
  padding: 0.5rem 0.8rem;
  border-radius: 6px;
  border: 1px solid #E9ECEF;
  margin-bottom: 0.5rem;
}

.service-time i, .fare i {
  color: var(--primary-color);
}

.pickup-points, .destinations, .route-note {
  margin-bottom: 1.5rem;
}

.pickup-points h3, .destinations h3, .route-note h3 {
  font-size: 1.1rem;
  margin: 0 0 1rem 0;
  color: #2C3E50;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 2px solid #E9ECEF;
  padding-bottom: 0.5rem;
}

.pickup-points h3 i, .destinations h3 i, .route-note h3 i {
  color: var(--primary-color);
}

.pickup-points ul, .destinations ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.pickup-points li, .destinations li {
  padding: 0.7rem 0;
  border-bottom: 1px solid #F1F3F4;
  font-size: 0.95rem;
  color: #34495E;
  font-weight: 500;
  position: relative;
  padding-left: 1.5rem;
}

.pickup-points li:before, .destinations li:before {
  content: "•";
  color: var(--primary-color);
  font-weight: bold;
  position: absolute;
  left: 0;
  top: 0.7rem;
}

.pickup-points li:last-child, .destinations li:last-child {
  border-bottom: none;
}

.route-note p {
  background: linear-gradient(135deg, #FFF8E1, #FFF3E0);
  padding: 1.2rem;
  border-radius: 10px;
  border-left: 4px solid #FF9800;
  margin: 0;
  font-size: 0.95rem;
  color: #E65100;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(255, 152, 0, 0.1);
}

/* Map Section */
.map-section {
  background: var(--card-bg-color);
  margin: 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.map-section h3 {
  padding: 1.2rem 1.5rem;
  margin: 0;
  font-size: 1.1rem;
  color: #2C3E50;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  background: #F8F9FA;
}

.map-section h3 i {
  color: var(--primary-color);
}

.map-container {
  height: 300px;
  width: 100%;
}

.map-error {
  height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #F8F9FA, #E9ECEF);
  color: #495057;
  text-align: center;
  padding: 2rem;
}

.map-error i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #DC3545;
}

.map-error p {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  font-weight: 500;
  color: #495057;
}

.retry-btn {
  background: linear-gradient(135deg, var(--primary-color), #5A6C8D);
  color: white;
  border: none;
  padding: 0.8rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(74, 78, 105, 0.3);
}

.retry-btn:hover {
  background: linear-gradient(135deg, #3A3D5A, #4A4E69);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(74, 78, 105, 0.4);
}

.map-controls {
  padding: 1rem 1.5rem;
  display: flex;
  gap: 0.8rem;
  background: #F8F9FA;
}

.map-btn {
  flex: 1;
  padding: 0.9rem;
  border: 2px solid #E9ECEF;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #495057;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.map-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-color), #5A6C8D);
  color: white;
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(74, 78, 105, 0.3);
}

.map-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #F8F9FA;
  color: #ADB5BD;
  border-color: #E9ECEF;
}

/* Error Message */
.error-message {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, #DC3545, #C82333);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: 90%;
  animation: slideDown 0.3s ease-out;
  border: 1px solid rgba(255,255,255,0.2);
}

.error-message i {
  font-size: 1.2rem;
}

.error-message p {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* Nearby Places */
.nearby-places {
  background: var(--card-bg-color);
  margin: 1rem;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-md);
  border: 1px solid var(--border-color);
}

.nearby-places h3 {
  padding: 1.2rem 1.5rem;
  margin: 0;
  font-size: 1.1rem;
  color: #2C3E50;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
  background: #F8F9FA;
}

.nearby-places h3 i {
  color: var(--primary-color);
}

.places-list {
  padding: 1rem 1.5rem;
}

.place-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 0;
  border-bottom: 1px solid #F1F3F4;
  transition: var(--transition);
}

.place-card:hover {
  background: #F8F9FA;
  border-radius: 8px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  margin: 0 -0.5rem;
}

.place-card:last-child {
  border-bottom: none;
}

.place-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.place-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-info {
  flex: 1;
}

.place-info h4 {
  margin: 0 0 0.5rem 0;
  font-size: 1rem;
  color: #2C3E50;
  font-weight: 600;
}

.place-category {
  margin: 0 0 0.5rem 0;
  font-size: 0.9rem;
  color: var(--primary-color);
  font-weight: 600;
  background: rgba(74, 78, 105, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  display: inline-block;
}

.place-distance {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #6C757D;
  font-weight: 500;
}

.place-distance i {
  color: var(--primary-color);
}

.show-on-map-btn {
  background: linear-gradient(135deg, var(--primary-color), #5A6C8D);
  color: white;
  border: none;
  padding: 0.8rem;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(74, 78, 105, 0.3);
}

.show-on-map-btn:hover {
  background: linear-gradient(135deg, #3A3D5A, #4A4E69);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(74, 78, 105, 0.4);
}

/* Info Window Styles */
:deep(.info-window) {
  padding: 0.8rem;
  max-width: 280px;
  border-radius: 8px;
}

:deep(.info-window-image) {
  margin-bottom: 0.5rem;
}

:deep(.info-window h4) {
  margin: 0 0 0.5rem 0;
  font-size: 0.95rem;
  color: #2C3E50;
  font-weight: 600;
}

:deep(.info-category) {
  margin: 0 0 0.3rem 0;
  font-size: 0.85rem;
  color: var(--primary-color);
  font-weight: 600;
  background: rgba(74, 78, 105, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 4px;
  display: inline-block;
}

:deep(.info-distance) {
  margin: 0;
  font-size: 0.85rem;
  color: #495057;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 480px) {
  .route-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .map-controls {
    flex-direction: column;
  }
  
  .place-card {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
  }
  
  .place-image {
    width: 100%;
    height: 120px;
  }
  
  .show-on-map-btn {
    align-self: stretch;
  }
  
  .error-message {
    top: 70px;
    left: 1rem;
    right: 1rem;
    transform: none;
    max-width: none;
  }
}
</style> 