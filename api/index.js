import express from "express"
import "dotenv/config";

const app = express();

let { PORT } = process.env

app.listen(PORT, (err) => {
    if (err) console.error("Unable to start server", err)
    else console.log("Server Up and running on " + PORT)
})

app.get("/api/status", async (req, res, next) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Server up and running",
            data: {}
        })
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Server down, try again later",
            data: {}
        })
    }
})

