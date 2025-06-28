<template>
  <div class="guilde-container">
    <h2>นำทางด้วยแผนที่สองแถว</h2>
    <div class="map-instruction">
      <span v-if="!startPoint">คลิกเลือกจุดเริ่มต้นบนแผนที่</span>
      <span v-else-if="!endPoint">เลือกสถานที่ท่องเที่ยวปลายทาง</span>
      <span v-else>เส้นทางจาก <b>{{ startPointLabel }}</b> ไป <b>{{ endPoint.Name }}</b></span>
      <button v-if="startPoint || endPoint" @click="resetSelection" class="reset-btn">เริ่มใหม่</button>
    </div>
    <div id="map" class="map-view"></div>
    <div v-if="startPoint && endPoint" class="result-section">
      <div class="route-info">
        <h3>เส้นทางที่เลือก</h3>
        <p>จาก <b>{{ startPointLabel }}</b> ไป <b>{{ endPoint.Name }}</b></p>
        <p>ระยะทางประมาณ: <b>{{ routeDistance }} เมตร</b></p>
      </div>
      <div class="songthaew-info">
        <h3>แนะนำสายรถสองแถว</h3>
        <div v-if="suggestedLine" class="suggested-line">
          <div class="line-header">
            <div class="line-color" :style="{ backgroundColor: getLineColor(suggestedLine.color) }"></div>
            <div class="line-name">{{ suggestedLine.name }}</div>
          </div>
          <div class="line-details">
            <div class="detail-item">
              <span class="label">เส้นทาง:</span>
              <span class="value">{{ suggestedLine.route || 'ไม่ระบุ' }}</span>
            </div>
            <div class="detail-item">
              <span class="label">จุดขึ้นรถ:</span>
              <span class="value">{{ suggestedLine.startStop?.name }}</span>
              <span class="distance">(ห่าง {{ suggestedLine.distanceToStart }}m)</span>
            </div>
            <div class="detail-item">
              <span class="label">จุดลงรถ:</span>
              <span class="value">{{ suggestedLine.endStop?.name }}</span>
              <span class="distance">(ห่าง {{ suggestedLine.distanceToEnd }}m)</span>
            </div>
            <div class="detail-item">
              <span class="label">เวลาให้บริการ:</span>
              <span class="value">{{ suggestedLine.service_time }}</span>
            </div>
            <div class="detail-item">
              <span class="label">ค่าโดยสาร:</span>
              <span class="value">{{ suggestedLine.fare || 'ไม่ระบุ' }}</span>
            </div>
            <div class="detail-item" v-if="suggestedLine.note">
              <span class="label">หมายเหตุ:</span>
              <span class="value note">{{ suggestedLine.note }}</span>
            </div>
          </div>
          <div class="route-summary">
            <div class="summary-item">
              <span class="summary-label">ระยะทางรวม:</span>
              <span class="summary-value">{{ suggestedLine.totalDistance }}m</span>
            </div>
            <div class="summary-item">
              <span class="summary-label">สถานที่ปลายทาง:</span>
              <span class="summary-value">{{ suggestedLine.destinations?.length || 0 }} แห่ง</span>
            </div>
          </div>
        </div>
        <div v-else class="no-route">
          <p>🚐 ไม่มีสายรถสองแถวที่เหมาะสม</p>
          <p class="suggestion">ลองเลือกจุดเริ่มต้นหรือปลายทางใหม่</p>
          <p class="reason">(ระยะทางจากจุดจอดรถสองแถวเกิน 1 กิโลเมตร)</p>
        </div>
      </div>
    </div>
    <div v-if="userLocation && nearbyAttractions.length" class="attraction-section centered-section">
      <h3 class="attraction-title">สถานที่ท่องเที่ยวใกล้คุณ</h3>
      <div class="category-filter-bar">
        <button
          v-for="cat in uniqueCategories"
          :key="cat"
          :class="['category-filter-btn', { active: selectedCategory === cat }]"
          @click="selectedCategory = cat"
        >
          {{ cat }}
        </button>
      </div>
      <div class="attraction-list">
        <div
          v-for="a in filteredNearbyAttractions"
          :key="a.Name"
          class="attraction-card"
          @click="showRouteToAttraction(a)"
        >
          <img :src="a.Picture" :alt="a.Name" v-if="a.Picture" />
          <div class="attraction-info">
            <b>{{ a.Name }}</b>
            <div class="distance">ห่าง {{ a.distance }} เมตร</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';
import datCsvUrl from '../assets/dat.csv?url';
import songthaewLinesData from '../assets/songthaew_lines.json';

export default {
  name: 'Guilde',
  data() {
    return {
      points: [],
      startPoint: null,
      endPoint: null,
      map: null,
      markers: [],
      polyline: null,
      userLocation: null,
      routeDistance: 0,
      suggestedLine: null,
      songthaewLines: songthaewLinesData,
      attractions: [],
      nearbyAttractions: [],
      selectedCategory: 'ทั้งหมด',
      attractionMarkers: [],
      songthaewPolyline: null,
      keyStopMarkers: [],
      connectionRoutes: [],
    };
  },
  computed: {
    groupedNearbyAttractions() {
      // แยก nearbyAttractions ตาม Categories
      if (!this.nearbyAttractions || !this.nearbyAttractions.length) return {};
      return this.nearbyAttractions.reduce((acc, a) => {
        const cat = a.Categories || 'อื่นๆ';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(a);
        return acc;
      }, {});
    },
    uniqueCategories() {
      const cats = this.nearbyAttractions.map(a => a.Categories || 'อื่นๆ');
      return ['ทั้งหมด', ...Array.from(new Set(cats))];
    },
    filteredNearbyAttractions() {
      if (this.selectedCategory === 'ทั้งหมด') return this.nearbyAttractions;
      return this.nearbyAttractions.filter(a => a.Categories === this.selectedCategory);
    },
    startPointLabel() {
      if (!this.startPoint) return '';
      if (this.startPoint.Name) return this.startPoint.Name;
      return `จุดที่เลือก (${this.startPoint.lat.toFixed(5)}, ${this.startPoint.lng.toFixed(5)})`;
    },
  },
  mounted() {
    this.loadCSV();
    this.getUserLocation();
  },
  methods: {
    loadCSV() {
      fetch(datCsvUrl)
        .then(res => res.text())
        .then(csv => {
          Papa.parse(csv, {
            header: true,
            complete: (results) => {
              this.points = results.data.filter(p => p.Latitude && p.Longitude);
              this.attractions = this.points.filter(p => p.Categories !== 'อื่นๆ');
              console.log(`📊 โหลดข้อมูลสถานที่ท่องเที่ยว ${this.attractions.length} แห่ง`);
              this.$nextTick(() => {
                this.initMap();
                // เรียก findNearbyAttractions หลังจาก attractions โหลดเสร็จ
                if (this.userLocation) {
                  this.findNearbyAttractions();
                }
              });
            }
          });
        });
    },
    getUserLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            this.userLocation = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude
            };
            console.log('📍 ได้ตำแหน่งผู้ใช้:', this.userLocation);
            // เรียก findNearbyAttractions หลังจากได้ตำแหน่งแล้ว
            this.findNearbyAttractions();
          },
          error => {
            console.error('❌ ไม่สามารถได้ตำแหน่งผู้ใช้:', error);
            // ใช้ตำแหน่งเริ่มต้นของเชียงใหม่
            this.userLocation = { lat: 18.7965, lng: 98.9675 };
            this.findNearbyAttractions();
          }
        );
      } else {
        console.log('❌ Browser ไม่รองรับ geolocation');
        // ใช้ตำแหน่งเริ่มต้นของเชียงใหม่
        this.userLocation = { lat: 18.7965, lng: 98.9675 };
        this.findNearbyAttractions();
      }
    },
    initMap() {
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAYer7PyjzNfQS6ekM4xb25emuhFLl661U`;
        script.async = true;
        script.defer = true;
        script.onload = this.renderMap;
        document.head.appendChild(script);
      } else {
        this.renderMap();
      }
    },
    renderMap() {
      this.map = new window.google.maps.Map(document.getElementById('map'), {
        center: this.points[0] ? { lat: parseFloat(this.points[0].Latitude), lng: parseFloat(this.points[0].Longitude) } : { lat: 18.7965, lng: 98.9675 },
        zoom: 14,
        styles: [
          { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          { featureType: 'transit', stylers: [{ visibility: 'off' }] }
        ]
      });
      // แสดง marker สถานที่ท่องเที่ยวทั้งหมด (สีแดง, คลิกเลือกเป็นปลายทาง)
      this.attractionMarkers = this.attractionMarkers || [];
      this.attractionMarkers.forEach(m => m.setMap(null));
      this.attractionMarkers = [];
      this.points.forEach((point, idx) => {
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(point.Latitude), lng: parseFloat(point.Longitude) },
          map: this.map,
          title: point.Name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });
        
        // InfoWindow แสดงแค่ข้อมูลและรูป
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 12px; min-width: 250px;">
              <h3 style="margin: 0 0 8px 0; color: #1976d2; font-size: 16px;">${point.Name}</h3>
              <p style="margin: 4px 0; font-size: 14px; color: #666;">
                <strong>ประเภท:</strong> ${point.Categories || 'ไม่ระบุ'}
              </p>
              <p style="margin: 4px 0; font-size: 14px; color: #666;">
                <strong>ตำแหน่ง:</strong> ${parseFloat(point.Latitude).toFixed(6)}, ${parseFloat(point.Longitude).toFixed(6)}
              </p>
              ${point.Picture ? `<img src="${point.Picture}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin: 8px 0;" alt="${point.Name}">` : ''}
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
          // ถ้าเลือก startPoint แล้ว ให้เลือกเป็นปลายทางทันที
          if (this.startPoint) {
            this.selectEndPoint(point);
          }
        });
        
        this.attractionMarkers.push(marker);
      });
      // แสดง marker จุดตัวเรา
      if (this.userLocation) {
        if (this.userMarker) this.userMarker.setMap(null);
        this.userMarker = new window.google.maps.Marker({
          position: this.userLocation,
          map: this.map,
          label: 'คุณ',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      }
      // แสดง marker จุดเริ่มต้น
      if (this.startPoint) {
        if (this.startMarker) this.startMarker.setMap(null);
        this.startMarker = new window.google.maps.Marker({
          position: this.startPoint,
          map: this.map,
          label: 'Start',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      }
      // แสดง marker จุดปลายทาง (endPoint)
      if (this.endPoint) {
        if (this.endMarker) this.endMarker.setMap(null);
        this.endMarker = new window.google.maps.Marker({
          position: { lat: parseFloat(this.endPoint.Latitude), lng: parseFloat(this.endPoint.Longitude) },
          map: this.map,
          label: 'จุดหมาย',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/orange-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      }
      // เพิ่ม listener สำหรับคลิกเลือกจุดเริ่มต้น
      this.map.addListener('click', (e) => {
        if (!this.startPoint) {
          this.startPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() };
          if (this.startMarker) this.startMarker.setMap(null);
          this.startMarker = new window.google.maps.Marker({
            position: this.startPoint,
            map: this.map,
            label: 'Start',
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(40, 40)
            }
          });
        }
      });
    },
    addMarkers() {
      this.markers.forEach(m => m.setMap(null));
      this.markers = [];
      this.points.forEach((point, idx) => {
        const marker = new window.google.maps.Marker({
          position: { lat: parseFloat(point.Latitude), lng: parseFloat(point.Longitude) },
          map: this.map,
          label: (idx+1).toString(),
          title: point.Name,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(32, 32)
          }
        });
        this.markers.push(marker);
      });
    },
    selectEndPoint(attraction) {
      this.endPoint = attraction;
      this.drawRoute();
      this.suggestSongthaewLine();
    },
    resetSelection() {
      this.startPoint = null;
      this.endPoint = null;
      this.routeDistance = 0;
      this.suggestedLine = null;
      
      // ลบเส้นทางทั้งหมด
      if (this.polyline) {
        this.polyline.setMap(null);
        this.polyline = null;
      }
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
        this.directionsRenderer = null;
      }
      
      // ลบเส้นทางรถสองแถว
      this.clearSongthaewRoutes();
      
      // ลบ markers
      if (this.startMarker) {
        this.startMarker.setMap(null);
        this.startMarker = null;
      }
      if (this.endMarker) {
        this.endMarker.setMap(null);
        this.endMarker = null;
      }
      if (this.userMarker) {
        this.userMarker.setMap(null);
        this.userMarker = null;
      }
      if (this.attractionMarkers) {
        this.attractionMarkers.forEach(m => m.setMap(null));
        this.attractionMarkers = [];
      }
      
      this.renderMap();
    },
    drawRoute() {
      if (this.polyline) this.polyline.setMap(null);
      if (this.directionsRenderer) {
        this.directionsRenderer.setMap(null);
        this.directionsRenderer = null;
      }
      
      // ลบเส้นทางรถสองแถวเก่า
      this.clearSongthaewRoutes();
      
      const path = [
        { lat: this.startPoint.lat, lng: this.startPoint.lng },
        { lat: parseFloat(this.endPoint.Latitude), lng: parseFloat(this.endPoint.Longitude) }
      ];
      
      // ใช้ Directions API วาดเส้นทางตามถนนจริง
      const directionsService = new window.google.maps.DirectionsService();
      this.directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: '#ff6b6b',
          strokeOpacity: 0.9,
          strokeWeight: 6
        }
      });
      
      directionsService.route({
        origin: path[0],
        destination: path[1],
        travelMode: 'DRIVING'
      }, (result, status) => {
        if (status === 'OK' && result.routes && result.routes[0]) {
          this.directionsRenderer.setDirections(result);
          // ดึงระยะทางจริงจาก legs
          const leg = result.routes[0].legs[0];
          this.routeDistance = leg.distance ? leg.distance.value : 0;
        } else {
          // fallback: วาดเส้นตรงถ้า directions error
          this.polyline = new window.google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: '#ff6b6b',
            strokeOpacity: 0.9,
            strokeWeight: 6,
            map: this.map
          });
          this.routeDistance = this.getDistance(path[0], path[1]);
        }
        
        // แนะนำสายรถสองแถวแบบใหม่ (ใกล้ start/end จริง)
        this.suggestSongthaewLineByStartEnd();
      });
    },
    getDistance(a, b) {
      const R = 6371000;
      const dLat = (b.lat - a.lat) * Math.PI / 180;
      const dLng = (b.lng - a.lng) * Math.PI / 180;
      const lat1 = a.lat * Math.PI / 180;
      const lat2 = b.lat * Math.PI / 180;
      const x = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.sin(dLng/2) * Math.sin(dLng/2) * Math.cos(lat1) * Math.cos(lat2);
      const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
      return Math.round(R * c);
    },
    suggestSongthaewLine() {
      this.suggestedLine = this.songthaewLines.find(line => {
        return line.stops.includes(this.endPoint.Name);
      }) || null;
    },
    suggestSongthaewLineByStartEnd() {
      let minTotalDist = Infinity;
      let bestLine = null;
      let bestStartStop = null;
      let bestEndStop = null;
      const start = this.startPoint;
      const end = { lat: parseFloat(this.endPoint.Latitude), lng: parseFloat(this.endPoint.Longitude) };
      
      console.log('🔍 เริ่มค้นหาเส้นทางรถสองแถว...');
      console.log('จุดเริ่มต้น:', start);
      console.log('จุดปลายทาง:', end);
      
      // ใช้ key_stops แทน polyline เพื่อความแม่นยำและเร็ว
      this.songthaewLines.forEach(line => {
        const keyStops = line.key_stops || [];
        if (keyStops.length === 0) {
          console.log(`⚠️ สาย ${line.name}: ไม่มี key_stops`);
          return;
        }
        
        // หาจุดจอดที่ใกล้จุดเริ่มต้นและจุดปลายทาง
        let minStartDist = Infinity, minEndDist = Infinity;
        let closestStartStop = null, closestEndStop = null;
        
        keyStops.forEach(stop => {
          const stopPos = { lat: stop.lat, lng: stop.lng };
          const distToStart = this.getDistance(start, stopPos);
          const distToEnd = this.getDistance(end, stopPos);
          
          if (distToStart < minStartDist) {
            minStartDist = distToStart;
            closestStartStop = stop;
          }
          if (distToEnd < minEndDist) {
            minEndDist = distToEnd;
            closestEndStop = stop;
          }
        });
        
        // ตรวจสอบว่าจุดจอดอยู่ในเส้นทางเดียวกันหรือไม่
        if (closestStartStop && closestEndStop) {
          const startIndex = keyStops.findIndex(stop => stop.name === closestStartStop.name);
          const endIndex = keyStops.findIndex(stop => stop.name === closestEndStop.name);
          
          // ตรวจสอบว่าจุดจอดอยู่ในลำดับที่ถูกต้อง (ไม่ใช่จุดเดียวกัน)
          if (startIndex !== -1 && endIndex !== -1 && startIndex !== endIndex) {
            const totalDist = minStartDist + minEndDist;
            console.log(`สาย ${line.name}: ระยะทางรวม ${totalDist}m (เริ่ม: ${minStartDist}m, ปลาย: ${minEndDist}m)`);
            
            // จำกัดระยะทางไม่เกิน 2km (2000m) เพื่อให้ใกล้เคียงจริง
            if (totalDist < minTotalDist && totalDist < 2000 && minStartDist < 1000 && minEndDist < 1000) {
              minTotalDist = totalDist;
              bestLine = line;
              bestStartStop = closestStartStop;
              bestEndStop = closestEndStop;
              console.log(`✅ พบเส้นทางที่ดีกว่า: ${line.name}`);
            }
          } else {
            console.log(`⚠️ สาย ${line.name}: จุดจอดไม่ถูกต้อง (startIndex: ${startIndex}, endIndex: ${endIndex})`);
          }
        }
      });
      
      if (bestLine && minTotalDist < 2000) {
        console.log(`🎯 เส้นทางที่แนะนำ: ${bestLine.name}`);
        console.log(`จุดขึ้นรถ: ${bestStartStop.name} (ห่าง ${this.getDistance(start, { lat: bestStartStop.lat, lng: bestStartStop.lng })}m)`);
        console.log(`จุดลงรถ: ${bestEndStop.name} (ห่าง ${this.getDistance(end, { lat: bestEndStop.lat, lng: bestEndStop.lng })}m)`);
        
        this.suggestedLine = {
          ...bestLine,
          startStop: bestStartStop,
          endStop: bestEndStop,
          distanceToStart: this.getDistance(start, { lat: bestStartStop.lat, lng: bestStartStop.lng }),
          distanceToEnd: this.getDistance(end, { lat: bestEndStop.lat, lng: bestEndStop.lng }),
          totalDistance: minTotalDist
        };
        
        // วาดเส้นทางรถสองแถวบนแผนที่
        this.drawSongthaewRoute(bestLine, bestStartStop, bestEndStop);
      } else {
        console.log('❌ ไม่พบเส้นทางที่เหมาะสม');
        this.suggestedLine = null;
        // ลบเส้นทางเก่าออก
        this.clearSongthaewRoutes();
      }
    },
    
    drawSongthaewRoute(line, startStop, endStop) {
      console.log('🎨 เริ่มวาดเส้นทางรถสองแถว...');
      console.log('สาย:', line.name);
      console.log('จุดเริ่ม:', startStop);
      console.log('จุดปลาย:', endStop);
      
      // ลบเส้นทางเดิมออก
      this.clearSongthaewRoutes();
      
      const keyStops = line.key_stops || [];
      if (keyStops.length < 2) {
        console.log('❌ ไม่มี key_stops ที่เพียงพอ');
        return;
      }
      
      // หาตำแหน่งของ startStop และ endStop ใน keyStops
      const startIndex = keyStops.findIndex(stop => 
        stop.name === startStop.name || 
        (Math.abs(stop.lat - startStop.lat) < 0.001 && Math.abs(stop.lng - startStop.lng) < 0.001)
      );
      const endIndex = keyStops.findIndex(stop => 
        stop.name === endStop.name || 
        (Math.abs(stop.lat - endStop.lat) < 0.001 && Math.abs(stop.lng - endStop.lng) < 0.001)
      );
      
      console.log('ตำแหน่งใน keyStops:', { startIndex, endIndex });
      
      // ถ้าไม่เจอ ให้ใช้จุดแรกและจุดสุดท้าย
      const minIndex = startIndex === -1 ? 0 : Math.min(startIndex, endIndex);
      const maxIndex = endIndex === -1 ? keyStops.length - 1 : Math.max(startIndex, endIndex);
      
      console.log('ช่วงเส้นทาง:', { minIndex, maxIndex });
      
      // ตรวจสอบว่าช่วงเส้นทางถูกต้อง
      if (minIndex >= maxIndex) {
        console.log('❌ ช่วงเส้นทางไม่ถูกต้อง');
        return;
      }
      
      // ใช้ Directions API วาดเส้นทางตามถนนจริง
      this.drawDirectionsRoute(keyStops, minIndex, maxIndex, line.color);
      
      // เพิ่ม markers สำหรับจุดจอดสำคัญ
      this.addKeyStopMarkers(keyStops, minIndex, maxIndex, line.color);
      
      // วาดเส้นทางเชื่อมต่อจากจุดเริ่มต้นไปยังจุดขึ้นรถ
      const start = this.startPoint;
      const end = { lat: parseFloat(this.endPoint.Latitude), lng: parseFloat(this.endPoint.Longitude) };
      
      this.drawConnectionRoute(start, { lat: keyStops[minIndex].lat, lng: keyStops[minIndex].lng }, '#4CAF50', 'จุดเริ่มต้น → จุดขึ้นรถ');
      this.drawConnectionRoute({ lat: keyStops[maxIndex].lat, lng: keyStops[maxIndex].lng }, end, '#F44336', 'จุดลงรถ → จุดปลายทาง');
    },
    
    drawDirectionsRoute(keyStops, startIndex, endIndex, lineColor) {
      console.log('🎯 วาดเส้นทางรถสองแถวด้วย Directions API');
      
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: this.getLineColor(lineColor),
          strokeOpacity: 0.9,
          strokeWeight: 8
        }
      });
      
      // สร้าง waypoints สำหรับเส้นทางผ่านจุดจอดทั้งหมด
      const waypoints = [];
      for (let i = startIndex + 1; i < endIndex; i++) {
        waypoints.push({
          location: { lat: keyStops[i].lat, lng: keyStops[i].lng },
          stopover: true
        });
      }
      
      console.log('Waypoints:', waypoints.length);
      
      // ถ้ามี waypoints มากเกินไป ให้ลดลง
      if (waypoints.length > 8) {
        const step = Math.ceil(waypoints.length / 8);
        const reducedWaypoints = [];
        for (let i = 0; i < waypoints.length; i += step) {
          reducedWaypoints.push(waypoints[i]);
        }
        waypoints.length = 0;
        waypoints.push(...reducedWaypoints);
        console.log('ลด waypoints เหลือ:', waypoints.length);
      }
      
      directionsService.route({
        origin: { lat: keyStops[startIndex].lat, lng: keyStops[startIndex].lng },
        destination: { lat: keyStops[endIndex].lat, lng: keyStops[endIndex].lng },
        waypoints: waypoints,
        travelMode: 'DRIVING',
        optimizeWaypoints: false
      }, (result, status) => {
        if (status === 'OK') {
          console.log('✅ Directions API สำเร็จ');
          directionsRenderer.setDirections(result);
          this.songthaewPolyline = directionsRenderer;
        } else {
          console.error('❌ Directions API failed:', status);
          // fallback: วาดเส้นตรงถ้า directions error
          this.drawSimpleRoute(keyStops, startIndex, endIndex, lineColor);
        }
      });
    },
    
    clearSongthaewRoutes() {
      // ลบเส้นทางรถสองแถว
      if (this.songthaewPolyline) {
        if (this.songthaewPolyline.setMap) {
          this.songthaewPolyline.setMap(null);
        } else if (this.songthaewPolyline.setDirections) {
          this.songthaewPolyline.setMap(null);
        }
        this.songthaewPolyline = null;
      }
      
      // ลบ markers จุดจอด
      if (this.keyStopMarkers) {
        this.keyStopMarkers.forEach(marker => marker.setMap(null));
        this.keyStopMarkers = [];
      }
      
      // ลบเส้นทางเชื่อมต่อ
      if (this.connectionRoutes) {
        this.connectionRoutes.forEach(r => {
          if (r.setMap) {
            r.setMap(null);
          }
        });
        this.connectionRoutes = [];
      }
      
      console.log('🧹 ลบเส้นทางรถสองแถวเก่าเรียบร้อย');
    },
    
    drawConnectionRoute(from, to, color, label) {
      console.log(`🔗 วาดเส้นทางเชื่อมต่อ: ${label}`);
      
      // ใช้ Directions API วาดเส้นทางตามถนนจริง
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: this.map,
        suppressMarkers: true,
        polylineOptions: {
          strokeColor: color,
          strokeOpacity: 0.7,
          strokeWeight: 4,
          icons: [{
            icon: {
              path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW
            },
            offset: '50%',
            repeat: '100px'
          }]
        }
      });
      
      directionsService.route({
        origin: from,
        destination: to,
        travelMode: 'WALKING'
      }, (result, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(result);
          // เก็บ reference เพื่อลบออกภายหลัง
          if (!this.connectionRoutes) this.connectionRoutes = [];
          this.connectionRoutes.push(directionsRenderer);
          console.log(`✅ วาดเส้นทางเชื่อมต่อเสร็จแล้ว: ${label}`);
        } else {
          console.error(`❌ Directions API failed for ${label}:`, status);
          // fallback: วาดเส้นตรง
          const connectionPolyline = new window.google.maps.Polyline({
            path: [from, to],
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.7,
            strokeWeight: 4,
            icons: [{
              icon: {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW
              },
              offset: '50%',
              repeat: '100px'
            }],
            map: this.map
          });
          
          if (!this.connectionRoutes) this.connectionRoutes = [];
          this.connectionRoutes.push(connectionPolyline);
          console.log(`✅ วาดเส้นทางเชื่อมต่อ (fallback) เสร็จแล้ว: ${label}`);
        }
      });
    },
    
    drawSimpleRoute(keyStops, startIndex, endIndex, lineColor) {
      console.log('🎯 วาดเส้นทางรถสองแถวด้วย polyline');
      const routePath = [];
      for (let i = startIndex; i <= endIndex; i++) {
        routePath.push({ lat: keyStops[i].lat, lng: keyStops[i].lng });
      }
      
      this.songthaewPolyline = new window.google.maps.Polyline({
        path: routePath,
        geodesic: true,
        strokeColor: this.getLineColor(lineColor),
        strokeOpacity: 0.9,
        strokeWeight: 8,
        map: this.map
      });
      
      console.log('✅ วาดเส้นทางรถสองแถวเสร็จแล้ว');
    },
    
    getLineColor(colorName) {
      const colors = {
        'yellow': '#FFD700',
        'orange': '#FF8C00',
        'blue': '#4169E1',
        'white': '#FFFFFF',
        'green': '#32CD32',
        'red': '#DC143C'
      };
      return colors[colorName] || '#FFD700';
    },
    
    addKeyStopMarkers(keyStops, startIndex, endIndex, lineColor) {
      // ลบ markers เดิมออก
      if (this.keyStopMarkers) {
        this.keyStopMarkers.forEach(marker => marker.setMap(null));
      }
      this.keyStopMarkers = [];
      
      console.log('🎨 เพิ่ม markers สำหรับจุดจอด:', { startIndex, endIndex, totalStops: keyStops.length });
      
      // ตรวจสอบข้อมูล
      if (!keyStops || keyStops.length === 0) {
        console.log('❌ ไม่มี keyStops ที่จะแสดง');
        return;
      }
      
      // เพิ่ม markers สำหรับจุดจอดในเส้นทาง
      for (let i = startIndex; i <= endIndex; i++) {
        const stop = keyStops[i];
        if (!stop || typeof stop.lat === 'undefined' || typeof stop.lng === 'undefined') {
          console.log(`⚠️ ข้ามจุดจอดที่ ${i}: ข้อมูลไม่ครบ`, stop);
          continue;
        }
        
        const isStart = i === startIndex;
        const isEnd = i === endIndex;
        
        let markerIcon;
        if (isStart) {
          // จุดเริ่มต้น - สีเขียว
          markerIcon = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#4CAF50',
            fillOpacity: 0.9,
            strokeColor: '#2E7D32',
            strokeWeight: 3
          };
        } else if (isEnd) {
          // จุดปลายทาง - สีแดง
          markerIcon = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#F44336',
            fillOpacity: 0.9,
            strokeColor: '#D32F2F',
            strokeWeight: 3
          };
        } else {
          // จุดจอดระหว่างทาง - สีตามสายรถ
          markerIcon = {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: this.getLineColor(lineColor),
            fillOpacity: 0.8,
            strokeColor: '#000000',
            strokeWeight: 2
          };
        }
        
        const marker = new window.google.maps.Marker({
          position: { lat: stop.lat, lng: stop.lng },
          map: this.map,
          title: `${stop.name}${isStart ? ' (จุดขึ้นรถ)' : isEnd ? ' (จุดลงรถ)' : ' (จุดจอด)'}`,
          icon: markerIcon,
          label: {
            text: isStart ? 'ขึ้น' : isEnd ? 'ลง' : (i - startIndex + 1).toString(),
            color: '#FFFFFF',
            fontSize: '12px',
            fontWeight: 'bold'
          }
        });
        
        // เพิ่ม InfoWindow สำหรับแสดงข้อมูลจุดจอด
        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; min-width: 200px;">
              <h4 style="margin: 0 0 8px 0; color: #1976d2;">${stop.name}</h4>
              <p style="margin: 4px 0; font-size: 14px;">
                ${isStart ? '🚌 <strong>จุดขึ้นรถ</strong>' : isEnd ? '🚌 <strong>จุดลงรถ</strong>' : '📍 จุดจอด'}
              </p>
              <p style="margin: 4px 0; font-size: 12px; color: #666;">
                ตำแหน่ง: ${stop.lat.toFixed(6)}, ${stop.lng.toFixed(6)}
              </p>
            </div>
          `
        });
        
        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });
        
        this.keyStopMarkers.push(marker);
      }
      
      console.log(`✅ เพิ่ม markers เรียบร้อย ${this.keyStopMarkers.length} จุด`);
    },
    findNearbyAttractions() {
      if (!this.userLocation || !this.attractions || this.attractions.length === 0) {
        console.log('❌ ไม่สามารถหา nearby attractions ได้:', {
          hasUserLocation: !!this.userLocation,
          attractionsCount: this.attractions?.length || 0
        });
        return;
      }
      
      console.log('🔍 เริ่มหา nearby attractions...');
      console.log('ตำแหน่งผู้ใช้:', this.userLocation);
      console.log('จำนวนสถานที่ท่องเที่ยว:', this.attractions.length);
      
      this.nearbyAttractions = this.attractions
        .map(a => {
          const distance = this.getDistance(
            { lat: parseFloat(a.Latitude), lng: parseFloat(a.Longitude) },
            this.userLocation
          );
          return { ...a, distance };
        })
        .filter(a => a.distance < 5000) // เพิ่มเป็น 5km
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10); // เพิ่มเป็น 10 แห่ง
        
      console.log(`✅ พบ nearby attractions ${this.nearbyAttractions.length} แห่ง`);
      this.nearbyAttractions.forEach(a => {
        console.log(`- ${a.Name}: ${a.distance}m`);
      });
    },
    showRouteToAttraction(attraction) {
      if (!this.userLocation) {
        alert('กรุณาอนุญาตให้เข้าถึงตำแหน่งของคุณ');
        return;
      }
      // set startPoint = userLocation, endPoint = attraction
      this.startPoint = { ...this.userLocation };
      this.endPoint = attraction;
      this.drawRoute();
      // Scroll ขึ้นไปแผนที่
      this.$nextTick(() => {
        const mapEl = document.getElementById('map');
        if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    }
  }
};
</script>

<style scoped>
.guilde-container {
  width: 900px;
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px 16px 16px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(102,126,234,0.13);
}
.map-instruction {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 1.2em;
  margin-bottom: 12px;
  color: #764ba2;
}
.reset-btn {
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 18px;
  font-size: 1em;
  margin-left: 12px;
  cursor: pointer;
  transition: background 0.2s;
}
.reset-btn:hover {
  background: #e53935;
}
.map-view {
  width: 100%;
  height: 420px;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(102,126,234,0.08);
  margin-bottom: 24px;
}
.result-section {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.route-info, .songthaew-info {
  flex: 1 1 220px;
  background: #f4f7fb;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(102,126,234,0.07);
  margin-bottom: 12px;
}
.route-info h3, .songthaew-info h3 {
  margin-top: 0;
  color: #764ba2;
}
.attraction-section {
  margin-top: 18px;
}
.centered-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
}
.attraction-title {
  font-size: 2em;
  color: #764ba2;
  margin-bottom: 18px;
  text-align: center;
}
.category-group-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center;
}
.category-group {
  width: 100%;
  max-width: 800px;
  background: #f4f7fb;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(102,126,234,0.08);
  padding: 18px 24px 24px 24px;
}
.category-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.3em;
  font-weight: bold;
  color: #1976d2;
  margin-bottom: 10px;
}
.category-icon {
  font-size: 1.3em;
}
.category-name {
  font-size: 1.1em;
}
.attraction-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  justify-content: center;
}
.attraction-card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(102,126,234,0.10);
  padding: 14px 14px 10px 14px;
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.15s, box-shadow 0.15s;
}
.attraction-card:hover {
  transform: translateY(-4px) scale(1.03);
  box-shadow: 0 6px 24px rgba(102,126,234,0.18);
}
.attraction-card img {
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 10px;
}
.attraction-info {
  font-size: 1em;
}
.distance {
  color: #888;
  font-size: 0.95em;
  margin-top: 2px;
}
.category-filter-bar {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-bottom: 22px;
  flex-wrap: wrap;
}
.category-filter-btn {
  background: #f4f7fb;
  color: #1976d2;
  border: none;
  border-radius: 20px;
  padding: 7px 22px;
  font-size: 1.05em;
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px rgba(102,126,234,0.07);
}
.category-filter-btn.active, .category-filter-btn:hover {
  background: #1976d2;
  color: #fff;
  box-shadow: 0 2px 10px rgba(102,126,234,0.13);
}
.select-destination-btn {
  margin-top: 8px;
  background: #ff6b6b;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 1em;
  cursor: pointer;
  transition: background 0.2s;
}
.select-destination-btn:hover {
  background: #e53935;
}
.suggested-line {
  background: #fff;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(102,126,234,0.07);
  border-left: 4px solid #1976d2;
}
.line-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
}
.line-color {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.line-name {
  font-size: 1.3em;
  font-weight: bold;
  color: #764ba2;
}
.line-details {
  margin-bottom: 16px;
}
.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  flex-wrap: wrap;
}
.label {
  font-size: 0.95em;
  font-weight: 600;
  color: #666;
  min-width: 80px;
  margin-right: 8px;
}
.value {
  font-size: 1em;
  color: #1976d2;
  font-weight: 500;
}
.distance {
  font-size: 0.85em;
  color: #888;
  margin-left: 8px;
  font-style: italic;
}
.note {
  color: #ff6b6b;
  font-weight: 500;
}
.route-summary {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
}
.summary-item {
  text-align: center;
  flex: 1;
}
.summary-label {
  font-size: 0.9em;
  color: #666;
  display: block;
  margin-bottom: 4px;
}
.summary-value {
  font-size: 1.1em;
  font-weight: bold;
  color: #1976d2;
}
.no-route {
  text-align: center;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #ddd;
}
.no-route p {
  margin: 8px 0;
  font-size: 1.1em;
  color: #666;
}
.suggestion {
  color: #888;
  font-size: 0.95em;
  font-style: italic;
}
.reason {
  color: #888;
  font-size: 0.95em;
  font-style: italic;
}
</style>
