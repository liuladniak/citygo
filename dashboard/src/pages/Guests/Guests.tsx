import { CardHeader, CardTitle } from "@/components/ui/card";
import "./Guests.css";
import BackButton from "@/components/ui/BackButton";

const Guests = () => {
  return (
    <section className="guests">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Guests</CardTitle>
      </CardHeader>
    </section>
  );
};

export default Guests;
