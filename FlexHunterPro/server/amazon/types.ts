export interface AmazonCredentials {
  email: string;
  password: string;
}

export interface ShiftDuration {
  min: number;
  max: number;
}

export interface LocationPreference {
  code: string;
  name: string;
  address: string;
  isUlez: boolean;
  enabled: boolean;
  minPay: number;
  minHourlyPay: number;
  arrivalBuffer: number;
  shiftDuration: ShiftDuration;
}

export interface SearchStrategy {
  type: 'short' | 'steady';
  refreshInterval: number;
  idleTime: number;
}

export interface SearchPreferences {
  locations: LocationPreference[];
  strategy: SearchStrategy;
  autoSolveCaptcha: boolean;
  stopAfterAccepted: boolean;
  schedule: {
    [key: string]: { enabled: boolean; startTime: string; endTime: string }
  };
  timezone: string;
}

export interface AmazonShift {
  locationCode: string;
  locationName: string;
  locationAddress: string;
  isUlez: boolean;
  pay: number;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  hourlyRate: number;
}

export interface ShiftSearchResult {
  shifts: AmazonShift[];
  acceptedShift?: AmazonShift;
  error?: string;
}
