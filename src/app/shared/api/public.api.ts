import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environment';

export interface LookupItem {
  id: number;
  name: string;
  extra?: string | null;
}

export interface Lookups {
  companies: LookupItem[];
  teams: LookupItem[];
}

export interface OnboardingSubmit {
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  joiningDate: string | null;
  teamId: number | null;
  companyId: number | null;
  phoneDialCode: string | null;
  phoneNumber: string | null;
  email: string;
  submitForApproval: boolean;
}

export interface ManagerRegistration {
  firstName: string;
  lastName: string;
  teamId: number | null;
  companyId: number | null;
  phoneDialCode: string;
  phoneNumber: string;
  email: string;
  submitForApproval: boolean;
}

export interface OnboardingResult {
  candidateId: number;
  status: string;
  message: string;
}

export interface SeatInfo {
  used: number;
  total: number;
}

/** Calls that work without logging in. */
@Injectable({ providedIn: 'root' })
export class PublicApi {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/public`;

  lookups() {
    return this.http.get<Lookups>(`${this.base}/lookups`);
  }

  seats() {
    return this.http.get<SeatInfo>(`${this.base}/seats`);
  }

  submitCandidate(body: OnboardingSubmit) {
    return this.http.post<OnboardingResult>(`${this.base}/onboarding/candidate`, body);
  }

  registerManager(body: ManagerRegistration) {
    return this.http.post<OnboardingResult>(`${this.base}/onboarding/manager`, body);
  }
}
