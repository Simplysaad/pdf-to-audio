import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema(
  {
    chatId: {
      type: String
    },
    title: {
      type: String,
      required: true
    },
    fileUrl: String,
    chapters: [
      {
        name: String,
        path: String
      }
    ]
    // ,zipFilePath: {
    //   type: String,
    //   required: true
    // }
    //, status: {
    //   type: String,
    //   enum: ["pending", "processing", "completed", "error"],
    //   default: "pending"
    // },
  },
  { timestamps: true }
);

export default Upload = mongoose.model("upload", UploadSchema);
