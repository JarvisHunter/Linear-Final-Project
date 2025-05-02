import { useState } from "react";
import "./Compress.css"; // Optional: for styling consistency

const HelpModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button className="btn btn-secondary" onClick={() => setIsOpen(true)}>
        Help
      </button>

      {isOpen && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              <h5>How Compression Works</h5>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Image Compression</strong> reduces file size by removing
                redundant data. This helps with faster downloads, uploads, and
                storage.
              </p>
              <p>
                <strong>Singular Value Decomposition (SVD)</strong> is a linear
                algebra technique that breaks an image matrix into 3 parts — by
                keeping only the largest values (largest "singular values"), we
                can reconstruct a close approximation with far less data.
              </p>
              <p>
                Adjusting the <code>k</code> value (from the slider) changes how
                many singular values we use — lower = more compressed, but lower
                quality.
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => setIsOpen(false)}
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpModal;
