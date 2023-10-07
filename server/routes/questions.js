import express from "express";
import {
  getQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  getSingleQuestion,
  getQuizQuestions
} from "../controllers/questions.js";

const router = express.Router();

router.put("/updateQuestion/:id", updateQuestion);
router.delete("/deleteQuestion/:id", deleteQuestion);
router.post("/addQuestion/:id", addQuestion);
router.get("/getQuestions", getQuestions);
router.get("/getSingleQuestion/:id", getSingleQuestion);
router.get("/getQuizQuestions/:id", getQuizQuestions);
router.get("/");

export default router;
