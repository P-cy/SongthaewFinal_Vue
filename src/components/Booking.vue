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
            <input type="number" id="people" v-model.number="numberOfPeople" min="1" max="8" readonly />
            <button @click="updatePeople(1)" :disabled="numberOfPeople >= 8">+</button>
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

// --- ⚠️ START: การตั้งค่าและข้อมูลสำคัญ ⚠️ ---

// !! สำคัญมาก !! ใส่ API Key ของคุณที่นี่
// เพื่อความปลอดภัยสูงสุด ควรอ่านค่านี้มาจาก Environment Variable (.env)
// แทนการ Hardcode โดยตรง
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

const mapRef = ref(null); // Reference to the map component instance

// --- Computed Properties ---
const isRouteCalculated = computed(() => !!tripDetails.distance);

const rawTotalPrice = computed(() => {
  if (!tripDetails.distanceValue) return 0;

  const distanceInKm = tripDetails.distanceValue / 1000;
  let price = 0;

  // --- Define your total price logic here ---
  // This logic determines the *total* fare, regardless of people count initially.
  // The per-person price will be derived from this total.

  const BASE_FARE = 60; // Base fare for the ride
  const PER_KM_RATE = 10; // Additional cost per kilometer after a certain distance
  const BASE_KM_INCLUDED = 2; // Kilometers included in the base fare

  if (distanceInKm <= BASE_KM_INCLUDED) {
    price = BASE_FARE;
  } else {
    price = BASE_FARE + (distanceInKm - BASE_KM_INCLUDED) * PER_KM_RATE;
  }

  // Ensure total doesn't go below minimum, and round up to nearest 5
  return Math.ceil(Math.max(BASE_FARE, price) / 5) * 5;
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
  const pricePerPerson = rawTotalPrice.value / numberOfPeople.value;
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
  }).format(pricePerPerson);
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
  if (newAmount >= 1 && newAmount <= 8) { // Max 8 people
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
</script>

<style scoped>
/* Keep existing styles, add new ones for price-per-person if needed */

.booking-form {
  max-width: 500px;
  margin: auto;
  border: 1px solid #ddd;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
}

.details-panel {
  padding: 16px;
}

.instructions {
  text-align: center;
  padding: 16px;
  background-color: #eef7ff;
  border-radius: 8px;
  margin-bottom: 16px;
  color: #333;
}

.trip-summary h3,
.payment-section h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #333;
  font-size: 1.1em;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.95em;
}

hr {
  border: none;
  border-top: 1px solid #eee;
  margin: 16px 0;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.people-input {
  display: flex;
  align-items: center;
  justify-content: center; /* Center the input and buttons */
  gap: 8px; /* Space between items */
}

.people-input input {
  width: 50px; /* Adjust width as needed */
  text-align: center;
  border: 1px solid #ccc;
  border-radius: 8px; /* More rounded corners for input */
  padding: 8px 0; /* Vertical padding only */
  -moz-appearance: textfield; /* Firefox */
  font-size: 1em;
  font-weight: bold;
}
.people-input input::-webkit-outer-spin-button,
.people-input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}


.people-input button {
  width: 40px; /* Larger, more tappable buttons */
  height: 40px;
  border: 1px solid #007bff; /* Blue border for buttons */
  background-color: #007bff; /* Blue background */
  color: white; /* White text */
  border-radius: 50%; /* Perfectly round */
  font-size: 1.5em; /* Larger +/- symbols */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.people-input button:hover:not(:disabled) {
  background-color: #0056b3;
  border-color: #0056b3;
}

.people-input button:disabled {
  background-color: #e0e0e0;
  border-color: #e0e0e0;
  color: #a0a0a0;
  cursor: not-allowed;
}


.price-summary {
  background-color: #e6f4ea;
  border: 1px solid #b7e1c7;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.price-summary .car-type {
  font-weight: 500;
  color: #2b613b;
}

/* Updated styles for displaying total and per person */
.price-summary > div { /* This targets the new div wrapping prices */
  text-align: right;
}

.price-summary .total-price-display {
  font-weight: bold;
  font-size: 1.2em;
  color: #1e462a;
}

.price-summary .price-per-person {
  font-size: 0.9em;
  color: #555;
  margin-top: 4px;
}


.payment-options {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.payment-options button {
  flex-grow: 1;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
  background-color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 1em; /* Ensure consistent font size */
  font-weight: 500; /* Make text slightly bolder */
}

/* Specific styling for Cash button */
.payment-options button:nth-child(1).active { /* Targets the first button (Cash) when active */
  background-color: #007bff;
  color: white;
  border-color: #007bff;
  box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
}

/* Specific styling for PromptPay button */
.payment-options button:nth-child(2).active { /* Targets the second button (PromptPay) when active */
  background-color: #673AB7; /* Deep Purple */
  color: white;
  border-color: #673AB7;
  box-shadow: 0 2px 6px rgba(103, 58, 183, 0.3); /* Matching purple shadow */
}


.request-button {
  width: 100%;
  padding: 15px;
  font-size: 1.1em;
  font-weight: bold;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.request-button:disabled {
  background-color: #a0c3e6;
  cursor: not-allowed;
}

.request-button:hover:not(:disabled) {
  background-color: #0056b3;
}
</style>