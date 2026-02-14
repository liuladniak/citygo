import "./Tours.css";
import ToursList from "../../components/ToursList/ToursList.jsx";
import { CardHeader, CardTitle } from "@/components/ui/card.js";
import BackButton from "@/components/ui/BackButton.js";

const Tours = () => {
  return (
    <section className="h-full w-full ">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Tours</CardTitle>
      </CardHeader>
      <ToursList />
    </section>
  );
};

export default Tours;
