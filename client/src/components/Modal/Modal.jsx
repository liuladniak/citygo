import { useEffect } from "react";
import "./Modal.scss";
import iconClose from "../../assets/icons/close.svg";

const Modal = ({ isOpen, onClose, children, className = "" }) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (event.target.classList.contains("modal-overlay")) {
        onClose();
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <button
        type="button"
        className="modal-close"
        onClick={onClose}
        aria-label="Close"
      >
        <img src={iconClose} alt="" />
      </button>
      <div className={`modal-content ${className}`}>{children}</div>
    </div>
  );
};

export default Modal;
