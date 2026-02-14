import BackButton from "./ui/BackButton";
import { CardHeader, CardTitle } from "./ui/card";

interface PageHeaderProps {
  title: string;
  backTo?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title }) => {
  return (
    <CardHeader className="flex items-center px-0">
      <BackButton />
      <CardTitle>{title}</CardTitle>
    </CardHeader>
  );
};

export default PageHeader;
