export const BACKEND_CONSTANTS = {
    envNames: {
        'clientSecret': 'TWITCH_CLIENT_SECRET',
        'mainAppDomain': 'DOMAIN_NAME',
        'redirectUri': 'REDIRECT_URI',
        'dbEndpoint': 'DB_ENDPOINT',
        'jwtSignatureToken': 'JWT_SIGNATURE_TOKEN',
        'twitchWebhookVerifyToken':'TWITCH_WEBHOOK_VERIFY_TOKEN',
        'subathonEventQueueUrl': 'SUBATHON_EVENT_QUEUE_URL',
        'twitchCallbackUrl': 'TWITCH_WEBHOOKS_CALLBACK_URL',
        'verifyMessage': 'VERIFY_MESSAGE'
    },
    externalEndpoints: {
        oauth: {
            base: 'https://id.twitch.tv/oauth2',
            token: '/token',
            validate: '/validate'
        },
        api: {
            base: 'https://api.twitch.tv/helix',
            users: '/users',
            eventSubscriptions: '/eventsub/subscriptions'
        }
    },
    authCookieName:'subathonAuth',
}