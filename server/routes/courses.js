import express from "express";
import {
  getCourses,
  addCourse,
  updateCourse,
  deleteCourse,
  getCoursesThisYear,
  getSingleCourse,
  getTotalCourses,
  getCouresThisWeek,
  getCouresThisMonth,
  getDeletedCourses,
  getUndeletedCourses,
  deletePermanentCousre,
  getPopularCourse,
} from "../controllers/courses.js";
import multer from "multer";
const upload = multer({ dest: "courses/thumbnails/" });

const router = express.Router();

router.put(
  "/updateCourse/:id",
  upload.single("course_thumbnail"),
  updateCourse
);
router.delete("/deleteCourse", deleteCourse);
router.post("/addCourse", upload.single("course_thumbnail"), addCourse);
router.get("/getCourses", getCourses);
router.get("/getDeletedCourses", getDeletedCourses);
router.get("/getUndeletedCourses/:id", getUndeletedCourses);
router.get("/getTotalCourses", getTotalCourses);
router.get("/getSingleCourse", getSingleCourse);
router.get("/getCoursesThisYear", getCoursesThisYear);
router.get("/");
///////////// Get The admin Info Route//////////////////
router.get("/getCoursesThisWeek", getCouresThisWeek);
router.get("/getCoursesThisMonth", getCouresThisMonth);
router.delete("/deletedPermanentCourse/:course_id", deletePermanentCousre);
router.get("/getPopularCourse", getPopularCourse);
export default router;
