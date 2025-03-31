import axios from 'axios';
import config from '../config';

// Use localhost backend instead of direct API calls
const BASE_URL = 'http://localhost:8000/api';
const AUTH_TOKEN = btoa(`${config.ftcApi.username}:${config.ftcApi.key}`);

const axiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Authorization': `Basic ${AUTH_TOKEN}`,
        'Content-Type': 'application/json'
    }
});

const api = {
    // Teams API
    getTeam: async (number, season = config.currentSeason) => {
        const response = await axiosInstance.get(`/teams/${season}`, {
            params: { teamNumber: number }
        });
        return response.data;
    },

    getTeamEvents: async (number, season = config.currentSeason) => {
        const response = await axiosInstance.get(`/events/${season}`, {
            params: { teamNumber: number }
        });
        return response.data;
    },

    getTeamMatches: async (number, season = config.currentSeason, eventCode) => {
        const response = await axiosInstance.get(`/schedule/${season}/${eventCode}/${config.defaultTournamentLevel}`, {
            params: {
                teamNumber: number
            }
        });
        return response.data;
    },

    searchTeams: async (season = config.currentSeason, state = '', search = '') => {
        const params = {};
        if (state) params.state = state;
        if (search) {
            const isNumber = !isNaN(search) && !isNaN(parseFloat(search));
            if (isNumber) {
                params.teamNumber = parseInt(search);
            } else {
                params.search = search;
            }
        }
        
        const response = await axiosInstance.get(`/teams/${season}`, { params });
        return response.data;
    },

    searchEvents: async (params = { season: config.currentSeason }) => {
        // If params is just a number, treat it as the season
        const season = typeof params === 'number' ? params : (params.season || config.currentSeason);
        const response = await axiosInstance.get(`/events/${season}`, { params: typeof params === 'object' ? params : {} });
        // Ensure we always return an array for filtering
        if (response.data && Array.isArray(response.data)) {
            return response.data;
        } else if (response.data && response.data.events && Array.isArray(response.data.events)) {
            return response.data.events;
        } else {
            console.warn('Events data is not in expected format:', response.data);
            return [];
        }
    },

    getEvent: async (season = config.currentSeason, eventCode) => {
        const response = await axiosInstance.get(`/events/${season}/${eventCode}`);
        return response.data;
    },

    getEventDetails: async (season = config.currentSeason, eventCode) => {
        const [eventData, rankings] = await Promise.all([
            axiosInstance.get(`/events/${season}/${eventCode}`),
            axiosInstance.get(`/rankings/${season}/${eventCode}`)
        ]);
        return {
            ...eventData.data,
            rankings: rankings.data
        };
    }
};

export default api;