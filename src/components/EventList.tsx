import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface Event {
    code: string;
    name: string;
    type: string;
    venue: string;
    city: string;
    stateProv: string;
    country: string;
    dateStart: string;
    dateEnd: string;
}

const EventList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const currentYear = new Date().getFullYear();
                const response = await api.searchEvents(currentYear);
                if (response.events) {
                    setEvents(response.events);
                } else {
                    setEvents([]);
                }
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch events');
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    if (loading) return <div>Loading events...</div>;
    if (error) return <div>Error: {error}</div>;
    if (events.length === 0) return <div>No events found</div>;

    return (
        <div className="event-list">
            <h2>FTC Events</h2>
            <div className="event-grid">
                {events.map(event => (
                    <div key={event.code} className="event-card">
                        <h3>{event.name}</h3>
                        <p>{event.type}</p>
                        <p>{event.venue}</p>
                        <p>{event.city}, {event.stateProv}</p>
                        <p>{event.country}</p>
                        <p>Date: {new Date(event.dateStart).toLocaleDateString()} - {new Date(event.dateEnd).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList;