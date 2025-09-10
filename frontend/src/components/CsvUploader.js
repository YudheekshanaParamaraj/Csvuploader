import React, { useState } from "react";
import Plot from "react-plotly.js";
import "./../App.css"; // Import global styles

export default function CsvUploader() {
  const [data, setData] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const parsedData = await res.json();
      setData(parsedData);
    } catch (err) {
      console.error(err);
      alert("Failed to upload file. Please check backend is running.");
    }
  };

  return (
    <div className="uploader-container">
      <h1>CSV Upload & Interactive Plot</h1>

      <input type="file" accept=".csv" onChange={handleFileUpload} />

      <button className="upload-btn">Upload CSV</button>

      {data && (
        <div className="plot-container">
          <Plot
            data={Object.keys(data)
              .filter((k) => k !== "time")
              .map((col) => ({
                x: data.time,
                y: data[col],
                type: "scatter",
                mode: "lines",
                name: col,
              }))}
            layout={{
              title: "CSV Data Visualization",
              xaxis: { title: "Time", rangeslider: { visible: true } },
              yaxis: { title: "Values" },
            }}
            config={{ responsive: true }}
            style={{ width: "100%", height: "500px" }}
          />
        </div>
      )}
    </div>
  );
}
