import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useBot } from "@/contexts/BotContext";
import { Badge } from "@/components/ui/badge";

export default function RecentOffers() {
  const { recentOffers } = useBot();
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric"
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  
  const formatTimeRange = (start: string, end: string) => {
    return `${formatTime(start)} - ${formatTime(end)}`;
  };
  
  const formatMoney = (amount: number) => {
    return `£${(amount / 100).toFixed(2)}`;
  };
  
  return (
    <Card className="overflow-hidden">
      <div className="px-4 py-5 sm:px-6 bg-gray-900 text-white">
        <h3 className="text-lg font-medium leading-6">Recent Offers</h3>
        <p className="text-xs text-gray-300 mt-1">Most recent offers at the top</p>
      </div>
      <CardContent className="p-0">
        <ScrollArea className="h-64">
          <div className="p-4 space-y-3">
            {recentOffers.length > 0 ? (
              recentOffers.map((offer) => (
                <div key={offer.id} className="border border-gray-200 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{offer.locationName}</h4>
                      <p className="text-xs text-gray-500">{offer.locationAddress}</p>
                    </div>
                    <span className="font-bold text-green-600">{formatMoney(offer.pay)}</span>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>{formatDate(offer.startTime)}, {formatTimeRange(offer.startTime, offer.endTime)}</span>
                    <span>{offer.durationHours} hours ({formatMoney(offer.hourlyRate)}/hr)</span>
                  </div>
                  <div className="mt-2 text-xs">
                    {offer.isUlez && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                        ULEZ
                      </Badge>
                    )}
                    {offer.accepted && (
                      <Badge variant="outline" className="ml-1 bg-green-50 text-green-600 border-green-200">
                        Accepted
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500 text-center py-4">No offers found yet</div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
