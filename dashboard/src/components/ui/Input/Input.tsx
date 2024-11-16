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
    <div className="grow w-full max-w-sm min-w-[200px]">
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow ${className}`}
        value={value}
        onChange={onChange}
        step={step}
      />
    </div>
  );
};

export default Input;
