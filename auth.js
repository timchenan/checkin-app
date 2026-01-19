const SUPABASE_URL = 'https://iyprasuguxuulysxhpzg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3gjXiKyPCiTiNadINRUdrg_qN6a7wCM';
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
        // LOGIN LOGIC
        const { data, error } = await _supabase.auth.signInWithPassword({ email, password });
        if (error) {
            msg.style.color = "red";
            msg.innerText = error.message;
        } else {
            window.location.href = "index.html"; // Redirect to check-in page
        }
    } else {
        // REGISTER LOGIC
        const { data, error } = await _supabase.auth.signUp({ email, password });
        if (error) {
            msg.style.color = "red";
            msg.innerText = error.message;
        } else {
            msg.style.color = "green";
            msg.innerText = "Registration successful! You can now login.";
            toggleMode();
        }
    }
}