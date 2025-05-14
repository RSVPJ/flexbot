import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useBot } from "@/contexts/BotContext";
import { formatDate } from "@/lib/utils";

export default function StatusCard() {
  const { searchStatus, startSearch, stopSearch, loading } = useBot();
  
  const handleToggleSearch = () => {
    if (searchStatus?.isActive) {
      stopSearch();
    } else {
      startSearch();
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <h2 className="text-lg font-semibold text-gray-900">Search Status</h2>
          <Button
            onClick={handleToggleSearch}
            disabled={loading}
            className={searchStatus?.isActive ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}
          >
            {loading ? "Please wait..." : searchStatus?.isActive ? "Stop Search" : "Start Search"}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row items-start md:items-center text-sm p-4 pt-0">
          {searchStatus?.isActive && searchStatus.session ? (
            <div className="bg-green-100 text-green-600 rounded-md px-3 py-1 mb-2 md:mb-0">
              <span className="font-medium">
                Search started on {formatDate(new Date(searchStatus.session.startTime))}
              </span>
            </div>
          ) : (
            <div className="bg-gray-100 text-gray-600 rounded-md px-3 py-1 mb-2 md:mb-0">
              <span className="font-medium">Search not active</span>
            </div>
          )}
          <p className="text-gray-500 md:ml-4">
            The activity log will update every 2 minutes.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
