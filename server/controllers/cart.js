import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";
import stripe from "stripe";
import crypto from "crypto";
const stripeInstance = stripe(
  "sk_test_51Nib8YIUKd3ZrP09eVVwoquDdZ1ALDpLpfRKUb74w5GAISHzLoX7qep4jHRpSpC4hWvuHDoMsa1xMRb8w4rBVfvu00a516DB0L"
);
export const getCart = (req, res) => {
  const { user_id } = req.body;
  const q = "SELECT * FROM cart WHERE user_id = ?";

  db.query(q, [user_id], (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error. Try again!" });
    } else {
      return res.status(200).json(data);
    }
  });
};

export const deleteFromCart = (req, res) => {
  const { cart_id } = req.body;

  const q = "DELETE FROM cart WHERE cart_id = ?";

  db.query(q, [cart_id], (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Failed to remove. Try again!" });
    } else {
      return res.status(200).json(data);
    }
  });
};

export const addToCart = (req, res) => {
  const { course_id, user_id, book_id } = req.body;
  const cart_id = uuidv4();
  const q = `INSERT INTO cart (cart_id, course_id, user_id, book_id ) VALUES (?,?,?,?)`;

  db.query(q, [cart_id, course_id, user_id, book_id], (err, data) => {
    if (err) {
      // console.log(err, "error");
      return res
        .status(401)
        .send({ message: "Error adding to cart. Try again!" });
    } else {
      // console.log(data, "data");
      return res.status(200).send({ message: "Added to cart!" });
    }
  });
};

export const checkCourse = (req, res) => {
  const { course_id, user_id } = req.body;
  const q = `SELECT * from cart WHERE course_id = ? AND user_id = ? `;
  db.query(q, [course_id, user_id], (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Error Checking in Cart!" });
    } else {
      if (data.length === 0) {
        return res.status(200).send({ message: false });
      } else {
        return res.status(200).send({ message: true });
      }
    }
  });
};

export const checkBook = (req, res) => {
  const { user_id, book_id } = req.body;
  const q = `SELECT * from cart WHERE book_id = ? and user_id = ? `;
  // console.log(req.body, "Checking");

  db.query(q, [book_id, user_id], (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Error Checking in Cart!" });
    } else {
      if (data.length === 0) {
        return res.status(200).send({ message: false });
      } else {
        return res.status(200).send({ message: true });
      }
    }
  });
};

////////////////////////paycheck //////////////////////////////////
export const payment = (req, res) => {
  const user_id = req.body.user_id;
  const q = `SELECT * FROM cart WHERE user_id = '${user_id}';`;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      const result = data;
      const userCart = result.map((row) => {
        return {
          cart_id: row.cart_id,
          user_id: row.user_id,
          book_id: row.book_id,
          course_id: row.course_id,
        };
      });
      const book = [];
      const course = [];
      userCart.forEach((element) => {
        if (!element.book_id) {
          // course = [...course, element];
          course.push(element);
        }
        if (!element.course_id) {
          // book = [...book, element];
          book.push(element);
        }
      });

      /////////Geting The Book And Cousre Id That user select in thr Cart//////////////
      const bookIdsToFetch = book.map((book) => book.book_id);
      const courseIdsToFetch = course.map((course) => course.course_id);

      // ... Previous code ...

      let TotalMoney = 0;
      let bookPricePromise;
      let coursePricePromise;
      // Fetching the Total price of the Books
      if (bookIdsToFetch.length) {
        const queryBook =
          "SELECT SUM(book_price) AS totalBook_price FROM book WHERE book_id IN (?)";
        bookPricePromise = new Promise((resolve, reject) => {
          db.query(queryBook, [bookIdsToFetch], (err, data) => {
            if (err) {
              reject(err);
            } else {
              const totalPrice = data[0].totalBook_price;
              resolve(totalPrice);
            }
          });
        });
      } else {
        bookPricePromise = 0;
      }

      // Fetching the Total price of the Courses
      if (courseIdsToFetch.length) {
        const queryCourse =
          "SELECT SUM(course_price) AS totalCourse_price FROM course WHERE course_id IN (?)";
        coursePricePromise = new Promise((resolve, reject) => {
          db.query(queryCourse, [courseIdsToFetch], (err, data) => {
            if (err) {
              reject(err);
            } else {
              const totalPrice = data[0].totalCourse_price;
              resolve(totalPrice);
            }
          });
        });
      } else {
        coursePricePromise = 0;
      }

      // Wait for both promises to resolve and add the prices to TotalMoney
      Promise.all([bookPricePromise, coursePricePromise])
        .then((results) => {
          const [totalBookPrice, totalCoursePrice] = results;
          TotalMoney = totalBookPrice + totalCoursePrice;

          // console.log("Total Price:", TotalMoney);

          // Rest of your code here, you can use TotalMoney now
          // console.log("Book ==", book);
          // console.log("Course", course);
          // console.log("Course", bookIdsToFetch);
          // console.log("Total Money", TotalMoney);
          async function payment() {
            try {
              const session = await stripeInstance.checkout.sessions.create({
                payment_method_types: ["card"],
                mode: "payment",
                line_items: [
                  {
                    price_data: {
                      currency: "usd",
                      product_data: {
                        name: "Course And Book",
                      },
                      unit_amount: TotalMoney * 100,
                    },
                    quantity: 1,
                  },
                ],
                client_reference_id: "your_unique_reference",
                success_url: `http://localhost:3000/success?user_id=${user_id}`,
                cancel_url: "http://localhost:3000/cancel",
              });

              // console.log({ ur: session.id });
              res.json({ url: session.url });
            } catch (e) {
              console.log("ddd", e.message);
              res.status(500).json("Ahmed");
            }
          }

          payment();

          // Send the response with the total price
          // res.json({ TotalMoney });
        })
        .catch((error) => {
          console.error("Error:", error);
          return res.status(401).send({ message: "Error Checking in Cart!" });
        });
    }
  });
};

export const payBack = (req, res) => {
  const user_id = req.body.user_id;
  const q = `SELECT * FROM cart WHERE user_id = '${user_id}';`;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      const result = data;
      const userCart = result.map((row) => {
        return {
          cart_id: row.cart_id,
          user_id: row.user_id,
          book_id: row.book_id,
          course_id: row.course_id,
        };
      });
      const book = [];
      const course = [];
      userCart.forEach((element) => {
        if (!element.book_id) {
          // course = [...course, element];
          course.push(element);
        }
        if (!element.course_id) {
          // book = [...book, element];
          book.push(element);
        }
      });

      /////////Geting The Book And Cousre Id That user select in thr Cart//////////////
      const bookIdsToFetch = book.map((book) => book.book_id);
      const courseIdsToFetch = course.map((course) => course.course_id);

      ///////////////Inserting Into entroll which user have Bought the Book
      if (bookIdsToFetch.length) {
        bookIdsToFetch.map((book_id) => {
          const currentDate = new Date()
            .toISOString()
            .slice(0, 19)
            .replace("T", " ");
          let q = `INSERT INTO purchase  VALUES ('${crypto.randomUUID()}', '${user_id}', '${book_id}', '5', '${currentDate}');`;
          db.query(q, (err, data) => {
            if (err) {
              return res
                .status(401)
                .send({ message: "Error Checking in Cart!" });
            } else {
              return 1;
            }
          });
        });
      }
      try {
        if (courseIdsToFetch.length) {
          courseIdsToFetch.map((cousre_id) => {
            const currentDate = new Date()
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
            let q = `INSERT INTO enrolled VALUES ('${crypto.randomUUID()}', 'dd', '0', '${currentDate}', '${user_id}', '${cousre_id}')`;
            db.query(q, (err, data) => {
              if (err) {
                return res
                  .status(401)
                  .send({ message: "Error Checking in Cart!" });
              } else {
                return 1;
              }
            });
          });
        }
      } catch (r) {
        res.json(e.message);
      }

      const query = `DELETE FROM cart
      WHERE user_id = '${user_id}';`;

      db.query(query, (err, data) => {
        if (err) {
          return res.status(401).send({ message: "Error Checking in Cart!" });
        }
      });

      // console.log("Book id ", bookIdsToFetch);
      // console.log("Course id ", courseIdsToFetch);
      res.json({ message: "Thank you Adrew tate " });
      // ... Previous code ...
    }
  });
};
