import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/connectDb.js";

// dotenv config
dotenv.config({ path: "./.env" });

// server config
const PORT = process.env.PORT || 5000;

// connect to db
connectDB()
  .then(() => {
    // listen for errors
    app.on("error", (error) => {
      console.error("Server is not able to talk to the database", error);
    });

    // start server
    app.listen(PORT, () => {
      console.log(`Server is running at: http://localhost:${PORT}...`);
    });
  })
  .catch((error) => {
    console.error("DB Connection Error:", error);
  });
