import { CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../../components/Header/Header";
import "./Schedule.css";
import BackButton from "@/components/ui/BackButton";

const Schedule = () => {
  return (
    <section className="schedule">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Schedule</CardTitle>
      </CardHeader>
    </section>
  );
};

export default Schedule;
