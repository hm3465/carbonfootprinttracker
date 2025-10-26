import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://api.climatiq.io/estimate";
const API_KEY = process.env.CLIMATIQ_API_KEY;

// Health (include a build tag so you can confirm you’re on the new server)
app.get("/health", (_req, res) => {
  res.json({ ok: true, apiKeyLoaded: !!API_KEY, serverBuild: "v2-bubble-errors" });
});

// Vehicle
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit = "km", mode } = req.body;

    if (!API_KEY) {
      return res.status(503).json({ error: "CLIMATIQ_API_KEY missing" });
    }

    const factorMap = {
      air: "passenger_flight-route_type_domestic-fuel_type_jet",
      rail: "passenger_train-route_type_national",
      car: "passenger_vehicle-vehicle_type_car-fuel_type_gasoline",
    };
    const emission_factor = factorMap[mode] || factorMap.car;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emission_factor,
        parameters: { distance: distance_value, distance_unit },
      }),
    });

    const data = await response.json();

    if (!response.ok || typeof data.co2e !== "number") {
      console.error("Vehicle API error:", response.status, data);
      return res.status(response.status || 500).json({
        error: "Climatiq vehicle estimate failed",
        details: data,
      });
    }

    res.json({ data: { attributes: { carbon_kg: data.co2e } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Vehicle API failed" });
  }
});

// Electricity
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit = "kwh", country = "us" } = req.body;

    if (!API_KEY) {
      return res.status(503).json({ error: "CLIMATIQ_API_KEY missing" });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emission_factor: "electricity-energy_source_grid_mix",
        parameters: { energy: electricity_value, energy_unit: electricity_unit, country },
      }),
    });

    const data = await response.json();

    if (!response.ok || typeof data.co2e !== "number") {
      console.error("Electricity API error:", response.status, data);
      return res.status(response.status || 500).json({
        error: "Climatiq electricity estimate failed",
        details: data,
      });
    }

    res.json({ data: { attributes: { carbon_kg: data.co2e } } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Electricity API failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
