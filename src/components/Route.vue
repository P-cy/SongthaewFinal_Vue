<template>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;700&display=swap" rel="stylesheet">
  <div class="bus-route-app">
    <!-- Header -->
    <div class="header">
      <div class="nav-bar">
        <button class="back-btn">‹</button>
        <p class="route-title">สาย 2</p>
      </div>
    </div>

    <!-- Bus Illustration -->
    <div class="bus-container">
      <div class="bus">
        <div class="bus-front">
          <div class="windshield"></div>
          <div class="route-number">2</div>
        </div>
        <div class="bus-body">
          <div class="windows">
            <div class="window"></div>
            <div class="window"></div>
            <div class="window"></div>
          </div>
          <div class="door-indicator">🚪</div>
        </div>
        <div class="wheel wheel-front"></div>
        <div class="wheel wheel-back"></div>
      </div>
    </div>

    <!-- Route Information -->
    <div class="route-info">
      <h2 class="route-name">บ้านโคกพันโปง - บ้านโคกน้อย</h2>
      
      <div class="route-details">
        <!-- <p class="route-label">เส้นทางจีง:</p> -->
        <p class="route-text">
          <b>เส้นทางวิ่ง:</b> บ้านโคกพันโปง - บ้านหัวพุง - บ้านคำใส - 
          เซินทรัพพลาซ่าขอนแก่น - ศาลหลักเมือง - บขส.เก่า - 
          รร.ขอนแก่นวิทยายน - ตลาดบางลำภู - ตลาดเทศบาล 1 - 
          รร.กัลยาณวัตร - สถ.เมืองขอนแก่น - เซ็นโซ่ห์ - 
          ไปรษณีย์ - วัดศรีจันทร์ - เรือนจำ - วิทยาลัยเทคนิค - 
          รพ.ขอนแก่น - ม.ราชมงคล - ตลาดหนองไผ่ - บ้านพระคือ
           - บ้านหนองไผ่ - บ้านหนองแสง - บ้านโคกน้อย
        </p>
      </div>

      <div class="fare-info">
        <p><strong>อัตราค่าโดยสาร:</strong> 9-13 บาท</p>
      </div>

      <div class="schedule-info">
        <p><strong>ช่วงเวลาดำเนินรถ:</strong> 06:00-19:00 น.</p>
      </div>
    </div>

    <!-- Map Section -->
    <div class="map-section">
      <h3 class="map-title">แผนที่เส้นทางเดินรถสองแถว</h3>
      <div class="map-container">
        <div class="map-placeholder">
          <div class="map-grid">
            <div class="road horizontal road-1"></div>
            <div class="road horizontal road-2"></div>
            <div class="road horizontal road-3"></div>
            <div class="road vertical road-4"></div>
            <div class="road vertical road-5"></div>
            <div class="landmark landmark-1">🏛️</div>
            <div class="landmark landmark-2">🏫</div>
            <div class="landmark landmark-3">🏥</div>
            <div class="landmark landmark-4">🏪</div>
            <div class="route-marker start">🚌</div>
            <div class="route-marker end">🏁</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BusRouteApp',
  data() {
    return {
      // Component data can be added here if needed
    }
  }
}
</script>

<style scoped>
.bus-route-app {
  font-family: 'Sarabun', sans-serif;
  max-width: 420px;
  margin: 0 auto;
  background: #f5f5f5;
  font-family: 'Arial', sans-serif;
  min-height: 100vh;
}

/* Header Styles */
.header {
  background: #5a5a8a;
  color: white;
  padding: 0;
}

.nav-bar {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  position: relative;
}

.back-btn {
  background: none;
  border: none;
  color: white;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 16px;
  margin-right: 16px;
}

.route-title {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

/* Bus Illustration */
.bus-container {
  display: flex;
  justify-content: center;
  padding: 32px 16px;
  background: white;
}

.bus {
  position: relative;
  width: 200px;
  height: 80px;
}

.bus-front {
  position: absolute;
  left: 0;
  top: 10px;
  width: 40px;
  height: 60px;
  background: #f1c40f;
  border-radius: 8px 0 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.windshield {
  position: absolute;
  top: 8px;
  left: 8px;
  width: 24px;
  height: 20px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.route-number {
  position: absolute;
  bottom: 8px;
  font-weight: bold;
  font-size: 16px;
  color: #2c3e50;
}

.bus-body {
  position: absolute;
  left: 40px;
  top: 0;
  width: 120px;
  height: 80px;
  background: #f1c40f;
  border-radius: 0 8px 8px 0;
}

.windows {
  position: absolute;
  top: 15px;
  left: 8px;
  display: flex;
  gap: 4px;
}

.window {
  width: 24px;
  height: 16px;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 2px;
}

.door-indicator {
  position: absolute;
  top: 35px;
  left: 85px;
  font-size: 12px;
  background: #27ae60;
  color: white;
  padding: 2px 4px;
  border-radius: 4px;
}

.wheel {
  position: absolute;
  width: 24px;
  height: 24px;
  background: #2c3e50;
  border-radius: 50%;
  border: 3px solid #34495e;
}

.wheel::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: radial-gradient(circle, #7f8c8d 2px, transparent 2px);
  background-size: 4px 4px;
  border-radius: 50%;
}

.wheel-front {
  left: 28px;
  bottom: -12px;
}

.wheel-back {
  right: 28px;
  bottom: -12px;
}

/* Route Information */
.route-info {
  background: white;
  padding: 20px;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.route-name {
  font-size: 18px;
  font-weight: bold;
  color: #8b4513;
  text-align: center;
  margin-bottom: 16px;
}

.route-label {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 8px;
}

.route-text {
  line-height: 1.6;
  color: #34495e;
  text-align: justify;
  margin-bottom: 16px;
}

.fare-info, .schedule-info {
  margin-bottom: 12px;
}

.fare-info p, .schedule-info p {
  margin: 0;
  color: #2c3e50;
}

/* Map Section */
.map-section {
  background: white;
  padding: 20px;
  margin: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.map-title {
  font-size: 20px;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  margin-bottom: 16px;
}

.map-container {
  width: 100%;
  height: 300px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  background: #f8f9fa;
}

.map-placeholder {
  width: 100%;
  height: 100%;
  position: relative;
  background: linear-gradient(45deg, #f8f9fa 25%, transparent 25%), 
              linear-gradient(-45deg, #f8f9fa 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, #f8f9fa 75%), 
              linear-gradient(-45deg, transparent 75%, #f8f9fa 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.map-grid {
  position: relative;
  width: 100%;
  height: 100%;
}

.road {
  position: absolute;
  background: #34495e;
}

.road.horizontal {
  height: 4px;
  width: 80%;
  left: 10%;
}

.road.vertical {
  width: 4px;
  height: 80%;
  top: 10%;
}

.road-1 { top: 20%; }
.road-2 { top: 50%; }
.road-3 { top: 80%; }
.road-4 { left: 30%; }
.road-5 { left: 70%; }

.landmark {
  position: absolute;
  font-size: 20px;
  z-index: 2;
}

.landmark-1 { top: 15%; left: 25%; }
.landmark-2 { top: 45%; left: 65%; }
.landmark-3 { top: 75%; left: 25%; }
.landmark-4 { top: 35%; left: 45%; }

.route-marker {
  position: absolute;
  font-size: 16px;
  z-index: 3;
}

.route-marker.start {
  top: 10%;
  left: 10%;
}

.route-marker.end {
  bottom: 10%;
  right: 10%;
}

/* Responsive Design */
@media (max-width: 320px) {
  .bus {
    width: 160px;
    height: 64px;
  }
  
  .bus-front {
    width: 32px;
    height: 48px;
  }
  
  .bus-body {
    width: 96px;
    height: 64px;
  }
  
  .route-info {
    padding: 16px;
    margin: 12px;
  }
  
  .route-name {
    font-size: 16px;
  }
}
</style>