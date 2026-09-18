import { Component, AfterViewInit } from '@angular/core';
import { Router, RouterEvent, RouteConfigLoadStart, RouteConfigLoadEnd, NavigationStart, NavigationEnd, NavigationCancel, ActivatedRoute } from '@angular/router';
import { AuthenticationService } from './core/authentication/service/authentication.service';
import { NgxPermissionsService } from 'ngx-permissions';
import { ConnectionService } from 'ng-connection-service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ErrorConnectionInternetComponent } from './shared/error-connection-internet/error-connection-internet.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
    public isShowingRouteLoadIndicator: boolean;
    loading;
    isConnected: boolean;

    constructor(
        public router: Router,
        public activatedRoute: ActivatedRoute,
        public authenticationService: AuthenticationService,
        private connectionService: ConnectionService,
        private modalService: NgbModal,
        public permissionsService: NgxPermissionsService
    ) {
        this.isShowingRouteLoadIndicator = false;
        this.loading = true;
    }

    ngOnInit() {
 
        this.connectionService.monitor().subscribe(isConnected => {
            this.isConnected = isConnected;
            if (this.isConnected) {
                this.modalService.dismissAll();
            }
            else {
                this.modalService.open(ErrorConnectionInternetComponent,
                    { size: 'lg', centered: true, backdrop: 'static' });
            }
        });

        this.authenticationService.setDecodeToken();

        if (this.authenticationService.loggedIn()) {
            this.authenticationService.setPermissions();
            if(this.authenticationService.tokenDecoded.role=='PantallaAsignadorDespacho'){
               this.router.navigateByUrl('inventario/despacho-asignacion')
            }

        }
    }

    ngAfterViewInit() {
        this.router.events
            .subscribe((event) => {

                if (event instanceof NavigationStart) {
                    this.loading = true;
                }
                else if (
                    event instanceof NavigationEnd ||
                    event instanceof NavigationCancel
                ) {
                    this.loading = false;
                }

            });
    }

}
