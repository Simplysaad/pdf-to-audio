import mongoose from "mongoose";

export default async function connectDB() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    if (!conn) throw new Error(`error connecting to ${conn.connection.host}`);
    console.log(`error connecting to ${conn.connection.host}`);
  } catch (err) {
    console.error(err);
  }
}
