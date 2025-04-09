
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const PatientsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
          <p className="text-muted-foreground">
            Manage patient information and track status.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Patients</CardTitle>
              <CardDescription>Registered in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">487</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Hospitalized</CardTitle>
              <CardDescription>Currently in hospital care</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">215</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Critical</CardTitle>
              <CardDescription>In critical condition</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">42</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Patient Activity</CardTitle>
            <CardDescription>Patient status changes in the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4 border-l-2 border-primary pl-4">
                <div>
                  <h3 className="font-medium">Patient ID: 38291</h3>
                  <p className="text-sm text-muted-foreground">2 hours ago</p>
                  <p className="mt-1">Transferred from ER to ICU</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 border-l-2 border-green-500 pl-4">
                <div>
                  <h3 className="font-medium">Patient ID: 29384</h3>
                  <p className="text-sm text-muted-foreground">5 hours ago</p>
                  <p className="mt-1">Discharged - condition stable</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4">
                <div>
                  <h3 className="font-medium">Patient ID: 47392</h3>
                  <p className="text-sm text-muted-foreground">8 hours ago</p>
                  <p className="mt-1">New admission - hurricane evacuation</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PatientsPage;
