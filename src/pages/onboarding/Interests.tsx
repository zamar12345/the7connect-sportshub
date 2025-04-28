import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import { useUpdateOnboardingStep } from "@/hooks/useOnboarding";
import { useAuth } from "@/context/AuthProvider";
import { useUpdateProfile } from "@/hooks/useProfile";

const POPULAR_SPORTS = [
  "Basketball", "Football", "Soccer", "Tennis", "Running",
  "Swimming", "Volleyball", "Baseball", "Golf", "Cycling"
];

const Interests = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { updateProfile, isUpdating } = useUpdateProfile();
  const { mutate: updateStep } = useUpdateOnboardingStep();
  
  const [selectedSport, setSelectedSport] = useState(profile?.sport || "");
  const [disciplines, setDisciplines] = useState<string[]>(profile?.disciplines || []);
  const [newDiscipline, setNewDiscipline] = useState("");

  const handleSportSelect = (sport: string) => {
    setSelectedSport(sport);
  };

  const handleAddDiscipline = () => {
    if (!newDiscipline.trim()) return;
    
    if (!disciplines.includes(newDiscipline)) {
      setDisciplines(prev => [...prev, newDiscipline]);
    }
    
    setNewDiscipline("");
  };

  const handleRemoveDiscipline = (discipline: string) => {
    setDisciplines(disciplines.filter(d => d !== discipline));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    updateProfile({
      userId: user.id,
      profile: {
        sport: selectedSport,
        disciplines,
        // Keep existing values
        username: profile?.username || "",
        full_name: profile?.full_name || "",
        bio: profile?.bio || "",
        avatar_url: profile?.avatar_url || "",
      }
    }, {
      onSuccess: () => {
        updateStep({ step: 'interests' }, {
          onSuccess: () => navigate('/onboarding/complete')
        });
      }
    });
  };

  return (
    <OnboardingLayout 
      title="Your Sports Interests"
      subtitle="Tell us which sports you're passionate about"
      currentStep="interests"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Your Primary Sport</Label>
            
            {selectedSport ? (
              <div className="flex items-center justify-between bg-secondary/50 p-3 rounded-md">
                <span>{selectedSport}</span>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSelectedSport("")}
                >
                  Change
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_SPORTS.map((sport) => (
                  <Button
                    key={sport}
                    type="button"
                    variant="outline"
                    onClick={() => handleSportSelect(sport)}
                    className="justify-start"
                  >
                    {sport}
                  </Button>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 space-y-2">
            <Label className="text-sm font-medium">Your Disciplines</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Add specific disciplines or events within your sport
            </p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {disciplines.map((discipline) => (
                <div key={discipline} className="bg-secondary text-secondary-foreground text-sm py-1 px-2 rounded-full flex items-center">
                  <span>{discipline}</span>
                  <button 
                    type="button" 
                    onClick={() => handleRemoveDiscipline(discipline)}
                    className="ml-1 text-secondary-foreground/70"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
            
            <div className="flex">
              <Input
                value={newDiscipline}
                onChange={(e) => setNewDiscipline(e.target.value)}
                placeholder="Add a discipline (e.g., Sprint, Marathon)"
                className="mr-2"
              />
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleAddDiscipline}
              >
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            size="lg" 
            className="w-full"
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Continue"}
          </Button>
        </div>
      </form>
    </OnboardingLayout>
  );
};

export default Interests;
