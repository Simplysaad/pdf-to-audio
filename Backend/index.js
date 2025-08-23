import express from "express";
// import connectDB from "./Config/db.js";
import "dotenv/config"

const app = express();

app.listen(process.env.PORT, (err) => {
  if (err) return console.error("error connecting to server", err);
  console.log(`Server listening on port ${process.env.PORT}`);
  // connectDB();
});

app.get("/", async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "this is good for a start",
    });
  } catch (err) {
    console.error(err);
  }
});
