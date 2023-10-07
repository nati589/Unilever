import { db } from "../db.js";

export const getContent = (req, res) => {
  const q = "select * from web_content";

  db.query(q, (err, data) => {
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

export const changeContent = (req, res) => {
  //   console.log(req.body);

  const q = "UPDATE web_content SET ? WHERE web_content_id = ?";

  db.query(q, [req.body, req.body.web_content_id], (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json("all good");
    }

    // if (err) {
    //   return res.status(401).send({ message: "Connection error try again." });
    // } else {
    //   res.status(200).send({ message: "Updated successfully!" });
    // }
  });
};
