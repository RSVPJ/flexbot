import { Card, CardContent } from "@/components/ui/card";
import { useBot } from "@/contexts/BotContext";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ActivityLog() {
  const { activityLogs } = useBot();
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  
  const formatActionText = (action: string, details?: string) => {
    switch (action) {
      case "SEARCH_STARTED":
        return "Search Started";
      case "SEARCH_STOPPED":
        return "Search Stopped";
      case "USER_LOGIN":
        return "Account Logged In";
      case "USER_LOGOUT":
        return "Account Logged Out";
      case "USER_UPDATED":
        return "Account Settings Updated";
      case "LOCATION_ADDED":
        return details || "Location Added";
      case "LOCATION_UPDATED":
        return details || "Location Updated";
      case "LOCATION_DELETED":
        return details || "Location Deleted";
      case "SEARCH_SETTINGS_UPDATED":
        return details || "Settings Updated";
      case "OFFER_FOUND":
        return details || "Offer Found";
      case "OFFER_ACCEPTED":
        return details || "Offer Accepted";
      default:
        return details || action;
    }
  };
  
  return (
    <Card className="overflow-hidden mb-6">
      <div className="px-4 py-5 sm:px-6 bg-gray-900 text-white">
        <h3 className="text-lg font-medium leading-6">Activity Log</h3>
      </div>
      <CardContent className="p-0">
        <ScrollArea className="h-60">
          <ul className="p-4 space-y-3">
            {activityLogs.length > 0 ? (
              activityLogs.map((log) => (
                <li key={log.id} className="flex">
                  <span className="text-sm text-gray-500 min-w-[4.5rem]">{formatTime(log.timestamp)}</span>
                  <span className="text-sm text-gray-900">{formatActionText(log.action, log.details)}</span>
                </li>
              ))
            ) : (
              <li className="text-sm text-gray-500 text-center py-4">No activity recorded yet</li>
            )}
          </ul>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
