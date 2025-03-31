import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

class FTCApi {
    private axiosInstance;

    constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    private async request(endpoint: string, params = {}) {
        try {
            const response = await this.axiosInstance.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error('FTC API Error:', error);
            throw error;
        }
    }

    async getTeams(season: number) {
        return this.request(`/teams/${season}`);
    }

    async getTeamInfo(season: number, teamNumber: number) {
        return this.request(`/teams/${season}/${teamNumber}`);
    }

    async getEvents(season: number) {
        return this.request(`/events/${season}`);
    }

    async getEventInfo(season: number, eventCode: string) {
        return this.request(`/events/${season}/${eventCode}`);
    }

    async getEventRankings(season: number, eventCode: string) {
        return this.request(`/rankings/${season}/${eventCode}`);
    }

    async getEventSchedule(season: number, eventCode: string, tournamentLevel: 'qual' | 'playoff') {
        return this.request(`/schedule/${season}/${eventCode}/${tournamentLevel}`);
    }
}

export default FTCApi;