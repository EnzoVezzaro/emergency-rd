
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const EventsPage = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">
            Manage disaster events and related information.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Active Events</CardTitle>
              <CardDescription>Currently active disaster events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">3</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Events</CardTitle>
              <CardDescription>Events from the past 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">5</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Total Affected</CardTitle>
              <CardDescription>People affected by current events</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">1,245</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Event Timeline</CardTitle>
            <CardDescription>Recent event activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-4">
                <div className="w-1 h-full bg-primary"></div>
                <div>
                  <h3 className="font-medium">Hurricane Laura</h3>
                  <p className="text-sm text-muted-foreground">Added 2 days ago</p>
                  <p className="mt-1">Category 3 hurricane affecting coastal areas.</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-1 h-full bg-primary"></div>
                <div>
                  <h3 className="font-medium">Wildfire - Northern Region</h3>
                  <p className="text-sm text-muted-foreground">Updated 5 days ago</p>
                  <p className="mt-1">Containment increased to 45%.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EventsPage;
