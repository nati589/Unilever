import express from "express";
import {
  enrollStudent,
  purchaseBook,
  fullCheckout,
} from "../controllers/enroll.js";

const router = express.Router();

router.post("/enrollStudent", enrollStudent);
router.post("/purchaseBook", purchaseBook);
router.post("/fullCheckout", fullCheckout);

export default router;
