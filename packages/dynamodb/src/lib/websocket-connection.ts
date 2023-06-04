import { QueryCommand, PutCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { EntityType, SUBATHON_PRIMARY_KEY_PREFIX, WEBSOCKET_PRIMARY_KEY_PREFIX, WebSocketRecord, dynamoDB } from "./dynamodb"

export const createWebSocketRecord = async (subathonId:string, connectionId: string) => {
    const record: WebSocketRecord = {
        connectionId,
        primaryKey: `${SUBATHON_PRIMARY_KEY_PREFIX}${subathonId}`,
        entityType: EntityType.WEBSOCKET,
        sortKey: `${WEBSOCKET_PRIMARY_KEY_PREFIX}${connectionId}`
    }

    try {
        await dynamoDB.send(new PutCommand({
            TableName: 'subathon',
            Item: record                
        }));
        return {
            success: true
        }
    }catch(e){
        console.log(e);
        throw new Error('Unable to save Websocket Connection');
    }
}

export const getWebSocketConnectionId = async (subathonId: string) => {
    try {
        const websocketRecord = (await dynamoDB.send(new QueryCommand({
            TableName: 'subathon',
            KeyConditionExpression: 'primaryKey = :primaryKey',
            FilterExpression: 'entityType = :entity',
            ExpressionAttributeValues: {
                ':primaryKey': `${SUBATHON_PRIMARY_KEY_PREFIX}${subathonId}`,
                ':entity':EntityType.WEBSOCKET
            },

        }))).Items as WebSocketRecord[] | undefined;

        return websocketRecord && websocketRecord.length === 1 ? websocketRecord[0]: null;
    }catch(e){
        console.log(e);
        throw new Error('Unable to get Websocket Connection Id');
    }
}

export const deleteWebSocketConnection = async (connectionId: string ) => {
    try {
        const record = await getWebSocketConnectionIdByConnectionId(connectionId);
        const request = new DeleteCommand({
            TableName: 'subathon',
            
            Key: {
                'primaryKey': record?.primaryKey,
                'sortKey': record?.sortKey
            },
        });

        await dynamoDB.send(request);
    }catch(e){
        console.log(e);
        throw new Error('Unable to delete WebSocket Id');
    }
}

export const getWebSocketConnectionIdByConnectionId = async (connectionId: string) => {
    try {
        const websocketRecord = (await dynamoDB.send(new QueryCommand({
            TableName: 'subathon',
            IndexName: 'sortKey-primaryKey-index',
            KeyConditionExpression: 'soryKey = :sortKey',
            FilterExpression: 'entityType = :entity',
            ExpressionAttributeValues: {
                ':sortKey': `${WEBSOCKET_PRIMARY_KEY_PREFIX}${connectionId}`,
                ':entity':EntityType.WEBSOCKET
            },

        }))).Items as WebSocketRecord[] | undefined;

        return websocketRecord && websocketRecord.length === 1 ? websocketRecord[0]: null;
    }catch(e){
        console.log(e);
        throw new Error('Unable to get Websocket Connection Id');
    }
}