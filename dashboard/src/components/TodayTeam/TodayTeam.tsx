import "./TodayTeam.scss";
import todayTeamData from "../../data/todayTeamData.json";

const TodayTeam = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const sortedTeamMembers = todayTeamData?.sort((a, b) => {
    const roleOrder = ["Manager", "Tour Guide", "Driver"];
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  return (
    <div className="team-members">
      <h3 className="team-member__heading">Available Team</h3>
      <ul className="team-member__list">
        {sortedTeamMembers?.map((teamMember, index) => {
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
