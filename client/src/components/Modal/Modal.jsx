import { useEffect } from "react";
import "./Modal.scss";
import iconClose from "../../assets/icons/close.svg";

const Modal = ({ isOpen, onClose, children, className }) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && event.target.classList.contains("modal-overlay")) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-close" onClick={onClose}>
        <img src={iconClose} alt="icon close" />
      </div>
      <div className={`modal-content ${className}`}>{children}</div>
    </div>
  );
};

export default Modal;
