import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.CLIMATIQ_API_KEY;

// --- Vehicle endpoint ---
app.post("/api/vehicle", async (req, res) => {
  try {
    const { distance_value, distance_unit } = req.body;

    const response = await fetch("https://beta3.api.climatiq.io/estimate", {
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
    res.json({ data: { attributes: { carbon_kg: data.co2e } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Vehicle request failed" });
  }
});

// --- Electricity endpoint ---
app.post("/api/electricity", async (req, res) => {
  try {
    const { electricity_value, electricity_unit } = req.body;

    const response = await fetch("https://beta3.api.climatiq.io/estimate", {
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
    res.json({ data: { attributes: { carbon_kg: data.co2e } } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Electricity request failed" });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
