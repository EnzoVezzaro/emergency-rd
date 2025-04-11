
import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import { AlertCircle, Hospital } from 'lucide-react'; // Added Hospital icon
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// Removed Button import as placeholder is removed
import MobileLayout from '@/components/layout/MobileLayout';
import EventSelector from '@/components/common/EventSelector';
import { useAppContext } from '@/context/AppContext';
import { useI18n } from '@/context/I18nContext';

// Helper function to create custom marker icons with patient count
const createPatientCountIcon = (count: number) => {
  return L.divIcon({
    html: `<div class="relative flex items-center justify-center bg-blue-500 text-white rounded-full w-8 h-8 border-2 border-white shadow-md">
             <span class="absolute text-xs font-bold">${count}</span>
           </div>`,
    className: '', // Important to clear default leaflet styles if needed
    iconSize: [32, 32],
    iconAnchor: [16, 16], // Center the icon anchor
  });
};

// Default icon for Leaflet markers (if needed, e.g., for fallback)
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
//   iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//   shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
// });


const MapPage = () => {
  const navigate = useNavigate(); // Initialize useNavigate
  // Get hospitals and patients from context
  const { currentEvent, refreshData, hospitals, patients } = useAppContext();
  const { t } = useI18n();

  // Calculate patient count per hospital for the current event
  const hospitalsWithPatientCount = useMemo(() => {
    const patientCounts: { [key: string]: number } = {};

    // Filter patients by the current event and count per hospital
    patients
      .filter(p => p.eventId === currentEvent?.id) // Changed to camelCase: eventId
      .forEach(patient => {
        if (patient.hospitalId) { // Changed to camelCase: hospitalId
          patientCounts[patient.hospitalId] = (patientCounts[patient.hospitalId] || 0) + 1; // Changed to camelCase: hospitalId
        }
      });

    // Map hospital data and add patient count
    return hospitals.map(hospital => ({
      ...hospital,
      patientCount: patientCounts[hospital.id] || 0,
    }));
  }, [hospitals, patients, currentEvent]);


  useEffect(()=>{
    refreshData()
  }, [])

  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{t('mapPage.title')}</h1>
        <EventSelector />
        
        <div className="mt-2 mb-6">
          <Alert variant="default" className="bg-primary-50 border-primary-200">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertTitle>{t('mapPage.eventActive.title')}</AlertTitle>
            <AlertDescription>
              {currentEvent?.name} - {currentEvent?.description.substring(0, 100)}
              {currentEvent?.description.length > 100 ? '...' : ''}
            </AlertDescription>
          </Alert>
        </div>

        {/* Map Container */}
        <div className="relative rounded-lg overflow-hidden h-[60vh] border border-gray-200">
          {/* Ensure Leaflet CSS is loaded before rendering MapContainer */}
          <MapContainer 
            center={[18.7357, -70.1627]} // Default center (Dominican Republic)
            zoom={8} 
            scrollWheelZoom={true} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Markers for each hospital */}
            {hospitalsWithPatientCount.map(hospital => (
              hospital.latitude && hospital.longitude && ( // Ensure lat/lng exist
                <Marker 
                  key={hospital.id} 
                  position={[hospital.latitude, hospital.longitude]}
                  icon={createPatientCountIcon(hospital.patientCount)}
                >
                  <Popup>
                    <button 
                      className="font-semibold text-blue-600 hover:underline text-left w-full" 
                      onClick={() => navigate(`/hospitals/${hospital.id}`)}
                    >
                      {hospital.name}
                    </button>
                    <div>{t('mapPage.peopleRegistered')}: {hospital.patientCount}</div>
                    <div className="text-xs text-gray-500">{hospital.address}</div>
                  </Popup>
                </Marker>
              )
            ))}
          </MapContainer> {/* Added closing tag */}
        </div>
      </div>
    </MobileLayout>
  );
};

export default MapPage;
