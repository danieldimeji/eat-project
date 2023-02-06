const express = require("express");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");

const { sequelize } = require("./models");
const router = require("./routes");

const app = express();
const PORT = process.env.PORT || 8000;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later"
});

app.use(limiter);
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
