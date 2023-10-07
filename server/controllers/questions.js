import { db } from "../db.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const getQuestions = (req, res) => {
  const q = "SELECT * FROM section ORDER BY section_date_created ASC";
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};

export const getSingleQuestion = (req, res) => {
  const id = req.params.id;
  console.log(id);
  // const { courseID } = req.body;
  const q = `SELECT * FROM question WHERE question_id ='${id}'`;
  db.query(q, id, (err, data) => {
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
export const getQuizQuestions = (req, res) => {
  const q = `SELECT * FROM question WHERE section_id = '${req.params.id}' ORDER BY question_date_created ASC`;
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};

export const addQuestion = (req, res) => {
  const question_id = uuidv4();
  const questionData = {
    question_id,
    question_name: req.body.title,
    question_options: JSON.stringify(req.body.choices),
    section_id: req.params.id,
  };
  const q = `INSERT INTO question (question_id, question_name, question_options, section_id, question_date_created ) VALUES (?,?,?,?,NOW())`;
  db.query(q, Object.values(questionData), (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
      // console.log(data);
    }
  });

  // console.log(req.body)
  // console.log(req.params.id)
};
export const updateQuestion = (req, res) => {
  const questionData = {
    question_name: req.body.title,
    question_options: JSON.stringify(req.body.choices),
  };
  const q = `UPDATE question SET question_name = ?, question_options = ? WHERE question_id = '${req.params.id}';`;
  db.query(q, Object.values(questionData), (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
    }
  });
};
export const deleteQuestion = (req, res) => {
  const q = `DELETE FROM question WHERE question_id = '${req.params.id}'`;
  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      res.json(data);
      // console.log(data);
    }
  });
};
