
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Hospital, Event, Patient, Upload } from '../types';
import { mockHospitals, mockEvents, mockPatients } from '../data/mockData';
import { useToast } from "@/components/ui/use-toast";
import { 
  fetchHospitals, 
  fetchEvents, 
  fetchVictims, 
  fetchDonationNeeds,
  getHospitalEventsMap,
  mapDbHospitalToHospital,
  mapDbVictimToPatient,
  DbDonationNeed,
  getLastEvent,
  DbUpload
} from '@/services/supabaseService';

type AppContextType = {
  hospitals: Hospital[];
  events: Event[];
  patients: Patient[];
  currentEvent: Event | null;
  lastUpdate: Upload | null;
  setCurrentEvent: (event: Event | null) => void;
  searchPatients: (name: string) => Patient[];
  getHospital: (id: string) => Hospital | undefined;
  getEvent: (id: string) => Event | undefined;
  isLoading: boolean;
  refreshData: () => Promise<void>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(null);
  const [lastUpdate, setLastUpdate] = useState<DbUpload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const mapDonationNeedsToHospital = (
    hospitalId: string, 
    donationNeeds: DbDonationNeed[]
  ) => {
    return donationNeeds
      .filter(need => need.hospital_id === hospitalId)
      .map(need => ({
        id: need.id,
        type: need.type,
        bloodType: need.blood_type as 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | undefined,
        description: need.additional_info || "",
        urgency: need.urgency_level as 'low' | 'medium' | 'high' | 'critical'
      }));
  };
  
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch data from Supabase
      const [dbHospitals, dbEvents, dbVictims, dbDonationNeeds, hospitalEventsMap, lastUpdate] = await Promise.all([
        fetchHospitals(),
        fetchEvents(),
        fetchVictims(),
        fetchDonationNeeds(),
        getHospitalEventsMap(),
        getLastEvent()
      ]);

      // Save last update
      setLastUpdate(lastUpdate);
      
      // Map DB data to our app types
      const mappedHospitals: Hospital[] = dbHospitals.map(dbHospital => {
        const hospital = mapDbHospitalToHospital(dbHospital);
        hospital.donationNeeds = mapDonationNeedsToHospital(dbHospital.id, dbDonationNeeds);
        return hospital;
      });
      
      const mappedPatients = dbVictims.map(mapDbVictimToPatient);
      
      // Link patients to hospitals
      mappedHospitals.forEach(hospital => {
        hospital.patients = mappedPatients.filter(patient => patient.hospitalId === hospital.id);
      });
      
      // Create event objects
      const mappedEvents: Event[] = dbEvents.map(dbEvent => ({
        id: dbEvent.id,
        name: dbEvent.title,
        description: dbEvent.description || "",
        startDate: dbEvent.start_date,
        endDate: dbEvent.end_date || undefined,
        type: "natural_disaster",
        status: dbEvent.status === "active" ? "active" : "resolved",
        affectedHospitalIds: hospitalEventsMap[dbEvent.id] || []
      }));
      
      setHospitals(mappedHospitals);
      setEvents(mappedEvents);
      setPatients(mappedPatients);
      
      // Set current event if none is set
      if (mappedEvents.length > 0 && !currentEvent) {
        setCurrentEvent(mappedEvents[0]);
      }
      
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error loading data",
        description: "Could not retrieve data from the server. Using mock data instead.",
        variant: "destructive"
      });
      
      // Fallback to mock data
      setHospitals(mockHospitals);
      setEvents(mockEvents);
      setPatients(mockPatients);
      if (mockEvents.length > 0) {
        setCurrentEvent(mockEvents[0]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const searchPatients = (name: string) => {
    if (!name.trim()) return [];
    const lowerCaseName = name.toLowerCase();
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(lowerCaseName)
    );
  };

  const getHospital = (id: string) => {
    return hospitals.find(hospital => hospital.id === id);
  };

  const getEvent = (id: string) => {
    return events.find(event => event.id === id);
  };
  
  const refreshData = async () => {
    await loadData();
  };

  return (
    <AppContext.Provider value={{
      hospitals,
      events,
      patients,
      currentEvent,
      lastUpdate,
      setCurrentEvent,
      searchPatients,
      getHospital,
      getEvent,
      isLoading,
      refreshData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
