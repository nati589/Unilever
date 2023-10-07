import { db } from "../db.js";
import { v4 as uuidv4 } from "uuid";
import stripe from "stripe";
import crypto from "crypto";
const stripeInstance = stripe(
  "sk_test_51Nib8YIUKd3ZrP09eVVwoquDdZ1ALDpLpfRKUb74w5GAISHzLoX7qep4jHRpSpC4hWvuHDoMsa1xMRb8w4rBVfvu00a516DB0L"
);

export const enrollStudent = (req, res) => {
  // console.log("Enrollment");
  const currentDate = new Date();
  const { user_id, course_id } = req.body;

  const enrolled_id = uuidv4();

  const q =
    "INSERT INTO enrolled (enrolled_id,enrolled_date, user_id, course_id) VALUES (?,?,?,?)";

  db.query(q, [enrolled_id, currentDate, user_id, course_id], (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: "Oops! Server connection error. Please try again.",
      });
    } else {
      const q2 =
        "UPDATE course SET course_students = course_students + 1 WHERE course_id = ?";

      db.query(q2, [course_id], (err, data) => {
        if (err) {
          res.status(401).json({
            message: "Error updating enrollment number!",
          });
        }
      });

      res.status(200).json({
        message:
          "You have Purchased Course Successfully! Go to My Courses tab to access it. Happy learning!",
      });
    }
  });
};

export const purchaseBook = (req, res) => {
  // console.log("Enrollment");
  const currentDate = new Date();
  const { user_id, book_id } = req.body;

  const purchase_id = uuidv4();

  const q =
    "INSERT INTO purchase (purchase_id,purchase_date, user_id, book_id) VALUES (?,?,?,?)";

  db.query(q, [purchase_id, currentDate, user_id, book_id], (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: "Oops! Server connection error. Please try again.",
      });
    } else {
      const q2 =
        "UPDATE book SET book_purchases = book_purchases + 1 WHERE book_id = ?";

      db.query(q2, [book_id], (err, data) => {
        if (err) {
          res.status(401).json({
            message: "Error updating purchase number!",
          });
        }
      });

      res.status(200).json({
        message:
          "You have Purchased Book Successfully! Go to My Books tab to access it. Happy reading!",
      });
    }
  });
};

export const fullCheckout = async (req, res) => {
  const { user_id } = req.body;
  const currentDate = new Date();
  const q = "SELECT * FROM cart WHERE user_id = ?";

  db.query(q, [user_id], (err, data) => {
    if (err) {
      return res
        .status(401)
        .send({ message: "Error checking out ! Please try again." });
    } else {
      const cartData = data;

      cartData.map((cartItem) => {
        if (cartItem.book_id === null) {
          const enrolled_id = uuidv4();

          const q2 =
            "INSERT INTO enrolled (enrolled_id,enrolled_date, user_id, course_id) VALUES (?,?,?,?)";

          db.query(
            q2,
            [enrolled_id, currentDate, user_id, cartItem.course_id],
            (err, data) => {
              if (err) {
                console.log(err);
                res.status(500).json({
                  message: "Error checking out course! Please try again.",
                });
              }
            }
          );
        } else if (cartItem.course_id === null) {
          const purchase_id = uuidv4();
          const q3 =
            "INSERT INTO purchase (purchase_id,purchase_date, user_id, book_id) VALUES (?,?,?,?)";

          db.query(
            q3,
            [purchase_id, currentDate, user_id, cartItem.book_id],
            (err, data) => {
              if (err) {
                console.log(err);
                res.status(500).json({
                  message: "Error checking out book! Please try again.",
                });
              }
            }
          );
        }
        const q4 = "DELETE FROM cart WHERE cart_id = ?";

        db.query(q4, [cartItem.cart_id], (err, data) => {
          if (err) {
            return res.status(401).send({
              message: "Error! Failed to remove from cart. Try again.",
            });
          }
        });
      });

      return res.status(200).send({
        message:
          "Checkout Complete! you can acess your courses and books in the My courses and My books tabs.",
      });
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
