import axios from 'axios';

const BASE_URL = 'http://localhost:8000/api';

class FTCApi {
    constructor() {
        this.axiosInstance = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
    }

    // Helper method for making requests
    async request(endpoint, params = {}) {
        try {
            const response = await this.axiosInstance.get(endpoint, { params });
            return response.data;
        } catch (error) {
            console.error('FTC API Error:', error);
            throw error;
        }
    }

    // Advancement methods
    async getEventAdvancement(season, eventCode, excludeSkipped = false) {
        return this.request(`/advancement/${season}/${eventCode}`, { excludeSkipped });
    }

    async getAdvancementSource(season, eventCode, includeDeclines = false) {
        return this.request(`/advancement/${season}/${eventCode}/source`, { includeDeclines });
    }

    // League methods
    async getLeagues(season, regionCode = null, leagueCode = null) {
        return this.request(`/leagues/${season}`, { regionCode, leagueCode });
    }

    async getLeagueMembers(season, regionCode, leagueCode) {
        return this.request(`/leagues/${season}/members/${regionCode}/${leagueCode}`);
    }

    async getLeagueRankings(season, regionCode, leagueCode) {
        return this.request(`/leagues/${season}/rankings/${regionCode}/${leagueCode}`);
    }

    // Event methods
    async getEventInfo(season, eventCode) {
        return this.request(`/events/${season}`, { eventCode });
    }

    async getEventRankings(season, eventCode) {
        return this.request(`/events/${season}/${eventCode}/rankings`);
    }

    // Season Data methods
    async getSeasonSummary(season) {
        return this.request(`/season/${season}`);
    }

    async getEvents(season, eventCode = null, teamNumber = null) {
        return this.request(`/events/${season}`, { eventCode, teamNumber });
    }

    async getTeams(season, options = {}) {
        return this.request(`/teams/${season}`, options);
    }

    // Schedule methods
    async getHybridSchedule(season, eventCode, tournamentLevel, start = 0, end = 999) {
        return this.request(
            `/schedule/${season}/${eventCode}/${tournamentLevel}/hybrid`,
            { start, end }
        );
    }

    async getEventSchedule(season, eventCode, options = {}) {
        return this.request(`/schedule/${season}/${eventCode}`, options);
    }
}

export default FTCApi;