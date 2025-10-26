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

// ✅ Serve static frontend files
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
const API_URL = "https://api.climatiq.io/estimate";
const API_KEY = process.env.CLIMATIQ_API_KEY;

// --- Vehicle endpoint ---
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit = "km", mode } = req.body;
    const factorMap = {
      air: "passenger_flight-route_type_domestic-fuel_type_jet",
      rail: "passenger_train-route_type_national",
      car: "passenger_vehicle-vehicle_type_car-fuel_type_gasoline"
    };
    const emission_factor = factorMap[mode] || factorMap.car;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        emission_factor,
        parameters: {
          distance: distance_value,
          distance_unit
        }
      })
    });

    const data = await response.json();
    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Vehicle API failed" });
  }
});

// --- Electricity endpoint ---
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit = "kwh", country = "us" } = req.body;

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
          energy_unit: electricity_unit,
          country
        }
      })
    });

    const data = await response.json();
    res.json({ data: { attributes: { carbon_kg: data.co2e || 0 } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Electricity API failed" });
  }
});

// ✅ Start server
const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
