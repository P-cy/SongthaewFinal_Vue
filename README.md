# SongthaewCNX - แอปพลิเคชันข้อมูลรถสองแถวเชียงใหม่

แอปพลิเคชันสำหรับดูข้อมูลรถสองแถว (Songthaew) ในจังหวัดเชียงใหม่ พร้อมแผนที่และเส้นทาง

## ฟีเจอร์หลัก

- **หน้าข้อมูล (Info)**: ค้นหาและดูรายการรถสองแถวทั้งหมด
- **หน้ารายละเอียด (Route)**: ดูรายละเอียดเส้นทาง พร้อมแผนที่และสถานที่ท่องเที่ยวใกล้เคียง
- **การจอง (Booking)**: ระบบจองรถสองแถว
- **แผนที่ (Map)**: แสดงเส้นทางรถสองแถวบนแผนที่

## การติดตั้ง

1. Clone repository
```bash
git clone <repository-url>
cd SongthaewCNXfinal
```

2. ติดตั้ง dependencies
```bash
npm install
```

3. สร้างไฟล์ `.env` และเพิ่ม Google Maps API Key
```bash
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## การตั้งค่า Google Maps API

1. ไปที่ [Google Cloud Console](https://console.cloud.google.com/)
2. สร้างโปรเจคใหม่หรือเลือกโปรเจคที่มีอยู่
3. เปิดใช้งาน Maps JavaScript API และ Places API
4. สร้าง API Key ในส่วน Credentials
5. เพิ่ม API Key ในไฟล์ `.env`

## การรันแอปพลิเคชัน

```bash
npm run dev
```

แอปจะรันที่ `http://localhost:5173`

## การใช้งาน

### หน้าข้อมูล (Info)
- ค้นหารถสองแถวตามชื่อสาย จุดรับ หรือปลายทาง
- คลิกที่ปุ่มลูกศรเพื่อดูรายละเอียดเส้นทาง

### หน้ารายละเอียด (Route)
- ดูข้อมูลครบถ้วนของเส้นทาง
- แสดงแผนที่พร้อมจุดสำคัญ
- ดูเส้นทางด้วย Google Directions API
- ค้นหาสถานที่ท่องเที่ยวใกล้เคียง

## โครงสร้างโปรเจค

```
src/
├── components/
│   ├── Info.vue          # หน้าข้อมูลรถสองแถว
│   ├── Route.vue         # หน้ารายละเอียดเส้นทาง
│   ├── Booking.vue       # หน้าจอง
│   └── Map.vue           # หน้าแผนที่
├── assets/
│   ├── songthaew_lines.json  # ข้อมูลรถสองแถว
│   └── ...
└── router/
    └── index.js          # การจัดการ routing
```

## เทคโนโลยีที่ใช้

- Vue 3 (Composition API)
- Vue Router
- Google Maps JavaScript API
- Google Places API
- Vite

## หมายเหตุ

- ต้องมี Google Maps API Key ที่เปิดใช้งาน Maps JavaScript API และ Places API
- ข้อมูลรถสองแถวมาจากไฟล์ `songthaew_lines.json`
- แอปออกแบบสำหรับมือถือ (Mobile-first design)
