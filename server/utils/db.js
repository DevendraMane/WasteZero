import mongoose from "mongoose";
import dotenv from "dotenv";
import logger from "./logger.js";
dotenv.config();

const URI = process.env.MONGODB_URL;

const connectDB = async () => {
  try {
    await mongoose.connect(URI);
    logger.info("Connection successful to DB");
  } catch (error) {
    logger.error("DB connection failed", {
      message: error?.message || "Unknown database error",
    });
    process.exit(1); //!<-- It tells Node.js to Stop running immediately and report that something went wrong.
  }
};

export default connectDB;
