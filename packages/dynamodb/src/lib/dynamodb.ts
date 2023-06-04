import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

import { BACKEND_CONSTANTS } from '@subathon/environments';
import { Subathon, SubathonEvent } from "@subathon/models/responses";

export enum EntityType {
    USER = 'user',
    SUBATHON = 'subathon',
    SUBATHON_EVENT = 'subathon_event',
    WEBSOCKET = 'WEBSOCKET_CONNECTION'
}

export interface baseRecord {
    primaryKey: string;
    sortKey: string;
    entityType: EntityType;
}

export const USER_PRIMARY_KEY_PREFIX = 'USER#';
export interface UserRecord extends baseRecord {
    twitchName: string;
    twitchId: string;
    entityType: EntityType.USER;
    accessToken: string;
    refreshToken: string;
}

export const SUBATHON_PRIMARY_KEY_PREFIX = 'SUBATHON#';
export type SubathonRecord = Subathon & baseRecord;

export const SUBATHON_EVENT_PRIMARY_KEY_PREFIX = 'SUBATHON_EVENT#';
export const WEBSOCKET_PRIMARY_KEY_PREFIX = 'WEBSOCKET#';

export interface WebSocketRecord extends baseRecord {
    entityType: EntityType.WEBSOCKET,
    connectionId: string;
}

export type SubathonEventRecord = SubathonEvent & baseRecord;

const client = new DynamoDBClient(process.env[BACKEND_CONSTANTS.envNames.dbEndpoint] ? {
    endpoint: 'http://localhost:8000'
} : {});
const dynamoDB = DynamoDBDocumentClient.from(client);

export { dynamoDB };