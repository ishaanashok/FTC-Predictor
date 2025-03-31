export interface Event {
    code: string;
    name: string;
    type: string;
    city: string;
    stateProv: string;
    country: string;
    dateStart: string;
    dateEnd: string;
    venue: string;
}

export interface Team {
    teamNumber: number;
    nameShort: string;
    nameFull: string;
    city: string;
    stateProv: string;
    country: string;
    website?: string;
    rookieYear?: number;
}