import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

interface SearchStatus {
  isActive: boolean;
  session?: {
    id: number;
    startTime: string;
    offersFound: number;
    offersAccepted: number;
  };
  stats: {
    searchTimeToday: number;
    acceptedShiftsThisWeek: number;
  };
}

interface ActivityLog {
  id: number;
  action: string;
  timestamp: string;
  details?: string;
}

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

interface BotContextType {
  searchStatus: SearchStatus | null;
  activityLogs: ActivityLog[];
  recentOffers: Offer[];
  startSearch: () => Promise<void>;
  stopSearch: () => Promise<void>;
  refreshStatus: () => Promise<void>;
  loading: boolean;
}

const defaultStats = {
  searchTimeToday: 0,
  acceptedShiftsThisWeek: 0
};

const defaultSearchStatus: SearchStatus = {
  isActive: false,
  stats: defaultStats
};

const BotContext = createContext<BotContextType>({
  searchStatus: defaultSearchStatus,
  activityLogs: [],
  recentOffers: [],
  startSearch: async () => {},
  stopSearch: async () => {},
  refreshStatus: async () => {},
  loading: false
});

export const useBot = () => useContext(BotContext);

export const BotProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchStatus, setSearchStatus] = useState<SearchStatus | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [recentOffers, setRecentOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusInterval, setStatusInterval] = useState<NodeJS.Timeout | null>(null);

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [statusInterval]);

  // Initial data fetch
  useEffect(() => {
    console.log("BotContext: Authentication state changed:", isAuthenticated);
    
    // Always set defaults to prevent undefined values
    if (!searchStatus) {
      setSearchStatus(defaultSearchStatus);
    }
    
    if (isAuthenticated) {
      setLoading(true);
      console.log("BotContext: Fetching initial data");
      
      // Add a timeout to prevent infinite loading
      const timeout = setTimeout(() => {
        console.log("BotContext: Data fetch timeout reached");
        setLoading(false);
        if (!searchStatus) {
          setSearchStatus(defaultSearchStatus);
        }
      }, 5000);
      
      Promise.all([
        fetchStatus(),
        fetchActivityLogs(),
        fetchOffers()
      ])
      .catch(error => {
        console.error("BotContext: Failed to fetch initial data:", error);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
        console.log("BotContext: Initial data fetch complete");
      });
      
      // Set up interval to refresh status
      const interval = setInterval(() => {
        fetchStatus().catch(error => {
          console.error("BotContext: Failed to refresh status:", error);
        });
      }, 30000); // Every 30 seconds
      
      setStatusInterval(interval);
    } else {
      // Set fallback values when not authenticated
      console.log("BotContext: User not authenticated, setting default values");
      setSearchStatus(defaultSearchStatus);
      setActivityLogs([]);
      setRecentOffers([]);
    }
    
    return () => {
      if (statusInterval) {
        clearInterval(statusInterval);
      }
    };
  }, [isAuthenticated]);

  const fetchStatus = async () => {
    if (!isAuthenticated) {
      console.log("BotContext: fetchStatus skipped, not authenticated");
      return;
    }
    
    try {
      console.log("BotContext: Fetching search status");
      const res = await fetch("/api/flex/status", {
        credentials: "include"
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("BotContext: Status data received:", data);
        setSearchStatus(data);
      } else if (res.status === 401) {
        console.log("BotContext: User not authenticated (401)");
        // Set fallback data on authentication error
        setSearchStatus(defaultSearchStatus);
      } else {
        console.error("BotContext: Error fetching status, status code:", res.status);
        // On other errors, still provide default data so UI is not broken
        if (!searchStatus) {
          setSearchStatus(defaultSearchStatus);
        }
      }
    } catch (error) {
      console.error("BotContext: Failed to fetch status:", error);
      // Provide fallback data on error
      if (!searchStatus) {
        setSearchStatus(defaultSearchStatus);
      }
    }
  };

  const fetchActivityLogs = async () => {
    if (!isAuthenticated) {
      console.log("BotContext: fetchActivityLogs skipped, not authenticated");
      return;
    }
    
    try {
      console.log("BotContext: Fetching activity logs");
      const res = await fetch("/api/activity-logs?limit=20", {
        credentials: "include"
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("BotContext: Activity logs received:", data.logs?.length || 0, "items");
        setActivityLogs(data.logs || []);
      } else if (res.status === 401) {
        console.log("BotContext: User not authenticated (401) for activity logs");
        setActivityLogs([]);
      } else {
        console.error("BotContext: Error fetching activity logs, status code:", res.status);
        // Keep existing logs on error
      }
    } catch (error) {
      console.error("BotContext: Failed to fetch activity logs:", error);
      // On error, don't clear existing logs
    }
  };

  const fetchOffers = async () => {
    if (!isAuthenticated) {
      console.log("BotContext: fetchOffers skipped, not authenticated");
      return;
    }
    
    try {
      console.log("BotContext: Fetching offers");
      const res = await fetch("/api/offers?limit=10", {
        credentials: "include"
      });
      
      if (res.ok) {
        const data = await res.json();
        console.log("BotContext: Offers received:", data.offers?.length || 0, "items");
        setRecentOffers(data.offers || []);
      } else if (res.status === 401) {
        console.log("BotContext: User not authenticated (401) for offers");
        setRecentOffers([]);
      } else {
        console.error("BotContext: Error fetching offers, status code:", res.status);
        // Keep existing offers on error
      }
    } catch (error) {
      console.error("BotContext: Failed to fetch offers:", error);
      // On error, don't clear existing offers
    }
  };

  const startSearch = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/flex/start");
      const data = await res.json();
      
      toast({
        title: "Search Started",
        description: data.message || "Amazon Flex search has been started successfully."
      });
      
      // Refresh data
      await Promise.all([
        fetchStatus(),
        fetchActivityLogs()
      ]);
    } catch (error) {
      console.error("Failed to start search:", error);
      toast({
        title: "Failed to Start Search",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const stopSearch = async () => {
    setLoading(true);
    try {
      const res = await apiRequest("POST", "/api/flex/stop");
      const data = await res.json();
      
      toast({
        title: "Search Stopped",
        description: data.message || "Amazon Flex search has been stopped successfully."
      });
      
      // Refresh data
      await Promise.all([
        fetchStatus(),
        fetchActivityLogs()
      ]);
    } catch (error) {
      console.error("Failed to stop search:", error);
      toast({
        title: "Failed to Stop Search",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStatus(),
        fetchActivityLogs(),
        fetchOffers()
      ]);
    } catch (error) {
      console.error("Failed to refresh status:", error);
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh latest data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <BotContext.Provider
      value={{
        searchStatus,
        activityLogs,
        recentOffers,
        startSearch,
        stopSearch,
        refreshStatus,
        loading
      }}
    >
      {children}
    </BotContext.Provider>
  );
};
