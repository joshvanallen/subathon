import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { FRONTEND_CONSTANTS, FRONTEND_ENVIRONMENT } from '@subathon/environments';
import { ValidateTokenResponse } from '@subathon/models/responses';

@Injectable({
    providedIn: 'root'
})
export class TokenService {
    
    private baseUrl = `${FRONTEND_ENVIRONMENT.baseAPIUrl}${FRONTEND_CONSTANTS.endpoints.auth.base}`;

    constructor(private http: HttpClient){}

    validate(){
        return this.http.get<ValidateTokenResponse>(`${this.baseUrl}${FRONTEND_CONSTANTS.endpoints.auth.validateToken}`, {
            withCredentials: true
        })
    }
}