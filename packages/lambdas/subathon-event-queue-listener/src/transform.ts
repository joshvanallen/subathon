import { createSubathonEvent, getSubathon, getSubathonEvent } from "@subathon/dynamodb";
import { Duration, EventCalcType, EventProcessStatus, EventType, RandomEventCalcConfiguration, Subathon, SubathonEvent } from "@subathon/models/responses";
import { TwitchEventTypeName } from "@subathon/models/twitch";

const pickRandomNumber = (max: number, min: number) => {
    return Math.random() * (max - min) + min;
}
const generateDefaultDuration = (config: RandomEventCalcConfiguration)=> {
    return {
        hours: config.minValue.hours === config.maxValue.hours ? config.maxValue.hours : null,
        minutes:  config.minValue.minutes === config.maxValue.minutes ? config.maxValue.minutes: null,
        seconds:  config.minValue.seconds === config.maxValue.seconds ? config.maxValue.seconds: null,
    }
}

const pickRandomDuration = (randomConfiguration: RandomEventCalcConfiguration): Duration => {
    const duration: Duration = generateDefaultDuration(randomConfiguration);
    if(duration.hours !== null){
        duration.hours = pickRandomNumber(randomConfiguration.maxValue.hours, randomConfiguration.minValue.hours);
    }
    if(duration.minutes !== null){
        duration.minutes = pickRandomNumber(randomConfiguration.maxValue.minutes, randomConfiguration.minValue.minutes);
    }
    if(duration.seconds !== null){
        duration.seconds = pickRandomNumber(randomConfiguration.maxValue.seconds, randomConfiguration.minValue.seconds);
    }

    return duration;
}

const transformToSubathonEvent = (twitchNotification: any, subathon: Subathon): SubathonEvent | null => {
    const subathonEvent: SubathonEvent = {
        id: null,
        status: EventProcessStatus.NotProcessed,
        details: null
    };

    switch(twitchNotification.subscription.type){

        case TwitchEventTypeName.RESUB_MESSAGE:
        case TwitchEventTypeName.SUB: {
            const eventConfiguration = subathon.configuration.events[EventType.SUB];
            subathonEvent.details = {
                weight: 1,
                submittedUser: {
                    twitchId: twitchNotification.event.user_id,
                    twitchName: twitchNotification.event.user_name
                },
                timeAdded: null,
                type: EventType.SUB,
                timestamp: new Date().toUTCString(),
                time: eventConfiguration.type === EventCalcType.CONSTANT ? eventConfiguration.value : pickRandomDuration(eventConfiguration)
            }
            break;
        }
        case TwitchEventTypeName.BITS: {
            const eventConfiguration = subathon.configuration.events[EventType.BITS];
            if(twitchNotification.event.bits >= eventConfiguration.minValueTrigger) {
                subathonEvent.details = {
                    weight: eventConfiguration.multiple ? Math.floor(twitchNotification.event.bits / eventConfiguration.minValueTrigger) : 1,
                    timeAdded: null,
                    type: EventType.BITS,
                    submittedUser: {
                        anonymous: twitchNotification.event.is_anonymous,
                        twitchId: twitchNotification.event.user_id,
                        twitchName: twitchNotification.event.user_name
                    },
                    timestamp: new Date().toUTCString(),
                    time: eventConfiguration.type === EventCalcType.CONSTANT ? eventConfiguration.value : pickRandomDuration(eventConfiguration)
                }
            }

        }
        case TwitchEventTypeName.GIFT: {
            const eventConfiguration = subathon.configuration.events[EventType.GIFTED];
            subathonEvent.details = {
                weight: eventConfiguration.multiple ? twitchNotification.event.total : 1,
                submittedUser: {
                    anonymous: twitchNotification.event.is_anonymous,
                    twitchId: twitchNotification.event.user_id,
                    twitchName: twitchNotification.event.user_name
                },
                timeAdded: null,
                type: EventType.GIFTED,
                timestamp: new Date().toUTCString(),
                time: eventConfiguration.type === EventCalcType.CONSTANT ? eventConfiguration.value : pickRandomDuration(eventConfiguration)
            }
            break;
        }
        default:
            return null;
    }

    return subathonEvent.details !== null ? subathonEvent : null;
}

const doesEventAlreadyExist = async (subathonId: string, messageId: string) => {
    const subathonEvent = await getSubathonEvent(subathonId, messageId);

    return subathonEvent ? true : false;
}

export async function transformAndSaveTwitchNotification(subathonId: string, messageId: string, twitchNotification: any) {
    if(!(await doesEventAlreadyExist(subathonId, messageId))){
        const subathon: Subathon = await getSubathon(twitchNotification.subscription.condition.broadcaster_user_id, subathonId);
        if(subathon) {
            const subathonEvent = transformToSubathonEvent(twitchNotification, subathon);
            subathonEvent.id = messageId;
            await createSubathonEvent(subathonId, subathonEvent);
        }
    }
    return {};
}