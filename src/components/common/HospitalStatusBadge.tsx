
import React from 'react';
import { useI18n } from '@/context/I18nContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type HospitalStatusBadgeProps = {
  status: 'receiving' | 'full' | 'closed';
};

const HospitalStatusBadge = ({ status }: HospitalStatusBadgeProps) => {
  const { t } = useI18n();
  
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'receiving':
        return { label: t('hospitalsPage.hospitalStatus.receiving'), className: 'bg-success text-white' };
      case 'full':
        return { label: t('hospitalsPage.hospitalStatus.full'), className: 'bg-warning text-white' };
      case 'closed':
        return { label: t('hospitalsPage.hospitalStatus.closed'), className: 'bg-destructive text-white' };
      default:
        return { label: t('hospitalsPage.hospitalStatus.unknown'), className: 'bg-gray-400 text-white' };
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
