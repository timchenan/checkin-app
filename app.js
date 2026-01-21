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

        // Check if we are on the dashboard
        const isDashboard = window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/');

        if (isDashboard) {
            // 1. Check for private invites
            checkForInvites(user.email);

            // 2. Load the public social feed (Add this line!)
            loadSocialFeed();
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

async function loadSocialFeed() {
    const feedContainer = document.getElementById('socialFeed');
    if (!feedContainer) return;

    const { data: activities, error } = await _supabase
        .from('check_ins')
        .select(`
            name,
            location,
            result_notes,
            created_at,
            plans (sport)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) return;

    feedContainer.innerHTML = "";
    activities.forEach(item => {
        const username = item.name.split('@')[0];
        const sportName = item.plans ? item.plans.sport : "Activity";

        // --- TIME AGO LOGIC ---
        const now = new Date();
        const past = new Date(item.created_at);
        const diffInMs = now - past;
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        let timeAgo = "";
        if (diffInMins < 1) timeAgo = "Just now";
        else if (diffInMins < 60) timeAgo = `${diffInMins}m ago`;
        else if (diffInHours < 24) timeAgo = `${diffInHours}h ago`;
        else timeAgo = past.toLocaleDateString([], { month: 'short', day: 'numeric' });

        const div = document.createElement('div');
        div.style.cssText = "padding:12px; border-bottom:1px solid #eee; text-align:left; font-size:0.9rem;";

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <span style="color:#007bff; font-weight:bold;">${username}</span> 
                    is doing <strong>${sportName}</strong>
                </div>
                <span style="color:#999; font-size:0.7rem;">${timeAgo}</span>
            </div>
            <div style="font-size:0.85rem; color:#333; margin-top:2px;">@ ${item.location}</div>
            <div style="color:#28a745; font-size:0.8rem; margin-top:4px;">${item.result_notes ? '🏆 ' + item.result_notes : '✅ Checked in'}</div>
        `;
        feedContainer.appendChild(div);
    });
}