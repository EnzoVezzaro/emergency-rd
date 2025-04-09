
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const HospitalsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hospitals</h1>
          <p className="text-muted-foreground">
            Manage hospitals and their status information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Hospitals</CardTitle>
              <CardDescription>Registered in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">24</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>At Capacity</CardTitle>
              <CardDescription>Hospitals at or near capacity</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">7</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Available Beds</CardTitle>
              <CardDescription>Total available across network</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">132</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hospital Network</CardTitle>
            <CardDescription>Status of registered hospitals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Memorial Hospital</h3>
                  <p className="text-sm text-muted-foreground">Downtown</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 mr-2 bg-green-500 rounded-full"></span>
                  <span>Normal capacity</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">General Hospital</h3>
                  <p className="text-sm text-muted-foreground">Westside</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 mr-2 bg-amber-500 rounded-full"></span>
                  <span>Near capacity</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Children's Hospital</h3>
                  <p className="text-sm text-muted-foreground">Eastside</p>
                </div>
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 mr-2 bg-red-500 rounded-full"></span>
                  <span>At capacity</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default HospitalsPage;
