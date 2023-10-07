// const cookieParser = require("cookie-parser");
import express, { json } from "express";
import authRoutes from "./routes/auth.js";
import teamRoutes from "./routes/team.js";
import booksRoutes from "./routes/books.js";
import coursesRoutes from "./routes/courses.js";
import sectionsRoutes from "./routes/sections.js";
import gradesRoutes from "./routes/grades.js";
import questionsRoutes from "./routes/questions.js";
import purchasesRouter from "./routes/purchases.js";
import cartRouter from "./routes/cart.js";
import enrollRouter from "./routes/enroll.js";
import webContentRoutes from "./routes/webContent.js";
import usersRoutes from "./routes/users.js";
// import cookieParser from "cookie-parser";
import cookieParser from "cookie-parser";

import cors from "cors";
import { db } from "./db.js";

const app = express();
app.use(cookieParser());

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/books", booksRoutes);
app.use("/api/webcontent", webContentRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/courses", coursesRoutes);
app.use("/api/sections", sectionsRoutes);
app.use("/api/grades", gradesRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/purchases", purchasesRouter);
app.use("/api/cart", cartRouter);
app.use("/api/enroll", enrollRouter);

app.get("/", (req, res) => {
  res.json("success");
});

app.listen(8800, () => {
  console.log("Server running on port 8800...");
  db.connect((error) => {
    if (error) {
      console.error("Error connecting to the database:", error);
      return;
    }
    console.log("Connected to the database.");
  });
});
