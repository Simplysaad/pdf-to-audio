import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  emailAddress: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,

  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users"
  }
});

export default user = mongoose.model("users", userSchema);
