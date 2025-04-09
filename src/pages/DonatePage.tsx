
import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import { useAppContext } from '@/context/AppContext';
import EventSelector from '@/components/common/EventSelector';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Droplet, Package, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

const DonatePage = () => {
  const { hospitals, currentEvent } = useAppContext();
  
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
        <h1 className="text-2xl font-bold mb-4">Donations & Help</h1>
        <EventSelector />
        
        <div className="mt-6 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center space-x-3 pb-3 pt-4 px-4">
              <Droplet className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">Blood Donations</h2>
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
                            {need.bloodType ? `Type ${need.bloodType}` : 'All blood types'} - {need.description}
                          </p>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            need.urgency === 'critical' ? 'bg-destructive/20 text-destructive' :
                            need.urgency === 'high' ? 'bg-warning/20 text-warning' :
                            'bg-info/20 text-info'
                          }`}>
                            {need.urgency.charAt(0).toUpperCase() + need.urgency.slice(1)}
                          </span>
                        </div>
                      </div>
                    ) : null;
                  })}
                  
                  <Button className="w-full mt-2">
                    Schedule Blood Donation
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No blood donation needs at this time.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-x-3 pb-3 pt-4 px-4">
              <Package className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">Supply Donations</h2>
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
                    Donate Supplies
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No supply donation needs at this time.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center space-x-3 pb-3 pt-4 px-4">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="font-semibold text-lg">Volunteer Help</h2>
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
                    Volunteer Now
                  </Button>
                </div>
              ) : (
                <p className="text-gray-500">No volunteer needs at this time.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MobileLayout>
  );
};

export default DonatePage;
