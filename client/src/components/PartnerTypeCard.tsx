import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PartnerTypeCardProps {
  title: string;
  description: string;
  steps: string;
  imageSrc: string;
  onClick: () => void;
}

const PartnerTypeCard = ({
  title,
  description,
  steps,
  imageSrc,
  onClick
}: PartnerTypeCardProps) => {
  return (
    <Card 
      className={cn(
        "border border-gray-200 hover:border-primary hover:shadow transition duration-150 overflow-hidden cursor-pointer",
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="mb-4 w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: `url(${imageSrc})` }}
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="flex items-center text-sm text-primary">
          <span>{steps}</span>
          <i className="ri-arrow-right-line ml-2"></i>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerTypeCard;
