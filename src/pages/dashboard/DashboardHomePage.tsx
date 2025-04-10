import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, Users, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/context/AppContext';
import { useI18n } from '@/context/I18nContext';
import { es, enUS } from 'date-fns/locale'

const DashboardHomePage = () => {
  const { t } = useI18n();
  const { language } = useI18n();
  const { hospitals, patients, events, refreshData, lastUpdate } = useAppContext(); 
  
  const activeEvents = events.filter(event => event.status === 'active');

  useEffect(()=>{
    refreshData()
  }, [])

  // console.log('event: ', events);
  const getAffectedCount = (event) =>{
    let count = 0;
    event.affectedHospitalIds.map((ah)=>{
      hospitals.map((h)=>{
        if (ah === h.id){
          count += h.patients.length
        }
      })
    })

    return count;
  }
  
  events.map((ev)=>{
    return ev.peopleAffected = getAffectedCount(ev);
  })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">{t('dashboardHome.title')}</h1>
          <p className="text-gray-500 mt-1">
            {t('dashboardHome.description')}
          </p>
        </div> 
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {t('dashboardHome.stats.activeEvents')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-2xl font-bold">{activeEvents.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {t('dashboardHome.stats.hospitals')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Hospital className="h-6 w-6 text-blue-500 mr-2" />
                <span className="text-2xl font-bold">{hospitals.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {t('dashboardHome.stats.registeredPatients')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-6 w-6 text-green-500 mr-2" />
                <span className="text-2xl font-bold">{patients.length}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {t('dashboardHome.stats.lastUpdate')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <span className="text-sm font-bold">
                  {
                    lastUpdate?.created_at && (
                      formatDistanceToNow(new Date(lastUpdate.created_at), { 
                        addSuffix: true,
                        locale: language === 'es' ? es : enUS
                      })
                    )
                  }
                  { !lastUpdate && 'Loading...' }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboardHome.sections.activeEvents')}</CardTitle>
            </CardHeader>
            <CardContent>
              {activeEvents.length > 0 ? (
                <div className="space-y-4">
                  {activeEvents.map(event => (
                    <div key={event.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{event.name}</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {t('dashboardHome.sections.hospitalStatus.active')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex text-sm text-gray-500 justify-between">
                        <span className="mr-4">
                          {t('dashboardHome.sections.labels.hospitals')}: {event.affectedHospitalIds.length}
                        </span>
                        <span>
                          {t('dashboardHome.sections.labels.started')}: {new Date(event.startDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex text-sm text-gray-500 justify-start">
                        <span className="">
                          {t('dashboardHome.sections.labels.involved')}: {event.peopleAffected}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  {t('dashboardHome.sections.noActiveEvents')}
                </p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboardHome.sections.recentUpdates')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {hospitals.slice(0, 3).map(hospital => (
                  <div key={hospital.id} className="bg-gray-50 p-3 rounded-lg">
                    <h3 className="font-medium mb-1">{hospital.name}</h3>
                    <div className="flex justify-between text-sm">
                      <span className={`${
                        hospital.status === 'receiving' ? 'text-green-600' :
                        hospital.status === 'full' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {t('dashboardHome.sections.labels.status')}: {t(`dashboardHome.sections.hospitalStatus.${hospital.status}`)}
                      </span>
                      <span className="text-gray-500">
                        {t('dashboardHome.sections.labels.involved')}: {hospital.patients.length}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHomePage;
