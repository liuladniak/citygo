interface TextAreaProps {
  placeholder: string;
  className?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  name,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className="grow h-40">
      <textarea
        name={name}
        placeholder={placeholder}
        className={`block h-full w-full bg-transparent resize-none placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 transition duration-300 ease focus:outline-none focus:border-slate-400 hover:border-slate-300 shadow-sm focus:shadow            ${className}`}
        value={value}
        onChange={onChange}
      ></textarea>
    </div>
  );
};

export default TextArea;
