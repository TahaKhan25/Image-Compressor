import { useState, useRef } from "react";

function formatBytes(bytes: number): string {
  const sizes = ["Bytes", "KB", "MB"];
  if (bytes === 0) return "0 Bytes";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return value.toFixed(2) + " " + sizes[i];
}

export default function MultipleImageCompressor() {
  const [images, setImages] = useState<File[]>([]);
  const [imageData, setImageData] = useState<
    {
      originalUrl: string;
      compressedUrl: string | null;
      name: string;
      originalSize: number;
      compressedSize: number | null;
    }[]
  >([]);
  const [compressionLevel, setCompressionLevel] = useState<number>(60);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);

      const previews = files.map((file) => {
        return new Promise<{
          originalUrl: string;
          compressedUrl: null;
          name: string;
          originalSize: number;
          compressedSize: null;
        }>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
            resolve({
              originalUrl: event.target?.result as string,
              compressedUrl: null,
              name: file.name,
              originalSize: file.size,
              compressedSize: null,
            });
          };
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previews).then((data) => {
        setImageData(data);
        setImages(files);
      });
    }
  };

  const handleCompress = () => {
    const compressions = imageData.map((item) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = item.originalUrl;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          const scaleFactor = 1 - compressionLevel / 100;
          canvas.width = img.width * (1 - scaleFactor * 0.8);
          canvas.height = img.height * (1 - scaleFactor * 0.8);

          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

          const quality = 1 - compressionLevel / 100;
          const compressedData = canvas.toDataURL("image/jpeg", quality);
          const base64Length = compressedData.split(",")[1].length;
          const compressedBytes = Math.ceil((base64Length * 3) / 4);

          resolve({
            ...item,
            compressedUrl: compressedData,
            compressedSize: compressedBytes,
          });
        };
      });
    });

    Promise.all(compressions).then((results) => {
      setImageData(results as any);
    });
  };

  const handleReset = () => {
    setImages([]);
    setImageData([]);
    setCompressionLevel(60);
  };

  const removeImage = (index: number) => {
    const updatedImages = [...images];
    const updatedImageData = [...imageData];
    updatedImages.splice(index, 1);
    updatedImageData.splice(index, 1);
    setImages(updatedImages);
    setImageData(updatedImageData);
  };

  return (
    <>
      <div className="upload-area" onClick={() => fileInputRef.current?.click()}>
        <input
          type="file"
          multiple
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFiles}
        />
        <div className="upload-instructions">
          <p>Click to select multiple images</p>
          <p className="hint">Supports JPEG and PNG — Max 10MB each</p>
        </div>
      </div>

      <p className="tip-text">
        💡 <strong>Tip:</strong> Compression level <strong>40–60%</strong> gives a good balance of quality & size.
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
          <button className="compress-btn" onClick={handleCompress} disabled={images.length === 0}>
            Compress All
          </button>
          <button className="reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <div className="image-preview">
        <div className="preview-section">
          {imageData.map((img, idx) => (
            <div className="preview-box" key={idx}>
              <button className="remove-btn" onClick={() => removeImage(idx)}>
                ❌
              </button>
              <h3>{img.name}</h3>
              <img src={img.originalUrl} alt="Original preview" />
              <p>Original: {formatBytes(img.originalSize)}</p>

              {img.compressedUrl && (
                <>
                  <img src={img.compressedUrl} alt="Compressed preview" />
                  <p>Compressed: {formatBytes(img.compressedSize || 0)}</p>
                  <a
                    href={img.compressedUrl}
                    download={`${img.name.split(".")[0]}-compressed.jpg`}
                  >
                    Download
                  </a>
                </>
              )}
            </div>
          ))}
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
