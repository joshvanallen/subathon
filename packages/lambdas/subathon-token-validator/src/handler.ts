import { getAuthCookieValue, twitchValidateOauthToken } from "@subathon/lambdas/shared-layer";
import { APIGatewayRequestAuthorizerEventV2, APIGatewayAuthorizerWithContextResult, APIGatewayAuthorizerResultContext } from "aws-lambda";

export const handler = async (event: APIGatewayRequestAuthorizerEventV2): Promise<APIGatewayAuthorizerWithContextResult<APIGatewayAuthorizerResultContext>> => {
    console.log(event);
    const authToken = getAuthCookieValue(event.cookies);
    const body: APIGatewayAuthorizerWithContextResult<APIGatewayAuthorizerResultContext> = {
        principalId: 'user',
        policyDocument: {
            Version: '2012-10-17',
            Statement: [
                {
                    Action: 'execute-api:Invoke',
                    Effect: 'Deny',
                    Resource: event.routeArn
                }
            ]
        },
        context:{}
    };

    if(authToken) {
        try {
            await twitchValidateOauthToken(authToken.accessToken);
            body.policyDocument.Statement[0].Effect = 'Allow';
        }catch(e) {
            console.log(e);
        }
    }
    console.log(JSON.stringify(body));
    return body;
}