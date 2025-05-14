import { useState, useEffect } from "react";
import StatusCard from "@/components/dashboard/StatusCard";
import ActivityLog from "@/components/dashboard/ActivityLog";
import RecentOffers from "@/components/dashboard/RecentOffers";
import AccountStatus from "@/components/dashboard/AccountStatus";
import SearchSettings from "@/components/settings/SearchSettings";
import LocationSettings from "@/components/settings/LocationSettings";
import OfferSettings from "@/components/settings/OfferSettings";
import ScheduleSettings from "@/components/settings/ScheduleSettings";
import OnboardingGuide from "@/components/onboarding/OnboardingGuide";
import { useAuth } from "@/contexts/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(
    localStorage.getItem("onboardingCompleted") === "true"
  );

  useEffect(() => {
    // Show onboarding for new users
    if (user && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [user, hasCompletedOnboarding]);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem("onboardingCompleted", "true");
  };

  return (
    <>
      {showOnboarding && <OnboardingGuide onComplete={handleOnboardingComplete} />}
      
      {/* Status Card */}
      <StatusCard />
      
      {/* Dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Search Settings */}
          <SearchSettings />
          
          {/* Location Settings */}
          <LocationSettings />
          
          {/* Offer Settings */}
          <OfferSettings className="md:col-span-2" />
          
          {/* Schedule Settings */}
          <ScheduleSettings className="md:col-span-2" />
        </div>
        
        {/* Activity and Offers Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Activity Log */}
          <ActivityLog />
          
          {/* Recent Offers */}
          <RecentOffers />
          
          {/* Account Status */}
          <AccountStatus />
        </div>
      </div>
    </>
  );
}
