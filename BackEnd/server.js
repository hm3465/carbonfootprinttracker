import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// --- Setup ---
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Optional: serve static files if you ever want to open http://127.0.0.1:3000/tracker.html
// app.use(express.static(__dirname));

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, apiKeyLoaded: !!process.env.CLIMATIQ_API_KEY });
});

const CLIMATIQ_URL = "https://api.climatiq.io/estimate";
const API_KEY = process.env.CLIMATIQ_API_KEY;

// --- Vehicle (car) ---
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit } = req.body;

    const payload = {
      // 👇 Selector object, not a string
      emission_factor: {
        activity_id: "passenger_vehicle-vehicle_type_car-fuel_type_gasoline"
        // Optionally add: data_version: "^2"
      },
      // Both notations work for distance; this one is explicit:
      parameters: {
        distance: {
          value: distance_value,
          unit: distance_unit || "km"
        }
      }
    };

    const r = await fetch(CLIMATIQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("Vehicle API error:", r.status, t);
      return res.status(r.status).json({ error: "Vehicle API failed", details: t });
    }

    const data = await r.json();
    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (e) {
    console.error("Vehicle endpoint error:", e);
    res.status(500).json({ error: "Vehicle endpoint failed" });
  }
});

// --- Electricity ---
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit, country } = req.body;

    const payload = {
      // 👇 Selector object, not a string
      emission_factor: {
        activity_id: "electricity-energy_source_grid_mix"
        // Optionally add: data_version: "^2"
      },
      parameters: {
        // Explicit value+unit form
        energy: {
          value: electricity_value,
          unit: electricity_unit || "kwh"
        },
        // Country code is still accepted by many electricity factors
        country: (country || "us").toLowerCase()
      }
    };

    const r = await fetch(CLIMATIQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!r.ok) {
      const t = await r.text();
      console.error("Electricity API error:", r.status, t);
      return res.status(r.status).json({ error: "Electricity API failed", details: t });
    }

    const data = await r.json();
    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (e) {
    console.error("Electricity endpoint error:", e);
    res.status(500).json({ error: "Electricity endpoint failed" });
  }
});

// --- Start ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://127.0.0.1:${PORT}`);
  console.log(`🔑 CLIMATIQ_API_KEY loaded: ${API_KEY ? "Yes" : "No"}`);
});
