import * as $ from 'jquery';
import { JwtModule } from '@auth0/angular-jwt';
import { NgxPermissionsModule } from 'ngx-permissions';


import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule, LocationStrategy, HashLocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';

import { NgbModule, NgbToastModule } from '@ng-bootstrap/ng-bootstrap';

import { FullComponent } from './core/layouts/full/full.component';
import { BlankComponent } from './core/layouts/blank/blank.component';

import { NavigationComponent } from './shared/header-navigation/navigation.component';
import { SidebarComponent } from './shared/sidebar/sidebar.component';
import { BreadcrumbComponent } from './shared/breadcrumb/breadcrumb.component';

import { Approutes } from './app-routing.module';
import { AppComponent } from './app.component';
import { SpinnerComponent } from './shared/spinner.component';
import { LoginComponent } from './Modules/login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

import { PerfectScrollbarModule, PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SharedModule } from './Modules/shared/shared.module';
import { environment } from 'src/environments/environment';
import { ToastrModule } from 'ngx-toastr';

import { SpeechSynthesisModule } from '@kamiazya/ngx-speech-synthesis';




const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true,
  wheelSpeed: 2,
  wheelPropagation: true,
  minScrollbarLength: 20
};

@NgModule({
  declarations: [
    AppComponent,
    SpinnerComponent,
    FullComponent,
    BlankComponent,
    NavigationComponent,
    BreadcrumbComponent,
    SidebarComponent,
    LoginComponent,
    
  ],
  imports: [

    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: [getHost()],
        blacklistedRoutes: [getHost() + '/' + 'api/Authentication']
      }
    }),
    SpeechSynthesisModule.forRoot({
      lang: 'es-DO',
      volume: 1.0,
      pitch: 1.0,
      rate: 1.0,
    }),
    NgbModule, ToastrModule.forRoot(),
    NgxPermissionsModule.forRoot(),
    NgbToastModule,
    CommonModule,
    BrowserModule,
    PerfectScrollbarModule,
    BrowserAnimationsModule,
    SharedModule,
    HttpClientModule,
    RouterModule.forRoot(Approutes),
    
    

  ],
  providers: [
    { provide: PERFECT_SCROLLBAR_CONFIG, useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG },
    { provide: 'BASE_URL', useFactory: getHost },
     AuthGuard,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function getHost() {
  return environment.apiUrl;
}

export function tokenGetter() {
  return localStorage.getItem("token");
}
