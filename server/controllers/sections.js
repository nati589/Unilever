import { db } from "../db.js";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import path from "path";

export const getSections = (req, res) => {
  const q = "SELECT * FROM section ORDER BY section_date_created ASC";
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};

export const getSingleSection = (req, res) => {
  const id = req.params.id;
  console.log(id);
  // const { courseID } = req.body;
  const q = `SELECT * FROM section WHERE section_id ='${id}'`;
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
export const getSectionFile = (req, res) => {
  const { id } = req.params;
  const directoryPath = "sections/files/";

  fs.readdir(directoryPath, (error, files) => {
    if (error) {
      console.error("Error reading directory:", error);
      res.status(500).send("Error reading directory");
      return;
    }

    const fileNameWithoutExtension = id;
    const file = files.find((file) => {
      const fileWithoutExtension = path.parse(file).name;
      return fileWithoutExtension === fileNameWithoutExtension;
    });

    if (!file) {
      console.error("File not found:", fileNameWithoutExtension);
      res.status(404).send("File not found");
      return;
    }

    const filePath = path.join(directoryPath, file);
    const contentType = getContentType(filePath);

    if (!contentType) {
      console.error("Unknown file type:", filePath);
      res.status(500).send("Unknown file type");
      return;
    }

    const options = {
      root: path.join("./"),
      headers: {
        "Content-Type": contentType,
      },
    };

    res.sendFile(filePath, options, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        res.status(500).send("Error sending file");
      } else {
        // console.log("Sent:", filePath);
      }
    });
  });
};
export const getSectionVideo = (req, res) => {
  const { id } = req.params;
  // const filePath = `sections/files/${id}.mp4`; // Adjust the file path based on your backend file storage
  const range = req.headers.range;
  if (!range) {
    res.status(400).send("Requires Range header");
  }
  const videoPath = `sections/files/${id}.mp4`;
  const videoSize = fs.statSync(`sections/files/${id}.mp4`).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };
  res.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, { start, end });
  videoStream.pipe(res);
};
function getContentType(filePath) {
  const fileExtension = path.extname(filePath).toLowerCase();

  switch (fileExtension) {
    case ".pdf":
      return "application/pdf";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mov":
      return "video/quicktime";
    default:
      return null;
  }
}
export const getCourseSections = (req, res) => {
  const q = `SELECT * FROM section WHERE course_id = '${req.params.id}' ORDER BY section_date_created ASC`;
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};
export const getCompleteSections = (req, res) => {
  const q = `SELECT section.section_id, section.course_id, grade.grade_id, grade.grade, grade.completed FROM section INNER JOIN grade ON section.section_id = grade.section_id WHERE section.course_id = '${req.params.id}';`;
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};

export const addSection = (req, res) => {
  const section_id = uuidv4();
  const values = Object.values(req.body);
  values.unshift(section_id);
  if (values[3] === "quiz") {
    values.pop();
  }
  values.push(req.params.id);
  console.log(values);
  // Create the SQL insert query
  const q = `INSERT INTO section (section_id, section_title, section_description, section_type, section_content, section_value, section_date_created, course_id) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)`;
  db.query(q, values, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      //   res.json(data);
      const query = `UPDATE course SET course_sections = course_sections + 1 WHERE course_id = '${req.params.id}';`;
      db.query(query);
      console.log(data);
      // Check if a new file has been uploaded
      if (req.file) {
        const sectionFile = req.file; // File object

        // Generate a new file name
        const originalFileName = sectionFile.originalname;
        const fileExtension = originalFileName.split(".").pop();
        const newFileName = `${section_id}.${fileExtension}`;

        // Construct the new file path
        const newFilePath = `sections/files/${newFileName}`;

        // Move the file with overwrite option
        // Rename the file with overwrite option
        fs.rename(sectionFile.path, newFilePath, (renameErr) => {
          if (renameErr) {
            console.error(renameErr);
            return res.status(500).json({ message: "Error renaming the file" });
          }

          res.json({ message: "Section created successfully" });
        });
      } else {
        res.json({ message: "Section created successfully" });
      }
    }
  });
  //   const course_thumbnail = req.file; // File object
  //   // Generate a new file name
  //   const originalFileName = course_thumbnail.originalname;
  //   const fileExtension = originalFileName.split(".").pop();
  //   const newFileName = `${course_id}.${fileExtension}`;
  //   // Construct the new file path
  //   const newFilePath = `courses/thumbnails/${newFileName}`;
  //   // Rename the file
  //   fs.rename(course_thumbnail.path, newFilePath, (err) => {
  //     if (err) {
  //       // Handle the error
  //       console.error(err);
  //       return res.status(500).json({ message: "Error renaming the file" });
  //     }
  //     res.json({ message: "Course added successfully" });
  //   });
};
export const updateSection = (req, res) => {
  // console.log(req.params.id);
  // console.log(req.body);
  const section_id = req.params.id;
  const values = Object.values(req.body);
  const directoryPath = "sections/files/";
  console.log(values);
  if (values[2] === "quiz") {
    values.pop();
  }
  values.push(req.params.id);
  console.log(values);
  // Create the SQL insert query
  const q = `UPDATE section SET section_title = ?, section_description = ?, section_type = ?, section_content = ?,section_value = ? WHERE section_id = '${req.params.id}';`;
  db.query(q, values, (err, data) => {
    if (err) {
      res.json(err);
      console.log(err);
    } else {
      // Check if a new file has been uploaded
      if (req.file) {
        const sectionFile = req.file; // File object

        // Generate a new file name
        const originalFileName = sectionFile.originalname;
        const fileExtension = originalFileName.split(".").pop();
        const newFileName = `${section_id}.${fileExtension}`;

        // Construct the new file path
        const newFilePath = `sections/files/${newFileName}`;

        // Move the file with overwrite option
        // Rename the file with overwrite option
        fs.rename(sectionFile.path, newFilePath, (renameErr) => {
          if (renameErr) {
            console.error(renameErr);
            return res.status(500).json({ message: "Error renaming the file" });
          }

          res.json({ message: "Section changed successfully" });
        });
      } else if (values[2] === "quiz") {
        fs.readdir(directoryPath, (err, files) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: "Error reading directory" });
          }

          // Find the file with a matching ID
          const matchingFile = files.find((file) => {
            const fileName = path.parse(file).name;
            return fileName === section_id;
          });

          if (!matchingFile) {
            return res.status(404).json({ message: "File not found" });
          }

          // Delete the file
          const filePath = path.join(directoryPath, matchingFile);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(err);
              res.status(500).json({ message: "Error deleting file" });
            } else {
              // res.status(200).json({ message: 'File deleted successfully' });
              res.json({ message: "Section changed successfully." });
            }
          });
        });
      } else {
        res.json({ message: "Section changed successfully" });
      }
    }
  });
};
export const deleteSection = (req, res) => {
  const sectionId = req.body.id;
  const courseId = req.body.course_id;
  const directoryPath = "sections/files/";

  db.beginTransaction((err) => {
    if (err) {
      return res
        .status(500)
        .send({ message: "Transaction error. Please try again." });
    }

    // Delete the section
    const deleteQuery = `DELETE FROM section WHERE section_id = '${sectionId}'`;
    db.query(deleteQuery, (err, deleteResult) => {
      if (err) {
        db.rollback(() => {
          res
            .status(500)
            .send({ message: "Error deleting section. Please try again." });
        });
      } else {
        // Update the course_sections value
        const updateQuery = `UPDATE course SET course_sections = course_sections - 1 WHERE course_id = '${courseId}'`;
        db.query(updateQuery, (err, updateResult) => {
          if (err) {
            db.rollback(() => {
              res.status(500).send({
                message: "Error updating course_sections. Please try again.",
              });
            });
          } else {
            db.commit((err) => {
              if (err) {
                db.rollback(() => {
                  res.status(500).send({
                    message: "Transaction commit error. Please try again.",
                  });
                });
              } else {
                fs.readdir(directoryPath, (err, files) => {
                  if (err) {
                    console.error(err);
                    return res
                      .status(500)
                      .json({ message: "Error reading directory" });
                  }

                  // Find the file with a matching ID
                  const matchingFile = files.find((file) => {
                    const fileName = path.parse(file).name;
                    return fileName === req.body.id;
                  });

                  if (!matchingFile) {
                    return res.status(404).json({ message: "File not found" });
                  }

                  // Delete the file
                  const filePath = path.join(directoryPath, matchingFile);
                  fs.unlink(filePath, (err) => {
                    if (err) {
                      console.error(err);
                      res.status(500).json({ message: "Error deleting file" });
                    } else {
                      // res.status(200).json({ message: 'File deleted successfully' });
                      res.json({ message: "Section deleted successfully." });
                    }
                  });
                });
                // if (fs.existsSync(filePath)) {
                //   // Delete the file
                //   fs.unlink(filePath, (err) => {
                //     if (err) {
                //       console.error(err);
                //       res.status(500).json({ message: 'Error deleting file' });
                //     } else {
                //       // res.status(200).json({ message: 'File deleted successfully' });
                //       res.json({ message: 'Section deleted successfully.' });
                //     }
                //   });
                // } else {
                //   res.json({ message: 'Section deleted successfully.' });
                //   // res.status(404).json({ message: 'File not found' });
                // }
              }
            });
          }
        });
      }
    });
  });
};
export const getQuizSections = (req, res) => {
  const q = "SELECT course.course_title, course.course_level, section.section_id, section.section_title, section.section_value FROM course INNER JOIN section ON course.course_id = section.course_id WHERE section.section_type = 'quiz'";
  db.query(q, (err, data) => {
    if (err) {
      return res.status(401).send({ message: "Connection error try again." });
    } else {
      res.status(200).json(data);
    }
  });
};

// export const getSectionVideo = (req, res) => {
//   const { id } = req.params;
//   const directoryPath = "sections/files/";
//   const fileNameWithoutExtension = id;

//   const searchFile = (directoryPath, fileNameWithoutExtension, callback) => {
//     fs.readdir(directoryPath, (error, files) => {
//       if (error) {
//         console.error('Error reading directory:', error);
//         callback(null); // Pass null to indicate file not found
//         return;
//       }

//       const file = files.find((file) => {
//         const fileWithoutExtension = path.parse(file).name;
//         return fileWithoutExtension.toLowerCase() === fileNameWithoutExtension.toLowerCase();
//       });

//       if (file) {
//         const filePath = path.join(directoryPath, file);
//         callback(filePath); // Pass the absolute file path to the callback
//       } else {
//         callback(null); // Pass null to indicate file not found
//       }
//     });
//   };

//   // Usage example

//   searchFile(directoryPath, fileNameWithoutExtension, (filePath) => {
//     if (filePath) {
//       console.log('File found:', filePath);
//       // Store the absolute file path in a variable or perform further operations with the file
//       // get video stats (about 11MB)
//      const stat = fs.statSync(filePath);
//      const fileSize = stat.size;
//      const range = req.headers.range;

//      if(range){
//          const parts = range.replace(/bytes=/, '').split('-')
//          const start = parseInt(parts[0], 10);
//          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

//          const chunksize = end - start + 1;
//          const file = fs.createReadStream(filePath, {start, end});
//          const head = {
//              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
//              'Accept-Ranges': 'bytes',
//              'Content-Length': chunksize,
//              'Content-Type': 'video/mp4'
//          };
//          res.writeHead(206, head);
//          file.pipe(res);
//      }
//      else{
//          const head = {
//              'Content-Length': fileSize,
//              'Content-Type': 'video/mp4'
//          };
//          res.writeHead(200, head);
//          fs.createReadStream(filePath).pipe(res)
//      }

//     } else {
//       console.log('File not found:', fileNameWithoutExtension);
//     }
//   });

//     // videoPath = path.join(directoryPath, file);

// };
