import React, { useState, useEffect } from 'react';
import Events from '../components/Events';
import api from '../services/api';
import '../styles/Events.css';

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await api.searchEvents();
        setEvents(response.events || []);
        setError(null);
      } catch (err) {
        setError('Failed to fetch events');
        console.error('Error fetching events:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleEventSelect = async (eventCode: string) => {
    try {
      const eventDetails = await api.getEventDetails(2023, eventCode);
      setSelectedEvent(eventDetails.events[0]);
    } catch (err) {
      console.error('Failed to fetch event details:', err);
    }
  };

  if (error) return <div className="error">{error}</div>;
  if (loading && events.length === 0) return <div className="loading">Loading events...</div>;

  return (
    <Events
      events={events}
      selectedEvent={selectedEvent}
      onEventSelect={handleEventSelect}
    />
  );
};

export default EventsPage;