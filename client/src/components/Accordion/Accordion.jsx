import { useState } from "react";
import "./Accordion.scss";

const AccordionItem = ({ faq, isActive, onToggle }) => (
  <div className="accordion-item">
    <div className="accordion-header" onClick={onToggle}>
      <h3>{faq.question}</h3>
      <span>{isActive ? "-" : "+"}</span>
    </div>
    <div
      className={`accordion-body ${isActive ? "accordion-body--active" : ""}`}
    >
      {faq.answer}
    </div>
  </div>
);

const Accordion = ({ items }) => {
  const [activeId, setActiveId] = useState(null);

  const handleToggle = (id) => {
    setActiveId(activeId === id ? null : id);
  };
  return (
    <div className="accordion">
      {items.map((faq) => (
        <AccordionItem
          key={faq.id}
          faq={faq}
          isActive={activeId === faq.id}
          onToggle={() => handleToggle(faq.id)}
        />
      ))}
    </div>
  );
};

export default Accordion;
