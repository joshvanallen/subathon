export interface User {
    profileImgUrl: string;
    displayName: string;
}

export interface CurrentUserResponse {
    user: User;
}