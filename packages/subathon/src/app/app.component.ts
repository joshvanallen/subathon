import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import { UserInfoService } from './user-info.service';
import { map } from 'rxjs';
import { AsyncPipe, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'jvasoftware-root',
  imports: [RouterOutlet, MatToolbarModule, AsyncPipe, NgIf],
  template: `
    <mat-toolbar color="primary">
      <span>Subathon Center by JustJVA</span>
      <span style="display:flex; align-items:center;" *ngIf="userInfo$ | async as userInfo">
        <span style="padding-right: 8px">{{userInfo.displayName}}</span>
        <img height="36" width="36" style="border-radius:50%" [src]="userInfo.profileImgUrl"/>
      </span>
    </mat-toolbar>
    <div class="route-outlet">
    <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .mat-toolbar {
      display: flex;
      justify-content: space-between;
    }
    .route-outlet {
      height: calc(100% - 64px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background-color: #eeeeee;
    }

    @media(max-width: 599px) {
      .route-outlet {
        height: calc(100% - 56px);
      }
    }
  `],
})
export class AppComponent {
  profilePicture$ = this.userInfoService.user$.pipe(map(userInfo => userInfo?.profileImgUrl));
  userInfo$ = this.userInfoService.user$;
  constructor(private userInfoService: UserInfoService){}

}
