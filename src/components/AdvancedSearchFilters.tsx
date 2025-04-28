import { useState } from "react";
import { 
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem
} from "@/components/ui/select";
import {
  Button
} from "@/components/ui/button";
import {
  SortAsc,
  Filter
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent
} from "@/components/ui/popover";

type SortOption = "relevance" | "recent" | "popular";
type FilterOption = "all" | "verified" | "followed" | "sport";
type SearchType = "users" | "posts" | "hashtags";

interface AdvancedSearchFiltersProps {
  activeFilter: FilterOption;
  activeSort: SortOption;
  activeSport?: string;
  searchType: SearchType;
  onFilterChange: (filter: FilterOption, sport?: string) => void;
  onSortChange: (sort: SortOption) => void;
}

const AdvancedSearchFilters: React.FC<AdvancedSearchFiltersProps> = ({
  activeFilter,
  activeSort,
  activeSport,
  searchType,
  onFilterChange,
  onSortChange
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const sportOptions = [
    "Basketball", "Football", "Soccer", "Tennis", 
    "Golf", "Baseball", "Swimming", "Athletics"
  ];
  
  const sortOptions: Record<SearchType, { value: SortOption; label: string }[]> = {
    users: [
      { value: "relevance", label: "Relevance" },
      { value: "recent", label: "Recently Joined" },
      { value: "popular", label: "Most Followed" }
    ],
    posts: [
      { value: "relevance", label: "Relevance" },
      { value: "recent", label: "Most Recent" },
      { value: "popular", label: "Most Liked" }
    ],
    hashtags: [
      { value: "relevance", label: "Relevance" },
      { value: "recent", label: "Recently Used" },
      { value: "popular", label: "Most Used" }
    ]
  };
  
  const filterOptions: Record<SearchType, { value: FilterOption; label: string }[]> = {
    users: [
      { value: "all", label: "All Users" },
      { value: "verified", label: "Verified Users" },
      { value: "followed", label: "Users You Follow" },
      { value: "sport", label: "By Sport" }
    ],
    posts: [
      { value: "all", label: "All Posts" },
      { value: "verified", label: "From Verified Users" },
      { value: "followed", label: "From Users You Follow" },
      { value: "sport", label: "By Sport" }
    ],
    hashtags: [
      { value: "all", label: "All Hashtags" },
      { value: "sport", label: "By Sport" }
    ]
  };

  const handleFilterChange = (filter: FilterOption) => {
    if (filter === 'sport') {
      return;
    }
    onFilterChange(filter);
    setIsFilterOpen(false);
  };

  const handleSportChange = (sport: string) => {
    onFilterChange('sport', sport);
    setIsFilterOpen(false);
  };
  
  return (
    <div className="flex space-x-2 my-4">
      <Select value={activeSort} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px]">
          <SortAsc className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {sortOptions[searchType].map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex-1">
            <Filter className="mr-2 h-4 w-4" />
            {filterOptions[searchType].find(f => f.value === activeFilter)?.label || 'Filter'}
            {activeFilter === 'sport' && activeSport && `: ${activeSport}`}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
          <div className="flex flex-col">
            {filterOptions[searchType].map(option => (
              <div key={option.value}>
                <Button
                  variant={activeFilter === option.value ? "secondary" : "ghost"}
                  className="w-full justify-start rounded-none"
                  onClick={() => handleFilterChange(option.value)}
                >
                  {option.label}
                </Button>
                
                {option.value === 'sport' && activeFilter === 'sport' && (
                  <div className="pl-4 py-2 max-h-[200px] overflow-y-auto bg-muted/30">
                    {sportOptions.map(sport => (
                      <Button
                        key={sport}
                        variant={activeSport === sport ? "secondary" : "ghost"}
                        size="sm"
                        className="w-full justify-start my-1"
                        onClick={() => handleSportChange(sport)}
                      >
                        {sport}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default AdvancedSearchFilters;
