import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { BehaviorSubject, map, take } from 'rxjs';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { SubathonService } from './subathon.service';
import { SubathonStorageService } from './subathon-storage.service';
import { MatChipsModule } from '@angular/material/chips';
import { Subathon, SubathonState } from '@subathon/models/responses';
import { SubathonStatePipe } from './subathon-state.pipe';

@Component({
    standalone: true,
    selector: 'subathon-listing',
    imports: [MatCardModule, AsyncPipe, MatButtonModule, MatIconModule, MatListModule, NgIf, MatProgressSpinnerModule, NgFor, MatChipsModule, SubathonStatePipe],
    template: `
        <mat-card>
            <mat-card-header>
                <h2>Subathons</h2>
            </mat-card-header>
            <mat-card-content>
                <ng-container *ngIf="subathons$ | async as subathons; else spinner">
                    <mat-list *ngIf="subathons.length > 0; else noSubathons">
                        <mat-list-item *ngFor="let subathon of subathons">
                            <span style="display:flex; align-items:center; justify-content:space-between">
                                <span>
                                    <span style="margin-right: 8px;">{{subathon.publicName}}</span>
                                    <mat-chip>{{subathon.state | subathonState}}</mat-chip>
                                </span>
                                <span>
                                    <button mat-icon-button (click)="updateState(subathon, SubathonState.IN_PROGRESS)" *ngIf="subathon.state === SubathonState.INIT || subathon.state === SubathonState.PAUSED"><mat-icon>play_arrow</mat-icon></button>
                                    <button mat-icon-button (click)="updateState(subathon, SubathonState.PAUSED)" *ngIf="subathon.state === SubathonState.IN_PROGRESS"><mat-icon>pause</mat-icon></button>
                                    <button mat-icon-button (click)="updateState(subathon, SubathonState.ENDED)" *ngIf="subathon.state === SubathonState.IN_PROGRESS || subathon.state === SubathonState.PAUSED"><mat-icon>stop</mat-icon></button>
                                </span>
                            </span>
                        </mat-list-item>
                    </mat-list>
                </ng-container>
            </mat-card-content>
        </mat-card>

        <ng-template #spinner>
            <mat-progress-spinner mode="indeterminate" color="primary"></mat-progress-spinner>
        </ng-template>
        <ng-template #noSubathons>
            <p>No Subathons yet...</p>
            <button type="button" mat-fab color="primary" [disabled]="isCreatingSubathon$ | async" (click)="addSubathon()" style="position: fixed;bottom: 5%;right: 5%;"><mat-icon>add</mat-icon></button>
        </ng-template>
    `,
    styles: [`
    
    :host {
        height: 85%;
        width: 75%;
        margin: 0 auto;
    }
    mat-list-item {
        display: flex;
        flex-direction: row;
    }
    .list-item-actions {
        display: flex;
        flex-direction: row
    }

    `]
})
export default class ListingComponent {
    subathons$ = this.subathonStorage.subathons$;
    SubathonState = SubathonState;
    isCreatingSubathon$ = new BehaviorSubject<boolean>(false);
    constructor(private subathonStorage: SubathonStorageService, private subathonService: SubathonService){}

    ngOnInit(){
        this.subathonService.getSubathons().pipe(take(1)).subscribe({
            next: (subathons) => {
            this.subathonStorage.setSubathons(subathons);
        }, error: () => {
            this.subathonStorage.setSubathons(null);
        }})
    }

    addSubathon() {
        this.isCreatingSubathon$.next(true);
        this.subathonService.createSubathon({} as Subathon).pipe(take(1)).subscribe({
            next: (subathon: any) => {
                this.subathonStorage.addSubathon(subathon.subathon);
            },
            error: (error) => {
                console.log(error);
                this.isCreatingSubathon$.next(false);
            }
        })
    }

    updateState(subathon: Subathon, status: SubathonState){
        this.subathonService.updateSubathonState(subathon.id, status).pipe(take(1)).subscribe({
            next: (subathon) => {
                this.subathonStorage.updateSubathonState(subathon.id, subathon.state);
            },
            error: (error) => {
                console.log(error);
            }
        });
    }
}