
import React from 'react';
import { Link } from 'react-router-dom';
import { Patient } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Hospital, Calendar } from 'lucide-react';

type PatientSearchResultProps = {
  patient: Patient;
};

const PatientSearchResult = ({ patient }: PatientSearchResultProps) => {
  const { getHospital, getEvent } = useAppContext();
  
  const hospital = getHospital(patient.hospitalId);
  const event = getEvent(patient.eventId);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConditionBadge = (condition?: string) => {
    switch (condition) {
      case 'stable':
        return <span className="text-xs bg-success/20 text-success/80 py-1 px-2 rounded-full">Stable</span>;
      case 'critical':
        return <span className="text-xs bg-destructive/20 text-destructive/80 py-1 px-2 rounded-full">Critical</span>;
      default:
        return <span className="text-xs bg-gray-200 text-gray-700 py-1 px-2 rounded-full">Unknown</span>;
    }
  };

  return (
    <Card className="overflow-hidden mb-4">
      <CardContent className="p-4">
        <div className="mb-3">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{patient.name}</h3>
            {getConditionBadge(patient.condition)}
          </div>
          {event && (
            <p className="text-sm text-gray-500 mt-1">
              From: {event.name}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          {hospital && (
            <div className="flex items-center text-sm">
              <Hospital size={16} className="mr-2 text-gray-500" />
              <Link to={`/hospitals/${hospital.id}`} className="text-primary hover:text-primary-600">
                {hospital.name}
              </Link>
            </div>
          )}
          
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-gray-500" />
            <span>Admitted {formatDate(patient.dateAdmitted)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientSearchResult;
