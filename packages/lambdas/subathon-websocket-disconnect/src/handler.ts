
import { deleteWebSocketConnection, getWebSocketConnectionId, getWebSocketConnectionIdByConnectionId } from '@subathon/dynamodb';
import { APIGatewayEventWebsocketRequestContextV2, APIGatewayProxyWebsocketEventV2 } from 'aws-lambda';

const checkForConnectionId =async (connectionId:string) => {
    return getWebSocketConnectionIdByConnectionId(connectionId);
}

export const handler = async (event: APIGatewayProxyWebsocketEventV2) => {
    if(event.requestContext.connectionId && await checkForConnectionId(event.requestContext.connectionId)) {
        await deleteWebSocketConnection(event.requestContext.connectionId);
    }
    return {
        statusCode: 200,
    }
}