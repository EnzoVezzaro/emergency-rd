
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type HospitalStatusBadgeProps = {
  status: 'receiving' | 'full' | 'closed';
};

const HospitalStatusBadge = ({ status }: HospitalStatusBadgeProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'receiving':
        return { label: 'Receiving Patients', className: 'bg-success text-white' };
      case 'full':
        return { label: 'Full Capacity', className: 'bg-warning text-white' };
      case 'closed':
        return { label: 'Closed', className: 'bg-destructive text-white' };
      default:
        return { label: 'Unknown', className: 'bg-gray-400 text-white' };
    }
  };

  const { label, className } = getStatusConfig(status);

  return (
    <Badge variant="outline" className={cn('font-medium', className)}>
      {label}
    </Badge>
  );
};

export default HospitalStatusBadge;
