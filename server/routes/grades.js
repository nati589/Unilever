import express from "express";
import {
  getGrades,
  addGrade,
  updateGrade,
  deleteGrade,
} from "../controllers/grades.js";

const router = express.Router();

router.get("/getGrades", getGrades);
router.put("/updateGrade/:id", updateGrade);
router.delete("/deleteGrade/:id", deleteGrade);
router.post("/addGrade", addGrade);

export default router;
