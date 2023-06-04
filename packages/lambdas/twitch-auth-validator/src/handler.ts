import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2}  from 'aws-lambda';
import { invalidateAuthCookie, isValidOauthToken, getAuthCookieValue } from '@subathon/lambdas/shared-layer';
import { TokenStatus, ValidateTokenResponse } from '@subathon/models/responses';


export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    const authToken = getAuthCookieValue(event.cookies);
    let statusCode = 200;
    const body: ValidateTokenResponse = {
        tokenStatus: TokenStatus.noToken
    }
    const newCookies = [];
    
    if(authToken){
        if(await isValidOauthToken(authToken.accessToken)){
            body.tokenStatus = TokenStatus.valid;
        }else{
            body.tokenStatus = TokenStatus.invalid;
            newCookies.push(invalidateAuthCookie(authToken.accessToken));
        }
    }
    
    return {
        statusCode,
        ...(newCookies.length > 0 ? {cookies: newCookies} : {}),
        body: JSON.stringify(body)
    }
};