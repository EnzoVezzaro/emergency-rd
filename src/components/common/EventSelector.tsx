
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAppContext } from '@/context/AppContext';

const EventSelector = () => {
  const { events, currentEvent, setCurrentEvent } = useAppContext();

  return (
    <div className="mb-4">
      <Select
        value={currentEvent?.id}
        onValueChange={(value) => {
          const event = events.find((e) => e.id === value);
          if (event) setCurrentEvent(event);
        }}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an emergency event" />
        </SelectTrigger>
        <SelectContent>
          {events.map((event) => (
            <SelectItem key={event.id} value={event.id}>
              {event.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventSelector;
