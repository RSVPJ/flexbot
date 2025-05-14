import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney, formatTimeRange } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface Offer {
  id: number;
  locationCode: string;
  locationName: string;
  locationAddress: string;
  isUlez: boolean;
  pay: number;
  startTime: string;
  endTime: string;
  durationHours: number;
  hourlyRate: number;
  accepted: boolean;
  timestamp: string;
}

interface SearchSession {
  id: number;
  startTime: string;
  endTime: string | null;
  status: string;
  offersFound: number;
  offersAccepted: number;
}

interface ActivityLog {
  id: number;
  action: string;
  timestamp: string;
  details: string | null;
}

export default function History() {
  const [activeTab, setActiveTab] = useState("offers");

  // Get offers history
  const { data: offersData, isLoading: isLoadingOffers } = useQuery({
    queryKey: ["/api/offers"],
  });

  // Get search sessions
  const { data: sessionsData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ["/api/search-sessions"],
  });

  // Get activity logs
  const { data: logsData, isLoading: isLoadingLogs } = useQuery({
    queryKey: ["/api/activity-logs"],
  });

  const formatActionText = (action: string, details?: string | null) => {
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

  const calculateSearchDuration = (startTime: string, endTime: string | null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">History</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="sessions">Search Sessions</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <TabsContent value="offers">
            <Card>
              <CardContent className="p-0 overflow-auto">
                {isLoadingOffers ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !offersData?.offers || offersData.offers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No offers found</p>
                    <Button variant="outline" className="mt-4">Export Data</Button>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Pay</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Hourly Rate</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {offersData.offers.map((offer: Offer) => (
                          <TableRow key={offer.id}>
                            <TableCell>
                              {formatDate(new Date(offer.startTime))}
                              <div className="text-xs text-gray-500">
                                {new Date(offer.startTime).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {offer.locationName} ({offer.locationCode})
                              <div className="text-xs text-gray-500">{offer.locationAddress}</div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatMoney(offer.pay)}
                            </TableCell>
                            <TableCell>
                              {`${offer.durationHours} hours`}
                              <div className="text-xs text-gray-500">
                                {formatTimeRange(
                                  new Date(offer.startTime),
                                  new Date(offer.endTime)
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{formatMoney(offer.hourlyRate)}/hr</TableCell>
                            <TableCell>
                              {offer.accepted ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Accepted
                                </Badge>
                              ) : (
                                <Badge variant="outline">Seen</Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 border-t">
                      <Button variant="outline">Export Offers History</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="sessions">
            <Card>
              <CardContent className="p-0 overflow-auto">
                {isLoadingSessions ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !sessionsData?.sessions || sessionsData.sessions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No search sessions found</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Started</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Offers Found</TableHead>
                          <TableHead>Offers Accepted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sessionsData.sessions.map((session: SearchSession) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              {formatDate(new Date(session.startTime))}
                              <div className="text-xs text-gray-500">
                                {new Date(session.startTime).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {calculateSearchDuration(session.startTime, session.endTime)}
                            </TableCell>
                            <TableCell>
                              {session.status === "running" ? (
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                  Running
                                </Badge>
                              ) : (
                                <Badge variant="outline">Stopped</Badge>
                              )}
                            </TableCell>
                            <TableCell>{session.offersFound}</TableCell>
                            <TableCell>{session.offersAccepted}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 border-t">
                      <Button variant="outline">Export Sessions History</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="activity">
            <Card>
              <CardContent className="p-0 overflow-auto">
                {isLoadingLogs ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : !logsData?.logs || logsData.logs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No activity logs found</p>
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Time</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logsData.logs.map((log: ActivityLog) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {formatDate(new Date(log.timestamp))}
                              <div className="text-xs text-gray-500">
                                {new Date(log.timestamp).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatActionText(log.action)}
                            </TableCell>
                            <TableCell>
                              {log.details || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="p-4 border-t">
                      <Button variant="outline">Export Activity Logs</Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
