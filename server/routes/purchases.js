import express from "express";
import {
  getBookPurchasesThisWeek,
  getCoursePurchasesThisWeek,
  getPurchasesThisYear,
  getTotalPurchase,
} from "../controllers/purchases.js";
// import { getBooks, addBook } from "../controllers/books.js";
// import multer from "multer";
// const upload = multer({ dest: 'books/thumbnails/' });

const router = express.Router();

router.get("/getTotalPurchase", getTotalPurchase);
router.get("/getPurchasesThisYear", getPurchasesThisYear);
// router.put('/updateMember', updateMember);
// router.delete('/deleteMember', deleteMember);
// router.post('/addBook', upload.single('book_thumbnail'), addBook);
////////////////////To Get info Admin//////////////
router.get("/getCoursePurchasesThisWeek", getCoursePurchasesThisWeek);
router.get("/getBookPurchasesThisWeek", getBookPurchasesThisWeek);
export default router;
