import { CardHeader, CardTitle } from "@/components/ui/card";
import "./Tasks.css";
import BackButton from "@/components/ui/BackButton";

const Tasks = () => {
  return (
    <section className="tasks">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Tasks</CardTitle>
      </CardHeader>
    </section>
  );
};

export default Tasks;
