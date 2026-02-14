import { CardHeader, CardTitle } from "@/components/ui/card";
import Header from "../../components/Header/Header";
import "./Settings.css";
import BackButton from "@/components/ui/BackButton";

const Settings = () => {
  return (
    <section className="settings">
      <CardHeader className="flex items-center">
        <BackButton />
        <CardTitle>Settings</CardTitle>
      </CardHeader>
    </section>
  );
};

export default Settings;
