import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: true,
  },
  telegram_id: {
    type: String,
    required: true,
    unique: true,
  },
  referredBy: {
    type: String,
  }
});

export default user = mongoose.model("users", userSchema);
