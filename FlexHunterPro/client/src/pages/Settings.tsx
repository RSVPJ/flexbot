import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import SearchSettings from "@/components/settings/SearchSettings";
import LocationSettings from "@/components/settings/LocationSettings";
import OfferSettings from "@/components/settings/OfferSettings";
import ScheduleSettings from "@/components/settings/ScheduleSettings";

export default function Settings() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="search">
        <Card>
          <CardContent className="p-0">
            <TabsList className="w-full rounded-t-lg rounded-b-none bg-gray-100 border-b">
              <TabsTrigger value="search">Search</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
            </TabsList>
            
            <div className="p-6">
              <TabsContent value="search">
                <SearchSettings className="shadow-none border-0" />
              </TabsContent>
              <TabsContent value="locations">
                <LocationSettings className="shadow-none border-0" />
              </TabsContent>
              <TabsContent value="offers">
                <OfferSettings className="shadow-none border-0" />
              </TabsContent>
              <TabsContent value="schedule">
                <ScheduleSettings className="shadow-none border-0" />
              </TabsContent>
            </div>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
