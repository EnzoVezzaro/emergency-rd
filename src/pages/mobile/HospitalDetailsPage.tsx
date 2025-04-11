
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Phone, MapPin, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import MobileLayout from '@/components/layout/MobileLayout';
import HospitalStatusBadge from '@/components/common/HospitalStatusBadge';
import DonationNeedBadge from '@/components/common/DonationNeedBadge';
import { useAppContext } from '@/context/AppContext';
import { useI18n } from '@/context/I18nContext';
import { es, enUS } from 'date-fns/locale'
import { formatDistanceToNow } from 'date-fns';

const HospitalDetailsPage = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const { hospitals, lastUpdate } = useAppContext();
  const { t, language } = useI18n();
  
  const hospital = hospitals.find(h => h.id === hospitalId);
  
  if (!hospital) {
    return (
      <MobileLayout>
        <div className="p-4">
          <Link to="/hospitals" className="flex items-center text-primary mb-4">
            <ChevronLeft size={20} className="mr-1" />
            {t('hospitalDetailsPage.backLink')}
          </Link>
          <div className="text-center p-8">
            <p>{t('hospitalDetailsPage.notFound.message')}</p>
            <Link to="/hospitals" className="text-primary mt-4 inline-block">
              {t('hospitalDetailsPage.notFound.link')}
            </Link>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <div className="p-4">
        <Link to="/hospitals" className="flex items-center text-primary mb-4">
          <ChevronLeft size={20} className="mr-1" />
          {t('hospitalDetailsPage.backLink')}
        </Link>
        
        <div className="mb-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold">{hospital.name}</h1>
            <HospitalStatusBadge status={hospital.status} />
          </div>
          
          <div className="flex items-center text-gray-600 mb-1">
            <MapPin size={16} className="mr-1" />
            <span className="text-sm">
              {hospital.address}, {hospital.city}, {hospital.state} {hospital.zipCode}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Phone size={16} className="mr-1" />
            <span className="text-sm">{hospital.phone}</span>
          </div>
        </div>
        
        <Tabs defaultValue="patients" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="patients">{t('hospitalDetailsPage.tabs.patients')}</TabsTrigger>
            <TabsTrigger value="donation">{t('hospitalDetailsPage.tabs.donationNeeds')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="patients">
            <Card className="mt-2">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">{t('hospitalDetailsPage.patients.title')}</h3>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" /> 
                      {
                        lastUpdate?.created_at && (
                          formatDistanceToNow(new Date(lastUpdate.created_at), { 
                            addSuffix: true,
                            locale: language === 'es' ? es : enUS
                          })
                        )
                      }
                  </div>
                </div>
                
                {hospital.patients.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {hospital.patients.map((patient) => (
                      <div key={patient.id} className="py-3">
                        <div className="flex justify-between">
                          <p className="font-medium">{patient.name}</p>
                          {patient.condition && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              patient.condition === 'stable' ? 'bg-success/20 text-success' : 
                              patient.condition === 'critical' ? 'bg-destructive/20 text-destructive' : 
                              patient.condition === 'deceased' ? 'bg-destructive/20 text-destructive' : 
                              'bg-gray-200 text-gray-700'
                            }`}>
                              {t(`patientCondition.${patient.condition}`)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {t('hospitalDetailsPage.patients.admitted')}: {new Date(patient.dateAdmitted).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('hospitalDetailsPage.patients.noRecords')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="donation">
            <Card className="mt-2">
              <CardContent className="p-4">
                <h3 className="font-medium mb-4">{t('hospitalDetailsPage.donationNeeds.title')}</h3>
                
                {hospital.donationNeeds.length > 0 ? (
                  <div className="space-y-4">
                    {hospital.donationNeeds.map((need) => (
                      <div key={need.id} className="bg-gray-50 p-3 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <DonationNeedBadge need={need} />
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded-full capitalize">
                          {t('hospitalDetailsPage.donationNeeds.priority')}: {t(`urgency.${need.urgency}`)}
                          </span>
                        </div>
                        <p className="text-sm">{need.description}</p>
                      </div>
                    ))}
                    
                    <div className="pt-4">
                      <a href={`tel:${hospital.phone}`} target='_blank' className="w-full">
                        <Button className="w-full">
                          {t('hospitalDetailsPage.donationNeeds.button')}
                        </Button> 
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">{t('hospitalDetailsPage.donationNeeds.noNeeds')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default HospitalDetailsPage;
