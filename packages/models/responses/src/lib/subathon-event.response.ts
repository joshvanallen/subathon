import { Duration } from "./duration";

export enum EventProcessStatus {
    NotProcessed,
    Processed
}

export enum EventType {
    SUB,
    GIFTED,
    BITS
}

export interface SubmittedUser {
    anonymous?: boolean;
    twitchId?: string;
    twitchName?: string;
}

export interface SubathonEventDetails {
    submittedUser: SubmittedUser;
    timeAdded: Duration;
    weight: number;
    time: Duration;
    type: EventType;
    timestamp: string;
}

export interface SubathonEvent {
    id: string;
    status: EventProcessStatus;
    details: SubathonEventDetails;
}