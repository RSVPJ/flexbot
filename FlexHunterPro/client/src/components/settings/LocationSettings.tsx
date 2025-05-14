import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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

interface LocationSettingsProps {
  className?: string;
}

export default function LocationSettings({ className }: LocationSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [locations, setLocations] = useState<Location[]>([]);
  
  // Fetch locations
  const { data: locationsData, isLoading } = useQuery({
    queryKey: ["/api/locations"],
    onSuccess: (data) => {
      if (data && data.locations) {
        setLocations(data.locations);
      }
    }
  });
  
  // Initialize with default locations if none exist
  useEffect(() => {
    if (!isLoading && locationsData && (!locationsData.locations || locationsData.locations.length === 0)) {
      // Add default locations
      const defaultLocations = [
        { code: "DXN1", name: "West Drayton", address: "Amazon Logistics ULEZ (UB79FN)", isUlez: true },
        { code: "DHA2", name: "Wembley", address: "Amazon Logistics (NW10 0UX) ULEZ", isUlez: true },
        { code: "CG13", name: "Harrow", address: "Morrisons (HA1 4BB)", isUlez: false },
        { code: "ULO6", name: "Wembley", address: "Fresh - ULEZ (NW10 7FW)", isUlez: true },
        { code: "CU06", name: "Queensbury", address: "Morrisons ULEZ (NW9 6RN)", isUlez: true },
        { code: "CU73", name: "High Wycombe", address: "Morrisons (HP13 5XX)", isUlez: false },
        { code: "DHA1", name: "Wembley", address: "Amazon Logistics (NW10 0UP) ULEZ", isUlez: true }
      ];
      
      defaultLocations.forEach(loc => {
        addLocationMutation.mutate({
          code: loc.code,
          name: loc.name,
          address: loc.address,
          isUlez: loc.isUlez,
          enabled: true,
          minPay: 5000, // £50.00
          minHourlyPay: 1200, // £12.00
          arrivalBuffer: 60,
          minShiftDuration: 2,
          maxShiftDuration: 5
        });
      });
    }
  }, [isLoading, locationsData]);
  
  // Mutation for adding a location
  const addLocationMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/locations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add Location",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  });
  
  // Mutation for updating a location
  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      return await apiRequest("PATCH", `/api/locations/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      toast({
        title: "Location Updated",
        description: "Location settings have been updated."
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
  
  const handleLocationToggle = (id: number, checked: boolean) => {
    updateLocationMutation.mutate({
      id,
      data: { enabled: checked }
    });
  };
  
  return (
    <Card className={className}>
      <div className="px-4 py-5 sm:px-6 bg-gray-900 text-white">
        <h3 className="text-lg font-medium leading-6">Desired Locations</h3>
      </div>
      <CardContent className="p-0">
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <ul className="p-4 space-y-3">
              {locations.map((location) => (
                <li key={location.id} className="flex items-center">
                  <Checkbox 
                    id={`location-${location.id}`}
                    checked={location.enabled}
                    onCheckedChange={(checked) => handleLocationToggle(location.id, !!checked)}
                    className="h-4 w-4 text-blue-500"
                  />
                  <Label 
                    htmlFor={`location-${location.id}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {location.name} ({location.code}) - {location.address}
                    {location.isUlez && <span className="ml-1 text-xs text-blue-500">ULEZ</span>}
                  </Label>
                </li>
              ))}
              {locations.length === 0 && !isLoading && (
                <li className="text-sm text-gray-500 text-center py-4">
                  No locations found. Add locations to start.
                </li>
              )}
            </ul>
          )}
        </ScrollArea>
        {locations.length === 0 && !isLoading && (
          <div className="p-4 border-t border-gray-200">
            <Button 
              onClick={() => {
                // This would normally open a modal to add a location
                // For this demo, we'll just add a sample location
                addLocationMutation.mutate({
                  code: "DXN1",
                  name: "West Drayton",
                  address: "Amazon Logistics ULEZ (UB79FN)",
                  isUlez: true,
                  enabled: true,
                  minPay: 5000, // £50.00
                  minHourlyPay: 1200, // £12.00
                  arrivalBuffer: 60,
                  minShiftDuration: 2,
                  maxShiftDuration: 5
                });
              }}
              className="w-full"
            >
              Add Default Locations
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
