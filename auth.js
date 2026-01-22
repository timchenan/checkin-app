const SUPABASE_URL = 'https://iyprasuguxuulysxhpzg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3gjXiKyPCiTiNadINRUdrg_qN6a7wCM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// --- NEW VERIFICATION LOGIC START ---
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('verified') === 'true') {
        const statusMsg = document.createElement('div');
        statusMsg.style.cssText = "background:#d4edda; color:#155724; padding:10px; border-radius:5px; margin-bottom:15px; font-size:0.8rem; text-align:center; border: 1px solid #c3e6cb;";
        statusMsg.innerHTML = "✅ Email verified! Please log in to continue.";

        const card = document.querySelector('.card');
        if (card) {
            card.insertBefore(statusMsg, card.firstChild);
        }
    }
});
// --- NEW VERIFICATION LOGIC END ---

let isLoginMode = true;

function toggleMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('authTitle').innerText = isLoginMode ? "Login" : "Register";
    document.getElementById('mainBtn').innerText = isLoginMode ? "Sign In" : "Sign Up";
    document.getElementById('toggleText').innerText = isLoginMode ? "Need an account? Register here." : "Already have an account? Login here.";
}

async function handleAuth() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const msg = document.getElementById('authMsg');

    if (!email || !password) {
        msg.innerText = "Please fill in all fields.";
        return;
    }

    msg.innerText = "Connecting...";

    if (isLoginMode) {
        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) {
            msg.style.color = "red";
            msg.innerText = error.message;
        } else {
            window.location.href = "index.html";
        }
    } else {
        // REGISTER LOGIC
        const { data, error } = await _supabase.auth.signUp({
            email,
            password,
            options: {
                // This tells Supabase exactly where to send the user after they click the email link
                emailRedirectTo: 'https://timchenan.github.io/checkin-app/login.html?verified=true'
            }
        });

        if (error) {
            msg.style.color = "red";
            msg.innerText = error.message;
        } else {
            msg.style.color = "green";
            msg.innerText = "Registration successful! Please check your email to verify.";
        }
    }
}