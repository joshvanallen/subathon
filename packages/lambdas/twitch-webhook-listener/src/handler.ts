import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2}  from 'aws-lambda';
import { BACKEND_CONSTANTS } from '@subathon/environments';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { handleNotification } from './handle-twitch-notification';

const TWITCH_MESSAGE_ID = 'Twitch-Eventsub-Message-Id'.toLowerCase();
const TWITCH_MESSAGE_TIMESTAMP = 'Twitch-Eventsub-Message-Timestamp'.toLowerCase();
const TWITCH_MESSAGE_SIGNATURE = 'Twitch-Eventsub-Message-Signature'.toLowerCase();
const MESSAGE_TYPE = 'Twitch-Eventsub-Message-Type'.toLowerCase();

const verifyMessage = (event: APIGatewayProxyEventV2) =>{
    const webhookSecret:string = process.env[BACKEND_CONSTANTS.envNames.twitchWebhookVerifyToken];
    const message = `${event.headers[TWITCH_MESSAGE_ID]}${event.headers[TWITCH_MESSAGE_TIMESTAMP]}${event.body}`;
    const encodedMessage = `sha256=${createHmac('sha256',webhookSecret).update(message).digest('hex')}`;

    console.log(message);
    console.log(timingSafeEqual(Buffer.from(encodedMessage), Buffer.from(event.headers[TWITCH_MESSAGE_SIGNATURE])));

    return timingSafeEqual(Buffer.from(encodedMessage), Buffer.from(event.headers[TWITCH_MESSAGE_SIGNATURE]));
}

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    console.log(event);    
    const notification = (!process.env[BACKEND_CONSTANTS.envNames.verifyMessage] && process.env[BACKEND_CONSTANTS.envNames.verifyMessage] === 'false') || verifyMessage(event) ? JSON.parse(event.body) : null;
    if(!notification) {
        return {
            statusCode: 403,
            body: JSON.stringify({
                message: 'Unable to verify message',
            })
        }
    }

    switch(event.headers[MESSAGE_TYPE]){
        case 'webhook_callback_verification':
            return {
                statusCode: 200,
                headers: {
                    'content-type': 'text/plain'
                },
                body: notification.challenge
            }
        case 'notification':
            console.log(notification);
            await handleNotification(event.pathParameters.subathonId, event.headers[TWITCH_MESSAGE_ID], notification);
            return {
                statusCode: 204,
            };
        default:
            console.log(notification);
            return {
                statusCode: 204
            }
    }
};