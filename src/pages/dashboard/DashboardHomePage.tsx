
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hospital, Users, Clock, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAppContext } from '@/context/AppContext';

const DashboardHomePage = () => {
  const { hospitals, patients, events } = useAppContext();
  
  const activeEvents = events.filter(event => event.status === 'active');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Emergency Response Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Manage emergency events, hospitals, and patient information
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Active Events</CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-500">Hospitals</CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-500">Registered Patients</CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-500">Last Update</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-purple-500 mr-2" />
                <span className="text-2xl font-bold">4m ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Emergency Events</CardTitle>
            </CardHeader>
            <CardContent>
              {activeEvents.length > 0 ? (
                <div className="space-y-4">
                  {activeEvents.map(event => (
                    <div key={event.id} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium">{event.name}</h3>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Active</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                      <div className="flex text-sm text-gray-500">
                        <span className="mr-4">
                          Hospitals: {event.affectedHospitalIds.length}
                        </span>
                        <span>
                          Started: {new Date(event.startDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No active emergency events.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Hospital Updates</CardTitle>
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
                        Status: {hospital.status.charAt(0).toUpperCase() + hospital.status.slice(1)}
                      </span>
                      <span className="text-gray-500">
                        Patients: {hospital.patients.length}
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
