import { useState } from "react";
import "./Tabs.scss";

const Tabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(0);
  return (
    <div className="tabs">
      <ul className="tabs-menu tabs-col--1">
        {tabs.map((tab, index) => (
          <li
            key={index}
            className={`tabs-menu__item ${index === activeTab ? "active" : ""}`}
            onClick={() => setActiveTab(index)}
          >
            <tab.icon />
            <span className="account-menu__title">{tab.label}</span>
          </li>
        ))}
      </ul>
      <div className="tab-content tabs-col--2">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Tabs;
