import BackButton from "./ui/BackButton";

interface PageHeaderProps {
  title: string;
  backTo?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, backTo }) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <BackButton to={backTo} />
      <h1 className="text-xl font-medium">{title}</h1>
    </div>
  );
};

export default PageHeader;
