import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SearchSettingsProps {
  className?: string;
}

export default function SearchSettings({ className }: SearchSettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [strategy, setStrategy] = useState("steady");
  const [autoSolveCaptcha, setAutoSolveCaptcha] = useState(true);
  const [stopAfterAccepted, setStopAfterAccepted] = useState(false);
  const [notificationNumber, setNotificationNumber] = useState("");
  
  // Fetch search settings
  const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/search-settings"],
    onSuccess: (data) => {
      if (data && data.settings) {
        setStrategy(data.settings.strategy);
        setAutoSolveCaptcha(data.settings.autoSolveCaptcha);
        setStopAfterAccepted(data.settings.stopAfterAccepted);
      }
    }
  });
  
  // Fetch user data for notification number
  const { data: userData, isLoading: isLoadingUser } = useQuery({
    queryKey: ["/api/user"],
    onSuccess: (data) => {
      if (data && data.user && data.user.notificationNumber) {
        setNotificationNumber(data.user.notificationNumber);
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
        title: "Settings Updated",
        description: "Your search settings have been saved."
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
  
  // Mutation for updating user notification number
  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("PATCH", "/api/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Notification Updated",
        description: "Your notification number has been saved."
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
  
  const handleStrategyChange = (value: string) => {
    setStrategy(value);
    updateSettingsMutation.mutate({ strategy: value });
  };
  
  const handleCaptchaToggle = (checked: boolean) => {
    setAutoSolveCaptcha(checked);
    updateSettingsMutation.mutate({ autoSolveCaptcha: checked });
  };
  
  const handleStopToggle = (checked: boolean) => {
    setStopAfterAccepted(checked);
    updateSettingsMutation.mutate({ stopAfterAccepted: checked });
  };
  
  const handleNotificationSave = () => {
    updateUserMutation.mutate({ notificationNumber });
  };
  
  const isLoading = isLoadingSettings || isLoadingUser;
  
  return (
    <Card className={className}>
      <div className="px-4 py-5 sm:px-6 bg-gray-900 text-white">
        <h3 className="text-lg font-medium leading-6">Search Settings</h3>
      </div>
      <CardContent className="p-4 space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Search Strategy */}
            <div>
              <Label className="block text-sm font-medium text-gray-900">Search Strategy</Label>
              <Select defaultValue={strategy} onValueChange={handleStrategyChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Short Burst</SelectItem>
                  <SelectItem value="steady">Steady Long Search</SelectItem>
                </SelectContent>
              </Select>
              <p className="mt-1 text-xs text-gray-500">
                {strategy === "short" 
                  ? "Utilize rapid, short-duration searches with shorter idle times"
                  : "Adopt a balanced approach with moderate refresh intervals"}
              </p>
            </div>
            
            {/* Auto Solve Captchas */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-captcha" className="text-sm font-medium text-gray-900">
                Automatically Solve Captchas
              </Label>
              <Switch 
                id="auto-captcha" 
                checked={autoSolveCaptcha}
                onCheckedChange={handleCaptchaToggle}
              />
            </div>
            
            {/* Stop after acceptance */}
            <div className="flex items-center justify-between">
              <Label htmlFor="stop-after" className="text-sm font-medium text-gray-900">
                Stop Search After Shift Accepted
              </Label>
              <Switch 
                id="stop-after" 
                checked={stopAfterAccepted}
                onCheckedChange={handleStopToggle}
              />
            </div>
            
            {/* Notification Number */}
            <div>
              <Label htmlFor="notification" className="block text-sm font-medium text-gray-900">
                Notification Number
              </Label>
              <div className="flex mt-1">
                <Input 
                  id="notification" 
                  type="text" 
                  value={notificationNumber} 
                  onChange={(e) => setNotificationNumber(e.target.value)}
                  className="rounded-r-none"
                />
                <Button 
                  onClick={handleNotificationSave}
                  className="rounded-l-none"
                  disabled={updateUserMutation.isPending}
                >
                  Update
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
