import { EventProcessStatus, SubathonEvent } from "@subathon/models/responses";
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { EntityType, SUBATHON_EVENT_PRIMARY_KEY_PREFIX, SUBATHON_PRIMARY_KEY_PREFIX, SubathonEventRecord, dynamoDB } from './dynamodb';

export async function getSubathonEvent(subathonId:string, subathonEventId: string): Promise<SubathonEvent | null> {

    try {
        const subathonEvent = (await dynamoDB.send(new GetCommand({
            TableName: 'subathon',
            Key: {
                primaryKey: `${SUBATHON_PRIMARY_KEY_PREFIX}${subathonId}`,
                sortKey: `${SUBATHON_EVENT_PRIMARY_KEY_PREFIX}${subathonEventId}`
            },
        }))).Item as SubathonEvent | undefined;
    
        if(!subathonEvent){
            return null;
        } else {
            return {
                id: subathonEvent.id,
                details: subathonEvent.details,
                status: subathonEvent.status,
            }
        }
    }catch(e) {
        console.log(e);
        throw new Error('Unable to get Subathon Event');
    }
    
}

export async function createSubathonEvent(subathonId:string, event: SubathonEvent) {
    try{
        const subathonEventRecord: SubathonEventRecord = {
            details: event.details,
            entityType: EntityType.SUBATHON_EVENT,
            id: event.id,
            status: event.status,
            primaryKey: `${SUBATHON_PRIMARY_KEY_PREFIX}${subathonId}`,
            sortKey: `${SUBATHON_EVENT_PRIMARY_KEY_PREFIX}${event.id}`
        }

        await dynamoDB.send(new PutCommand({
            TableName: 'subathon',
            Item: subathonEventRecord                
        }));

        return event;
    }catch(e){
        throw new Error('Unable able to create Subathon Event');
    }
}

export async function updateSubathonEvent(subathonId:string, subathonEventId:string, event: SubathonEvent) {
    try{
        const subathonEvent = await getSubathonEvent(subathonId, subathonEventId);
        if(subathonEvent){
            await dynamoDB.send(new PutCommand({
                TableName: 'subathon',
                Item: Object.assign({}, subathonEvent, event)                
            }));
        }
        
        return event;
    }catch(e){
        throw new Error('Unable able to create Subathon Event');
    }
}

export async function getUnProcessedSubathonEvents(subathonId: string): Promise<SubathonEvent[]> {
    try {
        const subathonEventRecords = (await dynamoDB.send(new QueryCommand({
            TableName: 'subathon',
            IndexName: 'subathon-event-by-processed',
            KeyConditionExpression: 'primaryKey = :subathonId',
            FilterExpression: 'status = :status',
            ExpressionAttributeValues: {
                ':subathonId': `${SUBATHON_EVENT_PRIMARY_KEY_PREFIX}${subathonId}`,
                ':status': EventProcessStatus.NotProcessed
            },
        }))).Items as SubathonEventRecord[] | undefined;

        if(!subathonEventRecords){
            return [];
        } else {
            return subathonEventRecords.map((subathonEventRecord) => {
                return {
                    details: subathonEventRecord.details,
                    id: subathonEventRecord.id,
                    status: subathonEventRecord.status,
                }
            });
        }
    }catch(e) {
        console.log(e);
        throw new Error('Unable to get unprocessed subathon events');
    }
}