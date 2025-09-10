import React from "react";
import CsvUploader from "./components/CsvUploader";

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: "center", margin: "20px 0" }}>
        CSV Upload & Interactive Plot
      </h1>
      <CsvUploader />
    </div>
  );
}

export default App;
