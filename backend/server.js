import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

let lastUploadedData = null;

app.post("/upload", upload.single("file"), (req, res) => {
  const results = {};
  const time = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      if (row.time) time.push(isNaN(row.time) ? row.time : Number(row.time));

      Object.keys(row).forEach((key) => {
        if (!results[key]) results[key] = [];
        const value = isNaN(row[key]) ? row[key] : Number(row[key]);
        results[key].push(value);
      });
    })
    .on("end", () => {
      results["time"] = time;
      lastUploadedData = results; // store globally
      res.json({ message: "Upload successful" });
      fs.unlinkSync(req.file.path);
    });
});

// New endpoint to fetch last uploaded data

app.get("/data", (req, res) => {
  if (!lastUploadedData) {
    return res.status(404).json({ error: "No data available" });
  }
  res.json(lastUploadedData);
});

// app.post("/upload", upload.single("file"), (req, res) => {
//   const results = {};
//   const time = [];

//   fs.createReadStream(req.file.path)
//     .pipe(csv())
//     .on("data", (row) => {
//       if (row.time) time.push(row.time);

//       Object.keys(row).forEach((key) => {
//         if (!results[key]) results[key] = [];
//         // Convert numeric values to numbers
//         const value = isNaN(row[key]) ? row[key] : Number(row[key]);
//         results[key].push(value);
//       });
//     })
//     .on("end", () => {
//       results["time"] = time;
//       res.json(results);
//       fs.unlinkSync(req.file.path);
//     });
// });

app.listen(5000, () =>
  console.log("✅ Server running on http://localhost:5000")
);
