import mongoose from "mongoose";
import { app } from "./app";
import config from "./config";

const start = async () => {
  const DB_URL = config.DB_URL! || `mongodb://localhost:27017/ksa-dev`;
  // connect mongodb
  await mongoose
    .connect(DB_URL)
    .then(() => console.log("Successfully connected to db"));

  const PORT = config.PORT || 4000;
  app.listen(PORT, () =>
    console.log(`App is running on http://localhost:${PORT}`)
  );
};

start();
