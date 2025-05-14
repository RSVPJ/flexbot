import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";

interface User {
  id: number;
  username: string;
  amazonEmail?: string;
  notificationNumber?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  updateUser: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        const res = await fetch("/api/user", {
          credentials: "include"
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("User authenticated:", data.user);
          setUser(data.user);
        } else {
          console.log("User not authenticated");
          // Make sure we set loading to false even when the user is not authenticated
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Ensure user is set to null on error
        setUser(null);
      } finally {
        console.log("Auth check complete, setting loading to false");
        setLoading(false);
      }
    };
    
    // Set a timeout to prevent infinite loading in case the request hangs
    const timeoutId = setTimeout(() => {
      console.log("Auth check timeout reached, forcing loading to false");
      setLoading(false);
    }, 5000); 
    
    checkAuth();
    
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (username: string, password: string) => {
    console.log("Login attempt for:", username);
    setLoading(true);
    
    // Create a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Login timeout reached, forcing loading state to false");
      setLoading(false);
    }, 10000); // 10 second timeout
    
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      
      clearTimeout(timeoutId); // Clear timeout as we got a response
      
      // Handle error response
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login response not OK:", response.status, errorData);
        throw new Error(errorData.message || "Login failed");
      }
      
      // Success case - clone the response before using it (can only read response body once)
      const clonedResponse = response.clone();
      const data = await response.json();
      console.log("Login successful, user:", data.user);
      
      if (data.user) {
        setUser(data.user);
        return data.user;
      } else {
        console.error("Login succeeded but no user data returned");
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Login failed:", error);
      // Ensure user is set to null on failure
      setUser(null);
      throw error;
    } finally {
      // Always make sure loading is set to false
      console.log("Login process complete, setting loading to false");
      setLoading(false);
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  };

  const logout = async () => {
    console.log("Logout attempt");
    setLoading(true);
    
    // Create a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Logout timeout reached, forcing loading state to false");
      setLoading(false);
      setUser(null); // Force clear user on timeout
    }, 5000); // 5 second timeout
    
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include"
      });
      
      clearTimeout(timeoutId); // Clear timeout as we got a response
      
      if (!response.ok) {
        console.error("Logout response not OK:", response.status);
        // Try to read error message if available
        try {
          const errorData = await response.json();
          console.error("Logout error details:", errorData);
        } catch (parseError) {
          console.error("Could not parse error response");
        }
      } else {
        console.log("Logout successful");
      }
      
      // Always clear the user state regardless of response
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      // Still clear the user state on error
      setUser(null);
    } finally {
      // Always make sure loading is set to false
      console.log("Logout process complete, setting loading to false");
      setLoading(false);
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  };

  const register = async (username: string, password: string) => {
    console.log("Registration attempt for:", username);
    setLoading(true);
    
    // Create a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Registration timeout reached, forcing loading state to false");
      setLoading(false);
    }, 10000); // 10 second timeout
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });
      
      clearTimeout(timeoutId); // Clear timeout as we got a response
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Registration response not OK:", response.status, errorData);
        throw new Error(errorData.message || "Registration failed");
      }
      
      // Success case - clone the response before using it (can only read response body once)
      const clonedResponse = response.clone();
      const data = await response.json();
      console.log("Registration successful, user:", data.user);
      
      if (data.user) {
        setUser(data.user);
        return data.user;
      } else {
        console.error("Registration succeeded but no user data returned");
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // Ensure user is set to null on failure
      setUser(null);
      throw error;
    } finally {
      // Always make sure loading is set to false
      console.log("Registration process complete, setting loading to false");
      setLoading(false);
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  };

  const updateUser = async (data: Partial<User>) => {
    console.log("Updating user data", data);
    setLoading(true);
    
    // Create a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log("Update user timeout reached, forcing loading state to false");
      setLoading(false);
    }, 10000); // 10 second timeout
    
    try {
      const response = await fetch("/api/user", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      clearTimeout(timeoutId); // Clear timeout as we got a response
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update user response not OK:", response.status, errorData);
        throw new Error(errorData.message || "Failed to update user");
      }
      
      // Success case - clone the response before using it (can only read response body once)
      const clonedResponse = response.clone();
      const updatedData = await response.json();
      console.log("User updated successfully:", updatedData.user);
      
      if (updatedData.user) {
        setUser(updatedData.user);
        return updatedData.user;
      } else {
        console.error("Update succeeded but no user data returned");
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("User update failed:", error);
      // Don't clear user data on update error, just keep the old user data
      throw error;
    } finally {
      // Always make sure loading is set to false
      console.log("Update user process complete, setting loading to false");
      setLoading(false);
      clearTimeout(timeoutId); // Ensure timeout is cleared
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
        register,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
