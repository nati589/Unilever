import { db } from "../db.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const getCourses = (req, res) => {
  const q = "SELECT * FROM course WHERE course_archived = '0'";
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
}; 

export const getPopularCourse = (req, res) => {
  const limit = 5;
  const q = "SELECT * FROM course ORDER BY course_rating DESC LIMIT ?";
  // console.log("first");
  db.query(q, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
}; 

export const getTrendingCourse = (req, res) => {
  const limit = 5;
  const q = "SELECT * FROM course ORDER BY course_purchases DESC LIMIT ?";
  // console.log("first");
  db.query(q, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};

export const getRecommendedCourse = (req, res) => {
  const limit = 5;
  const q = "SELECT * FROM course ORDER BY course_purchases DESC LIMIT ?";
  // console.log("first");
  db.query(q, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};

export const getDeletedCourses = (req, res) => {
  const q = "SELECT * FROM course WHERE course_archived = '1'";
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};
export const getUndeletedCourses = (req, res) => {
  const q = `UPDATE course
  SET course_archived = 0

  WHERE course_id = '${req.params.id}'`;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};
export const getTotalCourses = (req, res) => {
  const q = "SELECT * FROM course";
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};
///////////////////////////// Get the adim dashboard Info/////////////////////////////
export const getCouresThisMonth = (req, res) => {
  const q = `
  SELECT
  DATE_FORMAT(enrolled_date, '%Y-%m') AS month_value,
  COUNT(*) AS count
FROM
enrolled
WHERE
  enrolled_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
GROUP BY
  month_value
ORDER BY
  month_value`;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      // Define an array of month names
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Create an array to store the result with counts for each month
      const resultArray = months.map((monthName) => {
        const matchingRow = data.find((row) => {
          // Input date in the format "YYYY-MM"
          const inputDate = row.month_value;

          // Create a JavaScript Date object from the input date
          const dateParts = inputDate.split("-");
          const year = parseInt(dateParts[0], 10);
          const month = parseInt(dateParts[1], 10) - 1; // Months are 0-indexed, so subtract 1

          const jsDate = new Date(year, month);

          // Get the short month name
          const monthNames = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const shortMonthName = monthNames[jsDate.getMonth()];

          return shortMonthName === monthName;
        });
        return {
          month: monthName,
          count: matchingRow ? matchingRow.count : 0, // Set count to 0 if no data for the month
        };
      });

      // Print or use the resultArray as needed
      const monthData = resultArray.map((data) => data.count);
      // console.log(resultArray.count);
      res.json(monthData);
    }
  });
};
export const getCouresThisWeek = (req, res) => {
  const q = `
  SELECT DAYNAME(enrolled_date) AS day_name, COUNT(*) AS count
  FROM enrolled
  WHERE enrolled_date >= CURDATE() - INTERVAL 6 DAY
    AND enrolled_date < CURDATE() + INTERVAL 1 DAY
  GROUP BY DAYNAME(enrolled_date)
  ORDER BY DAYNAME(enrolled_date) DESC`;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      const resultArray = [];

      // Initialize the array with days and counts
      const daysOfWeek = [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ];
      console.log(data);
      daysOfWeek.forEach((day) => {
        const row = data.find((r) => r.day_name === day);
        resultArray.push({
          day_name: day,
          count: row ? row.count : 0,
        });
      });

      // Print the result array
      const dataOfWeek = resultArray.map((data) => data.count);
      console.log(resultArray);
      res.json(dataOfWeek);
    }
  });
};

export const getSingleCourse = (req, res) => {
  const { courseID } = req.query;

  const q = "SELECT * FROM course WHERE course_id =?";
  db.query(q, [courseID], (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      if (data.length === 0) {
        return res.status(404).send({ message: "Data not found!" });
      }

      res.status(200).json(data);
    }
  });
};

export const getCoursesThisYear = (req, res) => {
  const q = `
    SELECT *
    FROM course
    WHERE YEAR(course_date_created) = YEAR(CURRENT_DATE)
  `;
  db.query(q, (err, data) => {
    if (err) {
      return res
        .status(401)
        .send({ message: "Connection error try again.", data: result });
    } else {
      res.json(data);
    }
  });
};

export const addCourse = (req, res) => {
  // console.log(req.body);
  // console.log(req.file);
  const course_id = uuidv4();
  const values = Object.values(req.body);
  values.unshift(course_id);
  const course_thumbnail = req.file; // File object

  // Generate a new file name
  const originalFileName = course_thumbnail.originalname;
  const fileExtension = originalFileName.split(".").pop();
  const newFileName = `${course_id}.${fileExtension}`;

  // Construct the new file path
  const newFilePath = `courses/thumbnails/${newFileName}`;
  // Create the SQL insert query
  console.log(values, "values");
  const q = `INSERT INTO course (course_id, course_title, course_details,course_level,course_price,course_instructor, course_total_hour, course_date_created, course_thumbnail ) VALUES (?,?,?,?,?,?,?,NOW(),?)`;
  db.query(q, [...values, newFileName], (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      //   res.json(data);
      console.log(data);
    }
  });

  // Rename the file
  fs.rename(course_thumbnail.path, newFilePath, (err) => {
    if (err) {
      // Handle the error
      console.error(err);
      return res.status(500).json({ message: "Error renaming the file" });
    }

    res.json({ message: "Course added successfully" });
  });
};
export const updateCourse = (req, res) => {
  const courseId = req.params.id;
  console.log(req.params.id);
  console.log(req.body);
  const courseThumbnail = req.file; // File object

  // Generate a new file name
  const originalFileName = courseThumbnail.originalname;
  const fileExtension = originalFileName.split(".").pop();
  const newFileName = `${courseId}.${fileExtension}`;

  // Construct the new file path
  const newFilePath = `courses/thumbnails/${newFileName}`;

  const objValues = Object.values(req.body);

  const q = `UPDATE course SET course_title = ?, course_details = ?, course_level = ?, course_price = ?, course_instructor = ?, course_total_hour = ?, course_thumbnail = ? WHERE course_id = '${req.params.id}'`;
  db.query(q, [...objValues, newFileName], (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      //   res.json(data);
      console.log(data);
      // Check if a new file has been uploaded
      if (req.file) {
        // Move the file with overwrite option
        // Rename the file with overwrite option
        fs.rename(courseThumbnail.path, newFilePath, (renameErr) => {
          if (renameErr) {
            console.error(renameErr);
            return res.status(500).json({ message: "Error renaming the file" });
          }

          res.json({ message: "Course updated successfully" });
        });
      } else {
        res.json({ message: "Course updated successfully" });
      }
    }
  });
};

export const deleteCourse = (req, res) => {
  const q = `UPDATE course SET course_archived = 1 WHERE course_id = '${req.body.id}'`;
  db.query(q, req.body.id, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.json(data);
    }
  });
};
////////////////////////Deleting Permant/////////////
export const deletePermanentCousre = (req, res) => {
  const cousreId = req.params.course_id;

  const deleteQuery = "DELETE FROM course WHERE course_id = ?";

  db.query(deleteQuery, [cousreId], (error, results) => {
    if (error) {
      console.error("Error deleting Course:", error.message);
      res.status(500).json({ error: "Error deleting Course" });
    } else {
      console.log(`Deleted book with ID ${cousreId}`);
      res.status(200).json({ message: `Deleted book with ID ${cousreId}` });
    }
  });
};
