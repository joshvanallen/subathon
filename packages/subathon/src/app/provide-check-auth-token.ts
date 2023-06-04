import { APP_INITIALIZER, ENVIRONMENT_INITIALIZER, Provider, inject } from "@angular/core";
import { TokenService } from './validate-token.service';
import { UserInfoService } from "./user-info.service";
import { catchError, exhaustMap, map, of } from "rxjs";
import { UserService } from "./user.service";
import { CurrentUserResponse, TokenStatus } from "@subathon/models/responses";

const setUserStorage = (tokenService = inject(TokenService), userInfoService = inject(UserInfoService), userService = inject(UserService)) => {
    return () => tokenService.validate().pipe(
        exhaustMap((response) => {
            if(response.tokenStatus === TokenStatus.valid) {
                return userService.getCurrentUser();
            } else {
                return of(false)
            }
        }),
        map((response) => {
            if(!!response) {
                const { user } = response as CurrentUserResponse
                userInfoService.setUser(user);
            }else {
                userInfoService.setUser(null);
            }
        }),
        catchError((error) => {
            userInfoService.setUser(null);
            return of(null);
        })
    )
}

export const provideAppInitSetUserStorage = (): Provider => (
    {
        provide: APP_INITIALIZER,
        multi: true,
        useFactory: setUserStorage
    }
)