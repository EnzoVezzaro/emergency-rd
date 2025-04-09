
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Hospital, Event, Patient } from '../types';
import { mockHospitals, mockEvents, mockPatients } from '../data/mockData';

type AppContextType = {
  hospitals: Hospital[];
  events: Event[];
  patients: Patient[];
  currentEvent: Event | null;
  setCurrentEvent: (event: Event | null) => void;
  searchPatients: (name: string) => Patient[];
  getHospital: (id: string) => Hospital | undefined;
  getEvent: (id: string) => Event | undefined;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [hospitals, setHospitals] = useState<Hospital[]>(mockHospitals);
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [currentEvent, setCurrentEvent] = useState<Event | null>(mockEvents[0]);

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

  return (
    <AppContext.Provider value={{
      hospitals,
      events,
      patients,
      currentEvent,
      setCurrentEvent,
      searchPatients,
      getHospital,
      getEvent
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
