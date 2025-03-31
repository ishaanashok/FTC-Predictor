import React from 'react';
import type { Event } from '../types';

interface EventsProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (eventCode: string) => void;
}

const Events: React.FC<EventsProps> = ({ events, selectedEvent, onEventSelect }) => {
  return (
    <div className="events-container">
      <h2>FTC Events</h2>
      <div className="events-grid">
        {events.map(event => (
          <div 
            key={event.code} 
            className={`event-card ${selectedEvent?.code === event.code ? 'selected' : ''}`}
            onClick={() => onEventSelect(event.code)}
          >
            <h3>{event.name}</h3>
            <p className="event-location">{event.city}{event.stateProv ? `  ${event.stateProv}` : ''}</p>
            <p className="event-dates">
              {event.dateStart && !isNaN(new Date(event.dateStart.split('T')[0]).getTime()) 
                ? new Date(event.dateStart.split('T')[0]).toLocaleDateString() 
                : 'TBD'} - 
              {event.dateEnd && !isNaN(new Date(event.dateEnd.split('T')[0]).getTime()) 
                ? new Date(event.dateEnd.split('T')[0]).toLocaleDateString() 
                : 'TBD'}
            </p>
            <p className="event-type">{event.type}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Events;