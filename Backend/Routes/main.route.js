import { Router } from "express";

import { postUpload } from "../Controllers/main.controller.js";
import upload from "../Config/cloudinary.js";
const router = Router();

router.post("/", upload.single("uploadFile"), postUpload);

const mainRoutes = router;
export default mainRoutes;
