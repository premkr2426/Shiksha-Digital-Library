/* ===================================================
   Shiksha Digital Library — JavaScript
   Vanilla JS  |  Firebase v9 Modular  |  Firestore
   =================================================== */

// ─── Firebase v9 Modular Imports (CDN) ──────────────
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    onSnapshot,
    query,
    where,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ─── 🔥 Firebase Configuration ─────────────────────
const firebaseConfig = {
    apiKey: "AIzaSyA9nATGsp8x_nIEF-i27waTj5gMEjbNrRQ",
    authDomain: "shiksha-digital-library.firebaseapp.com",
    databaseURL: "https://shiksha-digital-library-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "shiksha-digital-library",
    storageBucket: "shiksha-digital-library.firebasestorage.app",
    messagingSenderId: "162891971459",
    appId: "1:162891971459:web:719b671bfed9c76aba14b6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestore collection reference
const bookingsRef = collection(db, 'bookings');
const roomsRef = collection(db, 'rooms');

// ─── CONSTANTS ──────────────────────────────────────
const TOTAL_SEATS = 90; // Default fallback


document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    //  1. DARK MODE TOGGLE
    // ==========================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const html = document.documentElement;

    // Load saved theme
    const savedTheme = localStorage.getItem('studynest-theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        html.setAttribute('data-theme', next);
        themeIcon.textContent = next === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('studynest-theme', next);
    });


    // ==========================================
    //  2. MOBILE NAV HAMBURGER
    // ==========================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });


    // ==========================================
    //  3. NAVBAR SCROLL EFFECT
    // ==========================================
    const navbar = document.getElementById('navbar');

    const handleScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });


    // ==========================================
    //  4. ACTIVE NAV LINK HIGHLIGHTING
    // ==========================================
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-links a');

    const highlightNav = () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navItems.forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === `#${id}`) a.classList.add('active');
                });
            }
        });
    };
    window.addEventListener('scroll', highlightNav, { passive: true });


    // ==========================================
    //  5. LIVE SEAT COUNTER (Firebase Firestore)
    // ==========================================
    const seatCountEl = document.getElementById('seatCount');

    if (seatCountEl) {
        let currentBookingsCount = 0;

        window.updateFrontendSeatCount = function() {
            let totalSeats = 0;
            if (window.allDynamicRooms && window.allDynamicRooms.length > 0) {
                window.allDynamicRooms.forEach(r => totalSeats += (r.totalSeats || 30));
            } else {
                totalSeats = TOTAL_SEATS; // Default
            }
            const availableSeats = Math.max(0, totalSeats - currentBookingsCount);
            if (seatCountEl) {
                seatCountEl.textContent = availableSeats;
                seatCountEl.removeAttribute('style');
            }
        };

        onSnapshot(bookingsRef, (snapshot) => {
            currentBookingsCount = snapshot.size;
            window.updateFrontendSeatCount();
        }, (error) => {
            console.error('Failed to listen to seat count:', error);
            seatCountEl.textContent = '—';
        });
    }


    // ==========================================
    //  6. SCROLL REVEAL ANIMATION
    // ==========================================
    const revealElements = document.querySelectorAll(
        '.pricing-card, .facility-card, .testimonial-card, .seat-card, .section-header'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    // ==========================================
    //  8. BACK TO TOP BUTTON
    // ==========================================
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });



});

// ==========================================
//  10. MODAL TOGGLE LOGIC
// ==========================================
window.openBookingModal = function () {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
};

window.closeBookingModal = function () {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restore background scrolling
    }
};


// ==========================================
//  9. STEP-BY-STEP BOOKING WIZARD
// ==========================================

let wizardRoom = null;
let wizardDuration = null;
let wizardPrice = null;
let wizardTimeSlot = null;
let wizardSeatId = null;

const step2 = document.getElementById('step2');
const step2Content = document.getElementById('step2Content');
const step3 = document.getElementById('step3');
const step3Content = document.getElementById('step3Content');
const wizardActionSection = document.getElementById('wizardActionSection');

const roomBtns = document.querySelectorAll('.room-btn');
const durationBtns = document.querySelectorAll('.duration-btn');
const wizardSeatGrid = document.getElementById('wizardSeatGrid');

// Summary elements
const summaryRoom = document.getElementById('summaryRoom');
const summaryDuration = document.getElementById('summaryDuration');
const summarySeat = document.getElementById('summarySeat');
const wizardConfirmBtn = document.getElementById('wizardConfirmBtn');

// Data structure to hold seat states
const wizardSeatsData = {};

// ─── Fetch booked seats for a room from Firestore ───
async function fetchRoomSeats(roomId) {
    try {
        const room = window.allDynamicRooms.find(r => r.id === roomId);
        const total = room && room.totalSeats ? parseInt(room.totalSeats) : 30;
        const startSeat = room && room.startSeatNumber ? parseInt(room.startSeatNumber) : 1;
        const rowsPerCol = Math.ceil(total / 3);

        wizardSeatsData[roomId] = {};
        
        // Reset all seats to available first
        let seatCount = 0;
        for (let c = 1; c <= 3; c++) {
            for (let s = 1; s <= rowsPerCol; s++) {
                if (seatCount >= total) break;
                const seatNum = startSeat + seatCount;
                const displayId = seatNum < 10 ? `0${seatNum}` : `${seatNum}`;
                const seatId = `${roomId}-${displayId}`;
                wizardSeatsData[roomId][seatId] = 'available';
                seatCount++;
            }
        }

        // Query Firestore for bookings in this room
        const q = query(bookingsRef, where('roomSelected', '==', roomId));
        const snapshot = await getDocs(q);

        // Mark booked seats
        snapshot.forEach(doc => {
            const data = doc.data();
            const seatId = `${roomId}-${data.seatNumber}`;
            if (wizardSeatsData[roomId][seatId] !== undefined) {
                wizardSeatsData[roomId][seatId] = 'booked';
            }
        });
    } catch (err) {
        console.error('Failed to fetch room seats from Firestore:', err);
    }
}

window.wizardSelectRoom = function (roomId, roomName) {
    wizardRoom = roomId;
    summaryRoom.textContent = roomName || `Room ${roomId}`;

    // Highlight selected
    const allRoomBtns = document.querySelectorAll('.room-btn');
    allRoomBtns.forEach((btn) => {
        if (btn.id === `roomBtn${roomId}`) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });

    // Populate Dynamic Durations
    const room = window.allDynamicRooms.find(r => r.id === roomId);
    const wizardDynamicDurations = document.getElementById('wizardDynamicDurations');
    
    if (room && wizardDynamicDurations) {
        const p5 = room.price5 || 0;
        const p10 = room.price10 || 0;
        const pFull = room.priceFull || 0;
        
        wizardDynamicDurations.innerHTML = `
            <button class="duration-btn" onclick="wizardSelectDuration('5 Hours', '₹${p5}/month')" id="duration5">
                <span class="duration-time">5 Hours</span>
                <span class="duration-price">₹${p5} / month</span>
            </button>
            <button class="duration-btn" onclick="wizardSelectDuration('10 Hours', '₹${p10}/month')" id="duration10">
                <span class="duration-time">10 Hours</span>
                <span class="duration-price">₹${p10} / month</span>
                <span class="duration-badge">Popular</span>
            </button>
            <button class="duration-btn" onclick="wizardSelectDuration('Full Shift', '₹${pFull}/month')" id="durationFull">
                <span class="duration-time">Full Shift</span>
                <span class="duration-price">₹${pFull} / month</span>
                <span class="duration-badge">Best Value</span>
            </button>
        `;
    }

    // Reveal Step 2
    step2.classList.remove('disabled');
    step2Content.style.display = 'block';

    // If seat was previously selected but room changed, reset seat
    if (wizardSeatId) {
        wizardSeatId = null;
        updateWizardSummary();
    }

    // If Step 3 is open, re-render seats for the new room
    if (!step3.classList.contains('disabled')) {
        fetchRoomSeats(roomId).then(() => renderWizardSeats());
    }

    // Scroll to Step 2
    setTimeout(() => {
        const offset = step2.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }, 100);
}

window.wizardSelectDuration = function (duration, price) {
    wizardDuration = duration;
    wizardPrice = price;
    summaryDuration.textContent = `${duration} (${price})`;

    // Highlight selected
    durationBtns.forEach((btn) => {
        const btnDuration = btn.querySelector('.duration-time').textContent;
        if (btnDuration === duration) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });

    const step25 = document.getElementById('step25');
    const timeSlotContainer = document.getElementById('timeSlotContainer');

    if (duration === '5 Hours') {
        if (timeSlotContainer) {
            timeSlotContainer.innerHTML = `
                <button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('6:00 AM - 11:00 AM')" id="slotA">
                    <span class="duration-time">6:00 AM - 11:00 AM</span>
                </button>
                <button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('11:00 AM - 4:00 PM')" id="slotB">
                    <span class="duration-time">11:00 AM - 4:00 PM</span>
                </button>
                <button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('4:00 PM - 9:00 PM')" id="slotC">
                    <span class="duration-time">4:00 PM - 9:00 PM</span>
                </button>
            `;
        }
        wizardTimeSlot = null;
        document.querySelectorAll('.timeslot-btn').forEach(btn => btn.classList.remove('selected'));

        // Hide step 3 until time slot is selected
        step3.classList.add('disabled');
        step3Content.style.display = 'none';

        step25.style.display = 'block';

        // Scroll to Step 2.5
        setTimeout(() => {
            const offset = step25.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }, 100);
    } else if (duration === '10 Hours') {
        if (timeSlotContainer) {
            timeSlotContainer.innerHTML = `
                <button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('6:00 AM - 4:00 PM')" id="slotA">
                    <span class="duration-time">6:00 AM - 4:00 PM</span>
                </button>
                <button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('11:00 AM - 9:00 PM')" id="slotB">
                    <span class="duration-time">11:00 AM - 9:00 PM</span>
                </button>
            `;
        }
        wizardTimeSlot = null;
        document.querySelectorAll('.timeslot-btn').forEach(btn => btn.classList.remove('selected'));

        step3.classList.add('disabled');
        step3Content.style.display = 'none';

        step25.style.display = 'block';

        // Scroll to Step 2.5
        setTimeout(() => {
            const offset = step25.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }, 100);
    } else if (duration === 'Full Shift') {
        wizardTimeSlot = '6:00 AM - 9:00 PM';
        step25.style.display = 'none';

        // Reveal Step 3
        step3.classList.remove('disabled');
        step3Content.style.display = 'block';

        // Fetch live seat data then render
        fetchRoomSeats(wizardRoom).then(() => renderWizardSeats());

        // Scroll to Step 3
        setTimeout(() => {
            const offset = step3.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }, 100);
    }
}

window.wizardSelectTimeSlot = function (slot) {
    wizardTimeSlot = slot;

    // Highlight selected
    document.querySelectorAll('.timeslot-btn').forEach(btn => {
        if (btn.querySelector('.duration-time').textContent === slot) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });

    // Reveal Step 3
    step3.classList.remove('disabled');
    step3Content.style.display = 'block';

    // Fetch live seat data then render
    fetchRoomSeats(wizardRoom).then(() => renderWizardSeats());

    // Scroll to Step 3
    setTimeout(() => {
        const offset = step3.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top: offset, behavior: 'smooth' });
    }, 100);
}

function renderWizardSeats() {
    wizardSeatGrid.innerHTML = '';

    const room = window.allDynamicRooms.find(r => r.id === wizardRoom);
    const total = room && room.totalSeats ? parseInt(room.totalSeats) : 30;
    const startSeat = room && room.startSeatNumber ? parseInt(room.startSeatNumber) : 1;
    const rowsPerCol = Math.ceil(total / 3);

    let seatCount = 0;
    for (let c = 1; c <= 3; c++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'seat-column';

        for (let s = 1; s <= rowsPerCol; s++) {
            if (seatCount >= total) break;
            const seatNum = startSeat + seatCount;
            const displayId = seatNum < 10 ? `0${seatNum}` : `${seatNum}`;
            const seatId = `${wizardRoom}-${displayId}`;
            const status = wizardSeatsData[wizardRoom][seatId];
            if (!status) { seatCount++; continue; } 

            const seatDiv = document.createElement('div');
            let stateClass = status;
            if (seatId === wizardSeatId) stateClass = 'selected';

            seatDiv.className = `seat ${stateClass}`;
            seatDiv.textContent = displayId;

            if (status === 'available') {
                seatDiv.addEventListener('click', () => handleWizardSeatClick(seatId));
            }
            colDiv.appendChild(seatDiv);
            seatCount++;
        }
        wizardSeatGrid.appendChild(colDiv);
    }
}

function handleWizardSeatClick(seatId) {
    wizardSeatId = (wizardSeatId === seatId) ? null : seatId;
    renderWizardSeats();
    updateWizardSummary();
}

function updateWizardSummary() {
    if (wizardSeatId) {
        const [room, seat] = wizardSeatId.split('-');
        summarySeat.textContent = seat;

        // Reveal action section
        wizardActionSection.classList.remove('hidden');
        wizardActionSection.style.display = 'flex';

        // Scroll to button
        setTimeout(() => {
            const offset = wizardActionSection.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }, 100);
    } else {
        summarySeat.textContent = '—';
        wizardActionSection.classList.add('hidden');
        wizardActionSection.style.display = 'none';
    }
}

// ─── Confirm Booking → Save to Firestore ────────────
window.wizardConfirmBooking = function () {
    if (!wizardRoom || !wizardDuration || !wizardSeatId) return;
    if (wizardDuration === '5 Hours' && !wizardTimeSlot) {
        alert('Please select a time slot.');
        return;
    }

    const step4 = document.getElementById('step4');
    const step4Content = document.getElementById('step4Content');
    const wizardNameInput = document.getElementById('wizardName');

    if (step4) {
        step4.classList.remove('disabled');
        if (step4Content) step4Content.style.display = 'block';

        const confirmBtn = document.getElementById('wizardConfirmBtn');
        confirmBtn.innerHTML = 'Submit Booking <span class="btn-arrow">→</span>';
        confirmBtn.onclick = window.wizardSubmitBooking;

        setTimeout(() => {
            const offset = step4.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
            if (wizardNameInput) wizardNameInput.focus();
        }, 100);
    }
};

window.wizardSubmitBooking = async function () {
    const userName = document.getElementById('wizardName').value.trim();
    const userPhone = document.getElementById('wizardPhone').value.trim();
    const userEmail = document.getElementById('wizardEmail').value.trim();

    if (!userName || !userPhone) {
        alert('Name and Phone Number are required!');
        return;
    }

    const [room, seat] = wizardSeatId.split('-');
    const confirmBtn = document.getElementById('wizardConfirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = 'Booking... ⏳';

    try {
        await addDoc(bookingsRef, {
            name: userName,
            phone: userPhone,
            email: userEmail || '',
            roomSelected: wizardRoom,
            shiftDuration: wizardDuration,
            selectedShiftTime: wizardTimeSlot || 'N/A',
            seatNumber: seat,
            date: Timestamp.now()
        });

        alert(`✅ Booking Confirmed!\n\n🚪 Room: ${room}\n💺 Seat: ${seat}\n⏳ Duration: ${wizardDuration}\n⏰ Shift: ${wizardTimeSlot || 'N/A'}\n\nThank you, ${userName}!`);

        wizardSeatsData[wizardRoom][wizardSeatId] = 'booked';
        wizardSeatId = null;
        renderWizardSeats();
        updateWizardSummary();

        const seatCountEl = document.getElementById('seatCount');
        if (seatCountEl && window._fetchSeatCount) {
            const count = await window._fetchSeatCount();
            if (count !== null) seatCountEl.textContent = count;
        }

        if (window.closeBookingModal) window.closeBookingModal();
    } catch (err) {
        console.error('Firestore booking error:', err);
        alert('❌ Failed to save booking. Please check your connection and try again.');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Submit Booking <span class="btn-arrow">→</span>';
    }
}

// ==========================================
// 10. FETCH ROOMS & ROOM DETAILS MODAL
// ==========================================

// Cache all fetched rooms for detail modal lookups
window.allDynamicRooms = [];
let selectedRoomIdForBooking = null;

onSnapshot(roomsRef, (snapshot) => {
    const grid = document.getElementById('dynamicRoomsGrid');
    if (!grid) return;

    if (snapshot.empty) {
        window.allDynamicRooms = [];
        grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); width: 100%;">No premium rooms available at the moment. Please check back later.</p>';
        return;
    }

    window.allDynamicRooms = [];
    let html = '';
    let wizardRoomsHtml = '';
    
    snapshot.forEach(docSnap => {
        const room = { id: docSnap.id, ...docSnap.data() };
        window.allDynamicRooms.push(room);
    });

    window.allDynamicRooms.sort((a, b) => {
        const getNo = (str) => { const m = (str||'').match(/\d+/); return m ? parseInt(m[0]) : 999; };
        return getNo(a.name) - getNo(b.name);
    });

    window.allDynamicRooms.forEach(room => {
        const imgSrc = room.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&q=80';
        const safeName = (room.name || '').replace(/</g, '&lt;');
        const safeTag = (room.tagline || '').replace(/</g, '&lt;');
        const safeDesc = (room.description || '').replace(/</g, '&lt;');
        const priceLabel = room.price5 ? `From ₹${room.price5}/mo` : '';

        html += `
        <div class="dynamic-room-card" onclick="openRoomDetailsModal('${room.id}')">
            <img src="${imgSrc}" alt="${safeName}" style="width:100%; height:160px; object-fit:cover; border-radius:12px; margin-bottom:16px;">
            <h3>${safeName}</h3>
            <div class="room-tagline">${safeTag}</div>
            <p>${safeDesc}</p>
            ${priceLabel ? `<span style="font-size:0.9rem; font-weight:700; color:var(--accent-1); margin-top:8px; display:inline-block;">${priceLabel}</span>` : ''}
            <button class="btn btn-outline btn-book-room" style="margin-top:16px;">View Details</button>
        </div>`;

        wizardRoomsHtml += `
        <button class="room-btn" onclick="wizardSelectRoom('${room.id}', '${safeName}')" id="roomBtn${room.id}">
            <span class="room-icon">🚪</span>
            <span class="room-name">${safeName}</span>
            <span class="room-desc">${safeTag}</span>
        </button>`;
    });
    
    grid.innerHTML = html;
    
    const wizardDynamicRooms = document.getElementById('wizardDynamicRooms');
    if (wizardDynamicRooms) {
        wizardDynamicRooms.innerHTML = wizardRoomsHtml;
    }
    
    // Update live seat count grand total when rooms change
    if (window.updateFrontendSeatCount) window.updateFrontendSeatCount();
});

// Open Room Details Modal
window.openRoomDetailsModal = function (roomId) {
    const room = window.allDynamicRooms.find(r => r.id === roomId);
    if (!room) return;

    selectedRoomIdForBooking = roomId;

    // Image
    const imgEl = document.getElementById('roomDetailImg');
    const imgSrc = room.imageUrl || 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&q=80';
    imgEl.src = imgSrc;
    imgEl.alt = room.name || 'Room';

    // Name, Tagline, Description
    document.getElementById('roomDetailName').textContent = room.name || 'Unnamed Room';
    document.getElementById('roomDetailTagline').textContent = room.tagline || '';
    document.getElementById('roomDetailDesc').textContent = room.description || '';

    // Pricing
    const pricingEl = document.getElementById('roomDetailPricing');
    pricingEl.innerHTML = `
        <div class="pricing-tile">
            <span class="pricing-duration">5 Hours</span>
            <span class="pricing-amount">₹${room.price5 || 0}<span style="font-size:0.75rem; font-weight:500;"> /month</span></span>
        </div>
        <div class="pricing-tile popular">
            <span class="pricing-badge">Popular</span>
            <span class="pricing-duration">10 Hours</span>
            <span class="pricing-amount">₹${room.price10 || 0}<span style="font-size:0.75rem; font-weight:500;"> /month</span></span>
        </div>
        <div class="pricing-tile">
            <span class="pricing-duration">Full Shift</span>
            <span class="pricing-amount">₹${room.priceFull || 0}<span style="font-size:0.75rem; font-weight:500;"> /month</span></span>
        </div>
    `;

    // Features
    const featEl = document.getElementById('roomDetailFeatures');
    let features = [];
    if (typeof room.features === 'string') {
        features = room.features.split(',').map(f => f.trim()).filter(f => f !== '');
    } else if (Array.isArray(room.features)) {
        features = room.features;
    }

    if (features.length === 0) features = ['No features listed'];

    featEl.innerHTML = features.map(f => `<li>✅ ${f.replace(/</g, '&lt;')}</li>`).join('');

    // Show modal
    const modal = document.getElementById('roomDetailsModal');
    modal.style.display = 'flex';
    setTimeout(() => { modal.classList.add('active'); }, 10);
    document.body.style.overflow = 'hidden';
};

// Close Room Details Modal
window.closeRoomDetailsModal = function () {
    const modal = document.getElementById('roomDetailsModal');
    modal.classList.remove('active');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
};

// ==========================================
// 11. BOOKING MODAL TOGGLE LOGIC (BULLETPROOF)
// ==========================================
window.openBookingModal = function () {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.style.display = 'flex';
        // Thoda delay taaki display block hone ke baad animation trigger ho
        setTimeout(() => {
            modal.classList.add('active');
        }, 10);
        document.body.style.overflow = 'hidden';
    } else {
        console.error("Error: 'bookingModal' ID nahi mili.");
    }
};

window.closeBookingModal = function () {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        // Animation khatam hone ke baad display none karo
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        document.body.style.overflow = '';

        // Modal band hote hi forms reset kar dena acchi practice hai
        resetBookingWizard();
    }
};

// Proceed to Book — close details modal, open booking modal, auto-select room
window.proceedToBookFromDetails = function () {
    // 1. Close Details Modal
    const detailModal = document.getElementById('roomDetailsModal');
    if (detailModal) {
        detailModal.classList.remove('active');
        setTimeout(() => {
            detailModal.style.display = 'none';
        }, 300);
    }

    // Find the index of the selected room among cached rooms
    const roomIndex = window.allDynamicRooms.findIndex(r => r.id === selectedRoomIdForBooking);
    const roomNumber = roomIndex + 1; // 1-based index for wizardSelectRoom

    // 2. Fir booking wala modal khol do thode delay ke baad
    setTimeout(() => {
        openBookingModal();

        // Auto-select the room in the wizard
        setTimeout(() => {
            if (typeof wizardSelectRoom === 'function') {
                const room = window.allDynamicRooms.find(r => r.id === selectedRoomIdForBooking);
                if (room) {
                    wizardSelectRoom(room.id, room.name);
                }
            }
        }, 150);
    }, 350);
};

// Wizard ko fresh state mein lane ka function
function resetBookingWizard() {
    // Ye variables existing codebase mein pehle se define hone chahiye
    if (typeof wizardRoom !== 'undefined') wizardRoom = null;
    if (typeof wizardDuration !== 'undefined') wizardDuration = null;
    if (typeof wizardPrice !== 'undefined') wizardPrice = null;
    if (typeof wizardSeatId !== 'undefined') wizardSeatId = null;
    if (typeof wizardTimeSlot !== 'undefined') wizardTimeSlot = null;

    const step2 = document.getElementById('step2');
    const step2Content = document.getElementById('step2Content');
    const step25 = document.getElementById('step25');
    const step3 = document.getElementById('step3');
    const step3Content = document.getElementById('step3Content');
    const actionSec = document.getElementById('wizardActionSection');

    if (step2) step2.classList.add('disabled');
    if (step2Content) step2Content.style.display = 'none';
    if (step25) step25.style.display = 'none';
    if (step3) step3.classList.add('disabled');
    if (step3Content) step3Content.style.display = 'none';
    
    const step4 = document.getElementById('step4');
    const step4Content = document.getElementById('step4Content');
    const wizardName = document.getElementById('wizardName');
    const wizardPhone = document.getElementById('wizardPhone');
    const wizardEmail = document.getElementById('wizardEmail');
    const confirmBtn = document.getElementById('wizardConfirmBtn');
    
    if (step4) step4.classList.add('disabled');
    if (step4Content) step4Content.style.display = 'none';
    if (wizardName) wizardName.value = '';
    if (wizardPhone) wizardPhone.value = '';
    if (wizardEmail) wizardEmail.value = '';
    
    if (confirmBtn) {
        confirmBtn.innerHTML = 'Confirm Booking <span class="btn-arrow">→</span>';
        confirmBtn.onclick = wizardConfirmBooking;
    }

    if (actionSec) {
        actionSec.classList.add('hidden');
        actionSec.style.display = 'none';
    }

    document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.timeslot-btn').forEach(b => b.classList.remove('selected'));

    const sumRoom = document.getElementById('summaryRoom');
    const sumDur = document.getElementById('summaryDuration');
    const sumSeat = document.getElementById('summarySeat');

    if (sumRoom) sumRoom.textContent = '—';
    if (sumDur) sumDur.textContent = '—';
    if (sumSeat) sumSeat.textContent = '—';
}