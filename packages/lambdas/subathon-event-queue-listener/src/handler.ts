
import { APIGatewayProxyStructuredResultV2, SQSEvent, SQSRecord } from "aws-lambda";
import { DeleteMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { BACKEND_CONSTANTS } from "@subathon/environments";
import { transformAndSaveTwitchNotification } from "./transform";
import { TwitchEventTypeName } from "@subathon/models/twitch";
import { updateSubathonState } from "./update-subathon-state";
import { SubathonState } from "@subathon/models/responses";

const client = new SQSClient({});

export async function deleteMessageFromQueue(sqsRecord: SQSRecord) {
    return client.send(new DeleteMessageCommand({
        QueueUrl: process.env[BACKEND_CONSTANTS.envNames.subathonEventQueueUrl],
        ReceiptHandle: sqsRecord.receiptHandle
    }));
}

export const handler = async (event: SQSEvent): Promise<APIGatewayProxyStructuredResultV2> => {
    console.log(event);
    const databaseSave: Promise<any>[] = event.Records.map(async (sqsRecord) => {
        const twitchNotification = JSON.parse(sqsRecord.body);
        const subathonId = sqsRecord.messageAttributes['SubathonId'].stringValue!;
        const messageId = sqsRecord.messageAttributes['MessageId'].stringValue!;
        
        switch(twitchNotification.subscription.type){
            case TwitchEventTypeName.BITS:
            case TwitchEventTypeName.GIFT:
            case TwitchEventTypeName.RESUB_MESSAGE:
            case TwitchEventTypeName.SUB:
                try {

                    await transformAndSaveTwitchNotification(subathonId, messageId, twitchNotification);
                }catch(e){
                    console.log(e);
                    throw new Error('Unable to save notification');
                }
                break;
            case TwitchEventTypeName.ONLINE:
                try{
                    await updateSubathonState(subathonId, SubathonState.IN_PROGRESS, twitchNotification);
                }catch(e){
                    console.log(e);
                    throw new Error('Unable to update subathon state to In Progress');
                }
                break;
            case TwitchEventTypeName.OFFLINE:
                try{
                    await updateSubathonState(subathonId, SubathonState.PAUSED, twitchNotification);
                }catch(e){
                    console.log(e);
                    throw new Error('Unable to update subathon state to Paused');
                }
                break;
        }

        try {
            await deleteMessageFromQueue(sqsRecord);
        }catch(e) {
            console.log(e);
            throw new Error('Unable to delete message');
        }

        return {
            twitchNotification,
            subathonId,
            messageId
        }
    });

    try {
        await Promise.all(databaseSave);
        return {
            statusCode: 200
        }
    }catch(e){
        console.log(e);
        return {
            statusCode: 500,
        }
    }
}