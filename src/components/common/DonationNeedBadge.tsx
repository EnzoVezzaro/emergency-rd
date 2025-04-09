
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DonationNeed } from '@/types';

type DonationNeedBadgeProps = {
  need: DonationNeed;
};

const DonationNeedBadge = ({ need }: DonationNeedBadgeProps) => {
  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'critical':
        return { className: 'bg-destructive text-white animate-pulse-gentle' };
      case 'high':
        return { className: 'bg-warning text-white' };
      case 'medium':
        return { className: 'bg-info text-white' };
      default:
        return { className: 'bg-slate-400 text-white' };
    }
  };

  const getTypeLabel = (need: DonationNeed) => {
    if (need.type === 'blood' && need.bloodType) {
      return `Blood Type ${need.bloodType}`;
    }
    
    return {
      blood: 'Blood',
      supplies: 'Supplies',
      volunteers: 'Volunteers'
    }[need.type] || need.type;
  };

  const { className } = getUrgencyConfig(need.urgency);

  return (
    <Badge variant="outline" className={cn('font-medium', className)}>
      {getTypeLabel(need)}
    </Badge>
  );
};

export default DonationNeedBadge;
