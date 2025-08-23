import { Router } from "express";

import { postUpload } from "../Controllers/main.controllers";
import upload from "../Config/cloudinary.js";
const router = Router();

router.post("/", upload.single("file"), postUpload);

export default router;
