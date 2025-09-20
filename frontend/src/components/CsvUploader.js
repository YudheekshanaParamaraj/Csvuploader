import React, { useState, useEffect } from "react";
import Plot from "react-plotly.js";
import "./../App.css"; // Import global styles

export default function CsvUploader() {
  const [data, setData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [refreshData, setRefreshData] = useState(false);
  const [yColumn, setYColumn] = useState(null); // selected Y column

  // Handle file selection
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  // Handle upload when button is clicked
  const handleUploadClick = async () => {
    if (!selectedFile) {
      alert("Please select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setRefreshData(true); // trigger fetch
    } catch (err) {
      console.error(err);
      alert("Failed to upload file. Please check backend is running.");
    }
  };

  // Fetch data after upload
  useEffect(() => {
    if (!refreshData) return;

    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/data");
        if (!res.ok) throw new Error("Failed to fetch data");
        const jsonData = await res.json();
        console.log("Fetched CSV:", jsonData);
        setData(jsonData);
        const keys = Object.keys(jsonData);
        if (keys.length > 1) {
          setYColumn(keys[1]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setRefreshData(false);
      }
    };

    fetchData();
  }, [refreshData]);

  return (
    <div className="uploader-container">
      <h1>CSV Upload & Interactive Plot</h1>

      {/* File Input */}
      <input type="file" accept=".csv" onChange={handleFileChange} />

      {/* Upload Button */}
      <button className="upload-btn" onClick={handleUploadClick}>
        Upload CSV
      </button>

      {/* Plot with dropdown */}
      {data && (() => {
        const keys = Object.keys(data);
        if (keys.length < 2) return <p>No data to plot</p>;

        const xKey = keys[0]; // first column = X
        const yKeys = keys.slice(1); // other columns = possible Y options

        return (
          <div className="plot-container">
            {/* Dropdown for selecting Y axis */}
            <div style={{ margin: "10px 0" }}>
              <label htmlFor="yColumn" style={{ marginRight: "10px" }}>
                Select Y-Axis Column:
              </label>
              <select
                id="yColumn"
                value={yColumn || ""}
                onChange={(e) => setYColumn(e.target.value)}
              >
                {yKeys.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>

            {/* Plot */}
            {yColumn && (
              <Plot
                data={[
                  {
                    x: data[xKey],
                    y: data[yColumn],
                    type: "scatter",
                    mode: "lines+markers",
                    name: yColumn,
                  },
                ]}
                layout={{
                  title: `Plot of ${yColumn} vs ${xKey}`,
                  xaxis: { title: xKey, rangeslider: { visible: true } },
                  yaxis: { title: yColumn },
                }}
                config={{ responsive: true }}
                style={{ width: "100%", height: "500px" }}
              />
            )}
          </div>
        );
      })()}
    </div>
  );
}
