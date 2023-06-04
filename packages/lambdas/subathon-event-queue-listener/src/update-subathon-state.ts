import { getSubathon, saveSubathonRecord } from "@subathon/dynamodb";
import { SubathonState } from "@subathon/models/responses";
import { getAppOauthToken, twitchDeleteEventSubByEventType, twitchListenToOnlineEvent } from '@subathon/lambdas/shared-layer'
import { TwitchEventTypeName } from "@subathon/models/twitch";

export const updateSubathonState = async (subathonId:string, state: SubathonState, twitchEvent: any): Promise<any> =>{
    try {
        const subathon = await getSubathon(twitchEvent.subscription.condition.broadcaster_user_id, subathonId);

        if((subathon.state === SubathonState.PAUSED && state === SubathonState.IN_PROGRESS) || (subathon.state === SubathonState.IN_PROGRESS && state === SubathonState.PAUSED)) {
            // okay
            const oauthResponse = await getAppOauthToken();
            if(state === SubathonState.PAUSED){
                await twitchDeleteEventSubByEventType(oauthResponse.access_token, twitchEvent.subscription.condition.broadcaster_user_id, subathon.id, TwitchEventTypeName.OFFLINE);
                await twitchListenToOnlineEvent(oauthResponse.access_token, twitchEvent.subscription.condition.broadcaster_user_id);
            }else {
                await twitchDeleteEventSubByEventType(oauthResponse.access_token, twitchEvent.subscription.condition.broadcaster_user_id, subathon.id, TwitchEventTypeName.ONLINE);
                await twitchListenToOnlineEvent(oauthResponse.access_token, twitchEvent.subscription.condition.broadcaster_user_id);
            }

            subathon.state = state;

            await saveSubathonRecord(subathon);
        }

    }catch(e){
        console.log(e);
    }
}