export enum TokenStatus {
    valid,
    invalid,
    noToken
}

export interface ValidateTokenResponse {
    tokenStatus: TokenStatus 
}