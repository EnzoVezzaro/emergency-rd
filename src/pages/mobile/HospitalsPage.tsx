
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import EventSelector from '@/components/common/EventSelector';
import HospitalCard from '@/components/common/HospitalCard';
import { useAppContext } from '@/context/AppContext';
import { useI18n } from '@/context/I18nContext'; // Import useI18n

const HospitalsPage = () => {
  const { hospitals, currentEvent } = useAppContext();
  const { t } = useI18n(); // Initialize useI18n
  
  const filteredHospitals = currentEvent
    ? hospitals.filter(hospital => 
        currentEvent.affectedHospitalIds.includes(hospital.id)
      )
    : hospitals;

  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{t('hospitalsPage.title')}</h1>
        <EventSelector />
        
        <div className="space-y-4 mt-4">
          {filteredHospitals.length > 0 ? (
            filteredHospitals.map((hospital) => (
              <HospitalCard key={hospital.id} hospital={hospital} />
            ))
          ) : (
            <div className="text-center p-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500">{t('hospitalsPage.noHospitals')}</p>
            </div>
          )}
        </div>
      </div>
    </MobileLayout>
  );
};

export default HospitalsPage;
