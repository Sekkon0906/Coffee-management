// backend/src/app.js
const express = require("express");
const cors = require("cors");

const healthRoutes = require("./routes/health.routes");
const lotsRoutes = require("./routes/lots.routes");
const dbTestRoutes = require("./routes/dbTest.routes");

const app = express();

const traceabilityRoutes = require("./routes/traceability.routes");
app.use("/api/traceability", traceabilityRoutes);

app.use(cors());
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/lots", lotsRoutes);
app.use("/api", dbTestRoutes);

module.exports = app;
