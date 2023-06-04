import { SubathonState } from "@subathon/models/responses";
import { Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'subathonState',
    standalone: true
})
export class SubathonStatePipe implements PipeTransform {
    transform(value: SubathonState): string {
        switch(value) {
            case SubathonState.ENDED:
                return 'Ended';
            case SubathonState.IN_PROGRESS:
                return 'In Progress';
            case SubathonState.PAUSED: 
                return 'Paused';
            case SubathonState.INIT:
                return 'Not Started';
            case SubathonState.STOPPING:
                return 'Stopping';
        }
    }
}