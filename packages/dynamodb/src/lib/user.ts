import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { EntityType, USER_PRIMARY_KEY_PREFIX, UserRecord, baseRecord, dynamoDB } from './dynamodb';

export async function createOrUpdateUser(user: UserRecord): Promise<UserRecord> {
    try {

        const possibleUser = (await dynamoDB.send(new GetCommand({
            TableName: 'subathon',
            Key: {
                'primaryKey':  `${USER_PRIMARY_KEY_PREFIX}${user.twitchId}`,
                'sortKey': `${USER_PRIMARY_KEY_PREFIX}${user.twitchId}`
            }
        }))).Item;

        const modifiedUser = Object.assign({
            entityType: EntityType.USER,
            primaryKey: `${USER_PRIMARY_KEY_PREFIX}${user.twitchId}`,
            sortKey: `${USER_PRIMARY_KEY_PREFIX}${user.twitchId}`
        } as baseRecord, possibleUser, user);
        await dynamoDB.send(new PutCommand({
            TableName: 'subathon',
            Item: modifiedUser                
        }));
        return modifiedUser;
    } catch(e){
        console.log(e);
        throw new Error('unable to create or update user');
    }
}