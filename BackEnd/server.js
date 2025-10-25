import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Check if API key is loaded
console.log("CLIMATIQ API Key loaded:", process.env.CLIMATIQ_API_KEY ? "Yes" : "No");

const API_URL = "https://api.climatiq.io/estimate";
const API_KEY = process.env.CLIMATIQ_API_KEY;

// --- Vehicle endpoint ---
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit } = req.body;
    console.log("Vehicle request received:", req.body);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emission_factor: "passenger_vehicle-vehicle_type_car-fuel_type_gasoline",
        parameters: {
          distance: distance_value,
          distance_unit: distance_unit || "km"
        }
      })
    });

    const data = await response.json();
    console.log("Climatiq response (vehicle):", data);

    res.json({ data: { attributes: { carbon_kg: data.co2e } } });
  } catch (error) {
    console.error("Vehicle request failed:", error);
    res.status(500).json({ error: "Vehicle request failed" });
  }
});

// --- Electricity endpoint ---
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit } = req.body;
    console.log("Electricity request received:", req.body);

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emission_factor: "electricity-energy_source_grid_mix",
        parameters: {
          energy: electricity_value,
          energy_unit: electricity_unit || "kwh"
        }
      })
    });

    const data = await response.json();
    console.log("Climatiq response (electricity):", data);

    res.json({ data: { attributes: { carbon_kg: data.co2e } } });
  } catch (error) {
    console.error("Electricity request failed:", error);
    res.status(500).json({ error: "Electricity request failed" });
  }
});

// --- Start server ---
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:3000`));
