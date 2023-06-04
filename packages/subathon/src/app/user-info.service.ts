import {Injectable} from '@angular/core';
import { User } from '@subathon/models/responses';
import { BehaviorSubject, Observable } from 'rxjs';

export type CurrentUser = User;
export type CurrentUser$ = CurrentUser | null;

@Injectable({
    providedIn: 'root'
})
export class UserInfoService {
    private user: BehaviorSubject<CurrentUser$> = new BehaviorSubject<CurrentUser$>(null);
    user$: Observable<CurrentUser$> = this.user.asObservable();

    constructor(){}

    setUser(user: CurrentUser$) {
        this.user.next(user);
    }
}