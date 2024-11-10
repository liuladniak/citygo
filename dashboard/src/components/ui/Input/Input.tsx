import "./Input.scss";

interface InputProps {
  type: string;
  placeholder: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  value,
  onChange,
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
      />
    </div>
  );
};

export default Input;
