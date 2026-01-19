// 1. Configuration (Use the same keys as app.js)
const SUPABASE_URL = 'https://iyprasuguxuulysxhpzg.supabase.co';
const SUPABASE_KEY = 'sb_publishable_3gjXiKyPCiTiNadINRUdrg_qN6a7wCM'; 
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Function to get data from Supabase
async function fetchCheckIns() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

    // Requesting all data from 'check_ins' table, ordered by time
    const { data, error } = await _supabase
        .from('check_ins')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error fetching:", error);
        tableBody.innerHTML = "<tr><td colspan='4'>Error loading data</td></tr>";
        return;
    }

    // 3. Injecting data into the table
    tableBody.innerHTML = ""; // Clear the loading message
    data.forEach(entry => {
        const row = document.createElement('tr');
        
        // Format the date to look nice
        const date = new Date(entry.created_at).toLocaleString();
        
        // Create a Google Maps link if coords exist
        let mapLink = "No GPS";
        if (entry.coords && entry.coords !== "Not provided") {
            mapLink = `<a class="map-link" href="https://www.google.com/maps?q=${entry.coords}" target="_blank">View Map</a>`;
        }

        row.innerHTML = `
            <td>${date}</td>
            <td>${entry.name}</td>
            <td>${entry.location}</td>
            <td>${mapLink}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Fetch data automatically when the page opens
window.onload = fetchCheckIns;