import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Location {
  id: number;
  code: string;
  name: string;
  address: string;
  isUlez: boolean;
  enabled: boolean;
  minPay: number;
  minHourlyPay: number;
  arrivalBuffer: number;
  minShiftDuration: number;
  maxShiftDuration: number;
}

interface OfferSettingsProps {
  className?: string;
}

export default function OfferSettings({ className }: OfferSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [minPay, setMinPay] = useState<number>(0);
  const [minHourlyPay, setMinHourlyPay] = useState<number>(0);
  const [arrivalBuffer, setArrivalBuffer] = useState<number>(0);
  const [shiftDuration, setShiftDuration] = useState<string>("3.5-5");
  
  // Fetch locations
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ["/api/locations"],
    onSuccess: (data) => {
      if (data && data.locations && data.locations.length > 0) {
        setLocations(data.locations);
        
        // Set the first location as selected by default
        if (!selectedLocationId && data.locations.length > 0) {
          const firstLocation = data.locations[0];
          setSelectedLocationId(firstLocation.id);
          setMinPay(firstLocation.minPay / 100); // Convert from cents to pounds
          setMinHourlyPay(firstLocation.minHourlyPay / 100);
          setArrivalBuffer(firstLocation.arrivalBuffer);
          
          // Set shift duration based on min and max
          const min = firstLocation.minShiftDuration;
          const max = firstLocation.maxShiftDuration;
          
          if (min === 2 && max === 3.5) {
            setShiftDuration("2-3.5");
          } else if (min === 3.5 && max === 5) {
            setShiftDuration("3.5-5");
          } else if (min === 5 && max === 6) {
            setShiftDuration("5-6");
          } else {
            setShiftDuration("any");
          }
        }
      }
    }
  });
  
  // Effect to update form values when selected location changes
  useEffect(() => {
    if (selectedLocationId) {
      const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
      if (selectedLocation) {
        setMinPay(selectedLocation.minPay / 100);
        setMinHourlyPay(selectedLocation.minHourlyPay / 100);
        setArrivalBuffer(selectedLocation.arrivalBuffer);
        
        // Set shift duration based on min and max
        const min = selectedLocation.minShiftDuration;
        const max = selectedLocation.maxShiftDuration;
        
        if (min === 2 && max === 3.5) {
          setShiftDuration("2-3.5");
        } else if (min === 3.5 && max === 5) {
          setShiftDuration("3.5-5");
        } else if (min === 5 && max === 6) {
          setShiftDuration("5-6");
        } else {
          setShiftDuration("any");
        }
      }
    }
  }, [selectedLocationId, locations]);
  
  // Mutation for updating a location
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/locations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Settings Updated",
        description: "Offer settings have been saved."
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(Number(locationId));
  };
  
  const handleMinPayUpdate = () => {
    if (!selectedLocationId) return;
    
    updateLocationMutation.mutate({
      id: selectedLocationId,
      data: { minPay: Math.round(minPay * 100) } // Convert to cents
    });
  };
  
  const handleMinHourlyPayUpdate = () => {
    if (!selectedLocationId) return;
    
    updateLocationMutation.mutate({
      id: selectedLocationId,
      data: { minHourlyPay: Math.round(minHourlyPay * 100) } // Convert to cents
    });
  };
  
  const handleArrivalBufferUpdate = () => {
    if (!selectedLocationId) return;
    
    updateLocationMutation.mutate({
      id: selectedLocationId,
      data: { arrivalBuffer }
    });
  };
  
  const handleShiftDurationUpdate = () => {
    if (!selectedLocationId) return;
    
    let minDuration = 0;
    let maxDuration = 24;
    
    switch (shiftDuration) {
      case "2-3.5":
        minDuration = 2;
        maxDuration = 3.5;
        break;
      case "3.5-5":
        minDuration = 3.5;
        maxDuration = 5;
        break;
      case "5-6":
        minDuration = 5;
        maxDuration = 6;
        break;
      case "any":
      default:
        minDuration = 0;
        maxDuration = 24;
        break;
    }
    
    updateLocationMutation.mutate({
      id: selectedLocationId,
      data: { 
        minShiftDuration: minDuration,
        maxShiftDuration: maxDuration
      }
    });
  };
  
  return (
    <Card className={className}>
      <div className="px-4 py-5 sm:px-6 bg-gray-900 text-white">
        <h3 className="text-lg font-medium leading-6">Offer Settings</h3>
      </div>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Location Selector */}
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-900 mb-1">
                Choose a location to update its settings
              </Label>
              {locations.length > 0 ? (
                <Select value={selectedLocationId?.toString()} onValueChange={handleLocationChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id.toString()}>
                        {location.name} ({location.code}) - {location.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm text-gray-500 py-2">
                  No locations found. Please add locations first.
                </div>
              )}
            </div>
            
            {selectedLocationId && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Minimum Shift Pay */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-1">
                    Minimum Shift Pay (£)
                  </Label>
                  <div className="flex">
                    <Input 
                      type="number"
                      value={minPay}
                      onChange={(e) => setMinPay(parseFloat(e.target.value) || 0)}
                      className="rounded-r-none"
                      min={0}
                      step={0.01}
                    />
                    <Button 
                      onClick={handleMinPayUpdate}
                      className="rounded-l-none"
                      disabled={updateLocationMutation.isPending}
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                {/* Minimum Pay Per Hour */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-1">
                    Minimum Pay Per Hour (£)
                  </Label>
                  <div className="flex">
                    <Input 
                      type="number"
                      value={minHourlyPay}
                      onChange={(e) => setMinHourlyPay(parseFloat(e.target.value) || 0)}
                      className="rounded-r-none"
                      min={0}
                      step={0.01}
                    />
                    <Button 
                      onClick={handleMinHourlyPayUpdate}
                      className="rounded-l-none"
                      disabled={updateLocationMutation.isPending}
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                {/* Arrival Buffer */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-1">
                    Arrival Buffer (Minutes)
                  </Label>
                  <div className="flex">
                    <Input 
                      type="number"
                      value={arrivalBuffer}
                      onChange={(e) => setArrivalBuffer(parseInt(e.target.value) || 0)}
                      className="rounded-r-none"
                      min={0}
                    />
                    <Button 
                      onClick={handleArrivalBufferUpdate}
                      className="rounded-l-none"
                      disabled={updateLocationMutation.isPending}
                    >
                      Update
                    </Button>
                  </div>
                </div>
                
                {/* Shift Duration */}
                <div>
                  <Label className="block text-sm font-medium text-gray-900 mb-1">
                    Shift Duration (Hours)
                  </Label>
                  <div className="flex">
                    <Select value={shiftDuration} onValueChange={setShiftDuration}>
                      <SelectTrigger className="rounded-r-none flex-grow">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3.5-5">Between 3.5 and 5 hours</SelectItem>
                        <SelectItem value="2-3.5">Between 2 and 3.5 hours</SelectItem>
                        <SelectItem value="5-6">Between 5 and 6 hours</SelectItem>
                        <SelectItem value="any">Any duration</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={handleShiftDurationUpdate}
                      className="rounded-l-none"
                      disabled={updateLocationMutation.isPending}
                    >
                      Update
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
