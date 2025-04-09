
import { Hospital, Event, Patient, DonationNeed } from '../types';

export const mockHospitals: Hospital[] = [
  {
    id: 'h1',
    name: 'Harbor Medical Center',
    address: '123 Main St',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98101',
    phone: '(206) 555-1234',
    status: 'receiving',
    latitude: 47.6062,
    longitude: -122.3321,
    donationNeeds: [
      {
        id: 'd1',
        type: 'blood',
        bloodType: 'O-',
        description: 'Urgently needed for trauma patients',
        urgency: 'critical'
      },
      {
        id: 'd2',
        type: 'supplies',
        description: 'Medical masks and gloves',
        urgency: 'medium'
      }
    ],
    patients: []
  },
  {
    id: 'h2',
    name: 'City General Hospital',
    address: '456 Oak Ave',
    city: 'Seattle',
    state: 'WA',
    zipCode: '98102',
    phone: '(206) 555-5678',
    status: 'full',
    latitude: 47.6152,
    longitude: -122.3261,
    donationNeeds: [
      {
        id: 'd3',
        type: 'blood',
        bloodType: 'A+',
        description: 'Needed for scheduled surgeries',
        urgency: 'medium'
      }
    ],
    patients: []
  },
  {
    id: 'h3',
    name: 'Lakeside Medical',
    address: '789 Pine Blvd',
    city: 'Bellevue',
    state: 'WA',
    zipCode: '98004',
    phone: '(425) 555-9012',
    status: 'receiving',
    latitude: 47.6101,
    longitude: -122.2015,
    donationNeeds: [
      {
        id: 'd4',
        type: 'volunteers',
        description: 'Medical professionals needed for night shifts',
        urgency: 'high'
      }
    ],
    patients: []
  }
];

export const mockEvents: Event[] = [
  {
    id: 'e1',
    name: 'Downtown Building Collapse',
    description: 'A 5-story building collapsed in the downtown area following structural issues.',
    startDate: '2025-04-08T14:30:00Z',
    type: 'accident',
    status: 'active',
    affectedHospitalIds: ['h1', 'h2']
  },
  {
    id: 'e2',
    name: 'Highway 99 Multi-Vehicle Accident',
    description: 'Major collision involving 8 vehicles on Highway 99 northbound.',
    startDate: '2025-04-09T08:15:00Z',
    type: 'accident',
    status: 'active',
    affectedHospitalIds: ['h1', 'h3']
  }
];

export const mockPatients: Patient[] = [
  {
    id: 'p1',
    name: 'John Smith',
    condition: 'stable',
    dateAdmitted: '2025-04-08T15:45:00Z',
    hospitalId: 'h1',
    eventId: 'e1'
  },
  {
    id: 'p2',
    name: 'Maria Rodriguez',
    condition: 'critical',
    dateAdmitted: '2025-04-08T16:20:00Z',
    hospitalId: 'h1',
    eventId: 'e1'
  },
  {
    id: 'p3',
    name: 'David Lee',
    condition: 'stable',
    dateAdmitted: '2025-04-08T16:45:00Z',
    hospitalId: 'h2',
    eventId: 'e1'
  },
  {
    id: 'p4',
    name: 'Sarah Johnson',
    condition: 'unknown',
    dateAdmitted: '2025-04-09T09:15:00Z',
    hospitalId: 'h1',
    eventId: 'e2'
  },
  {
    id: 'p5',
    name: 'Michael Chen',
    condition: 'stable',
    dateAdmitted: '2025-04-09T09:30:00Z',
    hospitalId: 'h3',
    eventId: 'e2'
  }
];

// Populate patients in hospitals
mockHospitals.forEach(hospital => {
  hospital.patients = mockPatients.filter(patient => patient.hospitalId === hospital.id);
});
