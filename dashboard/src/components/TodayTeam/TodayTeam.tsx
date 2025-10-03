import { Fragment, useEffect, useState } from "react";

import axios from "axios";

type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  profile_image: string;
  email: string;
  phone: string;
  work_email: string;
  status: string;
};

const TodayTeam = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const API_URL = import.meta.env.VITE_API_KEY;
  const [expandedPositions, setExpandedPositions] = useState<
    Record<string, boolean>
  >({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const filteredEmployees = employees.filter(
    (emp) =>
      emp.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAndGrouped = filteredEmployees.reduce((acc, emp) => {
    if (!acc[emp.position]) acc[emp.position] = [];
    acc[emp.position].push(emp);
    return acc;
  }, {} as Record<string, Employee[]>);

  const groupedEmployees = employees.reduce((acc, employee) => {
    if (!acc[employee.position]) {
      acc[employee.position] = [];
    }
    acc[employee.position].push(employee);
    return acc;
  }, {} as Record<string, Employee[]>);

  console.log("Grouped Employees", groupedEmployees);

  useEffect(() => {
    const newExpandedPositions: Record<string, boolean> = {};
    filteredEmployees.forEach((emp) => {
      newExpandedPositions[emp.position] = true;
    });
    setExpandedPositions(newExpandedPositions);
  }, [searchTerm]);

  const togglePosition = (position: string) => {
    setExpandedPositions((prev) => ({
      ...prev,
      [position]: !prev[position],
    }));
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await axios.get<{ data: Employee[] }>(
          `${API_URL}/api/employees`
        );
        setEmployees(response.data.data);
        console.log("Employees:", response.data.data);
      } catch (err) {
        setError("Failed to fetch employees.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  return (
    <div className="flex-1 bg-white border p-4 shadow-sm border-slate-200 rounded-lg w-full">
      <h3 className="text-base mb-4">Available Team</h3>

      {isLoading ? (
        <p>Loading employees...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <Fragment>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by name"
              className="border p-2 w-full rounded-md"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {Object.entries(filteredAndGrouped).map(([position, teamMembers]) => (
            <div key={position}>
              <button
                className="flex justify-between w-full p-2 bg-gray-200 rounded-md mb-4"
                onClick={() => togglePosition(position)}
              >
                <span>{position}</span>
                <span>{expandedPositions[position] ? "▲" : "▼"}</span>
              </button>
              {expandedPositions[position] && (
                <ul className="text-xs flex flex-col gap-4 mb-4">
                  {teamMembers.map((teamMember) => (
                    <li key={teamMember.id} className="flex items-center ">
                      <img
                        src={`${API_URL}/employees/${teamMember.profile_image}`}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                      <span className="ml-2">
                        {teamMember.first_name} {teamMember.last_name}
                      </span>
                      <span className="ml-auto">{teamMember.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Fragment>
      )}
    </div>
  );
};

export default TodayTeam;
