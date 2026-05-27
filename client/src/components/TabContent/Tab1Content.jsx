import "./TabContent.scss";
import "./Tab1Content.scss";
import Button from "../Button/Button";
import ProfileField from "./ProfileField";
import axios from "axios";
import { useState } from "react";

const sanitize = (value) => value.replace(/<[^>]*>/g, "").trimStart();
const sanitizePhone = (value) =>
  value.replace(/[^\d\s+\-().]/g, "").trimStart();

const EMPTY_STRINGS = ["Not provided", "No phone number provided", ""];
const cleanField = (val) => (!val || EMPTY_STRINGS.includes(val) ? "" : val);
const isFieldEmpty = (val) => !val || EMPTY_STRINGS.includes(val);

const Tab1Content = ({ user, session }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const [isEditing, setIsEditing] = useState({
    legalName: false,
    preferred_name: false,
    email: false,
    phone_number: false,
    emergency_contact: false,
  });

  const [userData, setUserData] = useState({
    first_name: user.first_name ?? "",
    last_name: user.last_name ?? "",
    preferred_name: cleanField(user.preferred_name),
    email: user.email ?? "",
    phone_number: cleanField(user.phone_number),
    emergency_contact: cleanField(user.emergency_contact),
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [saveText, setSaveText] = useState("Save");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const isPhone = name === "phone_number" || name === "emergency_contact";
    setUserData({
      ...userData,
      [name]: isPhone ? sanitizePhone(value) : sanitize(value),
    });
  };

  const toggleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: !isEditing[field] });
  };

  const handleCancel = (field) => {
    if (field === "legalName") {
      setUserData({
        ...userData,
        first_name: user.first_name ?? "",
        last_name: user.last_name ?? "",
      });
    } else {
      setUserData({ ...userData, [field]: cleanField(user[field]) });
    }
    setIsEditing({ ...isEditing, [field]: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};
    if (userData.first_name !== (user.first_name ?? ""))
      updatedData.first_name = userData.first_name;
    if (userData.last_name !== (user.last_name ?? ""))
      updatedData.last_name = userData.last_name;
    if (userData.preferred_name !== cleanField(user.preferred_name))
      updatedData.preferred_name = userData.preferred_name;
    if (userData.email !== (user.email ?? ""))
      updatedData.email = userData.email;
    if (userData.phone_number !== cleanField(user.phone_number))
      updatedData.phone_number = userData.phone_number;
    if (userData.emergency_contact !== cleanField(user.emergency_contact))
      updatedData.emergency_contact = userData.emergency_contact;

    if (Object.keys(updatedData).length === 0) return;

    try {
      const token = session?.access_token;
      if (!token) return;

      const response = await axios.put(`${API_URL}/auth/profile`, updatedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("Profile updated:", response.data);

      setIsEditing({
        legalName: false,
        preferred_name: false,
        email: false,
        phone_number: false,
        emergency_contact: false,
      });

      Object.keys(updatedData).forEach((key) => {
        user[key] = updatedData[key];
      });

      setSuccessMessage("Profile updated successfully!");
      setSaveText("Saved");
      setTimeout(() => {
        setSaveText("Save");
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.error(
        "Error updating profile:",
        error.response?.data || error.message,
      );
    }
  };

  return (
    <div className="tab-content tabs-col--2">
      <div className="account-header">
        <h2 className="account-heading">Personal info</h2>
        <span className="account-subheading">
          Add your details for faster booking
        </span>
      </div>

      <form className="form-account" onSubmit={handleSubmit}>
        <div className="account-details">
          <ProfileField
            label="Legal name"
            isEditing={isEditing.legalName}
            onEdit={() => toggleEdit("legalName")}
            onCancel={() => handleCancel("legalName")}
          >
            <div className="field-group">
              <label className="field__label">First name</label>
              <input
                className="field__input"
                type="text"
                name="first_name"
                value={userData.first_name}
                onChange={handleChange}
                readOnly={!isEditing.legalName}
                placeholder="First name"
              />
            </div>
            <div className="field-group">
              <label className="field__label">Last name</label>
              <input
                className="field__input"
                type="text"
                name="last_name"
                value={userData.last_name}
                onChange={handleChange}
                readOnly={!isEditing.legalName}
                placeholder="Last name"
              />
            </div>
          </ProfileField>

          <ProfileField
            label="Preferred name"
            isEditing={isEditing.preferred_name}
            onEdit={() => toggleEdit("preferred_name")}
            onCancel={() => handleCancel("preferred_name")}
          >
            <div className="field-group">
              <input
                className="field__input"
                type="text"
                name="preferred_name"
                value={userData.preferred_name}
                onChange={handleChange}
                readOnly={!isEditing.preferred_name}
                placeholder={
                  isFieldEmpty(userData.preferred_name) ? "Not provided" : ""
                }
              />
            </div>
          </ProfileField>

          <ProfileField
            label="Email"
            isEditing={isEditing.email}
            onEdit={() => toggleEdit("email")}
            onCancel={() => handleCancel("email")}
          >
            <div className="field-group">
              <input
                className="field__input"
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                readOnly={!isEditing.email}
                placeholder="Email address"
              />
            </div>
          </ProfileField>

          <ProfileField
            label="Phone number"
            isEditing={isEditing.phone_number}
            onEdit={() => toggleEdit("phone_number")}
            onCancel={() => handleCancel("phone_number")}
          >
            <div className="field-group">
              <input
                className="field__input"
                type="tel"
                name="phone_number"
                value={userData.phone_number}
                onChange={handleChange}
                readOnly={!isEditing.phone_number}
                placeholder={
                  isFieldEmpty(userData.phone_number)
                    ? "Not provided"
                    : "e.g. +1 555 000 0000"
                }
              />
            </div>
          </ProfileField>

          <ProfileField
            label="Emergency contact"
            isEditing={isEditing.emergency_contact}
            onEdit={() => toggleEdit("emergency_contact")}
            onCancel={() => handleCancel("emergency_contact")}
          >
            <div className="field-group">
              <input
                className="field__input"
                type="tel"
                name="emergency_contact"
                value={userData.emergency_contact}
                onChange={handleChange}
                readOnly={!isEditing.emergency_contact}
                placeholder={
                  isFieldEmpty(userData.emergency_contact)
                    ? "Not provided"
                    : "e.g. +1 555 000 0000"
                }
              />
            </div>
          </ProfileField>
        </div>

        <div className="account-actions">
          <Button type="submit" className="btn--save">
            {saveText}
          </Button>
        </div>

        {successMessage && <p className="success-message">{successMessage}</p>}
      </form>
    </div>
  );
};

export default Tab1Content;
