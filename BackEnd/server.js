// server.js
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

// 🧭 Resolve __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Serve static frontend files (so you can open tracker.html etc)
app.use(express.static(__dirname));

// ✅ Default route to index.html
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    apiKeyLoaded: !!process.env.CLIMATIQ_API_KEY,
    msg: "Server is up"
  });
});

// --- Climatiq setup ---
// NEW endpoint + selector object required
const API_URL = "https://api.climatiq.io/data/v1/estimate";
const API_KEY = process.env.CLIMATIQ_API_KEY;

// --- Vehicle endpoint ---
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit = "km", mode = "car" } = req.body;

    // Use a current activity_id. (We only call API for "car" in your UI.)
    // Source: Climatiq data explorer (ICE car, all NA parameters).
    const factorMap = {
      car:  "passenger_vehicle-vehicle_type_car-fuel_source_ice-engine_size_na-vehicle_age_na-vehicle_weight_na",
      // you can add more if you later decide to hit the API for other modes:
      air:  "passenger_flight-route_type_domestic-fuel_type_jet",   // example; may need adjusting per docs
      rail: "passenger_train-route_type_national"                  // example; may need adjusting per docs
    };

    const activity_id = factorMap[mode] || factorMap.car;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id,
          // caret means “use latest compatible”. The docs currently show ^21 in examples.
          data_version: "^21"
        },
        parameters: {
          distance: distance_value,
          distance_unit
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Vehicle API error:", response.status, data);
      return res.status(400).json({ error: "Vehicle API failed", details: data });
    }

    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Vehicle API failed" });
  }
});

// --- Electricity endpoint ---
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit = "kWh" } = req.body;

    // New recommended electricity activity_id per Climatiq quickstart
    const activity_id = "electricity-supply_grid-source_residual_mix";

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emission_factor: {
          activity_id,
          data_version: "^21"
        },
        parameters: {
          energy: electricity_value,
          energy_unit: electricity_unit
          // If you later want country-specific grid factors,
          // switch to a region-specific activity_id instead.
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Electricity API error:", response.status, data);
      return res.status(400).json({ error: "Electricity API failed", details: data });
    }

    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Electricity API failed" });
  }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
