import React from "react";
import Icon from "../ui/SVGIcons/Icon";
import { circleFullPath, groupIconPath } from "../ui/SVGIcons/iconPaths";

const TeamMembersArray = [
  {
    name: "Sarah Johnson",
    initials: "SJ",
    position: "Senior Guide",
    availability: "online",
  },
  {
    name: "Mike Chen",
    initials: "MC",
    position: "Travel Agent",
    availability: "online",
  },
  {
    name: "Emma Wilson",
    initials: "EW",
    position: "Support Staff",
    availability: "busy",
  },
  {
    name: "David Park",
    initials: "DP",
    position: "Finance",
    availability: "online",
  },
  {
    name: "Lisa Rodriguez",
    initials: "LR",
    position: "Tour Guide",
    availability: "offline",
  },
  {
    name: "Tom Anderson",
    initials: "TA",
    position: "Support Staff",
    availability: "online",
  },
];

const getAvailabilityStatus = (availability) => {
  switch (availability) {
    case "offline":
      return {
        color: "text-red-500",
        label: "online",
      };
    case "busy":
      return {
        color: "text-yellow-500",
        label: "busy",
      };
    case "online":
      return {
        color: "text-green-500",
        label: "offline",
      };
    default:
      return {
        color: "text-gray-500",
        label: "Unknown",
      };
  }
};

const Team = () => {
  return (
    <div className="flex-1 rounded-lg border shadow-sm bg-white border-slate-200">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon iconPath={groupIconPath} size={16} />
            <h3 className="tracking-tight text-lg font-semibold text-slate-900">
              Team (6)
            </h3>
          </div>
          <div>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 text-xs">
              All
            </button>
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2  focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-9 rounded-md px-3 text-xs">
              Available
            </button>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0 space-y-3">
        {TeamMembersArray.map((member, i) => (
          <TeamMemberCard
            key={i}
            name={member.name}
            initials={member.initials}
            position={member.position}
            availability={member.availability}
          />
        ))}
      </div>
    </div>
  );
};

export default Team;

const TeamMemberCard = ({ name, initials, position, availability }) => {
  const availabilityStatus = getAvailabilityStatus(availability);
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
      <div className="relative">
        <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">{initials}</span>
        </div>
        <Icon
          iconPath={circleFullPath}
          size={12}
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${availabilityStatus.color} bg-white rounded-full`}
        />
      </div>
      <div className="flex-1 min-w-0">
        {" "}
        <h4 className="text-sm font-medium text-slate-900 truncate mb-1">
          {name}
        </h4>
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-transparent text-warmBrown hover:bg-secondary/80 text-xs">
          {position}
        </div>
      </div>
    </div>
  );
};
