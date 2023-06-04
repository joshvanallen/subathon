import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";
import { BACKEND_CONSTANTS } from "@subathon/environments";

const client = new SQSClient({});
export async function handleNotification(subathonId: string, messageId:string, notification: any) {
    return client.send(new SendMessageCommand({
        QueueUrl: process.env[BACKEND_CONSTANTS.envNames.subathonEventQueueUrl],
        MessageAttributes: {
            SubathonId: {
                DataType: 'String',
                StringValue: subathonId
            },
            MessageId: {
                DataType: 'String',
                StringValue: messageId
            }
        },
        MessageBody: JSON.stringify(notification)
    }));
}