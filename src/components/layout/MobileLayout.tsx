
import TopNavigation from "./TopNavigation";
import BottomNavigation from "./BottomNavigation";

interface MobileLayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideTopNav?: boolean;
}

const MobileLayout = ({ 
  children, 
  hideBottomNav = false, 
  hideTopNav = false 
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <TopNavigation hideTopNav={hideTopNav} />

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation hideBottomNav={hideBottomNav} />
    </div>
  );
};

export default MobileLayout;
