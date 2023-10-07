import { db } from "../db.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";

export const getTotalPurchase = (req, res) => {
  const q =
    "SELECT (SELECT COUNT(*) FROM purchase) + (SELECT COUNT(*) FROM enrolled) AS total_count;";
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data[0]);
    }
  });
};
export const getCoursePurchasesThisWeek = (req, res) => {
  const q = `SELECT
  c.course_id,
  c.course_title,
  c.course_price,
  DAYNAME(enrolled_date) as day_name,
  COUNT(e.course_id) AS count_per_course,
  (c.course_price * COUNT(e.course_id)) AS course_revenue
FROM
  course AS c
INNER JOIN
  enrolled AS e
ON
  c.course_id = e.course_id
  WHERE enrolled_date >= CURDATE() - INTERVAL 6 DAY
  AND enrolled_date < CURDATE() + INTERVAL 1 DAY

    GROUP BY DAYNAME(enrolled_date)
  ORDER BY DAYNAME(enrolled_date) DESC;`;
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

      daysOfWeek.forEach((day) => {
        const row = data.find((r) => r.day_name === day);
        resultArray.push({
          day_name: day,
          amount: row ? row.course_revenue : 0,
        });
      });

      // Print the result array
      const dataOfWeek = resultArray.map((data) => data.amount);

      res.json(dataOfWeek);
    }
  });
};
export const getBookPurchasesThisWeek = (req, res) => {
  const q = `SELECT
  c.book_id,
  c.book_title,
  c.book_price,
  DAYNAME(purchase_date) as day_name,
  COUNT(e.book_id) AS count_per_course,
  (c.book_price * COUNT(e.book_id)) AS book_revenue
FROM
  book AS c
INNER JOIN
  purchase AS e
ON
  c.book_id = e.book_id
  WHERE purchase_date >= CURDATE() - INTERVAL 6 DAY
  AND purchase_date < CURDATE() + INTERVAL 1 DAY

    GROUP BY DAYNAME(purchase_date)
  ORDER BY DAYNAME(purchase_date) DESC;`;
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

      daysOfWeek.forEach((day) => {
        const row = data.find((r) => r.day_name === day);
        resultArray.push({
          day_name: day,
          amount: row ? row.book_revenue : 0,
        });
      });

      // Print the result array
      const dataOfWeek = resultArray.map((data) => data.amount);

      res.json(dataOfWeek);
    }
  });
};
export const getPurchasesThisYear = (req, res) => {
  const q = `
  SELECT (SELECT COUNT(*) FROM purchase WHERE YEAR(purchase_date) = YEAR(CURRENT_DATE)) + (SELECT COUNT(*) FROM enrolled WHERE YEAR(enrolled_date) = YEAR(CURRENT_DATE) ) AS total_count; `;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data[0]);
    }
  });
};
