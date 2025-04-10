
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import MobileLayout from '@/components/layout/MobileLayout';
import EventSelector from '@/components/common/EventSelector';
import { useAppContext } from '@/context/AppContext';
import { useI18n } from '@/context/I18nContext'; // Import useI18n

const MapPage = () => {
  const { currentEvent } = useAppContext();
  const { t } = useI18n(); // Initialize useI18n

  console.log('currentEvent: ', currentEvent); 

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
        
        <div className="relative bg-gray-200 rounded-lg overflow-hidden h-[60vh]">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center p-4">
              <p className="text-gray-600 mb-4">{t('mapPage.placeholder.text')}</p>
              <Button variant="outline" className="bg-white">
                {t('mapPage.placeholder.button')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MobileLayout>
  );
};

export default MapPage;
