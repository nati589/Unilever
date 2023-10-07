import express from "express";
import {
  getSections,
  addSection,
  updateSection,
  deleteSection,
  getSectionFile,
  getSectionVideo,
  getSingleSection,
  getCourseSections,
  getCompleteSections,
  getQuizSections
} from "../controllers/sections.js";
import multer from "multer";
const upload = multer({ dest: "sections/files/" });

const router = express.Router();

router.put("/updateSection/:id", upload.single("section_file"), updateSection);
router.delete("/deleteSection", deleteSection);
router.post("/addSection/:id", upload.single("section_file"), addSection);
router.get("/getSections", getSections);
router.get("/getSectionFile/:id", getSectionFile);
router.get("/getSectionVideo/:id", getSectionVideo);
router.get("/getSingleSection/:id", getSingleSection);
router.get("/getCourseSections/:id", getCourseSections);
router.get("/getCompleteSections/:id", getCompleteSections);
router.get("/getQuizSections", getQuizSections);
router.get("/");

export default router;
