
export enum TwitchEventTypeName {
    GIFT = 'channel.subscription.gift',
    RESUB_MESSAGE = 'channel.subscription.message',
    SUB = 'channel.subscribe',
    BITS = 'channel.cheer',
    ONLINE = 'stream.online',
    OFFLINE = 'stream.offline'
}

export interface TwitchSubType {
    type: TwitchEventTypeName;
    version: '1' | '2' | 'beta';
}