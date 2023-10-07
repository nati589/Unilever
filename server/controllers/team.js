import { db } from "../db.js";
import multer from "multer";
import * as path from "path";
import * as url from "url";
import { unlink } from "fs/promises";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../../client/src/images/", "profiles"),
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

export const getMembers = (req, res) => {
  const q = "select * from team";

  db.query(q, (err, data) => {
    if (err) {
      res.json(err);
    } else {
      res.json(data);
    }
  });
};

export const addMember = (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("member_image");

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.send(err);
      } else if (err) {
        return res.send(err);
      }

      const uploadedFile = req.file
        ? { fileName: req.file.filename }
        : { fileName: null };

      console.log("file name", uploadedFile.fileName);

      const q =
        "INSERT INTO team (member_name,member_position,member_image) VALUES (?,?,?)";

      db.query(
        q,
        [req.body.member_name, req.body.member_position, uploadedFile.fileName],
        (err, data) => {
          if (err) {
            console.log(err);
            res
              .status(500)
              .json({
                error: "Failed to insert value in database. Please try again.",
              });
          } else {
            res.json(data);
          }
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
};

export const updateMember = (req, res) => {
  try {
    let upload = multer({ storage: storage }).single("member_image");

    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.send(err);
      } else if (err) {
        return res.send(err);
      }

      const uploadedFile = req.file
        ? { fileName: req.file.filename }
        : { fileName: null };

      console.log("fname", uploadedFile.fileName);

      if (req.body.old_image !== null) {
        const filename = req.body.old_image;
        const directoryPath = "../../client/src/images/profiles/";

        const filePath = path.join(__dirname, directoryPath, filename);

        unlink(filePath)
          .then(() => {
            console.log("File deleted successfully");
          })
          .catch((err) => {
            console.error(err);
          });
      }

      const q =
        "UPDATE team SET member_name=?, member_position=? ,member_image=? WHERE member_id=?";

      db.query(
        q,
        [
          req.body.member_name,
          req.body.member_position,
          uploadedFile.fileName,
          req.body.member_id,
        ],
        (err, data) => {
          if (err) {
            console.log(err);
            res
              .status(500)
              .json({
                error: "Failed to update value in database. Please try again.",
              });
          } else {
            res.json(data);
          }
        }
      );
    });
  } catch (err) {
    console.log(err);
  }
};

export const deleteMember = (req, res) => {
  const q = " DELETE FROM team WHERE member_id=?";
  db.query(q, [req.body.member_id], (err, data) => {
    if (err) {
      console.log(err);
      res
        .status(500)
        .json({
          error:
            "Failed to delete member information in database. Please try again.",
        });
    } else {
      if (req.body.old_image !== null) {
        const filename = req.body.old_image;
        const directoryPath = "../../client/src/images/profiles/";
        const filePath = path.join(__dirname, directoryPath, filename);

        unlink(filePath)
          .then(() => {
            console.log("File deleted successfully");
          })
          .catch((err) => {
            console.error(err);
          });
      }

      res.json(data);
    }
  });
};
