import { useEffect, useRef, useState } from "react";
import "./CustomSelect.scss";
import selectIconActive from "../../assets/icons/arrow-up.svg";
import selectIconDefault from "../../assets/icons/arrow-down.svg";

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Please select",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || placeholder);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (options.includes(value)) {
      setSelectedValue(value);
    } else {
      setSelectedValue(placeholder);
    }
  }, [value, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelect = (option) => {
    setSelectedValue(option);
    onChange(option);
    setIsOpen(false);
  };

  const handleReset = () => {
    setSelectedValue(placeholder);
    onChange("");
    setIsOpen(false);
  };

  return (
    <div className="select" ref={dropdownRef}>
      <div
        className={`form-input select--selected ${
          isOpen ? "input-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedValue === placeholder ? "placeholder" : ""}>
          {selectedValue}
        </span>
        <img
          className="select__icon"
          src={isOpen ? selectIconActive : selectIconDefault}
          alt="select icon"
        />
      </div>
      <ul className={`select__options ${isOpen ? "open" : ""}`}>
        <li className="select__option" onClick={handleReset}>
          {placeholder}
        </li>
        {options.map((option, index) => (
          <li
            key={index}
            className="select__option"
            onClick={() => handleSelect(option)}
          >
            {option}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CustomSelect;
