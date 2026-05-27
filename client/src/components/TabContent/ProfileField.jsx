import "./TabContent.scss";

const EditButton = ({ onClick }) => (
  <button className="account-detail__btn" type="button" onClick={onClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
    <span>Edit</span>
  </button>
);

const CancelButton = ({ onClick }) => (
  <button className="account-detail__btn" type="button" onClick={onClick}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
    <span>Cancel</span>
  </button>
);

const ProfileField = ({ label, isEditing, onEdit, onCancel, children }) => {
  return (
    <div className={`account-detail${isEditing ? " is-editing" : ""}`}>
      <h3 className="account-detail__title">{label}</h3>
      <div className="account-detail__action">
        {isEditing ? (
          <CancelButton onClick={onCancel} />
        ) : (
          <EditButton onClick={onEdit} />
        )}
      </div>
      <div className="account-detail__always-row">{children}</div>
    </div>
  );
};

export default ProfileField;
