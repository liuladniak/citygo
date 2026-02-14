import { CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../../components/Header/Header";
import "./Reports.css";
import BackButton from "@/components/ui/BackButton";

const Reports = () => {
  return (
    <section className="reports">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Reports</CardTitle>
      </CardHeader>
    </section>
  );
};

export default Reports;
