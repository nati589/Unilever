import express from "express";
import {
  getBooks,
  getSingleBook,
  addBook,
  updateBook,
  deleteBook,
  getBooksThisYear,
  getBooksThisWeek,
  getBooksThisMonth,
  getTotalBooks,
  getDeletedBooks,
  getUndeletedBooks,
  deletePermanentBook,
  getPurchasedBooks,
  getPopularBook,
} from "../controllers/books.js";
import multer from "multer";
const upload = multer({ dest: "books/thumbnails/" });

const router = express.Router();

router.get("/getBooks", getBooks);
router.get("/getPurchasedBooks", getPurchasedBooks);
router.get("/getPopularBook", getPopularBook);
router.get("/getDeletedBooks", getDeletedBooks);
router.get("/getUndeletedBooks/:id", getUndeletedBooks);
router.get("/getTotalBooks", getTotalBooks);
router.get("/getSingleBook/:id", getSingleBook);
router.put("/updateBook/:id", upload.single("book_thumbnail"), updateBook);
router.delete("/deleteBook", deleteBook);
router.get("/getBooksThisYear", getBooksThisYear);
router.get("/getBooksThisWeek", getBooksThisWeek);
router.get("/getBooksThisMonth", getBooksThisMonth);
// router.put('/updateMember', updateMember);
// router.delete('/deleteMember', deleteMember);
router.post("/addBook", upload.single("book_thumbnail"), addBook);
router.delete("/deletedPermanentBook/:book_id", deletePermanentBook);

export default router;
