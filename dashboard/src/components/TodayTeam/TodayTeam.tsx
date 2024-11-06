import "./TodayTeam.scss";
import todayTeamData from "../../data/todayTeamData.json";

const API_URL = "http://localhost:5173";
const TodayTeam = () => {
  return (
    <div className="team-members">
      <h3 className="team-member__heading">Available Team</h3>
      <ul className="team-member__list">
        {todayTeamData?.map((teamMember, index) => {
          console.log(`${API_URL}/assets/images/${teamMember.avatar}`);

          return (
            <li className="team-member__item" key={index}>
              <div className="team-member__detail team-member__avatar">
                <img
                  src={`${API_URL}/src/assets/images/${teamMember.avatar}`}
                  alt="team member avatar"
                />
              </div>
              <span className="team-member__detail">{teamMember.name}</span>
              <span className="team-member__detail">{teamMember.role}</span>
              <span className="team-member__detail team-member__detail--status">
                {teamMember.status}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TodayTeam;
