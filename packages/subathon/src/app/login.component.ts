import { Component } from "@angular/core";
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { FRONTEND_ENVIRONMENT, CONSTANTS } from '@subathon/environments';

@Component({
    standalone: true,
    selector: 'subathon-login',
    imports: [MatCardModule, MatButtonModule, MatToolbarModule],
    template: `
    <mat-card class="page-center">
        <mat-card-content>
            <a mat-raised-button color="primary" href="{{authUrl}}">Connect/Login with Twitch!</a>
        </mat-card-content>
    </mat-card>
    `,
})
export default class LoginComponent {

    authUrl = new URL('https://id.twitch.tv/oauth2/authorize');
    constructor(){}

    ngOnInit() {
        this.authUrl.searchParams.append('response_type', 'code');
        this.authUrl.searchParams.append('force_verify', 'false');
        this.authUrl.searchParams.append('redirect_uri', FRONTEND_ENVIRONMENT.redirectCodeValidateURI);
        this.authUrl.searchParams.append('client_id', CONSTANTS.clientId);
        this.authUrl.searchParams.append('scope', CONSTANTS.scopes.join(' '));
        this.authUrl.searchParams.append('state', 'token');
      }

}