import mongoose from "mongoose";

const UploadSchema = new mongoose.Schema(
  {
    user_id: {
      type: String
    },
    path: {
      type: String,
      required: true
    },
    status: String,
    chapters: [
      {
        name: String,
        path: String
      }
    ],
    summary: {
      type: String
    },
    script: {
      type: String,
    },
    audio_url: String

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

const Upload = mongoose.model("upload", UploadSchema);
export default Upload;
