interface ImageProps {
  file: File;
}

const Image = ({ file }: ImageProps) => {
  const imageUrl = URL.createObjectURL(file);

  return (
    <div className="my-3 text-center">
      <img
        src={imageUrl}
        alt={file.name}
        className="img-fluid rounded shadow"
        style={{ maxHeight: "400px", objectFit: "contain" }}
      />
      <p className="mt-2 text-muted">{file.name}</p>
    </div>
  );
};

export default Image;
