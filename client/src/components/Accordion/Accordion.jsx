import { useState } from "react";
import "./Accordion.scss";

const AccordionItem = ({ faq, isActive, onToggle }) => (
  <div className={`accordion-item ${isActive ? "accordion-item--active" : ""}`}>
    <button className="accordion-header" onClick={onToggle}>
      <h3 className="accordion-header__question">{faq.question}</h3>
      <span className="accordion-header__icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`accordion-chevron ${
            isActive ? "accordion-chevron--open" : ""
          }`}
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </button>
    <div
      className={`accordion-body ${isActive ? "accordion-body--active" : ""}`}
    >
      <p className="accordion-body__text">{faq.answer}</p>
    </div>
  </div>
);

const Accordion = ({ items }) => {
  const [activeId, setActiveId] = useState(null);

  return (
    <div className="accordion">
      {items.map((faq) => (
        <AccordionItem
          key={faq.id}
          faq={faq}
          isActive={activeId === faq.id}
          onToggle={() => setActiveId(activeId === faq.id ? null : faq.id)}
        />
      ))}
    </div>
  );
};

export default Accordion;
