import BackButton from "./ui/BackButton";
import { CardHeader, CardTitle } from "./ui/card";

interface PageHeaderProps {
  title: string;
  backTo?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, backTo }) => {
  return (
    // <div className="flex items-center gap-3 mb-6">
    //   <BackButton to={backTo} />
    //   <h1 className="text-xl font-medium">{title}</h1>
    // </div>
    <CardHeader className="flex items-center px-0">
      <BackButton />
      <CardTitle>{title}</CardTitle>
    </CardHeader>
  );
};

export default PageHeader;
