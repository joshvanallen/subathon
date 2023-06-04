import axios from 'axios';
import { stringify } from 'node:querystring';
import { BACKEND_CONSTANTS, CONSTANTS} from '@subathon/environments';
import { TwitchEventTypeName, TwitchSubType } from '@subathon/models/twitch';

export interface OauthRequest {
    token?: string;
    grantType: 'code' | 'refresh' | 'client_credentials';
    redirect_uri?: string;
};

export interface RefreshOauthRequest extends OauthRequest {
    grantType: 'refresh';
    token: string;
}

export interface CodeOauthRequest extends OauthRequest {
    grantType: 'code';
    token: string;
}

export interface AppTokenOauthRequest extends OauthRequest {
    grantType: 'client_credentials'
}

export interface TwitchOauthTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token: string;
    scope: string[];
    token_type: 'bearer' | 'oauth';
}


function generateOAuthRequest(oauthAction: RefreshOauthRequest | CodeOauthRequest | AppTokenOauthRequest): any {
    if(oauthAction.grantType === 'client_credentials') {
        return {
            'grant_type':'client_credentials'
        };
    }

    return oauthAction.grantType === 'refresh' ? {
        'grant_type': 'refresh_token',
        'refresh_token': oauthAction.token
    } : {
        'grant_type': 'authorization_code',
        'code': oauthAction.token
    };
}

export function twitchGetOauthToken(oauthAction: RefreshOauthRequest | CodeOauthRequest | AppTokenOauthRequest) {


    const request = generateOAuthRequest(oauthAction);

    const {base, token} = BACKEND_CONSTANTS.externalEndpoints.oauth;
    return axios.post<TwitchOauthTokenResponse>(`${base}${token}`, stringify(Object.assign({
        'client_id': CONSTANTS.clientId,
        'client_secret': process.env[BACKEND_CONSTANTS.envNames.clientSecret]
    }, request))).then(response => response.data);
}

export interface TwitchOauthValidateResponse {
    client_id: string;
    login: string;
    scopes: string[];
    user_id: string;
    expires_in: number;
};

export function twitchValidateOauthToken(accessToken: string) {
    const {base, validate} = BACKEND_CONSTANTS.externalEndpoints.oauth;
    return axios.get<TwitchOauthValidateResponse>(`${base}${validate}`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    }).then((response) => response.data);
}

export async function isValidOauthToken(authToken: string): Promise<boolean> {
    try{
        await twitchValidateOauthToken(authToken);
        return true;
    }catch(e){
        return false;
    }
}

interface TwitchUserResponse {
    data: TwitchUser[]
}

export interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    type: string;
    broadcaster_type:string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    created_at: string;
}

export async function twitchGetUser(userAccessToken: string) {
    const {base, users} = BACKEND_CONSTANTS.externalEndpoints.api;
    console.log(`${base}${users}`);
    return axios.get<TwitchUserResponse>(`${base}${users}`, {
        headers: {
            'Authorization': `Bearer ${userAccessToken}`,
            'Client-Id': CONSTANTS.clientId
        }
    }).then((response) => {
        return  response.data.data[0];
    })
}

function createEventSubRequest(twitchId: string, subathonId: string, {
    type,
    version,
}: TwitchSubType){
    return {
        type,
        version,
        condition: {
            broadcaster_user_id: twitchId,
        },
        transport: {
            method: 'webhook',
            secret: process.env[BACKEND_CONSTANTS.envNames.twitchWebhookVerifyToken],
            callback: `${process.env[BACKEND_CONSTANTS.envNames.twitchCallbackUrl]}${subathonId}`
        }
    }
}

export function getAppOauthToken() {
    return twitchGetOauthToken({
        grantType: 'client_credentials'
    });
}

export async function getActiveEventSubsByUserIdAndType(oauthToken:string, userId: string, type?: TwitchEventTypeName, status?: 'enabled' | undefined) {
    const {base, eventSubscriptions} = BACKEND_CONSTANTS.externalEndpoints.api;
    return axios.get<any>(`${base}${eventSubscriptions}?${stringify({
        user_id: userId,
        ...(type ? {type}: {}),
        ...(status? {status}: {})
    })}`, {
        headers: {
            Authorization: `Bearer ${oauthToken}`,
            'Client-Id': CONSTANTS.clientId
        }
    }).then((response) => response.data)
}

export async function twitchListenToEvent(appOauthToken: string, twitchId: string, subathonId: string, event: TwitchSubType) {
    const eventRequest = createEventSubRequest(twitchId, subathonId, event);
    const {base, eventSubscriptions} = BACKEND_CONSTANTS.externalEndpoints.api;
    return axios.post<any>(`${base}${eventSubscriptions}`, eventRequest, {
        headers: {
            Authorization: `Bearer ${appOauthToken}`,
            'Client-Id': CONSTANTS.clientId
        }
    }).then((response) => response.data)

}

export async function twitchDeleteEventSub(appOauthToken: string, subscriptionId: string) {
    const {base, eventSubscriptions} = BACKEND_CONSTANTS.externalEndpoints.api;
    return axios.delete<any>(`${base}${eventSubscriptions}?${stringify({
        id: subscriptionId,
    })}`, {
        headers: {
            Authorization: `Bearer ${appOauthToken}`,
            'Client-Id': CONSTANTS.clientId
        }
    }).then((response) => response.data);
}

export async function twitchDeleteEventSubByEventType(appOauthToken: string, twitchId: string, subathonId: string, eventType: TwitchEventTypeName) {
    const subsResponse = await getActiveEventSubsByUserIdAndType(appOauthToken, twitchId, eventType);

    if(subsResponse.data.length > 0){
        const promises = subsResponse.data.filter((eventSubDetails: { transport: { callback: string; }; })=>eventSubDetails.transport.callback.indexOf(subathonId) > 0).map((subEvent: any) => {
            return twitchDeleteEventSub(appOauthToken, subEvent.id)
        });

        await Promise.all(promises);
    }
    return {
        success: true
    }
}

export async function twitchListenToOnlineEvent(twitchId: string, subathonId: string) {
    const oauthResponse = await getAppOauthToken();
    await twitchListenToEvent(oauthResponse.access_token, twitchId, subathonId, {
        type: TwitchEventTypeName.OFFLINE,
        version: '1'
    });
}

export async function twitchListenToOfflineEvent(twitchId: string, subathonId: string) {
    const oauthResponse = await getAppOauthToken();
    await twitchListenToEvent(oauthResponse.access_token, twitchId, subathonId, {
        type: TwitchEventTypeName.ONLINE,
        version: '1'
    });
}

export async function twitchDeleteAllSubathonEvents(twitchId: string, subathonId: string) {
    const oauthResponse = await getAppOauthToken();
    const subsResponse = await getActiveEventSubsByUserIdAndType(oauthResponse.access_token, twitchId);
    try {
        if(subsResponse.data.length > 0){
            const promises = subsResponse.data.filter((eventSubDetails: { transport: { callback: string; }; })=>eventSubDetails.transport.callback.indexOf(subathonId) > 0).map((subEvent: any) => {
                return twitchDeleteEventSub(oauthResponse.access_token,subEvent.id);
            })
            await Promise.all(promises);
        }
        return {
            success: true
        }
    } catch(e){
        console.log(e);
        return {
            success: false
        }
    }

}

export async function twitchListenToCalcEvents(twitchId: string, subathonId: string) {
    const events: TwitchSubType[] = [
        {
            type: TwitchEventTypeName.BITS,
            version: '1'
        },
        {
            type: TwitchEventTypeName.GIFT,
            version: '1'
        },
        {
            type: TwitchEventTypeName.SUB,
            version: '1'
        },
        {
            type: TwitchEventTypeName.RESUB_MESSAGE,
            version: '1'
        },
    ];
    const oauthResponse = await getAppOauthToken();

    const promises = events.map((event) => {
        return twitchListenToEvent(oauthResponse.access_token, twitchId, subathonId,event);
    });

    console.log(await Promise.all(promises));

    return {
        success: true
    }
}