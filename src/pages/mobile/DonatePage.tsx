
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAppContext } from '@/context/AppContext';
import EventSelector from '@/components/common/EventSelector';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Droplet, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/context/I18nContext'; // Import useI18n

const DonatePage = () => {
  const { hospitals, currentEvent } = useAppContext();
  const { t } = useI18n(); // Initialize useI18n
  
  const filteredHospitals = currentEvent
    ? hospitals.filter(hospital => 
        currentEvent.affectedHospitalIds.includes(hospital.id)
      )
    : hospitals;

  const bloodNeeds = filteredHospitals.flatMap(hospital => 
    hospital.donationNeeds.filter(need => need.type === 'blood')
  );
  
  const supplyNeeds = filteredHospitals.flatMap(hospital => 
    hospital.donationNeeds.filter(need => need.type === 'supplies')
  );
  
  const volunteerNeeds = filteredHospitals.flatMap(hospital => 
    hospital.donationNeeds.filter(need => need.type === 'volunteers')
  );

  return (
    <MobileLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">{t('donatePage.title')}</h1>
        <EventSelector />
        
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-3 pb-3 pt-4 px-4">
              <Droplet className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">{t('donatePage.bloodDonations.title')}</h2>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {bloodNeeds.length > 0 ? (
                <div className="space-y-3">
                  {bloodNeeds.map((need, index) => {
                    const hospital = filteredHospitals.find(h => 
                      h.donationNeeds.some(n => n.id === need.id)
                    );
                    
                    return hospital ? (
                      <div key={need.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">{hospital.name}</p>
                        <div className="flex justify-between items-center">
                          <p className="text-sm">
                            {need.bloodType ? `${t('donatePage.bloodDonations.type')} ${need.bloodType}` : t('donatePage.bloodDonations.allTypes')} - {need.description}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            need.urgency === 'critical' ? 'bg-destructive/20 text-destructive' :
                            need.urgency === 'high' ? 'bg-warning/20 text-warning' :
                            'bg-info/20 text-info'
                          }`}>
                            {t(`urgency.${need.urgency}`)}
                          </span>
                        </div>
                        <a href={`tel:${hospital.phone}`} target="_blank" rel="noopener noreferrer">
                          <Button className="w-full mt-4">
                            {t('donatePage.bloodDonations.button')}
                          </Button>
                        </a>
                      </div>
                    ) : null;
                  })}
                </div>
              ) : (
                <p className="text-gray-500">{t('donatePage.bloodDonations.noNeeds')}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-x-3 pb-3 pt-4 px-4">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">{t('donatePage.supplyDonations.title')}</h2>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {supplyNeeds.length > 0 ? (
                <div className="space-y-3">
                  {supplyNeeds.map((need, index) => {
                    const hospital = filteredHospitals.find(h => 
                      h.donationNeeds.some(n => n.id === need.id)
                    );
                    
                    return hospital ? (
                      <div key={need.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">{hospital.name}</p>
                        <p className="text-sm">{need.description}</p>
                      </div>
                    ) : null;
                  })}
                  
                  <Button className="w-full mt-2">
                    {t('donatePage.supplyDonations.button')}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">{t('donatePage.supplyDonations.noNeeds')}</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-x-3 pb-3 pt-4 px-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">{t('donatePage.volunteerHelp.title')}</h2>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              {volunteerNeeds.length > 0 ? (
                <div className="space-y-3">
                  {volunteerNeeds.map((need, index) => {
                    const hospital = filteredHospitals.find(h => 
                      h.donationNeeds.some(n => n.id === need.id)
                    );
                    
                    return hospital ? (
                      <div key={need.id} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium mb-1">{hospital.name}</p>
                        <p className="text-sm">{need.description}</p>
                      </div>
                    ) : null;
                  })}
                  
                  <Button className="w-full mt-2">
                    {t('donatePage.volunteerHelp.button')}
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">{t('donatePage.volunteerHelp.noNeeds')}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default DonatePage;
