import "./SelectInput.scss";

interface SelectProps {
  options: string[];
  placeholder?: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectInput: React.FC<SelectProps> = ({
  options,
  placeholder,
  className = "",
  value,
  onChange,
}) => {
  return (
    <div className={`select-input ${className}`}>
      <select
        value={value || ""}
        onChange={onChange}
        name="category"
        id="category"
        className="select-input__select"
      >
        {placeholder && !value && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SelectInput;
