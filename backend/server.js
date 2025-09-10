// backend/server.js
import express from "express";
import multer from "multer";
import csv from "csv-parser";
import fs from "fs";
import cors from "cors";

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(cors());

app.post("/upload", upload.single("file"), (req, res) => {
  const results = {};
  const time = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on("data", (row) => {
      if (row.time) time.push(row.time); // assumes a "time" column
      Object.keys(row).forEach((key) => {
        if (!results[key]) results[key] = [];
        results[key].push(row[key]);
      });
    })
    .on("end", () => {
      results["time"] = time;
      res.json(results);
      fs.unlinkSync(req.file.path); // delete temp file
    });
});

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));