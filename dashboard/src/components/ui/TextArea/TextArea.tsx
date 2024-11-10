import "./TextArea.scss";

interface TextAreaProps {
  placeholder: string;
  className?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const TextArea: React.FC<TextAreaProps> = ({
  placeholder,
  value,
  onChange,
  className = "",
}) => {
  return (
    <div className="textarea-wrp">
      <textarea
        placeholder={placeholder}
        className={`textarea ${className}`}
        value={value}
        onChange={onChange}
      ></textarea>
    </div>
  );
};

export default TextArea;
