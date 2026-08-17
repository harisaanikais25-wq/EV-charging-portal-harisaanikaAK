const API_BASE = '/api';

// DOM Elements
const stationsGrid = document.getElementById('stations-grid');
const bookingsList = document.getElementById('bookings-list');
const searchInput = document.getElementById('search-input');
const filterType = document.getElementById('filter-type');
const bookingCount = document.getElementById('booking-count');

const bookingModal = document.getElementById('booking-modal');
const closeModal = document.querySelector('.close-modal');

document.addEventListener('DOMContentLoaded', () => {
  fetchStations();
  fetchBookings();
  setupNavigation();
  setupEvents();
  setTodayDate();
});

function setTodayDate() {
  const dateInput = document.getElementById('booking-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
}

function setupNavigation() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const targetTab = e.target.dataset.tab;
      switchTab(targetTab);
    });
  });
}

window.switchTab = (tabId) => {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  
  const selectedBtn = document.querySelector(`[data-tab="${tabId}"]`);
  if (selectedBtn) selectedBtn.classList.add('active');
  
  const selectedTab = document.getElementById(tabId);
  if (selectedTab) selectedTab.classList.add('active');
};

async function fetchStations() {
  const search = searchInput.value;
  const type = filterType.value;
  const url = new URL(`${window.location.origin}${API_BASE}/stations`);
  if (search) url.searchParams.append('search', search);
  if (type !== 'All') url.searchParams.append('type', type);

  try {
    const res = await fetch(url);
    const result = await res.json();
    if (result.success) {
      renderStations(result.data);
    }
  } catch (err) {
    showToast('Failed to load stations', true);
  }
}

function renderStations(stations) {
  if (stations.length === 0) {
    stationsGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">No charging stations found matching criteria.</p>`;
    return;
  }

  stationsGrid.innerHTML = stations.map(s => `
    <div class="card">
      <div>
        <div class="card-header">
          <div>
            <div class="card-title">${s.name}</div>
            <div class="card-loc">📍 ${s.location}</div>
          </div>
          <span class="slots-pill ${s.availableSlots > 0 ? 'available' : 'full'}">
            ${s.availableSlots > 0 ? `${s.availableSlots}/${s.totalSlots} Free` : 'Full'}
          </span>
        </div>
        <div class="card-details">
          <div>🔌 <strong>Type:</strong> ${s.chargingType}</div>
          <div>💰 <strong>Tariff:</strong> ${s.pricePerKwh}</div>
          <div>🕒 <strong>Hours:</strong> ${s.operatingHours}</div>
          <div>📞 <strong>Contact:</strong> ${s.contact}</div>
        </div>
      </div>
      <button class="book-btn" ${s.availableSlots === 0 ? 'disabled' : ''} onclick="openBookingModal('${s.id}', '${s.name}', '${s.location}')">
        ${s.availableSlots > 0 ? 'Reserve Slot' : 'Fully Occupied'}
      </button>
    </div>
  `).join('');
}

async function fetchBookings() {
  try {
    const res = await fetch(`${API_BASE}/bookings`);
    const result = await res.json();
    if (result.success) {
      renderBookings(result.data);
      bookingCount.textContent = result.data.length;
    }
  } catch (err) {
    console.error(err);
  }
}

function renderBookings(bookings) {
  if (bookings.length === 0) {
    bookingsList.innerHTML = `<p style="text-align: center; color: var(--text-muted);">You have no active reservations.</p>`;
    return;
  }

  bookingsList.innerHTML = bookings.map(b => `
    <div class="booking-card">
      <div>
        <h3>${b.stationName}</h3>
        <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 4px;">
          📅 Date: <strong>${b.date}</strong> | ⏰ Slot: <strong>${b.timeSlot}</strong>
        </p>
        <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 6px;">
          👤 ${b.userName} (${b.userContact}) • 💳 ${b.paymentStatus}
        </p>
      </div>
      <button class="cancel-btn" onclick="cancelBooking('${b.id}')">Cancel</button>
    </div>
  `).join('');
}

window.openBookingModal = (id, name, location) => {
  document.getElementById('modal-station-id').value = id;
  document.getElementById('modal-station-title').textContent = `Book at ${name}`;
  document.getElementById('modal-station-sub').textContent = location;
  
  // Ensure the booking modal form automatically reflects the currently logged-in user's name
  document.getElementById('user-name').value = currentUser.name;
  
  document.getElementById('modal-step-form').style.display = 'block';
  document.getElementById('modal-step-qr').style.display = 'none';
  
  bookingModal.style.display = 'flex';
};

closeModal.onclick = () => bookingModal.style.display = 'none';

window.proceedToPayment = () => {
  const name = document.getElementById('user-name').value;
  const phone = document.getElementById('user-contact').value;
  
  if (!name || !phone) {
    showToast('Please fill out all contact information', true);
    return;
  }

  document.getElementById('modal-step-form').style.display = 'none';
  document.getElementById('modal-step-qr').style.display = 'block';
};

window.confirmPayment = async () => {
  const payload = {
    stationId: document.getElementById('modal-station-id').value,
    userName: document.getElementById('user-name').value,
    userContact: document.getElementById('user-contact').value,
    vehicleModel: document.getElementById('vehicle-model').value,
    vehicleNumber: document.getElementById('vehicle-number').value,
    date: document.getElementById('booking-date').value,
    timeSlot: document.getElementById('booking-time').value,
  };

  try {
    const res = await fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (result.success) {
      showToast('Payment Verified & Slot Reserved!');
      bookingModal.style.display = 'none';
      fetchStations();
      fetchBookings();
      switchTab('bookings-tab');
    } else {
      showToast(result.message, true);
    }
  } catch (err) {
    showToast('Error confirming reservation', true);
  }
};

// Default User State
let currentUser = {
  name: 'Ananya Roy',
  email: 'ananya.roy@example.com',
  phone: '+91 98765 43210'
};

// Helper to extract 2-letter initials for the avatar circle
function getInitials(name) {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// DYNAMIC LOGIN HANDLER
window.handleLogin = (e) => {
  e.preventDefault();
  
  const nameInput = document.getElementById('login-name-input').value;
  const emailInput = document.getElementById('login-email-input').value;

  if (!nameInput || !emailInput) return;

  // Update current user state
  currentUser.name = nameInput;
  currentUser.email = emailInput;

  // Update Profile UI elements dynamically
  document.getElementById('profile-name').textContent = currentUser.name;
  document.getElementById('profile-email-phone').textContent = `${currentUser.email} • ${currentUser.phone}`;
  document.getElementById('profile-avatar').textContent = getInitials(currentUser.name);

  // Update the Booking Modal form fields so new bookings use this user's name
  const userNameInput = document.getElementById('user-name');
  if (userNameInput) userNameInput.value = currentUser.name;

  showToast(`Welcome back, ${currentUser.name}!`);
  switchTab('profile-tab');
};

// DYNAMIC LOGOUT HANDLER
window.handleLogout = () => {
  currentUser = {
    name: 'Guest User',
    email: 'guest@voltpulse.in',
    phone: '+91 00000 00000'
  };

  document.getElementById('login-form').reset();
  showToast('Logged out successfully');
  switchTab('login-tab');
};

function setupEvents() {
  searchInput.addEventListener('input', fetchStations);
  filterType.addEventListener('change', fetchStations);
}

window.cancelBooking = async (id) => {
  if (!confirm('Are you sure you want to cancel this booking?')) return;

  try {
    const res = await fetch(`${API_BASE}/bookings/${id}`, { method: 'DELETE' });
    const result = await res.json();
    if (result.success) {
      showToast('Booking canceled successfully');
      fetchBookings();
      fetchStations();
    }
  } catch (err) {
    showToast('Failed to cancel booking', true);
  }
};

function showToast(msg, isError = false) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  if (isError) toast.style.background = '#ef4444';
  toast.textContent = msg;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}