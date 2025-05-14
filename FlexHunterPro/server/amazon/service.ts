import { AmazonCredentials, SearchPreferences, AmazonShift, ShiftSearchResult } from './types';

export class AmazonFlexService {
  private credentials: AmazonCredentials | null = null;
  private isLoggedIn = false;
  private searchActive = false;
  private searchInterval: NodeJS.Timeout | null = null;
  private currentPreferences: SearchPreferences | null = null;

  constructor() {
    this.resetState();
  }

  private resetState() {
    this.isLoggedIn = false;
    this.searchActive = false;
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
      this.searchInterval = null;
    }
  }

  async login(credentials: AmazonCredentials): Promise<boolean> {
    try {
      this.credentials = credentials;
      
      // In a real implementation, we would use Puppeteer or Playwright to:
      // 1. Navigate to Amazon Flex login page
      // 2. Input credentials
      // 3. Handle MFA if required
      // 4. Verify successful login
      
      // Simulating login success for now
      this.isLoggedIn = true;
      return true;
    } catch (error) {
      console.error('Login error:', error);
      this.isLoggedIn = false;
      return false;
    }
  }

  async logout(): Promise<boolean> {
    try {
      // Stop any active searches
      this.stopSearch();
      
      // In a real implementation, we would properly logout from Amazon Flex
      
      this.credentials = null;
      this.isLoggedIn = false;
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  }

  async startSearch(preferences: SearchPreferences): Promise<boolean> {
    if (!this.isLoggedIn || !this.credentials) {
      throw new Error('Not logged in to Amazon Flex');
    }

    try {
      this.currentPreferences = preferences;
      this.searchActive = true;
      
      // Set up search interval based on strategy
      const interval = preferences.strategy.type === 'short' 
        ? preferences.strategy.refreshInterval 
        : 60000; // 1 minute for steady approach
      
      // In a real implementation, we would:
      // 1. Navigate to the offers page
      // 2. Implement logic to search for offers based on preferences
      // 3. Accept offers that match criteria
      
      return true;
    } catch (error) {
      console.error('Start search error:', error);
      this.searchActive = false;
      return false;
    }
  }

  stopSearch(): void {
    this.searchActive = false;
    if (this.searchInterval) {
      clearInterval(this.searchInterval);
      this.searchInterval = null;
    }
  }

  isSearchActive(): boolean {
    return this.searchActive;
  }

  async performSearch(): Promise<ShiftSearchResult> {
    if (!this.isLoggedIn || !this.credentials || !this.currentPreferences) {
      throw new Error('Cannot perform search: not logged in or no preferences set');
    }

    try {
      // In a real implementation, we would:
      // 1. Use Puppeteer/Playwright to navigate to the offers page
      // 2. Scrape the available shifts
      // 3. Filter based on user preferences
      // 4. Attempt to accept matching shifts
      
      // For demonstration, we'll return empty results
      return {
        shifts: [],
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        shifts: [],
        error: 'Error performing search'
      };
    }
  }

  // Helper method to solve captchas using an external service or AI
  async solveCaptcha(): Promise<boolean> {
    try {
      // In a real implementation, this would:
      // 1. Detect captcha on the page
      // 2. Use a captcha solving service or AI to solve it
      // 3. Submit the solution
      
      return true;
    } catch (error) {
      console.error('Captcha solving error:', error);
      return false;
    }
  }

  // Helper method to check if a shift meets the user's criteria
  shiftMatchesPreferences(shift: AmazonShift): boolean {
    if (!this.currentPreferences) return false;
    
    // Find the location preference that matches this shift
    const locationPref = this.currentPreferences.locations.find(
      loc => loc.code === shift.locationCode && loc.enabled
    );
    
    if (!locationPref) return false;
    
    // Check minimum pay
    if (shift.pay < locationPref.minPay) return false;
    
    // Check minimum hourly pay
    if (shift.hourlyRate < locationPref.minHourlyPay) return false;
    
    // Check shift duration
    if (
      shift.durationHours < locationPref.shiftDuration.min || 
      shift.durationHours > locationPref.shiftDuration.max
    ) {
      return false;
    }
    
    // Check arrival buffer
    const now = new Date();
    const arrivalTime = new Date(shift.startTime);
    const minutesUntilStart = (arrivalTime.getTime() - now.getTime()) / (1000 * 60);
    if (minutesUntilStart < locationPref.arrivalBuffer) {
      return false;
    }
    
    return true;
  }
}

// Create singleton instance
export const amazonFlexService = new AmazonFlexService();
