import { APIGatewayProxyWebsocketEventV2 } from "aws-lambda";
import { 
    ApiGatewayManagementApiClient,
    PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
export const handler = async (event: APIGatewayProxyWebsocketEventV2) =>{
    
    const client = new ApiGatewayManagementApiClient({endpoint: 'https://ws.subathon.jvasoftware.com/'});
    const requestParams = {
        ConnectionId: (event.requestContext as any).connectionId as string,
        Data:  JSON.stringify({
            'someMessage': 'some'
        })
    };

    try{
        
          const command = new PostToConnectionCommand(requestParams as any);
          await client.send(command);
    }catch(e){
        console.log(e);
    }


    return {
        statusCode: 200
    }
}