import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FRONTEND_CONSTANTS, FRONTEND_ENVIRONMENT } from '@subathon/environments';
import { Subathon, SubathonState } from '@subathon/models/responses';
import { map } from 'rxjs';
@Injectable({
    providedIn: 'root'
})
export class SubathonService {
    private baseUrl = `${FRONTEND_ENVIRONMENT.baseAPIUrl}${FRONTEND_CONSTANTS.endpoints.manage.base}`;
    private manageUrls = FRONTEND_CONSTANTS.endpoints.manage;
    constructor(private http: HttpClient){}

    getSubathons() {
        return this.http.get<Subathon[] | []>(`${this.baseUrl}${this.manageUrls.subathon}`,{
            withCredentials: true
        }).pipe(map((resp:any) => resp.subathons));
    }

    createSubathon(subathon: Subathon) {
        return this.http.post<Subathon>(`${this.baseUrl}${this.manageUrls.subathon}`, {
            subathon
        },{
            withCredentials: true
        });
    }

    updateSubathon(subathon: Subathon) {
        return this.http.put<Subathon>(`${this.baseUrl}${this.manageUrls.subathon}${subathon.id}`, {
            subathon
        },{
            withCredentials: true
        });
    }

    updateSubathonState(subathonId: string, newState: SubathonState) {
        return this.http.patch<Subathon>(`${this.baseUrl}${this.manageUrls.subathon}/${subathonId}${this.manageUrls.state}`, {
            state: newState
        },{
            withCredentials: true
        })
    }
}