import { CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../../components/Header/Header";
import "./Team.css";
import BackButton from "@/components/ui/BackButton";

const Team = () => {
  return (
    <section className="team">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Team</CardTitle>
      </CardHeader>
    </section>
  );
};

export default Team;
