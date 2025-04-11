
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
  upload: any;
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
  peopleAffected?: number;
};

export type Upload = {
  id: string;
  file_path: string;
  file_type: string;
  hospital_id: string | null;
  event_id: string | null;
  created_at: string | null;
  updated_at: string | null;
  ocr_status: string | null;
  processed: boolean | null;
  processing_results: any | null;
  ocr_data: Json | null;
};
