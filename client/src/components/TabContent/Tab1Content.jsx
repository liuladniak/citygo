import "./TabContent.scss";
import "./Tab1Content.scss";
import Button from "../Button/Button";
import axios from "axios";
import { useState } from "react";

const Tab1Content = ({ user }) => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const [isEditing, setIsEditing] = useState({
    legalName: false,
    preferred_name: false,
    email: false,
    phone_number: false,
    emergency_contact: false,
  });
  const [userData, setUserData] = useState({
    first_name: user.first_name,
    last_name: user.last_name,
    preferred_name: user.preferred_name || "",
    email: user.email,
    phone_number: user.phone_number || "",
    emergency_contact: user.emergency_contact || "",
  });

  const [successMessage, setSuccessMessage] = useState("");

  const [saveText, setSaveText] = useState("Save");
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };

  const toggleEdit = (field) => {
    setIsEditing({ ...isEditing, [field]: !isEditing[field] });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {};

    if (userData.first_name !== user.first_name)
      updatedData.first_name = userData.first_name;
    if (userData.last_name !== user.last_name)
      updatedData.last_name = userData.last_name;
    if (userData.preferred_name !== user.preferred_name)
      updatedData.preferred_name = userData.preferred_name;
    if (userData.email !== user.email) updatedData.email = userData.email;
    if (userData.phone_number !== user.phone_number)
      updatedData.phone_number = userData.phone_number;
    if (userData.emergency_contact !== user.emergency_contact)
      updatedData.emergency_contact = userData.emergency_contact;

    if (Object.keys(updatedData).length === 0) {
      console.log("No changes to update");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        console.error("No token found. Please log in.");
        return;
      }

      const response = await axios.put(`${API_URL}/auth/profile`, updatedData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Profile updated successfully:", response.data);

      setIsEditing({
        legalName: false,

        preferredName: false,

        email: false,

        phoneNumber: false,

        emergencyContact: false,
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
        error.response?.data || error.message
      );
    }
  };
  const handleCancel = (field) => {
    if (field === "legalName") {
      setUserData({
        ...userData,
        first_name: user.first_name,
        last_name: user.last_name,
      });
    } else {
      setUserData({ ...userData, [field]: user[field] });
    }
    setIsEditing({
      ...isEditing,
      [field]: false,
    });
  };

  return (
    <div className="account-col account-col--2">
      <div className="account-header">
        <h2 className="account-heading">Personal info</h2>
        <span className="account-subheading">
          Add your details for faster booking
        </span>
      </div>
      <form className="form-account" onSubmit={handleSubmit}>
        <div className="account-details">
          <div className="account-detail">
            <div className="account-detail__col">
              <h3 className="account-detail__title">Legal name</h3>
              {isEditing.legalName ? (
                <div className="account-inputs">
                  <input
                    className="field__input"
                    type="text"
                    name="first_name"
                    value={userData.first_name}
                    onChange={handleChange}
                  />
                  <input
                    className="field__input"
                    type="text"
                    name="last_name"
                    value={userData.last_name}
                    onChange={handleChange}
                  />
                </div>
              ) : (
                <span className="account-detail__content">{`${userData.first_name} ${userData.last_name}`}</span>
              )}
            </div>
            {isEditing.legalName ? (
              <Button
                className="btn--cancel account-btn--cancel"
                type="button"
                onClick={() => handleCancel("legalName")}
              >
                Cancel
              </Button>
            ) : (
              <Button
                className="btn--edit"
                onClick={() => toggleEdit("legalName")}
                type="button"
              >
                Edit
              </Button>
            )}
          </div>
          <div className="account-detail">
            <div className="account-detail__col">
              <h3 className="account-detail__title">Preferred name</h3>
              {isEditing.preferred_name ? (
                <input
                  className="field__input"
                  type="text"
                  name="preferred_name"
                  value={userData.preferred_name}
                  onChange={handleChange}
                />
              ) : (
                <span className="account-detail__content">
                  {userData.preferred_name || "Not provided"}
                </span>
              )}
            </div>
            {isEditing.preferred_name ? (
              <Button
                className="btn--cancel  account-btn--cancel"
                type="button"
                onClick={() => handleCancel("preferred_name")}
              >
                Cancel
              </Button>
            ) : (
              <Button
                className="btn--edit"
                onClick={() => toggleEdit("preferred_name")}
                type="button"
              >
                Edit
              </Button>
            )}
          </div>
          <div className="account-detail">
            <div className="account-detail__col">
              <h3 className="account-detail__title">Email</h3>
              {isEditing.email ? (
                <input
                  className="field__input"
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleChange}
                />
              ) : (
                <span className="account-detail__content">
                  {userData.email}
                </span>
              )}
            </div>
            {isEditing.email ? (
              <Button
                className="btn--cancel  account-btn--cancel"
                type="button"
                onClick={() => handleCancel("email")}
              >
                Cancel
              </Button>
            ) : (
              <Button
                className="btn--edit"
                onClick={() => toggleEdit("email")}
                type="button"
              >
                Edit
              </Button>
            )}
          </div>
          <div className="account-detail">
            <div className="account-detail__col">
              <h3 className="account-detail__title">Phone number</h3>
              {isEditing.phone_number ? (
                <input
                  className="field__input"
                  type="tel"
                  name="phone_number"
                  value={userData.phone_number}
                  onChange={handleChange}
                />
              ) : (
                <span className="account-detail__content">
                  {userData.phone_number || "Not provided"}
                </span>
              )}
            </div>
            {isEditing.phone_number ? (
              <Button
                className="btn--cancel  account-btn--cancel"
                type="button"
                onClick={() => handleCancel("phone_number")}
              >
                Cancel
              </Button>
            ) : (
              <Button
                className="btn--edit"
                onClick={() => toggleEdit("phone_number")}
                type="button"
              >
                Edit
              </Button>
            )}
          </div>
          <div className="account-detail">
            <div className="account-detail__col">
              <h3 className="account-detail__title">Emergency contact</h3>
              {isEditing.emergency_contact ? (
                <input
                  className="field__input"
                  type="tel"
                  name="emergency_contact"
                  value={userData.emergency_contact}
                  onChange={handleChange}
                />
              ) : (
                <span className="account-detail__content">
                  {userData.emergency_contact || "Not provided"}
                </span>
              )}
            </div>
            {isEditing.emergency_contact ? (
              <Button
                className="btn--cancel  account-btn--cancel"
                type="button"
                onClick={() => handleCancel("emergency_contact")}
              >
                Cancel
              </Button>
            ) : (
              <Button
                className="btn--edit"
                onClick={() => toggleEdit("emergency_contact")}
                type="button"
              >
                Edit
              </Button>
            )}
          </div>
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
