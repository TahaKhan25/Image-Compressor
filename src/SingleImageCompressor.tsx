import { useState, useRef } from "react";
import "./App.css"; // Spinner CSS included here

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return value.toFixed(2) + " " + sizes[i];
}

export default function SingleImageCompressor() {
  const [original, setOriginal] = useState<string | null>(null);
  const [originalImageObj, setOriginalImageObj] = useState<HTMLImageElement | null>(null);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [compressedSize, setCompressedSize] = useState<number | null>(null);
  const [compressionLevel, setCompressionLevel] = useState<number>(60);
  const [originalFileName, setOriginalFileName] = useState<string>("compressed");
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    setOriginalFileName(file.name.split(".")[0]);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        setOriginal(img.src);
        setOriginalImageObj(img);
      };
    };

    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setOriginalSize(file.size);
      setOriginalFileName(file.name.split(".")[0]);

      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          setOriginal(img.src);
          setOriginalImageObj(img);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompress = () => {
    if (!originalImageObj) return;

    setIsCompressing(true);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const scaleFactor = 1 - compressionLevel / 100;
    canvas.width = originalImageObj.width * (1 - scaleFactor * 0.8);
    canvas.height = originalImageObj.height * (1 - scaleFactor * 0.8);

    ctx?.drawImage(originalImageObj, 0, 0, canvas.width, canvas.height);

    const quality = 1 - compressionLevel / 100;
    const compressedData = canvas.toDataURL("image/jpeg", quality);
    const base64Length = compressedData.split(",")[1].length;
    const compressedBytes = Math.ceil((base64Length * 3) / 4);

    setCompressed(compressedData);
    setCompressedSize(compressedBytes);
    setIsCompressing(false);
  };

  const handleReset = () => {
    setOriginal(null);
    setOriginalImageObj(null);
    setCompressed(null);
    setOriginalSize(null);
    setCompressedSize(null);
    setCompressionLevel(60);
    setOriginalFileName("compressed");
  };

  return (
    <>
      <div
        className="upload-area"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImage}
        />
        <div className="upload-instructions">
          <p>Click or drag & drop to upload an image</p>
          <p className="hint">Supports JPEG and PNG — Max 10MB</p>
        </div>
      </div>

      <p className="tip-text">
        💡 <strong>Tip:</strong> For a good balance between quality and size, a compression level of{" "}
        <strong>40–60%</strong> is recommended.
      </p>

      <div className="controls-panel">
        <label htmlFor="compression-slider">Compression Level: {compressionLevel}%</label>
        <input
          id="compression-slider"
          type="range"
          min={0}
          max={100}
          value={compressionLevel}
          onChange={(e) => setCompressionLevel(Number(e.target.value))}
        />
        <div className="btn-group">
          <button
            className="compress-btn"
            onClick={handleCompress}
            disabled={!originalImageObj || isCompressing}
          >
            {isCompressing ? <div className="loader"></div> : "Compress Image"}
          </button>
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="image-preview">
        <div className="preview-section">
          {original && (
            <div className="preview-box">
              <h3>Original</h3>
              <img src={original} alt="Original preview" />
              <p>Size: {formatBytes(originalSize || 0)}</p>
              <p>Dimensions: {originalImageObj?.width}x{originalImageObj?.height}</p>
            </div>
          )}

          {compressed && (
            <div className="preview-box">
              <h3>Compressed</h3>
              <img src={compressed} alt="Compressed preview" />
              <p>Size: {formatBytes(compressedSize || 0)}</p>
              <a href={compressed} download={`${originalFileName}-compressed.jpg`}>
                Download
              </a>
            </div>
          )}
        </div>
      </div>

      <section className="features">
        <div className="feature-card">
          <h4>Perfect Quality</h4>
          <p>Retain image quality while drastically reducing file size.</p>
        </div>
        <div className="feature-card">
          <h4>Fast Compression</h4>
          <p>Compress images in seconds directly in your browser.</p>
        </div>
        <div className="feature-card">
          <h4>Secure & Private</h4>
          <p>Images never leave your device. Compression happens locally.</p>
        </div>
        <div className="feature-card">
          <h4>Custom Compression Scale</h4>
          <p>Adjust compression strength to suit your quality needs.</p>
        </div>
        <div className="feature-card">
          <h4>No Limits</h4>
          <p>Compress as many images as you like for free.</p>
        </div>
        <div className="feature-card">
          <h4>Download Easily</h4>
          <p>One-click download for your compressed images.</p>
        </div>
      </section>
    </>
  );
}
