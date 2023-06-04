import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2}  from 'aws-lambda';
import { getAuthCookieValue } from '@subathon/lambdas/shared-layer';
import { SubathonsResponse } from '@subathon/models/responses';
import { getSubathonsByUserId } from '@subathon/dynamodb';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {    
    console.log(event);
    let statusCode = 200;
    const tokenValue = getAuthCookieValue(event.cookies);
    const body: SubathonsResponse = {
        subathons: []
    };

    try {
        body.subathons = await getSubathonsByUserId(tokenValue.userId);
    }catch(e){
        console.log(e);
    }

    return {
        statusCode,
        body: JSON.stringify(body)
    }
};