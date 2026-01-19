// 1. Configuration
const SUPABASE_URL = 'https://iyprasuguxuulysxhpzg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3gjXiKyPCiTiNadINRUdrg_qN6a7wCM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let userCoords = "Not provided";

// 2. On Load: Handle GPS & URL Params
window.onload = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const locFromUrl = urlParams.get('loc');

    if (locFromUrl) {
        document.getElementById('locationInput').value = locFromUrl;
    }

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            userCoords = `${lat}, ${lng}`;

            // Reverse Geocode (Optional)
            try {
                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
                const data = await response.json();
                if (!locFromUrl) {
                    document.getElementById('locationInput').value = `${data.city}, ${data.principalSubdivision}`;
                }
            } catch (err) {
                console.log("Geocoding failed, using coordinates only.");
            }
        });
    }
};

// 3. The Check-In Function
async function checkIn() {
    const nameVal = document.getElementById('userName').value;
    const locVal = document.getElementById('locationInput').value;
    const msg = document.getElementById('message');

    // Turnstile Verification
    const turnstileToken = document.querySelector('[name="cf-turnstile-response"]').value;
    if (!turnstileToken) {
        alert("Please complete the security check.");
        return;
    }

    if (!nameVal || !locVal) {
        msg.className = "error";
        msg.innerText = "Please fill in all fields.";
        return;
    }

    msg.innerText = "Processing...";

    const { data, error } = await _supabase
        .from('check_ins')
        .insert([{ name: nameVal, location: locVal, coords: userCoords }]);

    if (error) {
        msg.className = "error";
        msg.innerText = "Error: " + error.message;
    } else {
        msg.className = "success";
        msg.innerText = "Check-in successful!";
        document.getElementById('userName').value = '';
    }
}