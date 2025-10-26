document.addEventListener("DOMContentLoaded", () => {
    // 🔧 Auto-detect API base: if you open http://localhost:3000/tracker.html, this resolves to same origin.
    // If you open the file directly (file://...), we fall back to http://localhost:3000.
    const API_BASE = (location.origin.startsWith("http") && location.host)
      ? location.origin
      : "http://localhost:3000";
  
    const tripList = document.getElementById("tripList");
    const expenseList = document.getElementById("expenseList");
  
    const addTripBtn = document.getElementById("addTripBtn");
    const addExpenseBtn = document.getElementById("addExpenseBtn");
    const calcBtn = document.getElementById("calcBtn");
  
    const totalOut = document.getElementById("totalOut");
    const travelOut = document.getElementById("travelOut");
    const elecOut = document.getElementById("elecOut");
    const expOut = document.getElementById("expOut");
    const tipOut = document.getElementById("tipOut");
  
    // --- Local factors ---
    const LOCAL_TRAVEL_FACTORS_KG_PER_KM = {
      flight_short: 0.15,
      train:        0.041,
      bus:          0.105
    };
  
    const EXPENSE_FACTORS_KG_PER_USD = {
      groceries: 0.06,
      apparel:   0.09,
      electronics: 0.16,
      dining:    0.10,
      other:     0.07
    };
  
    function tripRowTemplate(i) {
      return `
        <div class="trip-row" data-idx="${i}" style="margin-bottom:.75rem;display:grid;gap:.5rem;grid-template-columns:1fr 1fr 1fr 120px 100px;">
          <select class="trip-mode">
            <option value="car">Car</option>
            <option value="flight_short">Flight (short)</option>
            <option value="train">Train</option>
            <option value="bus">Bus</option>
          </select>
          <input class="trip-origin" placeholder="Origin (city/airport)" />
          <input class="trip-dest" placeholder="Destination (city/airport)" />
          <input class="trip-dist" type="number" min="0" step="0.1" placeholder="Distance (km)" />
          <button class="link-reset remove-trip" type="button">Remove</button>
        </div>
      `;
    }
  
    function expenseRowTemplate(i) {
      return `
        <div class="expense-row" data-idx="${i}" style="margin-bottom:.75rem;display:grid;gap:.5rem;grid-template-columns:2fr 1fr 100px;">
          <input class="expense-desc" placeholder="Description (optional)"/>
          <select class="expense-cat">
            <option value="groceries">Groceries</option>
            <option value="apparel">Apparel</option>
            <option value="electronics">Electronics</option>
            <option value="dining">Dining</option>
            <option value="other">Other</option>
          </select>
          <div style="display:flex; gap:.5rem;">
            <input class="expense-amt" type="number" min="0" step="0.01" placeholder="$"/>
            <button class="link-reset remove-expense" type="button">Remove</button>
          </div>
        </div>
      `;
    }
  
    // Seed default rows
    tripList.insertAdjacentHTML("beforeend", tripRowTemplate(0));
    expenseList.insertAdjacentHTML("beforeend", expenseRowTemplate(0));
  
    // Button listeners
    addTripBtn.addEventListener("click", () => {
      const i = tripList.querySelectorAll(".trip-row").length;
      tripList.insertAdjacentHTML("beforeend", tripRowTemplate(i));
    });
  
    addExpenseBtn.addEventListener("click", () => {
      const i = expenseList.querySelectorAll(".expense-row").length;
      expenseList.insertAdjacentHTML("beforeend", expenseRowTemplate(i));
    });
  
    // Remove (delegation)
    tripList.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-trip")) {
        e.target.closest(".trip-row")?.remove();
      }
    });
    expenseList.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-expense")) {
        e.target.closest(".expense-row")?.remove();
      }
    });
  
    function numberOrZero(v) {
      const n = Number(v);
      return isFinite(n) && n > 0 ? n : 0;
    }
  
    async function postJSON(url, body) {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`POST ${url} failed: ${res.status} ${text}`);
      }
      return res.json();
    }
  
    calcBtn.addEventListener("click", async () => {
      const tripRows = [...document.querySelectorAll(".trip-row")];
      const expenseRows = [...document.querySelectorAll(".expense-row")];
  
      const kwh = numberOrZero(document.getElementById("kwh").value);
      const gridCountry = document.getElementById("gridZone").value || "us";
  
      let travelKg = 0;
      let elecKg = 0;
      let expKg = 0;
  
      const tripsSnapshot = [];
      const expensesSnapshot = [];
  
      try {
        // Quick sanity: can we reach the server?
        const ping = await fetch(`${API_BASE}/health`).then(r => r.ok ? r.json() : null).catch(() => null);
        if (!ping) {
          alert("Cannot reach the server at " + API_BASE + ". Start `node server.js` and open http://localhost:3000/tracker.html");
          return;
        }
        if (!ping.apiKeyLoaded) {
          console.warn("No CLIMATIQ_API_KEY loaded – API responses may fail.");
        }
  
        // 1) Travel
        for (const row of tripRows) {
          const mode = row.querySelector(".trip-mode").value;
          const origin = row.querySelector(".trip-origin").value.trim();
          const dest = row.querySelector(".trip-dest").value.trim();
          const distKm = numberOrZero(row.querySelector(".trip-dist").value);
          if (distKm <= 0) continue;
  
          let kg = 0;
          if (mode === "car") {
            const j = await postJSON(`${API_BASE}/api/vehicle`, {
              distance_value: distKm,
              distance_unit: "km"
            });
            kg = Number(j?.data?.attributes?.carbon_kg) || 0;
          } else {
            const factor = LOCAL_TRAVEL_FACTORS_KG_PER_KM[mode] ?? 0.1;
            kg = distKm * factor;
          }
  
          travelKg += kg;
          tripsSnapshot.push({ mode, origin, dest, distKm, kg: +kg.toFixed(3) });
        }
  
        // 2) Electricity
        if (kwh > 0) {
          const j = await postJSON(`${API_BASE}/api/electricity`, {
            electricity_value: kwh,
            electricity_unit: "kwh",
            country: gridCountry
          });
          elecKg = Number(j?.data?.attributes?.carbon_kg) || 0;
        }
  
        // 3) Expenses
        for (const row of expenseRows) {
          const cat = row.querySelector(".expense-cat").value;
          const desc = row.querySelector(".expense-desc").value.trim();
          const amt = numberOrZero(row.querySelector(".expense-amt").value);
          if (amt <= 0) continue;
          const perDollar = EXPENSE_FACTORS_KG_PER_USD[cat] ?? EXPENSE_FACTORS_KG_PER_USD.other;
          const kg = amt * perDollar;
          expKg += kg;
          expensesSnapshot.push({ cat, desc, amt, kg: +kg.toFixed(3) });
        }
  
        const totalKg = travelKg + elecKg + expKg;
  
        // Preview update
        travelOut.textContent = `${travelKg.toFixed(2)} kg`;
        elecOut.textContent = `${elecKg.toFixed(2)} kg`;
        expOut.textContent = `${expKg.toFixed(2)} kg`;
        totalOut.textContent = `${totalKg.toFixed(2)} kg`;
        tipOut.textContent =
          totalKg > 20 ? "Big day. Consider combining trips and dialing back high-impact purchases."
          : totalKg > 10 ? "Nice work. Try a car-free errand or lowering A/C a notch."
          : "Great job! Keep up the low-impact habits.";
  
        // Persist to summary
        const summary = {
          totals: {
            travelKg: +travelKg.toFixed(3),
            elecKg: +elecKg.toFixed(3),
            expKg: +expKg.toFixed(3),
            totalKg: +totalKg.toFixed(3)
          },
          details: {
            trips: tripsSnapshot,
            electricity: { kwh, gridCountry },
            expenses: expensesSnapshot
          },
          ts: Date.now()
        };
        sessionStorage.setItem("footprintResult", JSON.stringify(summary));
        window.location.href = "summary.html";
      } catch (err) {
        console.error(err);
        alert(err.message || "Calculation failed. Check the server and try again.");
      }
    });
  });
  