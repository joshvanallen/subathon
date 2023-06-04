import { MessageType } from "./message-types";

export interface BaseMessage {
    type: MessageType,
    payload: unknown;
}