import { useState } from "react";
import { Bell, Menu, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import OnboardingGuide from "@/components/onboarding/OnboardingGuide";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [showTutorial, setShowTutorial] = useState(false);

  const handleOpenTutorial = () => {
    setShowTutorial(true);
  };

  const handleTutorialComplete = () => {
    setShowTutorial(false);
  };

  return (
    <>
      {showTutorial && <OnboardingGuide onComplete={handleTutorialComplete} />}

      <header className="bg-white shadow-sm z-10">
        <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Button 
            onClick={onMenuClick}
            variant="ghost" 
            size="icon" 
            className="md:hidden text-gray-900"
          >
            <Menu />
          </Button>
          <div className="flex-1 flex justify-center md:justify-start">
            <h1 className="text-xl font-semibold text-gray-900 md:hidden">Flex Bot</h1>
          </div>
          <div className="ml-4 flex items-center space-x-2 md:ml-6">
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-900"
              onClick={handleOpenTutorial}
              title="Tutorial"
            >
              <HelpCircle size={20} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-gray-900"
              title="Notifications"
            >
              <Bell size={20} />
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
