import React, { useState } from "react";
import Icon from "../ui/SVGIcons/Icon";
import {
  calenderIconPath,
  clockPath,
  editPath,
  groupIconPath,
  locationIconPath,
  phonePath,
  visibilityPath,
} from "../ui/SVGIcons/iconPaths";
import Button from "../ui/Button/Button";
import DropdownWrapper from "../ui/DropdownWrapper";

const recentBookingsArray = [
  {
    title: "Johnson Family",
    status: "confirmed",
    bookingNumber: "BK-2024-0156",
    tourName: "Golden Gate Bridge & Alcatraz",
    tourDate: "Wed, Jul 17",
    tourTime: "09:00 AM",
    tourGuestsAmount: "4 guests",
    guide: "Sarah Johnson",
    tourPrice: "$480",
  },
  {
    title: "Mike & Rachel Chen",
    status: "pending",
    bookingNumber: "BK-2024-0157",
    tourName: "Fisherman's Wharf Food Tour",
    tourDate: "Wed, Jul 17",
    tourTime: "11:30 AM",
    tourGuestsAmount: "2 guests",
    guide: "David Park",
    tourPrice: "$180",
  },
  {
    title: "Thompson Group",
    status: "confirmed",
    bookingNumber: "BK-2024-0158",
    tourName: "City Highlights Tour",
    tourDate: "Thu, Jul 18",
    tourTime: "02:00 PM",
    tourGuestsAmount: "8 guests",
    guide: "Emma Wilson",
    tourPrice: "$640",
  },
  {
    title: "Rodriguez Wedding Party",
    status: "confirmed",
    bookingNumber: "BK-2024-0159",
    tourName: "Private Sunset Tour",
    tourDate: "Fri, Jul 19",
    tourTime: "06:00 PM",
    tourGuestsAmount: "12 guests",
    guide: "Lisa Rodriguez",
    tourPrice: "$1,200",
  },
];

const getStatusStyles = (status) => {
  switch (status) {
    case "cancelled":
      return {
        bg: "bg-red-100",
        text: "text-red-800",
        label: "cancelled",
      };
    case "pending":
      return {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "pending",
      };
    case "confirmed":
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        label: "confirmed",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        label: "unknown",
      };
  }
};

const RecentBookings = () => {
  return (
    <div className="flex-2  rounded-lg border shadow-sm bg-white border-slate-200">
      <div className="p-6 flex items-center justify-between space-y-0 pb-4">
        <div>
          <h3 className="tracking-tight text-lg font-semibold text-slate-900">
            Recent Bookings
          </h3>
          <p className="text-sm text-slate-600">
            Latest tour reservations and updates
          </p>
        </div>
        <Button to="/bookings" className="text-warmBrown">
          View All
        </Button>
      </div>
      <div className="p-6 pt-0 space-y-4">
        {recentBookingsArray.map((recentBookingCard, i) => (
          <RecentBookingCard
            key={i}
            title={recentBookingCard.title}
            status={recentBookingCard.status}
            bookingNumber={recentBookingCard.bookingNumber}
            tourName={recentBookingCard.tourName}
            tourDate={recentBookingCard.tourDate}
            tourTime={recentBookingCard.tourTime}
            tourGuestsAmount={recentBookingCard.tourGuestsAmount}
            guide={recentBookingCard.guide}
            tourPrice={recentBookingCard.tourPrice}
          />
        ))}
      </div>
    </div>
  );
};

export default RecentBookings;

const RecentBookingCard = ({
  title,
  status,
  bookingNumber,
  tourName,
  tourDate,
  tourTime,
  tourGuestsAmount,
  guide,
  tourPrice,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const statusStyles = getStatusStyles(status);

  const toggleDropdown = (key: string) => {
    setOpenDropdown((prev) => (prev === key ? null : key));
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h4 className="font-medium text-slate-900">{title}</h4>
          <div
            className={`inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 border-transparent text-xs px-2 py-1 ${statusStyles.bg} ${statusStyles.text}`}
          >
            {statusStyles.label}
          </div>
          <span className="text-sm text-slate-500">{bookingNumber}</span>
        </div>
        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
          <div className="flex items-center gap-1">
            <Icon iconPath={locationIconPath} />
            <span>{tourName}</span>
          </div>
          <div className="flex items-center gap-1">
            {" "}
            <Icon iconPath={calenderIconPath} />
            <span>{tourDate}</span>
          </div>
          <div className="flex items-center gap-1">
            {" "}
            <Icon iconPath={clockPath} />
            <span>{tourTime}</span>
          </div>
          <div className="flex items-center gap-1">
            {" "}
            <Icon iconPath={groupIconPath} />
            <span>{tourGuestsAmount}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-slate-600">
            Guide:
            <span className="font-medium"> {guide}</span>
          </span>
          <span className="font-medium text-warmBrown">{tourPrice}</span>
        </div>
      </div>
      <DropdownWrapper
        isOpen={openDropdown === "RecentBookingCard"}
        onToggle={() => toggleDropdown("RecentBookingCard")}
        trigger={<button className="text-warmBrown">...</button>}
      >
        <ul className="text-warmBrown text-sm min-w-[145px] flex flex-col gap-1">
          <li className="px-3 py-2 hover:bg-gray-100 flex cursor-pointer">
            <Icon iconPath={visibilityPath} className="mr-2" />
            View Details
          </li>
          <li className="px-3 py-2 hover:bg-gray-100 flex cursor-pointer">
            <Icon iconPath={editPath} className="mr-2" />
            Edit Booking
          </li>
          <li className="px-3 py-2 hover:bg-gray-100 flex cursor-pointer">
            <Icon iconPath={phonePath} className="mr-2" />
            Contact Client
          </li>
        </ul>
      </DropdownWrapper>
    </div>
  );
};
