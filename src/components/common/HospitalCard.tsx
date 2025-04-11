
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Phone, MapPin } from 'lucide-react';
import { Hospital } from '@/types';
import HospitalStatusBadge from './HospitalStatusBadge';
import DonationNeedBadge from './DonationNeedBadge';
import { useI18n } from '@/context/I18nContext';

type HospitalCardProps = {
  hospital: Hospital;
};

const HospitalCard = ({ hospital }: HospitalCardProps) => {
  const { t } = useI18n();
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-gray-50 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{hospital.name}</h3>
            <a href={`https://maps.google.com/maps?q=${hospital.name +', '+ hospital.address}`} target="_blank" rel="noopener noreferrer">
              <div className="flex items-center text-gray-500 text-sm mt-1">
                <MapPin size={14} className="mr-1" />
                <span>{hospital.address}</span>
              </div>
            </a>
          </div>
          <HospitalStatusBadge status={hospital.status} />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-3">
          <a href={`tel:${hospital.phone}`} target="_blank" rel="noopener noreferrer">
            <div className="flex items-center mb-2">
              <Phone size={14} className="text-gray-500 mr-1" />
              <span className="text-sm">{hospital.phone}</span>
            </div>
          </a>
        </div>
        
        {hospital.donationNeeds.length > 0 && (
          <div className="mb-3">
            <h4 className="text-sm font-medium mb-1">Donation Needs:</h4>
            <div className="flex flex-wrap gap-2">
              {hospital.donationNeeds.map((need) => (
                <DonationNeedBadge key={need.id} need={need} />
              ))}
            </div>
          </div>
        )}
        
        <div className="pt-2">
          <Link 
            to={`/hospitals/${hospital.id}`}
            className="text-primary hover:text-primary-600 text-sm font-medium"
          >
            {t('hospitalsPage.seeDetails')}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default HospitalCard;
