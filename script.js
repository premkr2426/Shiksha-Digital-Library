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
    apiKey: "AIzaSyBYtPfwJSIcutp6IzVHflZu0RvfCS4vrWw",
    authDomain: "library-test-cab90.firebaseapp.com",
    projectId: "library-test-cab90",
    storageBucket: "library-test-cab90.firebasestorage.app",
    messagingSenderId: "996632418924",
    appId: "1:996632418924:web:3070a8220d4e24224fd649"
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

    window.allDynamicRooms = window.allDynamicRooms || [];

    // ==========================================
    //  5. LIVE SEAT COUNTER (Firebase Firestore)
    // ==========================================
    const seatCountEl = document.getElementById('seatCount');

    if (seatCountEl) {
        let currentBookingsCount = 0;

        window.updateFrontendSeatCount = function () {
            console.log('CRITICAL: Seat counter logic started');
            let totalSeats = 0;
            if (window.allDynamicRooms && window.allDynamicRooms.length > 0) {
                window.allDynamicRooms.forEach(r => totalSeats += (r.totalSeats || 30));
            } else {
                totalSeats = TOTAL_SEATS || 30; // Default
            }
            const availableSeats = Math.max(0, totalSeats - currentBookingsCount);
            
            if (seatCountEl) {
                if (window.allDynamicRooms.length === 0 && seatCountEl.textContent.includes('Fetching')) {
                    seatCountEl.textContent = '0';
                } else {
                    seatCountEl.textContent = availableSeats;
                }
                seatCountEl.removeAttribute('style');
            }
        };

        // CHECK FIREBASE RULES: Verify in Firebase Console that 'read' access is explicitly allowed for unauthenticated users if this is public.
        const seatFetchTimeout = setTimeout(() => {
            if (seatCountEl.textContent.includes('Fetching') || seatCountEl.textContent === '—') {
                console.warn('Seat count fetch timed out (3000ms).');
                seatCountEl.textContent = '0'; // force unlock UI
            }
        }, 3000);

        try {
            console.log('Fetching live bookings data...');
            onSnapshot(bookingsRef, (snapshot) => {
                let approvedBookingsCount = 0;
                snapshot.forEach(docSnap => {
                    const status = docSnap.data().status || 'approved';
                    if (status === 'approved') approvedBookingsCount++;
                });

                console.log('CRITICAL: Data received from Firebase');
                console.log('Live bookings fetched:', snapshot.size, 'Approved:', approvedBookingsCount);
                clearTimeout(seatFetchTimeout);
                currentBookingsCount = approvedBookingsCount;
                window.updateFrontendSeatCount();
            }, (error) => {
                clearTimeout(seatFetchTimeout);
                console.error("FIREBASE ERROR:", error);
                seatCountEl.textContent = '0';
            });
        } catch (e) {
            clearTimeout(seatFetchTimeout);
            console.error("FIREBASE ERROR:", e);
            seatCountEl.textContent = '0';
        }
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
// Booking Modal functions
window.openBookingModal = function () {
    console.log("Opening Booking Modal...");
    const modal = document.getElementById('bookingModal');
    const otherModal = document.getElementById('liveSeatModal');

    if (otherModal) otherModal.classList.remove('active'); // Dusra modal band karo
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = '99999';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
    }
};

window.closeBookingModal = function () {
    const modal = document.getElementById('bookingModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
        document.body.style.overflow = '';
    }
};

// Live Viewer Modal functions
window.openLiveSeatModal = function () {
    console.log("Opening Live Viewer Modal...");
    const modal = document.getElementById('liveSeatModal');
    const otherModal = document.getElementById('bookingModal');

    if (otherModal) otherModal.classList.remove('active'); // Dusra modal band karo
    if (modal) {
        modal.style.display = 'flex';
        modal.style.zIndex = '99999';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';

        // Agar pehle se koi room select hai toh seats render karo
        const select = document.getElementById('liveViewerRoomSelect');
        if (select && select.value) {
            window.renderLiveViewerSeats();
        }
    }
};

window.closeLiveSeatModal = function () {
    const modal = document.getElementById('liveSeatModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
        document.body.style.overflow = '';
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

const step2 = document.getElementById('step2'); // Seat
const step2Content = document.getElementById('step2Content');
const step3 = document.getElementById('step3'); // Duration
const step3Content = document.getElementById('step3Content');
const step4 = document.getElementById('step4'); // Time Slot
const step5 = document.getElementById('step5'); // Details
const step5Content = document.getElementById('step5Content');
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

        let seatCount = 0;
        for (let c = 1; c <= 3; c++) {
            for (let s = 1; s <= rowsPerCol; s++) {
                if (seatCount >= total) break;
                const seatNum = startSeat + seatCount;
                const displayId = seatNum < 10 ? `0${seatNum}` : `${seatNum}`;
                const seatId = `${roomId}-${displayId}`;
                wizardSeatsData[roomId][seatId] = {
                    status: 'available',
                    bookedBlocks: []
                };
                seatCount++;
            }
        }

        const q = query(bookingsRef, where('roomSelected', '==', roomId));
        const snapshot = await getDocs(q);

        snapshot.forEach(doc => {
            const data = doc.data();
            const bStatus = data.status || 'approved';
            if (bStatus !== 'approved') return;

            const seatId = `${roomId}-${data.seatNumber}`;
            if (wizardSeatsData[roomId][seatId]) {
                const shift = data.selectedShiftTime || 'N/A';
                const blocks = [];

                if (shift.includes('6:00 AM - 11:00 AM')) blocks.push('A');
                else if (shift.includes('11:00 AM - 4:00 PM')) blocks.push('B');
                else if (shift.includes('4:00 PM - 9:00 PM')) blocks.push('C');
                else if (shift.includes('6:00 AM - 4:00 PM')) { blocks.push('A', 'B'); }
                else if (shift.includes('11:00 AM - 9:00 PM')) { blocks.push('B', 'C'); }
                else { blocks.push('A', 'B', 'C'); }

                wizardSeatsData[roomId][seatId].bookedBlocks.push(...blocks);
            }
        });

        for (let seatId in wizardSeatsData[roomId]) {
            const sd = wizardSeatsData[roomId][seatId];
            const uniqueBlocks = new Set(sd.bookedBlocks);
            sd.bookedBlocks = Array.from(uniqueBlocks);

            if (uniqueBlocks.size === 0) sd.status = 'available';
            else if (uniqueBlocks.size >= 3) sd.status = 'booked';
            else sd.status = 'partially-booked';
        }
    } catch (err) {
        console.error('Failed to fetch room seats:', err);
    }
}

window.wizardSelectRoom = function (roomId, roomName) {
    wizardRoom = roomId;
    summaryRoom.textContent = roomName || `Room ${roomId}`;

    const allRoomBtns = document.querySelectorAll('.room-btn');
    allRoomBtns.forEach(btn => {
        if (btn.id === `roomBtn${roomId}`) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });

    if (step2) step2.classList.remove('disabled');
    if (step2Content) step2Content.style.display = 'block';

    if (step3) step3.classList.add('disabled');
    if (step3Content) step3Content.style.display = 'none';
    if (step4) step4.style.display = 'none';
    if (step5) { step5.classList.add('disabled'); if (step5Content) step5Content.style.display = 'none'; }

    if (wizardActionSection) { wizardActionSection.classList.add('hidden'); wizardActionSection.style.display = 'none'; }
    wizardSeatId = null;

    fetchRoomSeats(roomId).then(() => renderWizardSeats());

    setTimeout(() => {
        if (step2) {
            const offset = step2.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
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

            const sd = wizardSeatsData[wizardRoom][seatId];
            if (!sd) { seatCount++; continue; }

            const seatDiv = document.createElement('div');
            let stateClass = sd.status;
            if (seatId === wizardSeatId) stateClass = 'selected';

            seatDiv.className = `seat ${stateClass}`;
            seatDiv.textContent = displayId;

            if (sd.status === 'available' || sd.status === 'partially-booked') {
                seatDiv.addEventListener('click', () => handleWizardSeatClick(seatId));
            }
            colDiv.appendChild(seatDiv);
            seatCount++;
        }
        wizardSeatGrid.appendChild(colDiv);
    }
}

function handleWizardSeatClick(seatId) {
    if (wizardSeatId === seatId) {
        wizardSeatId = null;
        if (step3) step3.classList.add('disabled');
        if (step3Content) step3Content.style.display = 'none';
        if (step4) step4.style.display = 'none';
    } else {
        wizardSeatId = seatId;

        if (step3) step3.classList.remove('disabled');
        if (step3Content) step3Content.style.display = 'block';
        if (step4) step4.style.display = 'none';

        const sd = wizardSeatsData[wizardRoom][seatId];
        const taken = sd ? sd.bookedBlocks : [];

        const room = window.allDynamicRooms.find(r => r.id === wizardRoom);
        const wizardDynamicDurations = document.getElementById('wizardDynamicDurations');
        if (room && wizardDynamicDurations) {
            const p5 = room.price5 || 0;
            const p10 = room.price10 || 0;
            const pFull = room.priceFull || 0;

            let html = "";
            const canBook5 = !taken.includes('A') || !taken.includes('B') || !taken.includes('C');
            const canBook10 = (!taken.includes('A') && !taken.includes('B')) || (!taken.includes('B') && !taken.includes('C'));
            const canBookFull = !taken.includes('A') && !taken.includes('B') && !taken.includes('C');

            if (canBook5) {
                html += `<button class="duration-btn" onclick="wizardSelectDuration('5 Hours', '₹${p5}/month')" id="duration5">
                    <span class="duration-time">5 Hours</span>
                    <span class="duration-price">₹${p5} / month</span>
                </button>`;
            }
            if (canBook10) {
                html += `<button class="duration-btn" onclick="wizardSelectDuration('10 Hours', '₹${p10}/month')" id="duration10">
                    <span class="duration-time">10 Hours</span>
                    <span class="duration-price">₹${p10} / month</span>
                    <span class="duration-badge">Popular</span>
                </button>`;
            }
            if (canBookFull) {
                html += `<button class="duration-btn" onclick="wizardSelectDuration('Full Shift', '₹${pFull}/month')" id="durationFull">
                    <span class="duration-time">Full Shift</span>
                    <span class="duration-price">₹${pFull} / month</span>
                    <span class="duration-badge">Best Value</span>
                </button>`;
            }
            wizardDynamicDurations.innerHTML = html;
        }

        wizardDuration = null;
        wizardTimeSlot = null;
        summaryDuration.textContent = '—';
        if (step5) step5.classList.add('disabled');
        if (step5Content) step5Content.style.display = 'none';
        if (wizardActionSection) {
            wizardActionSection.classList.add('hidden');
            wizardActionSection.style.display = 'none';
        }

        setTimeout(() => {
            if (step3) {
                const offset = step3.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }, 100);
    }
    renderWizardSeats();
    summarySeat.textContent = wizardSeatId ? wizardSeatId.split('-')[1] : '—';
}

window.wizardSelectDuration = function (duration, price) {
    wizardDuration = duration;
    wizardPrice = price;
    summaryDuration.textContent = `${duration} (${price})`;

    const dBtns = document.querySelectorAll('.duration-btn:not(.timeslot-btn)');
    dBtns.forEach(btn => {
        const dTimeEl = btn.querySelector('.duration-time');
        if (dTimeEl && dTimeEl.textContent === duration) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });


    const timeSlotContainer = document.getElementById('timeSlotContainer');

    const sd = wizardSeatsData[wizardRoom][wizardSeatId];
    const taken = sd ? sd.bookedBlocks : [];

    if (duration === '5 Hours') {
        let html = "";
        if (!taken.includes('A')) html += `<button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('6:00 AM - 11:00 AM')"><span class="duration-time">6:00 AM - 11:00 AM</span></button>`;
        if (!taken.includes('B')) html += `<button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('11:00 AM - 4:00 PM')"><span class="duration-time">11:00 AM - 4:00 PM</span></button>`;
        if (!taken.includes('C')) html += `<button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('4:00 PM - 9:00 PM')"><span class="duration-time">4:00 PM - 9:00 PM</span></button>`;
        timeSlotContainer.innerHTML = html;

        wizardTimeSlot = null;
        if (step4) {
            step4.classList.remove('disabled');
            step4.style.display = 'block';
        }

        if (step5) step5.classList.add('disabled');
        if (step5Content) step5Content.style.display = 'none';
        if (wizardActionSection) {
            wizardActionSection.classList.add('hidden');
            wizardActionSection.style.display = 'none';
        }

        setTimeout(() => {
            if (step4) {
                const offset = step4.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }, 100);

    } else if (duration === '10 Hours') {
        let html = "";
        if (!taken.includes('A') && !taken.includes('B')) {
            html += `<button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('6:00 AM - 4:00 PM')"><span class="duration-time">6:00 AM - 4:00 PM</span></button>`;
        }
        if (!taken.includes('B') && !taken.includes('C')) {
            html += `<button class="duration-btn timeslot-btn" onclick="wizardSelectTimeSlot('11:00 AM - 9:00 PM')"><span class="duration-time">11:00 AM - 9:00 PM</span></button>`;
        }
        timeSlotContainer.innerHTML = html;

        wizardTimeSlot = null;
        if (step4) {
            step4.classList.remove('disabled');
            step4.style.display = 'block';
        }

        if (step5) step5.classList.add('disabled');
        if (step5Content) step5Content.style.display = 'none';
        if (wizardActionSection) {
            wizardActionSection.classList.add('hidden');
            wizardActionSection.style.display = 'none';
        }

        setTimeout(() => {
            if (step4) {
                const offset = step4.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: offset, behavior: 'smooth' });
            }
        }, 100);

    } else if (duration === 'Full Shift') {
        wizardTimeSlot = '6:00 AM - 9:00 PM';
        if (step4) step4.style.display = 'none';
        updateWizardSummaryAction();
    }
}

window.wizardSelectTimeSlot = function (slot) {
    wizardTimeSlot = slot;
    document.querySelectorAll('.timeslot-btn').forEach(btn => {
        if (btn.querySelector('.duration-time').textContent === slot) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
    updateWizardSummaryAction();
}

function updateWizardSummaryAction() {
    const confirmBtn = document.getElementById('wizardConfirmBtn');

    if (wizardSeatId && wizardDuration && wizardTimeSlot) {
        if (wizardActionSection) {
            wizardActionSection.classList.remove('hidden');
            wizardActionSection.style.display = 'flex';
        }

        if (step5) {
            step5.classList.remove('disabled');
            if (step5Content) step5Content.style.display = 'block';
        }

        if (confirmBtn) {
            confirmBtn.innerHTML = 'Submit Booking <span class="btn-arrow">→</span>';
        }

        setTimeout(() => {
            if (step5) {
                const offset = step5.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: offset, behavior: 'smooth' });
                const wizardNameInput = document.getElementById('wizardName');
                if (wizardNameInput) wizardNameInput.focus();
            }
        }, 100);
    }
}

function updateWizardSummary() {
function generateBookingToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let token = '';
    for (let i = 0; i < 6; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `SL-${token}`;
}

window.showSuccessModal = function(token, room, seat, duration, shift) {
    const tokenEl = document.getElementById('smToken');
    const roomEl = document.getElementById('smRoom');
    const seatEl = document.getElementById('smSeat');
    const durationEl = document.getElementById('smDuration');
    const shiftEl = document.getElementById('smShift');

    if (tokenEl) tokenEl.textContent = token;
    if (roomEl) roomEl.textContent = room;
    if (seatEl) seatEl.textContent = seat;
    if (durationEl) durationEl.textContent = duration;
    if (shiftEl) shiftEl.textContent = shift || 'N/A';

    const copyBtn = document.getElementById('copyTokenBtn');
    if (copyBtn) {
        copyBtn.onclick = function() {
            if (navigator.clipboard) {
                navigator.clipboard.writeText(token).then(() => {
                    copyBtn.innerHTML = '✅ Copied!';
                    setTimeout(() => {
                        copyBtn.innerHTML = '📋 Copy Token';
                    }, 2000);
                }).catch(err => {
                    console.error("Failed to copy:", err);
                });
            }
        };
    }

    const modal = document.getElementById('successModal');
    if (modal) modal.style.display = 'flex';
}

window.wizardSubmitBooking = async function () {
    const userName = document.getElementById('wizardName').value.trim();
    const userPhone = document.getElementById('wizardPhone').value.trim();

    if (!userName || !userPhone) {
        alert('Name and Phone Number are required!');
        return;
    }

    const [room, seat] = wizardSeatId.split('-');
    const confirmBtn = document.getElementById('wizardConfirmBtn');
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = 'Booking... ⏳';

    try {
        const joinDate = new Date();
        const expiryDate = new Date(joinDate);
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        const refToken = generateBookingToken();

        await addDoc(bookingsRef, {
            name: userName,
            phone: userPhone,
            roomSelected: wizardRoom,
            shiftDuration: wizardDuration,
            selectedShiftTime: wizardTimeSlot || 'N/A',
            seatNumber: seat,
            date: Timestamp.fromDate(joinDate),
            expiryDate: Timestamp.fromDate(expiryDate),
            status: 'pending',
            bookingToken: refToken
        });

        if (window.showSuccessModal) {
            window.showSuccessModal(refToken, room, seat, wizardDuration, wizardTimeSlot);
        }

        await fetchRoomSeats(wizardRoom);
        wizardSeatId = null;
        renderWizardSeats();

        const step5 = document.getElementById('step5');
        const step5Content = document.getElementById('step5Content');
        if (step5) step5.classList.add('disabled');
        if (step5Content) step5Content.style.display = 'none';
        
        if (wizardActionSection) {
            wizardActionSection.classList.add('hidden');
            wizardActionSection.style.display = 'none';
        }

        if (window.updateFrontendSeatCount) window.updateFrontendSeatCount();
        if (window.closeBookingModal) window.closeBookingModal();
    } catch (err) {
        console.error('Firestore booking error:', err);
        alert('❌ Failed to save booking. Please check your connection and try again.');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Submit Booking <span class="btn-arrow">→</span>';
    }
}

// ==========================================
// 10. LIVE SEAT VIEWER MODAL LOGIC
// ==========================================

window.openLiveSeatModal = function () {
    console.log('[MODAL] Attempting to OPEN Live Seat Modal...');
    if (window.closeBookingModal) window.closeBookingModal();
    const modal = document.getElementById('liveSeatModal');
    if (modal) {
        modal.style.zIndex = '99999';
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
        document.body.style.overflow = 'hidden';
        console.log('[MODAL] Live Seat Modal OPENED successfully.');

        const select = document.getElementById('liveViewerRoomSelect');
        if (select) {
            if (window.allDynamicRooms && window.allDynamicRooms.length > 0) {
                let html = '<option value="" disabled selected>Select a Room to View</option>';
                window.allDynamicRooms.forEach(r => {
                    html += `<option value="${r.id}">${r.name}</option>`;
                });
                select.innerHTML = html;
            } else {
                select.innerHTML = '<option value="" disabled selected>No rooms available</option>';
            }
        }
    }
}

window.closeLiveSeatModal = function () {
    console.log('[MODAL] Attempting to CLOSE Live Seat Modal...');
    const modal = document.getElementById('liveSeatModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
        document.body.style.overflow = '';
        console.log('[MODAL] Live Seat Modal CLOSED successfully.');
    }
}

window.jumpToBookingFromLiveView = function (roomId, seatId, duration, timeSlot) {
    window.closeLiveSeatModal();
    setTimeout(() => {
        window.openBookingModal();
        setTimeout(() => {
            const room = window.allDynamicRooms.find(r => r.id === roomId);
            const roomName = room ? room.name : `Room ${roomId}`;
            if (window.wizardSelectRoom) window.wizardSelectRoom(roomId, roomName);

            setTimeout(() => {
                if (window.handleWizardSeatClick) window.handleWizardSeatClick(seatId);

                setTimeout(() => {
                    let priceLabel = '...';
                    if (room) {
                        if (duration === '5 Hours') priceLabel = `₹${room.price5 || 0}/month`;
                        else if (duration === '10 Hours') priceLabel = `₹${room.price10 || 0}/month`;
                        else if (duration === 'Full Shift') priceLabel = `₹${room.priceFull || 0}/month`;
                    }
                    if (window.wizardSelectDuration) window.wizardSelectDuration(duration, priceLabel);

                    setTimeout(() => {
                        if (window.wizardSelectTimeSlot && duration !== 'Full Shift') {
                            window.wizardSelectTimeSlot(timeSlot);
                        }
                        const step5 = document.getElementById('step5');
                        if (step5 && !step5.classList.contains('disabled')) {
                            const offset = step5.getBoundingClientRect().top + window.scrollY - 100;
                            window.scrollTo({ top: offset, behavior: 'smooth' });
                        }
                    }, 300);
                }, 300);
            }, 300);
        }, 100);
    }, 300);
};

window.renderLiveViewerSeats = async function () {
    const detailsContainer = document.getElementById('liveSeatShiftDetails');
    if (detailsContainer) {
        detailsContainer.style.display = 'none';
        detailsContainer.innerHTML = '';
    }

    const roomId = document.getElementById('liveViewerRoomSelect').value;
    if (!roomId) return;

    await fetchRoomSeats(roomId);

    const grid = document.getElementById('liveViewerSeatGrid');
    grid.innerHTML = '';

    const room = window.allDynamicRooms.find(r => r.id === roomId);
    if (!room) return;

    const total = room.totalSeats ? parseInt(room.totalSeats) : 30;
    const startSeat = room.startSeatNumber ? parseInt(room.startSeatNumber) : 1;
    const rowsPerCol = Math.ceil(total / 3);

    let seatCount = 0;
    for (let c = 1; c <= 3; c++) {
        const colDiv = document.createElement('div');
        colDiv.className = 'seat-column';

        for (let s = 1; s <= rowsPerCol; s++) {
            if (seatCount >= total) break;
            const seatNum = startSeat + seatCount;
            const displayId = seatNum < 10 ? `0${seatNum}` : `${seatNum}`;
            const seatId = `${roomId}-${displayId}`;

            const sd = wizardSeatsData[roomId][seatId];
            if (!sd) { seatCount++; continue; }

            const seatDiv = document.createElement('div');
            seatDiv.className = `seat ${sd.status}`;
            seatDiv.textContent = displayId;

            if (sd.status === 'available' || sd.status === 'partially-booked') {
                seatDiv.style.cursor = 'pointer';
                seatDiv.onclick = () => window.showLiveSeatShiftDetails(roomId, seatId);
            } else {
                seatDiv.style.cursor = 'default';
            }

            colDiv.appendChild(seatDiv);
            seatCount++;
        }
        grid.appendChild(colDiv);
    }
}

window.showLiveSeatShiftDetails = function (roomId, seatId) {
    const detailsContainer = document.getElementById('liveSeatShiftDetails');
    if (!detailsContainer) return;

    const sd = wizardSeatsData[roomId][seatId];
    if (!sd) return;
    const taken = sd.bookedBlocks || [];

    const room = window.allDynamicRooms.find(r => r.id === roomId);
    if (!room) return;

    const p5 = room.price5 || 0;
    const p10 = room.price10 || 0;
    const pFull = room.priceFull || 0;

    let html = `
    <div style="padding:16px; border:1px solid var(--border-color); border-radius:12px; background:var(--surface-bg);">
        <h4 style="margin: 0 0 16px 0; font-size: 1.1rem; color: var(--text-primary);">Quick View: Room ${roomId.replace('room', '')}, Seat ${seatId.split('-')[1]}</h4>
        <div style="display:flex; flex-direction:column; gap:8px;">`;

    const isAvailable = (blocks) => blocks.every(b => !taken.includes(b));

    const renderShiftBtn = (title, duration, timeSlot, reqBlocks, price) => {
        if (isAvailable(reqBlocks)) {
            return `
            <button class="duration-btn" style="text-align:left; display:flex; justify-content:space-between; align-items:center;" onclick="window.jumpToBookingFromLiveView('${roomId}', '${seatId}', '${duration}', '${timeSlot}')">
                <div>
                    <strong style="display:block; margin-bottom:4px;">${title}</strong>
                    <span style="font-size:0.85rem; color:var(--text-secondary);">${timeSlot} - ₹${price}/mo</span>
                </div>
                <span style="color:var(--accent-1); font-weight:700;">Book Now →</span>
            </button>`;
        } else {
            return `
            <button class="duration-btn disabled-shift" style="text-align:left; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <strong style="display:block; margin-bottom:4px;">${title}</strong>
                    <span style="font-size:0.85rem;">${timeSlot}</span>
                </div>
                <span style="font-weight:700;">Already Booked 🚫</span>
            </button>`;
        }
    };

    html += renderShiftBtn('Morning Shift (5 Hours)', '5 Hours', '6:00 AM - 11:00 AM', ['A'], p5);
    html += renderShiftBtn('Afternoon Shift (5 Hours)', '5 Hours', '11:00 AM - 4:00 PM', ['B'], p5);
    html += renderShiftBtn('Evening Shift (5 Hours)', '5 Hours', '4:00 PM - 9:00 PM', ['C'], p5);
    html += renderShiftBtn('Day Double (10 Hours)', '10 Hours', '6:00 AM - 4:00 PM', ['A', 'B'], p10);
    html += renderShiftBtn('Late Double (10 Hours)', '10 Hours', '11:00 AM - 9:00 PM', ['B', 'C'], p10);
    html += renderShiftBtn('Full Shift', 'Full Shift', '6:00 AM - 9:00 PM', ['A', 'B', 'C'], pFull);

    html += `</div></div>`;

    detailsContainer.innerHTML = html;
    detailsContainer.style.display = 'block';

    setTimeout(() => {
        detailsContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
};

// =========================// CHECK FIREBASE RULES: Verify in Firebase Console that 'read' access is explicitly allowed for unauthenticated users if this is public.
const roomsFetchTimeout = setTimeout(() => {
    const grid = document.getElementById('dynamicRoomsGrid');
    if (grid && window.allDynamicRooms.length === 0) {
        console.warn('Rooms fetch timed out (4000ms).');
        grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); width: 100%;">Failed to load live rooms. Timeout exceeded.</p>';
        const seatCountEl = document.getElementById('seatCount');
        if (seatCountEl && seatCountEl.textContent === 'Fetching live data...') {
            seatCountEl.textContent = '0';
        }
    }
}, 4000);

try {
    console.log('Fetching rooms data...');
    onSnapshot(roomsRef, (snapshot) => {
        console.log('Rooms fetched successfully. Doc count:', snapshot.size);
        clearTimeout(roomsFetchTimeout);

        const grid = document.getElementById('dynamicRoomsGrid');
        if (!grid) return;

        if (snapshot.empty) {
            console.log('Rooms collection is empty. Showing fallback empty state.');
            window.allDynamicRooms = [];
            grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); width: 100%;">System Ready. No premium rooms available at the moment.</p>';
            // Even if empty, ensure we trigger the counter unlock!
            if (window.updateFrontendSeatCount) window.updateFrontendSeatCount();
            return;
        }

        window.allDynamicRooms = [];
        let html = '';
        let wizardRoomsHtml = '';

        snapshot.forEach(docSnap => {
            const room = { id: docSnap.id, ...docSnap.data() };
            window.allDynamicRooms.push(room);
        });

        console.log('Rooms parsed:', window.allDynamicRooms);

        window.allDynamicRooms.sort((a, b) => {
            const getNo = (str) => { const m = (str || '').match(/\d+/); return m ? parseInt(m[0]) : 999; };
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
    }, (error) => {
        clearTimeout(roomsFetchTimeout);
        console.error("FIREBASE ERROR:", error);
        const grid = document.getElementById('dynamicRoomsGrid');
        if (grid) grid.innerHTML = '<p style="text-align:center; color:var(--text-muted); width: 100%;">Error loading rooms (Permission Denied?).</p>';
        const seatCountEl = document.getElementById('seatCount');
        if (seatCountEl) seatCountEl.textContent = 'Error';
    });
} catch (e) {
    clearTimeout(roomsFetchTimeout);
    console.error("FIREBASE ERROR:", e);
    const seatCountEl = document.getElementById('seatCount');
    if (seatCountEl) seatCountEl.textContent = 'Error';
}

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
    // 1. Reset Variables explicitly
    wizardRoom = null;
    wizardDuration = null;
    wizardPrice = null;
    wizardSeatId = null;
    wizardTimeSlot = null;

    // 2. Reset UI Steps
    const step2 = document.getElementById('step2');
    const step2Content = document.getElementById('step2Content');
    const step3 = document.getElementById('step3');
    const step3Content = document.getElementById('step3Content');
    const step4 = document.getElementById('step4');
    const step5 = document.getElementById('step5');
    const step5Content = document.getElementById('step5Content');

    if (step2) { step2.classList.add('disabled'); }
    if (step2Content) { step2Content.style.display = 'none'; }
    
    if (step3) { step3.classList.add('disabled'); }
    if (step3Content) { step3Content.style.display = 'none'; }
    
    if (step4) { 
        step4.classList.add('disabled'); 
        step4.style.display = 'none'; 
    }
    
    if (step5) { step5.classList.add('disabled'); }
    if (step5Content) { step5Content.style.display = 'none'; }

    // 3. Clear Inputs & Summary
    const wizardName = document.getElementById('wizardName');
    const wizardPhone = document.getElementById('wizardPhone');
    if (wizardName) wizardName.value = '';
    if (wizardPhone) wizardPhone.value = '';

    const summaryRoom = document.getElementById('summaryRoom');
    const summaryDuration = document.getElementById('summaryDuration');
    const summarySeat = document.getElementById('summarySeat');
    if (summaryRoom) summaryRoom.textContent = '—';
    if (summaryDuration) summaryDuration.textContent = '—';
    if (summarySeat) summarySeat.textContent = '—';

    const wizardActionSection = document.getElementById('wizardActionSection');
    if (wizardActionSection) {
        wizardActionSection.classList.add('hidden');
        wizardActionSection.style.display = 'none';
    }

    // 4. Reset Buttons
    document.querySelectorAll('.room-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.duration-btn').forEach(b => b.classList.remove('selected'));
    document.querySelectorAll('.timeslot-btn').forEach(b => b.classList.remove('selected'));

    const confirmBtn = document.getElementById('wizardConfirmBtn');
    if (confirmBtn) {
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = 'Submit Booking <span class="btn-arrow">→</span>';
    }

    // 5. Auto-Scroll to Step 1
    setTimeout(() => {
        const step1 = document.getElementById('step1');
        if (step1) {
            const offset = step1.getBoundingClientRect().top + window.scrollY - 100;
            window.scrollTo({ top: offset, behavior: 'smooth' });
        }
    }, 100);
}