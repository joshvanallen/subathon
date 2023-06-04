import { createSubathon } from "@subathon/dynamodb";
import { getAuthCookieValue } from "@subathon/lambdas/shared-layer";
import { EventCalcType, EventType, Subathon, SubathonState } from "@subathon/models/responses";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {    
    console.log(event);
    let statusCode = 200;
    const tokenValue = getAuthCookieValue(event.cookies);
    const body: { [key: string]: Subathon} = {
        subathon: null
    };
    if(tokenValue.userId === '736464803' || tokenValue.userId === '184452484') {
        try {
        }catch(e){
            console.log(e);
        }
    }

    return {
        statusCode,
        body: JSON.stringify(body)
    }
};