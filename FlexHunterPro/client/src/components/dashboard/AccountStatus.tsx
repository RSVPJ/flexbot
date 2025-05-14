import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useBot } from "@/contexts/BotContext";

export default function AccountStatus() {
  const { user } = useAuth();
  const { searchStatus } = useBot();
  
  // Calculate search time in hours and minutes
  const formatSearchTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.floor(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };
  
  // Calculate percentages for progress bars
  const searchTimePercentage = Math.min(
    (searchStatus?.stats.searchTimeToday || 0) / (24 * 60) * 100, 
    100
  );
  
  const shiftsPercentage = Math.min(
    ((searchStatus?.stats.acceptedShiftsThisWeek || 0) / 7) * 100,
    100
  );
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-900 text-white">
        <h3 className="text-lg font-medium leading-6">Account Status</h3>
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">Amazon Flex Account</h4>
            <p className="text-xs text-gray-500">{user?.amazonEmail || "Not connected"}</p>
          </div>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            user?.amazonEmail 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {user?.amazonEmail ? "Connected" : "Not Connected"}
          </span>
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Search Time Today</span>
            <span className="text-xs text-gray-900 font-medium">
              {formatSearchTime(searchStatus?.stats.searchTimeToday || 0)}
            </span>
          </div>
          <Progress value={searchTimePercentage} className="h-1.5" />
        </div>
        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Shifts Accepted This Week</span>
            <span className="text-xs text-gray-900 font-medium">
              {searchStatus?.stats.acceptedShiftsThisWeek || 0} / 7
            </span>
          </div>
          <Progress value={shiftsPercentage} className="h-1.5" />
        </div>
      </CardContent>
    </Card>
  );
}
