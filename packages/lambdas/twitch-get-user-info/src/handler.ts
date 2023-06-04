import { getAuthCookieValue, twitchGetUser } from "@subathon/lambdas/shared-layer";
import { CurrentUserResponse } from "@subathon/models/responses";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    let statusCode = 200;
    const authToken = getAuthCookieValue(event.cookies);
    const body = {
        user: null
    }
    if(authToken) {
        try {
            const { display_name: displayName, profile_image_url: profileImgUrl } = await twitchGetUser(authToken.accessToken);
            body.user = {
                displayName,
                profileImgUrl
            };
        }catch(e) {
            console.log(e);
        }
    }

    return {
        statusCode,
        body: JSON.stringify(body)
    }
}