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
            body.subathon = await createSubathon(tokenValue.userId, {
                id: null,
                state: SubathonState.INIT,
                token: null,
                twitchId: tokenValue.userId,
                publicName: 'My Very First Subathon',
                configuration: {
                    nextTimeLiveStart: false,
                    initialDuration: {
                        hours: 8,
                        minutes: 0,
                        seconds: 0
                    },
                    events: {
                        [EventType.BITS]: {
                            type: EventCalcType.CONSTANT,
                            minValueTrigger: 100,
                            multiple: true,
                            value: {
                                hours: 0,
                                minutes: 1,
                                seconds: 0
                            }
                        },
                        [EventType.SUB]: {
                            type: EventCalcType.CONSTANT,
                            minValueTrigger: 1,
                            multiple: true,
                            value: {
                                hours: 0,
                                minutes: 10,
                                seconds: 0
                            }
                        },
                        [EventType.GIFTED]: {
                            type: EventCalcType.CONSTANT,
                            minValueTrigger: 1,
                            multiple: true,
                            value: {
                                hours: 0,
                                minutes: 10,
                                seconds: 0
                            }
                        }
                    }
                }
            });
        }catch(e){
            console.log(e);
        }
    }

    return {
        statusCode,
        body: JSON.stringify(body)
    }
};