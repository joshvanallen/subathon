import { UserRecord, createOrUpdateUser } from '@subathon/dynamodb';
import {BACKEND_CONSTANTS} from '@subathon/environments';
import { generateAuthCookie, twitchGetOauthToken, twitchValidateOauthToken } from '@subathon/lambdas/shared-layer';
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 }  from 'aws-lambda';

async function validateCode(event: APIGatewayProxyEventV2): Promise<UserRecord> {
    let response;

    try{
        const twitchCodeResponse = await twitchGetOauthToken({
            grantType: 'code',
            token: event.queryStringParameters.code
        });
        const twitchValidateResponse = await twitchValidateOauthToken(twitchCodeResponse.access_token);
        response = await createOrUpdateUser({
            twitchId: twitchValidateResponse.user_id,
            twitchName: twitchValidateResponse.login,
            accessToken: twitchCodeResponse.access_token,
            refreshToken: twitchCodeResponse.refresh_token,
        } as UserRecord);
    }catch(e){
        console.log(e);
        throw new Error('Unable to validate twitch code');
    }

    return response;
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    console.log('hi');
    if(!(event.queryStringParameters && event.queryStringParameters.code)){
        return {
            statusCode: 302,
            headers: {
                location: process.env[BACKEND_CONSTANTS.envNames.redirectUri]
            }
        }
    }

    const response = await validateCode(event);

    return {
        statusCode: 302,
        cookies: [generateAuthCookie(response.accessToken, response.twitchId)],
        headers: {
            location: process.env[BACKEND_CONSTANTS.envNames.redirectUri]
        }
    }
};