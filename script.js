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
const TOTAL_SEATS = 90; // 3 rooms × 30 seats each


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
        onSnapshot(bookingsRef, (snapshot) => {
            const totalBooked = snapshot.size;
            const availableSeats = Math.max(0, TOTAL_SEATS - totalBooked);
            seatCountEl.textContent = availableSeats;
            seatCountEl.removeAttribute('style'); // Clear loading state inline CSS
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
window.openBookingModal = function() {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }
};

window.closeBookingModal = function() {
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

// Data structure to hold seat states: 3 rooms, 30 seats each
const wizardSeatsData = {};
for (let r = 1; r <= 3; r++) {
    wizardSeatsData[r] = {};
    for (let c = 1; c <= 3; c++) {
        for (let s = 1; s <= 10; s++) {
            const rowLetter = String.fromCharCode(64 + s);
            const seatId = `${r}-${rowLetter}${c}`;
            wizardSeatsData[r][seatId] = 'available';
        }
    }
}

// ─── Fetch booked seats for a room from Firestore ───
async function fetchRoomSeats(roomId) {
    try {
        // Reset all seats to available first
        for (let c = 1; c <= 3; c++) {
            for (let s = 1; s <= 10; s++) {
                const rowLetter = String.fromCharCode(64 + s);
                const seatId = `${roomId}-${rowLetter}${c}`;
                wizardSeatsData[roomId][seatId] = 'available';
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

window.wizardSelectRoom = function(roomId) {
    wizardRoom = roomId;
    summaryRoom.textContent = `Room ${roomId}`;
    
    // Highlight selected
    roomBtns.forEach((btn, idx) => {
        if (idx === roomId - 1) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });

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

window.wizardSelectDuration = function(duration, price) {
    wizardDuration = duration;
    wizardPrice = price;
    summaryDuration.textContent = `${duration} (${price})`;
    
    // Highlight selected
    durationBtns.forEach((btn) => {
        const btnDuration = btn.querySelector('.duration-time').textContent;
        if (btnDuration === duration) btn.classList.add('selected');
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
    
    for (let c = 1; c <= 3; c++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'seat-column';
        
        for (let s = 1; s <= 10; s++) {
            const rowLetter = String.fromCharCode(64 + s);
            const seatId = `${wizardRoom}-${rowLetter}${c}`;
            const status = wizardSeatsData[wizardRoom][seatId];
            const displayId = `${rowLetter}${c}`;
            
            const seatDiv = document.createElement('div');
            let stateClass = status;
            if (seatId === wizardSeatId) stateClass = 'selected';
            
            seatDiv.className = `seat ${stateClass}`;
            seatDiv.textContent = displayId;
            
            if (status === 'available') {
                seatDiv.addEventListener('click', () => handleWizardSeatClick(seatId));
            }
            colDiv.appendChild(seatDiv);
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
window.wizardConfirmBooking = async function() {
    if (!wizardRoom || !wizardDuration || !wizardSeatId) return;
    
    const [room, seat] = wizardSeatId.split('-');
    
    // Prompt user for name and phone
    const userName = prompt('Enter your full name:');
    if (!userName || !userName.trim()) { alert('Name is required!'); return; }
    
    const userPhone = prompt('Enter your phone number:');
    if (!userPhone || !userPhone.trim()) { alert('Phone number is required!'); return; }
    
    const confirmBtn = document.getElementById('wizardConfirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = 'Booking... ⏳';
    
    try {
        // Save booking directly to Firestore 'bookings' collection
        await addDoc(bookingsRef, {
            name: userName.trim(),
            phone: userPhone.trim(),
            roomSelected: wizardRoom,
            shiftDuration: wizardDuration,
            seatNumber: seat,
            date: Timestamp.now()
        });

        alert(`✅ Booking Confirmed!\n\n🚪 Room: ${room}\n💺 Seat: ${seat}\n⏳ Duration: ${wizardDuration}\n\nThank you, ${userName.trim()}!`);
        
        // Mark seat as booked locally and re-render
        wizardSeatsData[wizardRoom][wizardSeatId] = 'booked';
        wizardSeatId = null;
        renderWizardSeats();
        updateWizardSummary();
        
        // Refresh the live seat counter
        const seatCountEl = document.getElementById('seatCount');
        if (seatCountEl && window._fetchSeatCount) {
            const count = await window._fetchSeatCount();
            if (count !== null) seatCountEl.textContent = count;
        }

    } catch (err) {
        console.error('Firestore booking error:', err);
        alert('❌ Failed to save booking. Please check your connection and try again.');
    } finally {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Confirm Booking <span class="btn-arrow">→</span>';
    }
}

// ==========================================
// 10. FETCH ROOMS FROM ADMIN PANEL
// ==========================================
onSnapshot(roomsRef, (snapshot) => {
    const grid = document.getElementById('dynamicRoomsGrid');
    if (!grid) return;
    
    if (snapshot.empty) {
        grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); width: 100%;">No premium rooms available at the moment. Please check back later.</p>';
        return;
    }
    
    let html = '';
    snapshot.forEach(doc => {
        const room = doc.data();
        html += `
        <div style="background: var(--bg-card); padding: 24px; border-radius: 16px; border: 1px solid var(--border-color); box-shadow: var(--shadow-card);">
            <h3 style="font-size: 1.3rem; margin-bottom: 12px;">🚪 ${room.name}</h3>
            <span style="background: var(--accent-glow); color: var(--accent-light); padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">${room.tagline}</span>
            <p style="margin-top: 16px; font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6;">${room.description}</p>
        </div>`;
    });
    grid.innerHTML = html;
});
