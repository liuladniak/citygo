import { useEffect, useRef, useState } from "react";
import "./CustomSelect.scss";
import selectIconActive from "../../assets/icons/arrow-up.svg";
import selectIconDefault from "../../assets/icons/arrow-down.svg";

function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Please select",
  hidePlaceholder = false,
  className = "",
  optionsClassName = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(
    value || (hidePlaceholder ? options[0] : placeholder)
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (options.includes(value)) {
      setSelectedValue(value);
    } else {
      setSelectedValue(hidePlaceholder ? options[0] : placeholder);
    }
  }, [value, options, placeholder, hidePlaceholder]);

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
    setSelectedValue(hidePlaceholder ? options[0] : placeholder);
    onChange(null);
    setIsOpen(false);
  };

  return (
    <div className="select" ref={dropdownRef}>
      <div
        className={`form-input select--selected ${className} ${
          isOpen ? "input-active" : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedValue === placeholder ? "placeholder" : ""}>
          {/* {selectedValue} */}
          {typeof selectedValue === "object" && selectedValue !== null
            ? selectedValue.label
            : selectedValue}
        </span>
        <img
          className="select__icon"
          src={isOpen ? selectIconActive : selectIconDefault}
          alt="select icon"
        />
      </div>
      <ul
        className={`select__options ${optionsClassName} ${
          isOpen ? "open" : ""
        }`}
      >
        {!hidePlaceholder && (
          <li className="select__option" onClick={handleReset}>
            {placeholder}
          </li>
        )}
        {options.map((option, index) => {
          console.log("option for time slot", option.label);
          return (
            <li
              key={index}
              className="select__option"
              onClick={() => handleSelect(option)}
            >
              {/* {option} */}
              {typeof option === "object" && option !== null
                ? option.label
                : option}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default CustomSelect;
