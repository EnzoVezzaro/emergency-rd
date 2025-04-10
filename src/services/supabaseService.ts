
import { supabase } from "@/integrations/supabase/client";
import { Hospital, Event, Patient } from "@/types";

export type DbHospital = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  capacity: number;
  current_occupancy: number;
  contact_phone: string | null;
  contact_email: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type DbEvent = {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  status: string;
  is_public: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

export type DbVictim = {
  id: string;
  full_name: string;
  status: string;
  hospital_id: string | null;
  event_id: string | null;
  additional_info: any | null;
  created_at: string | null;
  updated_at: string | null;
};

export type DbUpload = {
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

export type DbDonationNeed = {
  id: string;
  hospital_id: string | null;
  blood_type: string | null;
  urgency_level: string;
  status: string;
  quantity_needed: number | null;
  additional_info: string | null;
  created_at: string | null;
  updated_at: string | null;
};

// Hospital CRUD operations
export const fetchHospitals = async (): Promise<DbHospital[]> => {
  const { data, error } = await supabase.from("hospitals").select("*");
  
  if (error) {
    console.error("Error fetching hospitals:", error);
    throw error;
  }
  
  return data || [];
};

export const getHospital = async (id: string): Promise<DbHospital | null> => {
  const { data, error } = await supabase
    .from("hospitals")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching hospital:", error);
    return null;
  }
  
  return data?.[0] || null;
};

export const updateHospital = async (id: string, updateData: Partial<DbHospital>): Promise<DbHospital | null> => {
  const { data, error } = await supabase
    .from("hospitals")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating hospital:", error);
    throw error;
  }
  
  return data;
};

export const createHospital = async (hospitalData: Omit<DbHospital, 'id' | 'created_at' | 'updated_at'>): Promise<DbHospital | null> => {
  const { data, error } = await supabase
    .from("hospitals")
    .insert(hospitalData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating hospital:", error);
    throw error;
  }
  
  return data;
};

export const deleteHospital = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("hospitals")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting hospital:", error);
    throw error;
  }
  
  return true;
};

// Event CRUD operations
export const fetchEvents = async (): Promise<DbEvent[]> => {
  const { data, error } = await supabase.from("events").select("*");
  
  if (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
  
  return data || [];
};

export const getEvent = async (id: string): Promise<DbEvent | null> => {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();
  
  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }
  
  return data;
};

export const getLastEvent = async (): Promise<DbUpload | null> => {
  const { data, error } = await supabase
    .from("uploads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1);
  
  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }
  
  return data?.[0] || null;
};

export const updateEvent = async (id: string, updateData: Partial<DbEvent>): Promise<DbEvent | null> => {
  const { data, error } = await supabase
    .from("events")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();
  
  if (error) {
    console.error("Error updating event:", error);
    throw error;
  }
  
  return data;
};

export const createEvent = async (eventData: Omit<DbEvent, 'id' | 'created_at' | 'updated_at'>): Promise<DbEvent | null> => {
  const { data, error } = await supabase
    .from("events")
    .insert(eventData)
    .select()
    .single();
  
  if (error) {
    console.error("Error creating event:", error);
    throw error;
  }
  
  return data;
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", id);
  
  if (error) {
    console.error("Error deleting event:", error);
    throw error;
  }
  
  return true;
};

// Map DB types to our app types
export const mapDbHospitalToHospital = (dbHospital: DbHospital): Hospital => {
  return {
    id: dbHospital.id,
    name: dbHospital.name,
    address: dbHospital.address,
    city: "Unknown", // We'll need to extract this from address
    state: "Unknown", // We'll need to extract this from address
    zipCode: "Unknown", // We'll need to extract this from address
    phone: dbHospital.contact_phone || "",
    status: dbHospital.current_occupancy >= dbHospital.capacity ? 'full' : 'receiving',
    latitude: dbHospital.latitude,
    longitude: dbHospital.longitude,
    donationNeeds: [], // Need to fetch these separately
    patients: [] // Need to fetch these separately
  };
};

// Get hospital-event associations
export const getHospitalEventsMap = async (): Promise<Record<string, string[]>> => {
  const { data, error } = await supabase.from("hospital_events").select("*");
  
  if (error) {
    console.error("Error fetching hospital events:", error);
    return {};
  }
  
  const map: Record<string, string[]> = {};
  
  data?.forEach(item => {
    if (!map[item.event_id]) {
      map[item.event_id] = [];
    }
    map[item.event_id].push(item.hospital_id);
  });
  
  return map;
};

// Patient/Victim CRUD operations
export const fetchVictims = async (): Promise<DbVictim[]> => {
  const { data, error } = await supabase.from("victims").select("*").order("updated_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching victims:", error);
    throw error;
  }
  
  return data || [];
};

export const mapDbVictimToPatient = (victim: DbVictim): Patient => {
  return {
    id: victim.id,
    name: victim.full_name,
    condition: victim.status === 'stable' || victim.status === 'critical' || victim.status === 'deceased' ? victim.status : 'unknown',
    dateAdmitted: victim.created_at || new Date().toISOString(),
    hospitalId: victim.hospital_id || "",
    eventId: victim.event_id || ""
  };
};

// Donation needs
export const fetchDonationNeeds = async (hospitalId?: string): Promise<DbDonationNeed[]> => {
  let query = supabase.from("donation_needs").select("*");
  
  if (hospitalId) {
    query = query.eq("hospital_id", hospitalId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error("Error fetching donation needs:", error);
    throw error;
  }
  
  return data || [];
};
