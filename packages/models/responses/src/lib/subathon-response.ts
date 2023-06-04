import { Duration } from "./duration";
import { EventType } from "./subathon-event.response";

export enum SubathonState {
    INIT,
    IN_PROGRESS,
    PAUSED,
    STOPPING,
    ENDED
}

export interface SubathonRuntime {
    remainingDuration: Duration;
    endTimestamp: string;
    history: {
        state: SubathonState,
        timestamp: string;
        remainingDuration: Duration;
    }[];
}

export interface Subathon {
    id: string;
    state: SubathonState,
    token: string,
    twitchId: string,
    publicName?: string;
    configuration?: SubathonConfiguration;
    runtime?: SubathonRuntime;
}

export enum EventCalcType {
    CONSTANT,
    RANDOM,
}

export interface SubathonEventCalcConfiguration { 
    type: EventCalcType;
    multiple: boolean;
    minValueTrigger: number;
}

export interface ConstantEventCalcConfiguration extends SubathonEventCalcConfiguration {
    type: EventCalcType.CONSTANT;
    value: Duration;
}

export interface RandomEventCalcConfiguration extends SubathonEventCalcConfiguration {
    type: EventCalcType.RANDOM;
    minValue: Duration;
    maxValue: Duration;
}

type AllSubathonEventCalcConfiguration = ConstantEventCalcConfiguration | RandomEventCalcConfiguration;

export interface SubathonConfiguration {
    initialDuration: Duration;
    nextTimeLiveStart: boolean;
    events: Partial<Record<EventType, AllSubathonEventCalcConfiguration>>;
}


export interface SubathonsResponse {
    subathons: Subathon[]
}