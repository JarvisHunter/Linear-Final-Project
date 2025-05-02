import { useRef } from "react";

const Button = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete the image?"
    );
    if (confirmed) {
      alert("Image deleted (placeholder action)");
    }
  };

  return (
    <div className="d-flex gap-3 my-4">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={(e) => {
          if (e.target.files?.length) {
            alert(`Image selected: ${e.target.files[0].name}`);
          }
        }}
      />

      <button
        type="button"
        className="btn btn-primary"
        onClick={handleAddImage}
      >
        Add Image <span className="badge text-bg-secondary">+</span>
      </button>

      <button
        type="button"
        className="btn btn-danger"
        onClick={handleDeleteImage}
      >
        Delete Image <span className="badge text-bg-secondary">×</span>
      </button>
    </div>
  );
};

export default Button;
