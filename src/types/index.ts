
export type Hospital = {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  status: 'receiving' | 'full' | 'closed';
  latitude: number;
  longitude: number;
  donationNeeds: DonationNeed[];
  patients: Patient[];
  victims?: any[]
};

export type DonationNeed = {
  id: string;
  type: 'blood' | 'supplies' | 'volunteers';
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  description: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
};

export type Patient = {
  id: string;
  name: string;
  condition?: 'stable' | 'critical' | 'deceased' | 'unknown';
  dateAdmitted: string;
  hospitalId: string;
  eventId: string;
};

export type Event = {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  type: 'natural_disaster' | 'accident' | 'other';
  status: 'active' | 'resolved';
  affectedHospitalIds: string[];
};
