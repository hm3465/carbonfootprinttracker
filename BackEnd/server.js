import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Resolve __dirname for ES modules
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(__dirname));


// ✅ Serve your static files (index.html, tracker.html, summary.html, style.css, tracker.js, summary.js)
app.use(express.static(__dirname));

// ✅ Tiny health check to confirm the server is reachable from the browser
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    apiKeyLoaded: !!process.env.CLIMATIQ_API_KEY,
    msg: "Server is up"
  });
});

// ✅ Check if API key is loaded
console.log("CLIMATIQ API Key loaded:", process.env.CLIMATIQ_API_KEY ? "Yes" : "No");

const API_URL = "https://api.climatiq.io/estimate";
const API_KEY = process.env.CLIMATIQ_API_KEY;

// --- Vehicle endpoint ---
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit } = req.body;
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

    if (!response.ok) {
      const text = await response.text();
      console.error("Climatiq vehicle error:", response.status, text);
      return res.status(500).json({ error: "Vehicle request failed", details: text });
    }

    const data = await response.json();
    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (error) {
    console.error("Vehicle request failed:", error);
    res.status(500).json({ error: "Vehicle request failed" });
  }
});

// --- Electricity endpoint ---
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit } = req.body;
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

    if (!response.ok) {
      const text = await response.text();
      console.error("Climatiq electricity error:", response.status, text);
      return res.status(500).json({ error: "Electricity request failed", details: text });
    }

    const data = await response.json();
    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (error) {
    console.error("Electricity request failed:", error);
    res.status(500).json({ error: "Electricity request failed" });
  }
});

// --- Start server ---
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
