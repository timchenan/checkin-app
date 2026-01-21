// --- STEP 1: CONFIGURATION (MUST BE AT THE TOP) ---
const SUPABASE_URL = 'https://iyprasuguxuulysxhpzg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3gjXiKyPCiTiNadINRUdrg_qN6a7wCM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let userCoords = "Not provided";

// --- STEP 2: AUTH FUNCTIONS ---
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();

    if (!user) {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    } else {
        // Fill UI elements with user email
        const emailEl = document.getElementById('userEmail');
        if (emailEl) emailEl.innerText = user.email;

        const displayEmail = document.getElementById('displayEmail');
        if (displayEmail) displayEmail.innerText = user.email;

        // NEW: Check for invitations only if on the dashboard
        const isDashboard = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');
        if (isDashboard) {
            checkForInvites(user.email);
        }
    }
    return user;
}

// Separate function to keep things clean
async function checkForInvites(userEmail) {
    const { data: invites, error } = await _supabase
        .from('plans')
        .select('*')
        .eq('invitees', userEmail) // Checks if your email is in the invite list
        .eq('is_completed', false);

    if (invites && invites.length > 0) {
        const alertBox = document.getElementById('invitationAlert');
        if (alertBox) {
            alertBox.style.display = 'block';
            alertBox.innerHTML = `
                <div style="background: #fff3cd; border: 1px solid #ffeeba; padding: 15px; border-radius: 10px; margin-bottom: 20px; color: #856404; text-align: left;">
                    <strong>You're Invited! 🎾</strong><br>
                    Someone invited you to join a ${invites[0].sport} session.
                    <button onclick="window.location.href='checkin.html'" style="margin-top:10px; width:100%; background:#856404; color:white;">View & Check In</button>
                </div>
            `;
        }
    }
}

async function handleLogout() {
    await _supabase.auth.signOut();
    window.location.href = 'login.html';
}

// --- STEP 3: RUN CHECK ---
checkUser();

// --- STEP 4: GPS & GLOBAL LOGIC ---
// We keep this separate so it doesn't conflict with page-specific window.onload
function setupGPS() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            userCoords = `${position.coords.latitude}, ${position.coords.longitude}`;
            console.log("GPS Captured:", userCoords);
        }, (err) => {
            console.log("GPS Denied");
        });
    }
}
setupGPS();