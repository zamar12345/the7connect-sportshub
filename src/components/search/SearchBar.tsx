
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBarComponent = ({ 
  value, 
  onChange, 
  placeholder = "Search", 
  className 
}: SearchBarProps) => {
  return (
    <div className={`relative ${className}`}>
      <Search 
        size={18}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" 
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10"
      />
    </div>
  );
};

export default SearchBarComponent;
