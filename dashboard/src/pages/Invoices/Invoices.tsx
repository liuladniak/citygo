import { CardHeader, CardTitle } from "@/components/ui/card";
import "./Invoices.css";
import BackButton from "@/components/ui/BackButton";

const Invoices = () => {
  return (
    <section className="invoices">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Invoices</CardTitle>
      </CardHeader>
    </section>
  );
};

export default Invoices;
