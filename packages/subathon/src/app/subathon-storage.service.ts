import { Injectable } from '@angular/core';
import { Subathon, SubathonState } from '@subathon/models/responses';
import { BehaviorSubject } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class SubathonStorageService {
    private subathonsSubject: BehaviorSubject<Subathon[] | null> = new BehaviorSubject<Subathon[] | null>(null);
    subathons$ = this.subathonsSubject.asObservable();

    setSubathons(subathons: Subathon[] | null) {
        this.subathonsSubject.next(subathons);
    }
    addSubathon(subathon: Subathon | null) {
        if(subathon) {
            this.subathonsSubject.next([subathon].concat(...(this.subathonsSubject.value ? this.subathonsSubject.value : [])))
        }
    }
    updateSubathonState(subathonId: string, state: SubathonState){
        
        const foundIndex = this.subathonsSubject.value?.findIndex((subathon) => subathon.id === subathonId);
        if(foundIndex != null && foundIndex > -1){
            const ret = this.subathonsSubject.value!;
            const cloned = structuredClone(ret[foundIndex]);
            cloned.state = state;
            ret[foundIndex] = cloned;

            this.setSubathons(ret);
        } 
    }
}