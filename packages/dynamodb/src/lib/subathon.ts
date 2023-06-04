import { Subathon, SubathonState } from "@subathon/models/responses";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { EntityType, SUBATHON_PRIMARY_KEY_PREFIX, SubathonRecord, USER_PRIMARY_KEY_PREFIX, UserRecord, baseRecord, dynamoDB } from './dynamodb';
import { randomUUID } from "crypto";
import { sign } from 'jsonwebtoken'
import { BACKEND_CONSTANTS } from "@subathon/environments";

export async function getSubathonsByUserId(userId: string): Promise<Subathon[]> {

    try {
        const subathons = (await dynamoDB.send(new QueryCommand({
            TableName: 'subathon',
            KeyConditionExpression: 'primaryKey = :userId',
            FilterExpression: 'entityType = :entity',
            ExpressionAttributeValues: {
                ':userId': `${USER_PRIMARY_KEY_PREFIX}${userId}`,
                ':entity':EntityType.SUBATHON
            },
        }))).Items as SubathonRecord[] | undefined;
    
        if(!subathons){
            return [];
        }

        return subathons.map((subathon: SubathonRecord) => {
            return {
                state: subathon.state,
                token: subathon.token,
                twitchId: subathon.twitchId,
                configuration: subathon.configuration,
                id: subathon.id,
                publicName: subathon.publicName,
                runtime: subathon.runtime
            };
        })
    }catch(e) {
        console.log(e);
        throw new Error('Unable to get Subathons');
    }
}

export async function getSubathon(userId:string, subathonId: string): Promise<SubathonRecord | null> {

    try {
        const subathon = (await dynamoDB.send(new GetCommand({
            TableName: 'subathon',
            Key: {
                'primaryKey':  `${USER_PRIMARY_KEY_PREFIX}${userId}`,
                'sortKey': `${SUBATHON_PRIMARY_KEY_PREFIX}${subathonId}`
            }
        }))).Item as SubathonRecord | undefined;
    
        if(!subathon){
            return null;
        }

        return subathon;
    }catch(e) {
        console.log(e);
        throw new Error('Unable to get Subathon');
    }
}

export async function saveSubathonRecord(subathonRecord:SubathonRecord): Promise<SubathonRecord> {
    try {

        await dynamoDB.send(new PutCommand({
            TableName: 'subathon',
            Item: subathonRecord                
        }));

        return subathonRecord;

    }catch(e){
        console.log(e);
        throw new Error('Unable to save the subathon record')
    }
}

export async function createSubathon(userId: string, subathon: Subathon): Promise<Subathon> {
    try {
        const id = `${randomUUID()}`;
        
        const subathonRecord: SubathonRecord = {
            entityType: EntityType.SUBATHON,
            primaryKey: `${USER_PRIMARY_KEY_PREFIX}${userId}`,
            id,
            sortKey: `${SUBATHON_PRIMARY_KEY_PREFIX}${id}`,
            state: SubathonState.INIT,
            publicName: subathon.publicName,
            twitchId: userId,
            configuration: subathon.configuration,
            token: sign({
                userId,
                subathonId: id
            }, process.env[BACKEND_CONSTANTS.envNames.jwtSignatureToken]!, {
                expiresIn: '365 days'
            })
        };

        await dynamoDB.send(new PutCommand({
            TableName: 'subathon',
            Item: subathonRecord                
        }));

        return {
            id: subathonRecord.id,
            state: subathonRecord.state,
            publicName: subathonRecord.publicName,
            configuration: subathonRecord.configuration,
            twitchId: subathonRecord.twitchId,
            token: subathonRecord.token,
            runtime: subathon.runtime
        };
    }catch (e) {
        console.log(e);
        throw new Error('Unable to create subathon');
    }
}