const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const publicPath = path.resolve(__dirname, 'public');
app.use(express.static(publicPath));

// Database of 10 Stations Across India
let stations = [
  {
    id: "st-1",
    name: "Ather Grid Fast Charger",
    location: "Indiranagar, Bengaluru",
    address: "100 Feet Rd, 12th Main, Indiranagar",
    chargingType: "CCS2 - Fast DC (50kW)",
    availableSlots: 4,
    totalSlots: 6,
    operatingHours: "24/7 Open",
    pricePerKwh: "₹18 / kWh",
    contact: "+91 98765 43210"
  },
  {
    id: "st-2",
    name: "Tata Power EZ Charge",
    location: "Koramangala, Bengaluru",
    address: "80 Feet Rd, 4th Block, Koramangala",
    chargingType: "Type 2 - AC (22kW)",
    availableSlots: 2,
    totalSlots: 4,
    operatingHours: "06:00 AM - 11:00 PM",
    pricePerKwh: "₹15 / kWh",
    contact: "+91 98765 43211"
  },
  {
    id: "st-3",
    name: "Zeon Charging Hub",
    location: "MG Road, Bengaluru",
    address: "Trinity Circle, MG Road",
    chargingType: "CCS2 - Ultra Fast (120kW)",
    availableSlots: 1,
    totalSlots: 8,
    operatingHours: "24/7 Open",
    pricePerKwh: "₹22 / kWh",
    contact: "+91 98765 43212"
  },
  {
    id: "st-4",
    name: "Jio-bp pulse Station",
    location: "Whitefield, Bengaluru",
    address: "ITPL Main Rd, Whitefield",
    chargingType: "CCS2 - Fast DC (60kW)",
    availableSlots: 5,
    totalSlots: 5,
    operatingHours: "24/7 Open",
    pricePerKwh: "₹19 / kWh",
    contact: "+91 98765 43213"
  },
  {
    id: "st-5",
    name: "Statiq EV HyperHub",
    location: "Cyber City, Gurugram",
    address: "DLF Cyber City, Phase 2",
    chargingType: "CCS2 - Ultra Fast (150kW)",
    availableSlots: 6,
    totalSlots: 10,
    operatingHours: "24/7 Open",
    pricePerKwh: "₹21 / kWh",
    contact: "+91 98765 43214"
  },
  {
    id: "st-6",
    name: "Kazam Smart Charging",
    location: "Bandra West, Mumbai",
    address: "Connecting Rd, Off Hill Road",
    chargingType: "Type 2 - AC (7.4kW)",
    availableSlots: 3,
    totalSlots: 4,
    operatingHours: "07:00 AM - 11:00 PM",
    pricePerKwh: "₹14 / kWh",
    contact: "+91 98765 43215"
  },
  {
    id: "st-7",
    name: "ChargeZone SuperStation",
    location: "HITEC City, Hyderabad",
    address: "Mindspace IT Park, Madhapur",
    chargingType: "CCS2 - Fast DC (60kW)",
    availableSlots: 2,
    totalSlots: 6,
    operatingHours: "24/7 Open",
    pricePerKwh: "₹18 / kWh",
    contact: "+91 98765 43216"
  },
  {
    id: "st-8",
    name: "Relux Electric Hub",
    location: "Anna Nagar, Chennai",
    address: "2nd Avenue, Block AB",
    chargingType: "Type 2 - AC (22kW)",
    availableSlots: 4,
    totalSlots: 4,
    operatingHours: "06:00 AM - 10:00 PM",
    pricePerKwh: "₹16 / kWh",
    contact: "+91 98765 43217"
  },
  {
    id: "st-9",
    name: "Magenta ChargeGrid",
    location: "Viman Nagar, Pune",
    address: "Phoenix Marketcity Annexe",
    chargingType: "CCS2 - Fast DC (50kW)",
    availableSlots: 1,
    totalSlots: 5,
    operatingHours: "24/7 Open",
    pricePerKwh: "₹17 / kWh",
    contact: "+91 98765 43218"
  },
  {
    id: "st-10",
    name: "Shell Recharge Plaza",
    location: "Connaught Place, New Delhi",
    address: "Outer Circle, Block C",
    chargingType: "CCS2 - Ultra Fast (120kW)",
    availableSlots: 7,
    totalSlots: 8,
    operatingHours: "24/7 Open",
    pricePerKwh: "₹23 / kWh",
    contact: "+91 98765 43219"
  }
];

let bookings = [
  {
    id: "bk-1001",
    stationId: "st-1",
    stationName: "Ather Grid Fast Charger",
    userName: "Rahul Sharma",
    userContact: "+91 91234 56789",
    vehicleModel: "Nexon EV Max",
    vehicleNumber: "KA 01 EQ 4521",
    date: "2026-08-20",
    timeSlot: "14:00 - 15:00",
    paymentStatus: "Paid (UPI)",
    amount: "₹180",
    status: "Confirmed"
  }
];

// Serve index.html on Root Path
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// STATIONS API
app.get('/api/stations', (req, res) => {
  const { search, type } = req.query;
  let filtered = [...stations];

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(s => 
      s.name.toLowerCase().includes(q) || 
      s.location.toLowerCase().includes(q)
    );
  }

  if (type && type !== 'All') {
    filtered = filtered.filter(s => s.chargingType.toLowerCase().includes(type.toLowerCase()));
  }

  res.status(200).json({ success: true, data: filtered });
});

// BOOKINGS API
app.get('/api/bookings', (req, res) => {
  res.status(200).json({ success: true, data: bookings });
});

app.post('/api/bookings', (req, res) => {
  const { stationId, userName, userContact, vehicleModel, vehicleNumber, date, timeSlot } = req.body;

  if (!stationId || !userName || !userContact || !vehicleModel || !vehicleNumber || !date || !timeSlot) {
    return res.status(400).json({ success: false, message: "Please fill out all required fields." });
  }

  const station = stations.find(s => s.id === stationId);
  if (!station) {
    return res.status(404).json({ success: false, message: "Selected station does not exist." });
  }

  if (station.availableSlots <= 0) {
    return res.status(400).json({ success: false, message: "No available slots at this station." });
  }

  station.availableSlots -= 1;

  const newBooking = {
    id: `bk-${Date.now().toString().slice(-5)}`,
    stationId,
    stationName: station.name,
    userName,
    userContact,
    vehicleModel,
    vehicleNumber,
    date,
    timeSlot,
    paymentStatus: "Paid (UPI)",
    amount: "₹200",
    status: "Confirmed"
  };

  bookings.unshift(newBooking);
  res.status(201).json({ success: true, message: "Booking created successfully!", data: newBooking });
});

app.delete('/api/bookings/:id', (req, res) => {
  const index = bookings.findIndex(b => b.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ success: false, message: "Booking not found" });
  }

  const canceledBooking = bookings[index];
  const station = stations.find(s => s.id === canceledBooking.stationId);
  if (station && station.availableSlots < station.totalSlots) {
    station.availableSlots += 1;
  }

  bookings.splice(index, 1);
  res.status(200).json({ success: true, message: "Booking canceled successfully" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});