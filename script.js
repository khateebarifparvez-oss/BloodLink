/* =============================================
   BloodLink — Blood Donor Finder
   script.js
   ============================================= */

/* ══════════════════════════════════════════
   DATA — STATE CAPITALS & DONOR POOL
══════════════════════════════════════════ */

const CITIES = [
  "Amaravati", "Itanagar", "Dispur", "Patna", "Raipur", "Panaji",
  "Gandhinagar", "Chandigarh", "Shimla", "Ranchi", "Bengaluru",
  "Thiruvananthapuram", "Bhopal", "Mumbai", "Imphal", "Shillong",
  "Aizawl", "Kohima", "Bhubaneswar", "Jaipur", "Gangtok", "Chennai",
  "Hyderabad", "Agartala", "Lucknow", "Dehradun", "Kolkata"
];

// Deduplicate and sort alphabetically
const STATE_CAPITALS = [...new Set(CITIES)].sort();

const NAMES = [
  "Arjun Reddy",    "Priya Sharma",   "Kiran Patel",    "Aisha Khan",
  "Rohan Mehta",    "Sneha Nair",     "Vikram Singh",   "Divya Pillai",
  "Amit Yadav",     "Lakshmi Iyer",   "Suresh Rao",     "Pooja Gupta",
  "Harish Tiwari",  "Meera Joshi",    "Rajesh Kumar",   "Ananya Das",
  "Siddharth Verma","Kavitha Bhat",   "Nikhil Shetty",  "Swati Bhatt",
  "Manish Dubey",   "Rekha Nair",     "Prakash Naidu",  "Sunita Patil",
  "Deepak Jain",    "Kavya Menon",    "Sanjay Mishra",  "Pallavi Ghosh",
  "Rahul Sharma",   "Nisha Tiwari"
];

const BLOOD_GROUPS  = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const AVAILABILITY  = ["Available", "Cooldown", "Unavailable"];
const EMOJIS        = ["👤", "🧑", "👩", "🧔", "👦", "👧", "🧕", "🧑‍⚕️"];

// Maps availability → dot CSS class and label text
const AVAIL_COLOR = {
  "Available":   "green",
  "Cooldown":    "amber",
  "Unavailable": "red"
};

const AVAIL_LABEL = {
  "Available":   "Available Now",
  "Cooldown":    "3-Month Cooldown",
  "Unavailable": "Unavailable"
};

// Gender → emoji map for newly registered donors
const GENDER_EMOJI = {
  male:   "🧔",
  female: "👩",
  other:  "🧑",
  "":     "👤"
};

/* ══════════════════════════════════════════
   SEEDED RANDOM — consistent fake data
══════════════════════════════════════════ */

/**
 * Returns a simple LCG pseudo-random number generator
 * seeded by a numeric value. Guarantees the same donor
 * list every time the page loads (no surprises for the user).
 */
function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/* ══════════════════════════════════════════
   GENERATE DEFAULT / FAKE DONORS
══════════════════════════════════════════ */

function generateDonors(city) {
  // Seed based on city name so data is stable across reloads
  const seed = city.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const rng   = seededRand(seed);
  const count = 4 + Math.floor(rng() * 5); // 4–8 donors per city
  const donors = [];

  for (let i = 0; i < count; i++) {
    const avail      = AVAILABILITY[Math.floor(rng() * 3)];
    const monthsAgo  = Math.floor(rng() * 24);
    const lastDate   = new Date();
    lastDate.setMonth(lastDate.getMonth() - monthsAgo);

    donors.push({
      id:          city + i,
      name:        NAMES[Math.floor(rng() * NAMES.length)],
      age:         18 + Math.floor(rng() * 42),
      blood:       BLOOD_GROUPS[Math.floor(rng() * BLOOD_GROUPS.length)],
      city,
      phone:       "+91 0123456789",
      lastDonated: lastDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
      availability: avail,
      emoji:       EMOJIS[Math.floor(rng() * EMOJIS.length)],
      donations:   1 + Math.floor(rng() * 20),
      isNew:       false
    });
  }

  return donors;
}

/* ══════════════════════════════════════════
   INITIALISE DATA STORE
══════════════════════════════════════════ */

// Object keyed by city name → array of donor objects
const ALL_DONORS = {};
STATE_CAPITALS.forEach(city => {
  ALL_DONORS[city] = generateDonors(city);
});

/* ══════════════════════════════════════════
   BOOTSTRAP — populate dropdowns & stats
══════════════════════════════════════════ */

function updateGlobalStats() {
  const all       = Object.values(ALL_DONORS).flat();
  const available = all.filter(d => d.availability === "Available");
  document.getElementById("totalDonors").textContent     = all.length;
  document.getElementById("availableDonors").textContent = available.length;
}

function populateCityDropdown(selectId) {
  const select = document.getElementById(selectId);
  // Only add if not already populated (beyond the placeholder option)
  if (select.options.length > 1) return;
  STATE_CAPITALS.forEach(city => {
    const opt = document.createElement("option");
    opt.value       = city;
    opt.textContent = city;
    select.appendChild(opt);
  });
}

// Run on page load
updateGlobalStats();
populateCityDropdown("citySelect");

/* ══════════════════════════════════════════
   SEARCH / FIND DONORS
══════════════════════════════════════════ */

function searchDonors() {
  const city  = document.getElementById("citySelect").value;
  const blood = document.getElementById("bloodSelect").value;

  if (!city) {
    alert("Please select a city first!");
    return;
  }

  let donors = [...(ALL_DONORS[city] || [])];

  // Filter by blood group if selected
  if (blood) {
    donors = donors.filter(d => d.blood === blood);
  }

  // In Emergency Mode, sort available donors to the top
  if (document.body.classList.contains("emergency")) {
    donors.sort((a, b) =>
      (a.availability === "Available" ? 0 : 1) -
      (b.availability === "Available" ? 0 : 1)
    );
  }

  // Update city info pill
  const cityAll    = ALL_DONORS[city] || [];
  const availCount = cityAll.filter(d => d.availability === "Available").length;
  document.getElementById("cityPill").innerHTML =
    `📍 ${city} &nbsp;|&nbsp; <span>${cityAll.length}</span> donors &nbsp;|&nbsp; <span>${availCount}</span> available now`;

  // Show results section
  document.getElementById("defaultMsg").style.display    = "none";
  document.getElementById("resultsSection").style.display = "block";
  document.getElementById("cityName").textContent         = city;
  document.getElementById("resultCount").textContent      =
    `${donors.length} donor${donors.length !== 1 ? "s" : ""} found`;

  renderCards(donors);
}

/* ══════════════════════════════════════════
   RENDER DONOR CARDS
══════════════════════════════════════════ */

function renderCards(donors) {
  const grid = document.getElementById("donorGrid");
  grid.innerHTML = "";

  if (!donors.length) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="big">🔍</div>
        <h3>No donors found</h3>
        <p>Try a different blood group or city</p>
      </div>`;
    return;
  }

  donors.forEach((donor, index) => {
    const card = document.createElement("div");
    card.className         = `donor-card ${donor.availability === "Available" ? "available" : ""}`;
    card.style.animationDelay = `${index * 60}ms`;

    // Availability color for inline style
    const availColor =
      donor.availability === "Available"  ? "var(--green)" :
      donor.availability === "Cooldown"   ? "var(--amber)" :
                                            "var(--muted)";

    const donationText =
      donor.donations > 0
        ? `${donor.donations} donation${donor.donations !== 1 ? "s" : ""}`
        : "First-time donor";

    card.innerHTML = `
      <div class="card-top">
        <div class="donor-avatar">${donor.emoji}</div>
        <div class="blood-badge">${donor.blood}</div>
      </div>
      <div class="donor-name">
        ${donor.name}
        ${donor.isNew ? '<span class="new-donor-tag">NEW</span>' : ""}
      </div>
      <div class="donor-age">Age ${donor.age} &nbsp;·&nbsp; ${donationText}</div>
      <div class="card-details">
        <div class="detail-row">
          <span class="icon">📍</span>
          <span><strong>${donor.city}</strong></span>
        </div>
        <div class="detail-row">
          <span class="icon">🗓️</span>
          <span>Last donated: <strong>${donor.lastDonated}</strong></span>
        </div>
        <div class="detail-row">
          <span class="icon">📞</span>
          <span><strong>${donor.phone}</strong></span>
        </div>
      </div>
      <div class="card-footer">
        <div class="availability">
          <div class="dot ${AVAIL_COLOR[donor.availability]}"></div>
          <span style="color:${availColor}">${AVAIL_LABEL[donor.availability]}</span>
        </div>
        <button class="btn-contact" onclick='openContactModal(${JSON.stringify(donor)})'>
          Contact →
        </button>
      </div>`;

    grid.appendChild(card);
  });
}

/* ══════════════════════════════════════════
   CONTACT MODAL
══════════════════════════════════════════ */

function openContactModal(donor) {
  document.getElementById("modalName").textContent        = donor.name;
  document.getElementById("modalCity").textContent        = donor.city;
  document.getElementById("modalBlood").textContent       = donor.blood;
  document.getElementById("modalPhone").textContent       = donor.phone;
  document.getElementById("modalLastDonated").textContent = donor.lastDonated;
  document.getElementById("modalOverlay").classList.add("open");
}

function closeModal() {
  document.getElementById("modalOverlay").classList.remove("open");
}

document.getElementById("modalOverlay").addEventListener("click", function (e) {
  if (e.target === this) closeModal();
});

/* ══════════════════════════════════════════
   EMERGENCY MODE TOGGLE
══════════════════════════════════════════ */

function toggleEmergency() {
  document.getElementById("emergencyToggle").classList.toggle("on");
  document.body.classList.toggle("emergency");

  // Re-render current results if visible
  if (document.getElementById("resultsSection").style.display !== "none") {
    searchDonors();
  }
}

/* ══════════════════════════════════════════
   REGISTER / BE A DONOR MODAL
══════════════════════════════════════════ */

function openRegisterModal() {
  // Lazy-populate city dropdown inside the form
  populateCityDropdown("regCity");

  // Reset to form view
  document.getElementById("registerForm").style.display    = "block";
  document.getElementById("registerSuccess").style.display = "none";

  // Clear all inputs
  ["regName", "regAge", "regPhone", "regLastDonated"].forEach(id => {
    document.getElementById(id).value = "";
  });
  ["regGender", "regBlood", "regCity"].forEach(id => {
    document.getElementById(id).selectedIndex = 0;
  });

  // Clear all inline errors
  clearFormErrors();

  document.getElementById("registerOverlay").classList.add("open");
}

function closeRegisterModal() {
  document.getElementById("registerOverlay").classList.remove("open");
}

document.getElementById("registerOverlay").addEventListener("click", function (e) {
  if (e.target === this) closeRegisterModal();
});

/* ── FORM VALIDATION & SUBMISSION ── */

function clearFormErrors() {
  ["errName", "errAge", "errBlood", "errCity", "errPhone"].forEach(id => {
    document.getElementById(id).textContent = "";
  });
}

function submitRegistration() {
  clearFormErrors();

  // Read values
  const name    = document.getElementById("regName").value.trim();
  const age     = parseInt(document.getElementById("regAge").value, 10);
  const gender  = document.getElementById("regGender").value;
  const blood   = document.getElementById("regBlood").value;
  const city    = document.getElementById("regCity").value;
  const phone   = document.getElementById("regPhone").value.trim();
  const lastRaw = document.getElementById("regLastDonated").value;

  // Validate
  let valid = true;

  if (!name) {
    document.getElementById("errName").textContent = "Name is required";
    valid = false;
  }
  if (!age || age < 18 || age > 65) {
    document.getElementById("errAge").textContent = "Age must be between 18 and 65";
    valid = false;
  }
  if (!blood) {
    document.getElementById("errBlood").textContent = "Please select a blood group";
    valid = false;
  }
  if (!city) {
    document.getElementById("errCity").textContent = "Please select a city";
    valid = false;
  }
  if (!phone || phone.replace(/\D/g, "").length < 10) {
    document.getElementById("errPhone").textContent = "Enter a valid 10-digit phone number";
    valid = false;
  }

  if (!valid) return;

  // Format "last donated" date
  let lastDonated = "First time";
  if (lastRaw) {
    const d = new Date(lastRaw + "-01");
    lastDonated = d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  }

  // Build new donor object
  const newDonor = {
    id:           "user_" + Date.now(),
    name,
    age,
    blood,
    city,
    phone:        phone.startsWith("+91") ? phone : "+91 " + phone,
    lastDonated,
    availability: "Available",
    emoji:        GENDER_EMOJI[gender] || "👤",
    donations:    lastRaw ? 1 : 0,
    isNew:        true
  };

  // Insert at top of that city's donor list
  if (!ALL_DONORS[city]) ALL_DONORS[city] = [];
  ALL_DONORS[city].unshift(newDonor);

  // Refresh global stats counters
  updateGlobalStats();

  // Show success screen inside the modal
  document.getElementById("successCity").textContent      = city;
  document.getElementById("registerForm").style.display    = "none";
  document.getElementById("registerSuccess").style.display = "block";

  // If the user is already viewing this city, live-refresh the results
  const currentCity = document.getElementById("citySelect").value;
  if (currentCity === city && document.getElementById("resultsSection").style.display !== "none") {
    searchDonors();
  }
}

/* ══════════════════════════════════════════
   KEYBOARD SHORTCUT — Enter to search
══════════════════════════════════════════ */

document.addEventListener("keydown", e => {
  if (e.key === "Enter") searchDonors();
});