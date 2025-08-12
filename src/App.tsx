import { useState } from "react";
import "./App.css";
import SingleImageCompressor from "./SingleImageCompressor";
import MultipleImageCompressor from "./MultipleImageCompressor";


function App() {
  
  const [mode, setMode] = useState<"single" | "multiple">("single");
  

  return (
    <div className="site-container">
      <header>
        <div className="logo-container">
          <img src="/public/logo.png" alt="logo" className="logo" />
          
        </div>
        <h1>📷 ImageCompressor Pro</h1>
        <p>Free and powerful image compression tool for smart file size reduction</p>
      </header>

      <div className="mode-toggle">
        <button
          className={mode === "single" ? "active" : ""}
          onClick={() => setMode("single")}
        >
          Single Image
        </button>
        <button
          className={mode === "multiple" ? "active" : ""}
          onClick={() => setMode("multiple")}
        >
          Multiple Images
        </button>
      </div>

      <main>
        {mode === "single" ? <SingleImageCompressor /> : <MultipleImageCompressor />}
      </main>

      <footer>
        <p>© {new Date().getFullYear()} ImageCompressor Pro. Built by Taha Khan</p>
      </footer>
    </div>
  );
}
export default App;