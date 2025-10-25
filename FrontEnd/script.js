document.getElementById("activityForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  const transport = document.getElementById("transport").value;
  const electricity = document.getElementById("electricity").value;
  const diet = document.getElementById("diet").value;

  let totalCO2 = 0;

  try {
    // --- Step 1: Calculate transport emissions ---
    if (transport) {
      const transportResponse = await fetch("http://localhost:3000/api/vehicle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          distance_value: transport,
          distance_unit: "km",
          vehicle_model_id: "3a2b5b2b-65e3-4c1d-8ad1-6d939a8f8433" // Example ID (car)
        })
      });
      const transportData = await transportResponse.json();
      totalCO2 += transportData.data.attributes.carbon_kg || 0;
    }

    // --- Step 2: Calculate electricity emissions ---
    if (electricity) {
      const electricityResponse = await fetch("http://localhost:3000/api/electricity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          electricity_value: electricity,
          electricity_unit: "kwh",
          country: "us"
        })
      });
      const electricityData = await electricityResponse.json();
      totalCO2 += electricityData.data.attributes.carbon_kg || 0;
    }

    // --- Step 3: Diet estimate (simplified) ---
    if (diet === "meat-heavy") totalCO2 += 7;
    else if (diet === "balanced") totalCO2 += 5;
    else if (diet === "vegetarian") totalCO2 += 3;
    else if (diet === "vegan") totalCO2 += 2;

    // Update summary section
    document.querySelector(".summary-card .total span").textContent = totalCO2.toFixed(2) + " kg";
    document.querySelector(".tip").textContent =
      totalCO2 > 10
        ? "Tip: Try reducing car trips or meat meals!"
        : "Great job! Keep it up!";
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to calculate emissions. Please try again.");
  }
});
