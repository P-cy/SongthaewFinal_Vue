<template>
  <div class="guilde-container">
    <h2>นำทางด้วยแผนที่สองแถว</h2>
    <div class="map-instruction">
      <span v-if="!startPoint">คลิกเลือกจุดเริ่มต้นบนแผนที่</span>
      <span v-else-if="!endPoint">คลิกเลือกจุดปลายทางบนแผนที่</span>
      <span v-else>เส้นทางจาก <b>{{ startPoint.Name }}</b> ไป <b>{{ endPoint.Name }}</b></span>
      <button v-if="startPoint || endPoint" @click="resetSelection" class="reset-btn">เริ่มใหม่</button>
    </div>
    <div id="map" class="map-view"></div>
    <div v-if="startPoint && endPoint" class="result-section">
      <div class="route-info">
        <h3>เส้นทางที่เลือก</h3>
        <p>จาก <b>{{ startPoint.Name }}</b> ไป <b>{{ endPoint.Name }}</b></p>
        <p>ระยะทางประมาณ: <b>{{ routeDistance }} เมตร</b></p>
      </div>
      <div class="songthaew-info">
        <h3>แนะนำสายรถสองแถว</h3>
        <div v-if="suggestedLine">
          <p>สาย: <b>{{ suggestedLine.name }}</b></p>
          <p>เส้นทาง: {{ suggestedLine.route }}</p>
        </div>
        <div v-else>
          <p>ไม่มีสายรถสองแถวที่ตรงเส้นทางนี้</p>
        </div>
      </div>
    </div>
    <div v-if="userLocation && nearbyAttractions.length" class="attraction-section">
      <h3>สถานที่ท่องเที่ยวใกล้คุณ</h3>
      <div class="attraction-list">
        <div v-for="a in nearbyAttractions" :key="a.Name" class="attraction-card">
          <img :src="a.Picture" :alt="a.Name" v-if="a.Picture" />
          <div class="attraction-info">
            <b>{{ a.Name }}</b>
            <div class="category">หมวด: {{ a.Categories }}</div>
            <div class="distance">ห่าง {{ a.distance }} เมตร</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

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
      songthaewLines: [
        { name: 'สายแดง', route: 'นิมมาน - ท่าแพ - วัดพระสิงห์', color: '#e53935', stops: ['One Nimman', 'Maya Lifestyle Shopping Center', 'Wat Phra Singh Worawihan', 'Wat Chedi Luang Varavihara', 'Chiang Mai Walking Street', 'ประตูท่าแพ'] },
        { name: 'สายเหลือง', route: 'นิมมาน - มช. - ดอยสุเทพ', color: '#fbc02d', stops: ['One Nimman', 'Kao Soy Nimman', 'The Barisotel by The Baristro', 'Wat Phra That Doi Suthep', 'Central Chiangmai'] },
        { name: 'สายฟ้า', route: 'นิมมาน - เจ็ดยอด - เมญ่า', color: '#1976d2', stops: ['One Nimman', 'Wat Jed Yod', 'Maya Lifestyle Shopping Center'] },
      ],
      attractions: [],
      nearbyAttractions: [],
    };
  },
  mounted() {
    this.loadCSV();
    this.getUserLocation();
  },
  methods: {
    loadCSV() {
      fetch(require('@/assets/dat.csv'))
        .then(res => res.text())
        .then(csv => {
          Papa.parse(csv, {
            header: true,
            complete: (results) => {
              this.points = results.data.filter(p => p.Latitude && p.Longitude);
              this.attractions = this.points.filter(p => p.Categories !== 'อื่นๆ');
              this.$nextTick(this.initMap);
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
            this.findNearbyAttractions();
          }
        );
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
      this.addMarkers();
      if (this.userLocation) {
        new window.google.maps.Marker({
          position: this.userLocation,
          map: this.map,
          label: 'คุณ',
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
            scaledSize: new window.google.maps.Size(40, 40)
          }
        });
      }
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
        marker.addListener('click', () => this.handleMarkerClick(point));
        this.markers.push(marker);
      });
    },
    handleMarkerClick(point) {
      if (!this.startPoint) {
        this.startPoint = point;
      } else if (!this.endPoint && point !== this.startPoint) {
        this.endPoint = point;
        this.drawRoute();
        this.suggestSongthaewLine();
      }
    },
    resetSelection() {
      this.startPoint = null;
      this.endPoint = null;
      this.routeDistance = 0;
      this.suggestedLine = null;
      if (this.polyline) {
        this.polyline.setMap(null);
        this.polyline = null;
      }
    },
    drawRoute() {
      if (this.polyline) this.polyline.setMap(null);
      const path = [
        { lat: parseFloat(this.startPoint.Latitude), lng: parseFloat(this.startPoint.Longitude) },
        { lat: parseFloat(this.endPoint.Latitude), lng: parseFloat(this.endPoint.Longitude) }
      ];
      this.polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#ff6b6b',
        strokeOpacity: 0.9,
        strokeWeight: 6,
        map: this.map
      });
      this.routeDistance = this.getDistance(path[0], path[1]);
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
      // แนะนำสายที่มีจุด start/end อยู่ใน stops
      this.suggestedLine = this.songthaewLines.find(line => {
        return line.stops.includes(this.startPoint.Name) && line.stops.includes(this.endPoint.Name);
      }) || null;
    },
    findNearbyAttractions() {
      if (!this.userLocation) return;
      this.nearbyAttractions = this.attractions
        .map(a => {
          const distance = this.getDistance(
            { lat: parseFloat(a.Latitude), lng: parseFloat(a.Longitude) },
            this.userLocation
          );
          return { ...a, distance };
        })
        .filter(a => a.distance < 1200)
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 5);
    }
  }
};
</script>

<style scoped>
.guilde-container {
  max-width: 800px;
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
.attraction-list {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
}
.attraction-card {
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(102,126,234,0.07);
  padding: 10px 12px;
  width: 180px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.attraction-card img {
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 8px;
}
.attraction-info {
  font-size: 1em;
}
.category {
  color: #1976d2;
  font-size: 0.95em;
}
.distance {
  color: #888;
  font-size: 0.9em;
}
</style>
