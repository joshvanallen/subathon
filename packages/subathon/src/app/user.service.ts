import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { FRONTEND_CONSTANTS, FRONTEND_ENVIRONMENT } from "@subathon/environments";
import { CurrentUserResponse } from "@subathon/models/responses";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private baseUrl = `${FRONTEND_ENVIRONMENT.baseAPIUrl}${FRONTEND_CONSTANTS.endpoints.auth.base}`;

    constructor(private http: HttpClient){}

    getCurrentUser(){
        return this.http.get<CurrentUserResponse>(`${this.baseUrl}${FRONTEND_CONSTANTS.endpoints.auth.getCurrentUser}`, {
            withCredentials: true
        })
    }
}