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

interface ScheduleSettingsProps {
  className?: string;
}

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

type WeekSchedule = {
  [key: string]: DaySchedule;
};

export default function ScheduleSettings({ className }: ScheduleSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const dayNames = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
  const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const [schedule, setSchedule] = useState<WeekSchedule>({
    monday: { enabled: true, startTime: "00:00", endTime: "23:59" },
    tuesday: { enabled: true, startTime: "00:00", endTime: "23:59" },
    wednesday: { enabled: false, startTime: "", endTime: "" },
    thursday: { enabled: true, startTime: "12:00", endTime: "16:15" },
    friday: { enabled: true, startTime: "00:00", endTime: "23:59" },
    saturday: { enabled: true, startTime: "00:00", endTime: "23:59" },
    sunday: { enabled: true, startTime: "00:00", endTime: "23:59" }
  });
  
  const [timezone, setTimezone] = useState("Etc/Greenwich");
  
  // Fetch search settings
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ["/api/search-settings"],
    onSuccess: (data) => {
      if (data && data.settings) {
        if (data.settings.schedule) {
          setSchedule(data.settings.schedule);
        }
        if (data.settings.timezone) {
          setTimezone(data.settings.timezone);
        }
      }
    }
  });
  
  // Mutation for updating search settings
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/search-settings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/search-settings"] });
      toast({
        title: "Schedule Updated",
        description: "Your search schedule has been saved."
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
  
  const handleStartTimeChange = (day: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        startTime: value
      }
    }));
  };
  
  const handleEndTimeChange = (day: string, value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        endTime: value
      }
    }));
  };
  
  const handleToggleDay = (day: string, enabled: boolean) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled,
        startTime: enabled ? (prev[day].startTime || "00:00") : "",
        endTime: enabled ? (prev[day].endTime || "23:59") : ""
      }
    }));
  };
  
  const handleSaveSchedule = () => {
    updateSettingsMutation.mutate({
      schedule,
      timezone
    });
  };
  
  return (
    <Card className={className}>
      <div className="px-4 py-5 sm:px-6 bg-gray-900 text-white">
        <h3 className="text-lg font-medium leading-6">Search Schedule</h3>
      </div>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
              {dayNames.map((day, index) => (
                <div key={day} className="border rounded-md p-2">
                  <div className="flex justify-between items-center">
                    <Label 
                      htmlFor={`toggle-${day}`}
                      className="font-medium text-gray-900 mb-1 text-center cursor-pointer"
                    >
                      {dayLabels[index]}
                    </Label>
                    <input
                      id={`toggle-${day}`}
                      type="checkbox"
                      checked={schedule[day]?.enabled ?? false}
                      onChange={(e) => handleToggleDay(day, e.target.checked)}
                      className="h-3 w-3"
                    />
                  </div>
                  <div className="flex flex-col space-y-1">
                    <div className="flex justify-between items-center">
                      <Input
                        type="time"
                        value={schedule[day]?.startTime ?? ""}
                        onChange={(e) => handleStartTimeChange(day, e.target.value)}
                        disabled={!schedule[day]?.enabled}
                        className={`text-xs p-1 ${!schedule[day]?.enabled ? 'opacity-50' : ''}`}
                      />
                      <span className="text-xs">-</span>
                      <Input
                        type="time"
                        value={schedule[day]?.endTime ?? ""}
                        onChange={(e) => handleEndTimeChange(day, e.target.value)}
                        disabled={!schedule[day]?.enabled}
                        className={`text-xs p-1 ${!schedule[day]?.enabled ? 'opacity-50' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between">
              <div className="w-1/2">
                <Label className="block text-sm font-medium text-gray-900 mb-1">
                  Timezone
                </Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Etc/Greenwich">Etc/Greenwich</SelectItem>
                    <SelectItem value="Europe/London">Europe/London</SelectItem>
                    <SelectItem value="UTC">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleSaveSchedule}
                className="self-end"
                disabled={updateSettingsMutation.isPending}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
