
import { Button } from "@/components/ui/button";

interface ViewTypeToggleProps {
  viewType: "cards" | "table";
  onChange: (type: "cards" | "table") => void;
}

const ViewTypeToggle = ({ viewType, onChange }: ViewTypeToggleProps) => {
  return (
    <div className="flex space-x-2">
      <Button 
        variant={viewType === "cards" ? "default" : "outline"} 
        size="sm"
        onClick={() => onChange("cards")}
      >
        Cards
      </Button>
      <Button 
        variant={viewType === "table" ? "default" : "outline"} 
        size="sm"
        onClick={() => onChange("table")}
      >
        Table
      </Button>
    </div>
  );
};

export default ViewTypeToggle;
