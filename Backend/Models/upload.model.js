import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    },
    fileName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "error"],
      default: "pending",
    },
    filePath: {
      type: String,
      required: true,
    },
    chapterCount: {
      type: Number,
      required: true,
    },
    zipFilePath: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default upload = mongoose.model("users", userSchema);

