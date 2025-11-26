// src/app.js
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const lotsRoutes = require("./routes/lots.routes");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/health", healthRoutes);
app.use("/api/lots", lotsRoutes);

module.exports = app;
