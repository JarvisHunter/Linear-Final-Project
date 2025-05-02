import { useState } from "react";

const Slider = () => {
  const [value, setValue] = useState(50); // Initial value

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(event.target.value));
  };

  return (
    <>
      <label className="form-label" htmlFor="customRange1">
        k = <strong>{value}</strong>
      </label>
      <div className="range" data-mdb-range-init>
        <input
          type="range"
          className="form-range"
          id="customRange1"
          min="1"
          max="100"
          value={value}
          onChange={handleChange}
        />
      </div>
    </>
  );
};

export default Slider;
