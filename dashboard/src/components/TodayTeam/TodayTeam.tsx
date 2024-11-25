import todayTeamData from "../../data/todayTeamData.json";

const TodayTeam = () => {
  const API_URL = import.meta.env.VITE_API_KEY;
  const sortedTeamMembers = todayTeamData?.sort((a, b) => {
    const roleOrder = ["Manager", "Tour Guide", "Driver"];
    return roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role);
  });

  return (
    <div className="border border-lightGray p-4 ml-4 w-full h-full">
      <h3 className="text-base mb-6">Available Team</h3>
      <ul className="text-xs flex flex-col gap-4">
        {sortedTeamMembers?.map((teamMember, index) => {
          return (
            <li
              className="w-full flex justify-between items-center"
              key={index}
            >
              <div className="overflow-hidden w-8 h-8 block rounded-full mr-4">
                <img src={teamMember.avatar} alt="w-full h-full object-cover" />
              </div>
              <span className="flex-1">{teamMember.name}</span>
              <span className="flex-1">{teamMember.role}</span>
              <span className="flex-1">{teamMember.status}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TodayTeam;
