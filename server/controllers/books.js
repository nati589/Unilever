import { db } from "../db.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const getBooks = (req, res) => {
  const q = "SELECT * FROM book WHERE book_archived = '0'";
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};

export const getPopularBook = (req, res) => {
  const limit = 5;
  const q = "SELECT * FROM book ORDER BY book_rating DESC LIMIT ?";
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

export const getTrendingBook = (req, res) => {
  const limit = 5;
  const q = "SELECT * FROM book ORDER BY book_purchases DESC LIMIT ?";
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

export const getRecommendedBook = (req, res) => {
  const limit = 5;
  const q = "SELECT * FROM book ORDER BY book_purchases DESC LIMIT ?";
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

export const getPurchasedBooks = (req, res) => {
  const q =
    "SELECT * FROM book INNER JOIN purchase WHERE book.book_archived = '0' AND book.book_id = purchase.book_id";
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};

export const getDeletedBooks = (req, res) => {
  const q = "SELECT * FROM book WHERE book_archived = '1'";
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};
export const getUndeletedBooks = (req, res) => {
  const q = `UPDATE book
  SET book_archived = 0

  WHERE book_id = '${req.params.id}'`;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};
export const getTotalBooks = (req, res) => {
  const q = "SELECT * FROM book ";
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};
export const getSingleBook = (req, res) => {
  const bookID = req.params.id;

  const q = "SELECT * FROM book WHERE book_id =?";
  db.query(q, [bookID], (err, data) => {
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
export const getBooksThisYear = (req, res) => {
  const q = `
    SELECT *
    FROM book
    WHERE YEAR(book_date_created) = YEAR(CURRENT_DATE)
  `;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};
export const getBooksThisMonth = (req, res) => {
  const q = `
  SELECT
  DATE_FORMAT(purchase_date, '%Y-%m') AS month_value,
  COUNT(*) AS count
FROM
  purchase
WHERE
  purchase_date >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)
GROUP BY
  month_value
ORDER BY
  month_value `;
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
export const getBooksThisWeek = (req, res) => {
  const q = `
  SELECT DAYNAME(purchase_date) AS day_name, COUNT(*) AS count
  FROM purchase
  WHERE purchase_date >= CURDATE() - INTERVAL 6 DAY
    AND purchase_date < CURDATE() + INTERVAL 1 DAY
  GROUP BY DAYNAME(purchase_date)
  ORDER BY DAYNAME(purchase_date) DESC;
`;
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

      res.json(dataOfWeek);
    }
  });
};

export const addBook = (req, res) => {
  // console.log(req.body)
  // console.log(req.file)
  const bookId = uuidv4();
  const values = Object.values(req.body);
  values.unshift(bookId);

  const book_thumbnail = req.file; // File object

  // Generate a new file name
  const originalFileName = book_thumbnail.originalname;
  const fileExtension = originalFileName.split(".").pop();
  const newFileName = `${bookId}.${fileExtension}`;

  // Construct the new file path
  const newFilePath = `books/thumbnails/${newFileName}`;

  const q =
    "INSERT INTO book (book_id, book_title, book_author, book_details, book_price, book_date_created,book_thumbnail) VALUES (?, ?, ?, ?, ?, NOW(),?)";
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
  fs.rename(book_thumbnail.path, newFilePath, (err) => {
    if (err) {
      // Handle the error
      console.error(err);
      return res.status(500).json({ message: "Error renaming the file" });
    }

    res.json({ message: "Book added successfully" });
  });
};
export const updateBook = (req, res) => {
  const bookId = req.params.id;
  console.log(req.params.id);
  console.log(req.body);

  const bookThumbnail = req.file; // File object

  // Generate a new file name
  const originalFileName = bookThumbnail.originalname;
  const fileExtension = originalFileName.split(".").pop();
  const newFileName = `${bookId}.${fileExtension}`;

  // Construct the new file path
  const newFilePath = `books/thumbnails/${newFileName}`;

  const values = Object.values(req.body);
  const q = `UPDATE book SET book_title = ?, book_author = ?, book_details = ?, book_price = ?,book_thumbnail = ? WHERE book_id = '${req.params.id}'`;
  db.query(q, [...values, newFileName], (err, data) => {
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
        fs.rename(bookThumbnail.path, newFilePath, (renameErr) => {
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
export const deleteBook = (req, res) => {
  const q = `UPDATE book SET book_archived = 1 WHERE book_id = '${req.body.id}'`;
  db.query(q, req.body.id, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.json(data);
    }
  });
};

//////////////////Delete Permamnet//////////////////////////
export const deletePermanentBook = (req, res) => {
  const bookId = req.params.book_id;

  const deleteQuery = "DELETE FROM book WHERE book_id = ?";

  db.query(deleteQuery, [bookId], (error, results) => {
    if (error) {
      // console.error("Error deleting book:", error.message);
      res.status(500).json({ error: "Error deleting book" });
    } else {
      // console.log(`Deleted book with ID ${bookId}`);
      res.status(200).json({ message: `Deleted book with ID ${bookId}` });
    }
  });
};
