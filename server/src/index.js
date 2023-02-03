const express = require("express");
const morgan = require("morgan");

const { sequelize } = require("./models");
const router = require("./routes");

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(morgan("combined"));

app.use("/api/v1", router);

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
  console.log(`Listening on port:${PORT}...`);
});
