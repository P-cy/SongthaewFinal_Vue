<template>
  <div class="booking-form">
    <GoogleMap
      :api-key="googleMapsApiKey"
      :center="mapCenter"
      :zoom="13"
      style="width: 100%; height: 400px"
      ref="mapRef"
      @click="handleMapClick"
    >
      <Marker v-if="origin" :options="{ position: origin, label: 'A' }" />
      <Marker v-if="destination" :options="{ position: destination, label: 'B' }" />
      <Polyline v-if="routePolyline" :options="polylineOptions" />
    </GoogleMap>

    <div class="details-panel">
      <div v-if="!origin || !destination" class="instructions">
        <p v-if="!origin">📍 **ขั้นตอนที่ 1:** แตะบนแผนที่เพื่อปักหมุด **"จุดรับ"**</p>
        <p v-else>📍 **ขั้นตอนที่ 2:** แตะอีกครั้งเพื่อปักหมุด **"จุดส่ง"**</p>
      </div>

      <div v-if="isRouteCalculated" class="trip-summary">
        <h3>สรุปการเดินทาง</h3>
        <div class="summary-item">
          <span>ระยะทาง:</span>
          <strong>{{ tripDetails.distance }}</strong>
        </div>
        <div class="summary-item">
          <span>เวลาประมาณ:</span>
          <strong>{{ tripDetails.duration }}</strong>
        </div>
        <hr />
        <div class="form-group">
          <label for="people">จำนวนคน</label>
          <div class="people-input">
            <button @click="updatePeople(-1)" :disabled="numberOfPeople <= 1">-</button>
            <input type="number" id="people" v-model.number="numberOfPeople" :min="1" :max="maxPeople" readonly />
            <button @click="updatePeople(1)" :disabled="numberOfPeople >= maxPeople">+</button>
          </div>
          <div class="flat-rate-toggle">
            <label>
              <input type="checkbox" v-model="isFlatRate" />
              เหมาจ่าย 130 บาท (สูงสุด 12 คน)
            </label>
          </div>
        </div>
        <div class="price-summary">
          <span class="car-type">Express x{{ numberOfPeople }}</span>
          <div>
            <div class="total-price-display">รวม: {{ formattedTotalPrice }}</div>
            <div class="price-per-person" v-if="numberOfPeople > 1">({{ formattedPricePerPerson }} / คน)</div>
          </div>
        </div>
      </div>

      <div v-if="isRouteCalculated" class="payment-section">
        <h3>ช่องทางชำระเงิน</h3>
        <div class="payment-options">
          <button
            :class="{ active: paymentMethod === 'Cash' }"
            @click="paymentMethod = 'Cash'"
          >
            เงินสด
          </button>
          <button
            :class="{ active: paymentMethod === 'PromptPay' }"
            @click="paymentMethod = 'PromptPay'"
          >
            Prompt Pay
          </button>
        </div>
      </div>

      <button
        class="request-button"
        :disabled="!isRouteCalculated"
        @click="handleRequestRoddaeng"
      >
        เรียกรถแดง
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { GoogleMap, Marker, Polyline } from 'vue3-google-map';

const googleMapsApiKey = 'AIzaSyAYer7PyjzNfQS6ekM4xb25emuhFLl661U'; // <--- ใส่ Key ของคุณที่นี่

// ตั้งค่าพิกัดเริ่มต้นของแผนที่ให้เป็นเชียงใหม่
const mapCenter = { lat: 18.787747, lng: 98.993128 };

// --- END: การตั้งค่าและข้อมูลสำคัญ ---

// --- State Management ---
const origin = ref(null); // { lat, lng }
const destination = ref(null); // { lat, lng }
const tripDetails = reactive({
  distance: '',
  duration: '',
  distanceValue: 0, // ระยะทางเป็นเมตร
});
const routePolyline = ref(null);
const numberOfPeople = ref(1);
const paymentMethod = ref('Cash');
const isFlatRate = ref(false); // เพิ่ม state สำหรับเหมาจ่าย

const mapRef = ref(null); // Reference to the map component instance

// --- Computed Properties ---
const isRouteCalculated = computed(() => !!tripDetails.distance);

const maxPeople = computed(() => (isFlatRate.value ? 12 : 8));

const rawTotalPrice = computed(() => {
  if (isFlatRate.value) {
    return 130;
  }
  return numberOfPeople.value * 15;
});

const formattedTotalPrice = computed(() => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(rawTotalPrice.value);
});

const formattedPricePerPerson = computed(() => {
  if (!rawTotalPrice.value || numberOfPeople.value === 0) return '';
  if (isFlatRate.value) {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
    }).format(rawTotalPrice.value / numberOfPeople.value);
  }
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(15);
});

const polylineOptions = computed(() => ({
  path: routePolyline.value,
  geodesic: true,
  strokeColor: '#007bff',
  strokeOpacity: 0.8,
  strokeWeight: 5,
}));

// --- Methods ---
const handleMapClick = (event) => {
  const clickedLatLng = {
    lat: event.latLng.lat(),
    lng: event.latLng.lng(),
  };

  if (!origin.value) {
    origin.value = clickedLatLng;
  } else if (!destination.value) {
    destination.value = clickedLatLng;
  }
};

const calculateRoute = () => {
  if (!origin.value || !destination.value || !window.google) {
    return;
  }

  const directionsService = new window.google.maps.DirectionsService();
  directionsService.route(
    {
      origin: origin.value,
      destination: destination.value,
      travelMode: window.google.maps.TravelMode.DRIVING,
    },
    (response, status) => {
      if (status === window.google.maps.DirectionsStatus.OK) {
        const route = response.routes[0];
        const leg = route.legs[0];

        // อัปเดตข้อมูลการเดินทาง
        tripDetails.distance = leg.distance.text;
        tripDetails.duration = leg.duration.text;
        tripDetails.distanceValue = leg.distance.value; // ระยะทางเป็นเมตร

        // สร้างเส้นทางสำหรับ Polyline
        routePolyline.value = window.google.maps.geometry.encoding.decodePath(
          route.overview_polyline
        );

        // ปรับมุมมองแผนที่ให้เห็นทั้งเส้นทาง
        const bounds = new window.google.maps.LatLngBounds();
        bounds.extend(leg.start_location);
        bounds.extend(leg.end_location);
        mapRef.value.map.fitBounds(bounds);

      } else {
        console.error('Directions request failed due to ' + status);
        alert('ไม่สามารถคำนวณเส้นทางได้ กรุณาลองใหม่อีกครั้ง');
        resetState();
      }
    }
  );
};

const updatePeople = (amount) => {
  const newAmount = numberOfPeople.value + amount;
  if (newAmount >= 1 && newAmount <= maxPeople.value) {
    numberOfPeople.value = newAmount;
  }
};

const handleRequestRoddaeng = () => {
  if (!isRouteCalculated.value) return;

  const bookingDetails = {
    origin: origin.value,
    destination: destination.value,
    distance: tripDetails.distance,
    duration: tripDetails.duration,
    people: numberOfPeople.value,
    totalPrice: rawTotalPrice.value, // Use the raw total price
    pricePerPerson: rawTotalPrice.value / numberOfPeople.value, // Add price per person to details
    paymentMethod: paymentMethod.value,
  };

  // ในแอปจริง คุณจะส่งข้อมูลนี้ไปยัง Server หรือจัดการต่อไป
  console.log('Booking Details:', bookingDetails);
  alert(`เรียกรถสำเร็จ!\nราคารวม: ${formattedTotalPrice.value}\nราคาต่อคน: ${formattedPricePerPerson.value}\nวิธีการชำระเงิน: ${paymentMethod.value}`);
};

const resetState = () => {
  origin.value = null;
  destination.value = null;
  tripDetails.distance = '';
  tripDetails.duration = '';
  tripDetails.distanceValue = 0;
  routePolyline.value = null;
  numberOfPeople.value = 1;
};


// --- Watchers ---
watch(destination, (newDestination) => {
  if (newDestination) {
    calculateRoute();
  }
});

watch(isFlatRate, (val) => {
  if (val && numberOfPeople.value > 12) {
    numberOfPeople.value = 12;
  }
  if (!val && numberOfPeople.value > 8) {
    numberOfPeople.value = 8;
  }
});
</script>

<style scoped>
.booking-form {
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px 16px 16px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 32px rgba(102,126,234,0.13);
}

.details-panel {
  margin-top: 20px;
  padding: 30px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  width: 100%;
}

.instructions {
  text-align: center;
  padding: 25px;
  background: #e3f2fd;
  border-radius: 8px;
  margin-bottom: 25px;
  width: 100%;
}

.instructions p {
  margin: 10px 0;
  font-size: 1.2em;
  color: #1976d2;
}

.trip-summary {
  background: white;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 25px;
  width: 100%;
}

.trip-summary h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4em;
  text-align: center;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.summary-item:last-child {
  border-bottom: none;
}

.form-group {
  margin: 20px 0;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.people-input {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 15px;
}

.people-input button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #667eea;
  color: white;
  font-size: 1.2em;
  cursor: pointer;
  transition: all 0.3s ease;
}

.people-input button:hover:not(:disabled) {
  background: #5a6fd8;
  transform: scale(1.05);
}

.people-input button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.people-input input {
  width: 80px;
  height: 40px;
  text-align: center;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
}

.flat-rate-toggle {
  margin-top: 10px;
}

.flat-rate-toggle label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.95em;
  color: #666;
}

.flat-rate-toggle input[type="checkbox"] {
  width: 18px;
  height: 18px;
}

.price-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  margin-top: 15px;
}

.car-type {
  font-weight: 600;
  font-size: 1.1em;
}

.total-price-display {
  font-size: 1.3em;
  font-weight: 700;
}

.price-per-person {
  font-size: 0.9em;
  opacity: 0.9;
}

.payment-section {
  margin: 25px 0;
  width: 100%;
}

.payment-section h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.4em;
  text-align: center;
}

.payment-options {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  width: 100%;
}

.payment-options button {
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #ddd;
  border-radius: 12px;
  background: white;
  color: #666;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 60px;
}

.payment-options button:hover {
  border-color: #667eea;
  color: #667eea;
}

.payment-options button.active {
  border-color: #667eea;
  background: #667eea;
  color: white;
}

.request-button {
  width: 100%;
  padding: 18px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  font-size: 1.2em;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
  min-height: 60px;
}

.request-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

.request-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* Responsive Design */
@media (max-width: 768px) {
  .details-panel {
    padding: 15px;
  }
  
  .trip-summary {
    padding: 15px;
  }
  
  .payment-options {
    flex-direction: column;
  }
  
  .people-input {
    justify-content: center;
  }
}
</style>