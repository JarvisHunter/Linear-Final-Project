import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import "./Compress.css";

const Compress = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [quality, setQuality] = useState<number>(50);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      setCompressedFile(null);
      setDimensions(null);

      const img = new Image();
      img.onload = () => {
        setDimensions({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleCompress = async () => {
    if (!originalFile) return;

    const options = {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      initialQuality: quality / 100,
    };

    try {
      const result = await imageCompression(originalFile, options);
      setCompressedFile(result);
    } catch (err) {
      console.error("Compression failed:", err);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const a = document.createElement("a");
    a.href = url;
    a.download = `compressed_${compressedFile.name}`;
    a.click();
  };

  const formatBytes = (bytes: number): string => {
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const getSizeReduction = () => {
    if (!originalFile || !compressedFile) return null;
    const reduction =
      ((originalFile.size - compressedFile.size) / originalFile.size) * 100;
    return `${reduction.toFixed(2)}%`;
  };

  return (
    <div className="mainContainer">
      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {/* Upload + Delete Buttons */}
      <div className="button-container gap-3">
        <button className="btn btn-primary" onClick={handleUploadClick}>
          Upload Image
        </button>

        <button
          className="btn btn-danger"
          onClick={() => {
            if (originalFile) {
              const confirmDelete = window.confirm(
                "Delete the uploaded image?"
              );
              if (confirmDelete) {
                setOriginalFile(null);
                setCompressedFile(null);
                setDimensions(null);
              }
            }
          }}
          disabled={!originalFile}
        >
          Delete Image
        </button>
      </div>

      {/* Image Preview */}
      {originalFile && (
        <div className="uploadCard my-4">
          <p className="text-muted">{originalFile.name}</p>
          <p className="text-muted">
            Size: {formatBytes(originalFile.size)}{" "}
            {dimensions &&
              `| Dimensions: ${dimensions.width} x ${dimensions.height}`}
          </p>
        </div>
      )}

      {/* Compression Quality Slider */}
      {originalFile && (
        <div className="my-4">
          <label htmlFor="qualitySlider" className="form-label">
            Compression Quality: <strong>{quality}</strong>%
          </label>
          <input
            type="range"
            className="form-range"
            id="qualitySlider"
            min="10"
            max="100"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </div>
      )}

      {/* Compress Button */}
      {originalFile && (
        <div className="button-container">
          <button className="btn btn-success" onClick={handleCompress}>
            Compress Image
          </button>
        </div>
      )}

      {/* Display both images side by side */}
      {originalFile && compressedFile && (
        <>
          <div className="d-flex justify-content-center gap-5 flex-wrap my-4">
            <div className="text-center">
              <h5>Original</h5>
              <img
                src={URL.createObjectURL(originalFile)}
                alt="Original"
                className="image"
              />
              <p className="text-muted">{formatBytes(originalFile.size)}</p>
            </div>
            <div className="text-center">
              <h5>Compressed</h5>
              <img
                src={URL.createObjectURL(compressedFile)}
                alt="Compressed"
                className="image"
              />
              <p className="text-muted">{formatBytes(compressedFile.size)}</p>
              <button className="btn download-btn" onClick={handleDownload}>
                Download Compressed Image
              </button>
            </div>
          </div>

          {/* 📉 Size Reduction Message */}
          <div className="compressed-message">
            Size reduced by <strong>{getSizeReduction()}</strong>
          </div>
        </>
      )}
    </div>
  );
};

export default Compress;
