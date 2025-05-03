import { useRef, useState } from "react";
import { SVD } from "svd-js";
import "./Compress.css";

const Compress = () => {
  const [originalFile, setOriginalFile]       = useState<File | null>(null);
  const [compressedUrl, setCompressedUrl]     = useState<string | null>(null);
  const [k, setK]                             = useState<number>(50);
  const [maxK, setMaxK]                       = useState<number>(100);
  const [originalPixels, setOriginalPixels]   = useState<number | null>(null);
  const [compressedPixels, setCompressedPixels] = useState<number | null>(null);
  const [storedK, setStoredK] = useState<number | null>(null);
  const [storedDims, setStoredDims] = useState<{ m: number, n: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const askFile      = () => fileInputRef.current?.click();

  /* ------------ pick file ------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setOriginalFile(file);
    setCompressedUrl(null);
    setOriginalPixels(null);
    setCompressedPixels(null);
    setMaxK(100);
    setK(50);
  };

  /* ------------ compress -------------- */
  const handleCompress = async () => {
    if (!originalFile) return;

    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        /* --------- scale for SVD speed ---------- */
        const maxSize = 512;
        let targetW = img.width;
        let targetH = img.height;

        if (targetW > maxSize || targetH > maxSize) {
          if (targetW >= targetH) {
            targetH = Math.round((img.height / img.width) * maxSize);
            targetW = maxSize;
          } else {
            targetW = Math.round((img.width / img.height) * maxSize);
            targetH = maxSize;
          }
        }

        setOriginalPixels(3 * targetW * targetH); // or img.width × img.height if you prefer full-res

        const m = targetH;
        const n = targetW;
        const finalK = Math.min(k, maxK);

        setStoredK(finalK);
        setStoredDims({ m, n });

        setCompressedPixels(3 * finalK * (m + n + 1)); // 3 channels

        /* --------- work canvas ---------- */
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(img, 0, 0, targetW, targetH);
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const pixels = imageData.data;

        /* --------- SVD per channel ------ */
        for (let c = 0; c < 3; c++) {
          const needsTranspose = targetH < targetW;
          const matrix: number[][] = [];

          if (needsTranspose) {
            for (let x = 0; x < targetW; x++) {
              const row: number[] = [];
              for (let y = 0; y < targetH; y++)
                row.push(pixels[(y * targetW + x) * 4 + c]);
              matrix.push(row);
            }
          } else {
            for (let y = 0; y < targetH; y++) {
              const row: number[] = [];
              for (let x = 0; x < targetW; x++)
                row.push(pixels[(y * targetW + x) * 4 + c]);
              matrix.push(row);
            }
          }

          const { u, q, v } = SVD(matrix);
          const cap = Math.min(maxK, q.length);
          // if (cap < maxK) setMaxK(cap);               // shrink slider limit if needed

          if (needsTranspose) {
            for (let y = 0; y < targetH; y++)
              for (let x = 0; x < targetW; x++) {
                let val = 0;
                for (let t = 0; t < Math.min(k, q.length); t++)
                  val += v[y][t] * q[t] * u[x][t];
                pixels[(y * targetW + x) * 4 + c] = clamp(val);
              }
          } else 
          {
            for (let y = 0; y < targetH; y++)
              for (let x = 0; x < targetW; x++) {
                let val = 0;
                for (let t = 0; t < Math.min(k, q.length); t++)
                  val += u[y][t] * q[t] * v[x][t];
                pixels[(y * targetW + x) * 4 + c] = clamp(val);
              }
          }
        }
        setCompressedPixels(3 * k * (m + n + k)); // 3 channels

        ctx.putImageData(imageData, 0, 0);

        /* --------- redraw to original size so dimensions stay intact -------- */
        const full = document.createElement("canvas");
        full.width = img.width;
        full.height = img.height;
        full.getContext("2d")!.drawImage(canvas, 0, 0, img.width, img.height);

        /* --------- export (PNG keeps exact pixels, no extra loss) ----------- */
        const url = full.toDataURL("image/png");
        setCompressedUrl(url);
      };

      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(originalFile);
  };

  /* -------------- UI ------------------ */
  return (
    <div className="mainContainer">
      <input type="file" accept="image/*" ref={fileInputRef}
             style={{display:"none"}} onChange={handleFileChange} />

      <button className="btn btn-primary" onClick={askFile}>Upload Image</button>

      {originalFile && (
        <>
          <div className="my-3">
            <label>Compression Rank (k): {k}</label>
            <input type="range" min="1" max={maxK} value={k}
                   onChange={e => setK(+e.target.value)} className="form-range"/>
          </div>
          <button className="btn btn-success" onClick={handleCompress}>
            Compress Image
          </button>
        </>
      )}

      {originalFile && compressedUrl ? (
        <div className="image-comparison-container">
          <div className="image-column">
            <h5>Original Image:</h5>
            <div className="image-wrapper">
              <img src={URL.createObjectURL(originalFile)}
                   className="comparison-image" alt="original"/>
            </div>
          </div>
          <div className="image-column">
            <h5>Compressed Image (SVD):</h5>
            <div className="image-wrapper">
              <img src={compressedUrl} className="comparison-image" alt="compressed"/>
            </div>
          </div>
        </div>
      ) : (
        originalFile && (
          <div className="image-column">
            <h5>Original Image:</h5>
            <img src={URL.createObjectURL(originalFile)} className="image" alt="original"/>
          </div>
        )
      )}

      {compressedUrl && (
        <a href={compressedUrl} download="svd_compressed.png"
           className="btn btn-info mt-2">Download</a>
      )}

      {compressedUrl && originalPixels && compressedPixels && storedDims && storedK && (
        <div className="compression-stats mt-3">
          <p>🖼️ <strong>Original size:</strong> 3 x {storedDims.m} × {storedDims.n} = {originalPixels.toLocaleString()}</p>
          <p>🎨 <strong>Compressed size:</strong> 3 × {storedK} × ({storedDims.m} + {storedDims.n} + 1) = {compressedPixels.toLocaleString()}</p>
          <p>📊 <strong>Compression Ratio:</strong> {(originalPixels / compressedPixels).toFixed(2)}</p>        
        </div>
      )}
    </div>
  );
};

/* helper */
const clamp = (x: number) => (x < 0 ? 0 : x > 255 ? 255 : Math.round(x));

export default Compress;
