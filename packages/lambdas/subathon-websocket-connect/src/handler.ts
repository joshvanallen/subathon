
import { createWebSocketRecord, getWebSocketConnectionId } from '@subathon/dynamodb';
import { decodeSubathonClockToken, isValidSubathonClockToken } from '@subathon/lambdas/shared-layer';
import { APIGatewayProxyEventV2WithRequestContext, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';
import { 
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';

const checkForExistingConnection = async (subathonId) => {
    const values = await getWebSocketConnectionId(subathonId);
    console.log(values);
    return values;
}

export const handler = async (event: APIGatewayProxyEventV2WithRequestContext<APIGatewayProxyWebsocketEventV2>) => {
    console.log(event);

    if(!(event.queryStringParameters?.token && isValidSubathonClockToken(event.queryStringParameters.token))){
        return {
            statusCode: 401
        }
    }
    const {userId, subathonId} = decodeSubathonClockToken(event.queryStringParameters.token) as any;
    try{

        await createWebSocketRecord(subathonId, (event.requestContext as any).connectionId);

        return {
            statusCode: 200,
            headers: {
                'Sec-WebSocket-Protocol': 'subathon-clock'
            }
        }

    }catch(e){
        console.log(e);
        return {
            statusCode: 500
        }
    }



}