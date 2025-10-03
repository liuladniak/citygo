import { useState } from "react";

const CardWithCheckBox = (children) => {
  const [isChecked, setIsChecked] = useState(false);
  const handleCheck = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div onClick={handleCheck}>
      <input type="checkbox" checked={isChecked} />
      {children}
    </div>
  );
};

export default CardWithCheckBox;
