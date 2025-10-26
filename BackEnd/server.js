import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.CLIMATIQ_API_KEY;

// Health check
app.get("/health", (req, res) => {
  res.json({ ok: true, apiKeyLoaded: !!API_KEY });
});

// ✅ VEHICLE EMISSIONS
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit, mode } = req.body;

    if (!distance_value || !mode) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Choose emission factor by mode
    const factors = {
      car: "passenger_vehicle-vehicle_type_car-fuel_source_na-distance_na-engine_size_na",
      air: "passenger_flight-route_type_domestic-fuel_source_jet_distance_na-class_na-rf_included_na",
      rail: "passenger_train-route_type_na-fuel_source_na-distance_na"
    };

    const factorId = factors[mode];
    if (!factorId) return res.status(400).json({ error: "Unsupported mode." });

    const body = {
      emission_factor: { id: factorId },
      parameters: {
        distance: distance_value,
        distance_unit: distance_unit || "km"
      }
    };

    const response = await fetch("https://api.climatiq.io/compute", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("DEBUG: Climatiq VEHICLE response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Vehicle API error:", data);
      return res.status(500).json({ error: "Vehicle API failed", data });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ ELECTRICITY EMISSIONS
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit, region } = req.body;

    if (!electricity_value) {
      return res.status(400).json({ error: "Missing electricity_value" });
    }

    const body = {
      region: region || "US",
      amount: {
        energy: electricity_value,
        energy_unit: electricity_unit || "kwh"
      }
    };

    const response = await fetch("https://api.climatiq.io/energy/v1.1/electricity", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log("DEBUG: Climatiq ELECTRICITY response:", JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error("Electricity API error:", data);
      return res.status(500).json({ error: "Electricity API failed", data });
    }

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
