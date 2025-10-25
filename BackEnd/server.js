import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_URL = "https://www.carboninterface.com/api/v1";
const API_KEY = process.env.CARBON_API_KEY;

// --- Vehicle endpoint ---
app.post("/api/vehicle", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/estimates`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "vehicle",
        distance_unit: req.body.distance_unit,
        distance_value: req.body.distance_value,
        vehicle_model_id: req.body.vehicle_model_id
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Vehicle request failed" });
  }
});

// --- Electricity endpoint ---
app.post("/api/electricity", async (req, res) => {
  try {
    const response = await fetch(`${API_URL}/estimates`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        type: "electricity",
        electricity_unit: req.body.electricity_unit,
        electricity_value: req.body.electricity_value,
        country: req.body.country
      })
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Electricity request failed" });
  }
});

app.listen(3000, () => console.log("✅ Server running on http://localhost:3000"));
