import "./Input.scss";

interface InputProps {
  type: string;
  placeholder: string;
  className?: string;
  step?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,
  step,
  className = "",
}) => {
  return (
    <div className="input-wrp">
      <input
        type={type}
        placeholder={placeholder}
        className={`input ${className}`}
        value={value}
        onChange={onChange}
        step={step}
      />
    </div>
  );
};

export default Input;
