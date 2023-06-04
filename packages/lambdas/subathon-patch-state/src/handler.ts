import { getSubathon, saveSubathonRecord } from "@subathon/dynamodb";
import { calcDurationFromNowToDate, calcTimestampFromNow, getAuthCookieValue, twitchDeleteAllSubathonEvents, twitchListenToCalcEvents, twitchListenToOfflineEvent, twitchListenToOnlineEvent } from "@subathon/lambdas/shared-layer";
import { SubathonState } from "@subathon/models/responses";
import { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from "aws-lambda";

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyStructuredResultV2> => {
    console.log(event);
    const stateRequest = JSON.parse(event.body);
    const tokenValue = getAuthCookieValue(event.cookies);

    try {
        const subathon = await getSubathon(tokenValue.userId, event.pathParameters['subathonId']);

        if(stateRequest.state === SubathonState.INIT) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid Option, subathon is not allowed to move back into not started.'
                })
            }
        }

        if(subathon.state === SubathonState.ENDED) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid Option, subathon is not allowed to move out of ended.'
                })
            }
        }

        if(subathon.state === SubathonState.INIT && stateRequest.state !== SubathonState.IN_PROGRESS){
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid Option, subathon must be started first.'
                })
            }
        }

        if(subathon.state === SubathonState.IN_PROGRESS && stateRequest.state === SubathonState.IN_PROGRESS) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid Option, subathon is already in progress.'
                })
            }
        }

        if(subathon.state === SubathonState.PAUSED && stateRequest.state === SubathonState.PAUSED) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid Option, subathon is already paused.'
                })
            }
        }

        if(subathon.state === SubathonState.STOPPING && stateRequest.state === SubathonState.STOPPING) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Invalid Option, subathon is already stopping.'
                })
            }
        }

        
        if(stateRequest.state === SubathonState.IN_PROGRESS) {
            // create an EventBridge event to switch back to STOPPING based on endTimeStamp
            if(!subathon.runtime){
                subathon.runtime = {
                    endTimestamp: null,
                    history: [{
                        state: SubathonState.IN_PROGRESS,
                        timestamp: new Date().toUTCString(),
                        remainingDuration: subathon.configuration.initialDuration
                    }],
                    remainingDuration: null
                }
                subathon.runtime.endTimestamp = calcTimestampFromNow(subathon.configuration.initialDuration);
            } else {
                subathon.runtime.history.push({
                    state: SubathonState.IN_PROGRESS,
                    timestamp: new Date().toUTCString(),
                    remainingDuration: subathon.runtime.remainingDuration
                });
                subathon.runtime.endTimestamp = calcTimestampFromNow(subathon.runtime.remainingDuration);
                subathon.runtime.remainingDuration = null;
            }

            if(subathon.state === SubathonState.INIT) {
                // transitioning from INIT to IN_PROGRESS
                await twitchListenToCalcEvents(tokenValue.userId, subathon.id);
                await twitchListenToOfflineEvent(tokenValue.userId, subathon.id);
            }

        }

        if(stateRequest.state === SubathonState.STOPPING) {
            // disable webhooks
            subathon.runtime.history.push({
                state: SubathonState.STOPPING,
                timestamp: new Date().toUTCString(),
                remainingDuration: calcDurationFromNowToDate(new Date(subathon.runtime.endTimestamp))
            });


        }

        if(stateRequest.state === SubathonState.PAUSED) {
            // create an EventBridge event to switch to Ended in 48hrs
            subathon.runtime.history.push({
                state: SubathonState.PAUSED,
                timestamp: new Date().toUTCString(),
                remainingDuration: subathon.runtime.remainingDuration
            });

            subathon.runtime.remainingDuration = calcDurationFromNowToDate(new Date(subathon.runtime.endTimestamp));
            subathon.runtime.endTimestamp = null;

            await twitchListenToOnlineEvent(tokenValue.userId, subathon.id);
        }

        if(stateRequest.state === SubathonState.ENDED) {
            subathon.runtime.history.push({
                state: SubathonState.ENDED,
                timestamp: new Date().toUTCString(),
                remainingDuration: subathon.runtime.remainingDuration
            });
            subathon.runtime.remainingDuration = null;
            subathon.runtime.endTimestamp = null;

            await twitchDeleteAllSubathonEvents(tokenValue.userId, subathon.id);
        }

        subathon.state = stateRequest.state;
        await saveSubathonRecord(subathon);
        
        return {
            statusCode: 200,
            body: JSON.stringify({
                id: subathon.id,
                state: stateRequest.state,
                success: true
            })
        }

    } catch(e) {
        console.log(e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Unexpected Error'
            })
        }
    }
}