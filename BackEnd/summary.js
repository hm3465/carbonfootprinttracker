document.addEventListener("DOMContentLoaded", () => {
    const raw = sessionStorage.getItem("footprintResult");
    if (!raw) {
      // No data; send back to tracker
      window.location.replace("tracker.html");
      return;
    }
  
    const data = JSON.parse(raw);
  
    // Totals
    const { travelKg, elecKg, expKg, totalKg } = data.totals;
    document.getElementById("totalOut").textContent = `${totalKg.toFixed(2)} kg`;
    document.getElementById("travelOut").textContent = `${travelKg.toFixed(2)} kg`;
    document.getElementById("elecOut").textContent   = `${elecKg.toFixed(2)} kg`;
    document.getElementById("expOut").textContent    = `${expKg.toFixed(2)} kg`;
  
    const tipOut = document.getElementById("tipOut");
    tipOut.textContent =
      totalKg > 20
        ? "Big day. Consider combining trips and dialing back high-impact purchases."
        : totalKg > 10
        ? "Nice work. Try a car-free errand or lowering A/C a notch."
        : "Great job! Keep up the low-impact habits.";
  
    // Trips table
    const tripsDiv = document.getElementById("tripsTable");
    const trips = data.details?.trips || [];
    if (trips.length) {
      const rows = trips.map(t =>
        `<tr>
           <td>${t.mode}</td>
           <td>${t.origin || "-"}</td>
           <td>${t.dest || "-"}</td>
           <td style="text-align:right">${t.distKm.toFixed(1)} km</td>
           <td style="text-align:right">${t.kg.toFixed(2)} kg</td>
         </tr>`
      ).join("");
  
      tripsDiv.innerHTML = `
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left">Mode</th>
                <th style="text-align:left">Origin</th>
                <th style="text-align:left">Destination</th>
                <th style="text-align:right">Distance</th>
                <th style="text-align:right">Emissions</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    } else {
      tripsDiv.textContent = "No trips recorded.";
    }
  
    // Electricity details
    const elecDiv = document.getElementById("elecDetail");
    const el = data.details?.electricity || {};
    if (el.kwh) {
      elecDiv.textContent = `${el.kwh} kWh • grid=${(el.gridCountry || "us").toUpperCase()}`;
    } else {
      elecDiv.textContent = "—";
    }
  
    // Expenses table
    const expDiv = document.getElementById("expTable");
    const exps = data.details?.expenses || [];
    if (exps.length) {
      const rows = exps.map(e =>
        `<tr>
           <td>${e.cat}</td>
           <td>${e.desc || "-"}</td>
           <td style="text-align:right">$${e.amt.toFixed(2)}</td>
           <td style="text-align:right">${e.kg.toFixed(2)} kg</td>
         </tr>`
      ).join("");
      expDiv.innerHTML = `
        <div style="overflow-x:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left">Category</th>
                <th style="text-align:left">Description</th>
                <th style="text-align:right">Amount</th>
                <th style="text-align:right">Emissions</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    } else {
      expDiv.textContent = "No expenses recorded.";
    }
  });
  