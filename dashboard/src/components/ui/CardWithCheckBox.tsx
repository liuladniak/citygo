import { ReactNode } from "react";
import { useState } from "react";

type CardWithCheckBoxProps = {
  children: ReactNode;
};
const CardWithCheckBox = ({ children }: CardWithCheckBoxProps) => {
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
