// backend/src/index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();

// RUTAS
const lotsRoutes = require("./routes/lots.routes");
const providersRoutes = require("./routes/providers.routes");
const adminConfigRoutes = require("./routes/adminConfig.routes");

app.use(cors());
app.use(express.json());

// healthcheck simple opcional
app.get("/api/db-test", (req, res) => {
  res.json({ ok: true });
});

// montar routers
app.use("/api/lots", lotsRoutes);
app.use("/api/providers", providersRoutes);
app.use("/api/admin", adminConfigRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Server on port", PORT);
});
