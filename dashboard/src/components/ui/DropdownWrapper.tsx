import { useEffect, useRef } from "react";

interface DropdownWrapperProps {
  isOpen: boolean;
  onToggle: () => void;
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const DropdownWrapper: React.FC<DropdownWrapperProps> = ({
  isOpen,
  onToggle,
  trigger,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        if (isOpen) onToggle();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onToggle]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={onToggle} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute  top-[130%] right-0 z-50  bg-white shadow-md rounded-md p-1">
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownWrapper;
