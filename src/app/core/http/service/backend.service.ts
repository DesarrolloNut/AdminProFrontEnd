import { AuthenticationService } from './../../authentication/service/authentication.service';
import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestContenido } from '../model/RequestContenido';
import { ResponseContenido } from '../model/ResponseContenido';
import { Observable } from 'rxjs';
import { Paginacion } from '../model/Paginacion';
import { DataApi, dataApiRootMap } from '../../../shared/enums/DataApi.enum';
import { retry } from 'rxjs/operators';
import { JwtHelperService } from '@auth0/angular-jwt';
import { TokenModel } from '../../authentication/model/TokenModel';


@Injectable({
    providedIn: 'root'
})
export class BackendService {


    http: HttpClient;
    baseUrl: string;

    helper = new JwtHelperService();
    tokenDecoded: TokenModel;


    constructor(
      _http: HttpClient, @Inject('BASE_URL')
      _baseUrl: string) {
        this.http = _http;
        this.baseUrl = _baseUrl;
    }

    public GetAllWithPagination<T>(api: DataApi, Method: string, Columna: string, PaginaNo: number = 1, PaginaSize: number = 10, OrderASC: boolean = true, parametros: any[] = []): Observable<ResponseContenido<T>> {
        this.setDecodeToken();
        let request = new RequestContenido<T>();
        parametros= this.addParametersExtra(parametros)
        request.parametros = parametros;
        request.pagina = new Paginacion();
        request.pagina.paginaNo = PaginaNo;
        request.pagina.paginaSize = PaginaSize;
        request.pagina.ordenAsc = OrderASC;
        request.pagina.ordenColumna = Columna;
        return this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request).pipe(retry(3));
    }

    public DoPost<T>(api: DataApi, Method: string, parametros: any): Observable<ResponseContenido<T>> {
        let request = new RequestContenido<T>();
        request.parametros = parametros;
      
        return this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request).pipe(retry(3));
    }
    public DoPostAny<T>(api: DataApi, Method: string, request: any, reportProgress = false): Observable<ResponseContenido<T>> {
     
        return this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request).pipe(retry(3));
    }
    public async DoPostAnyAsync<T>(api: DataApi, Method: string, request: any, reportProgress = false) {
    
        return  await this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request).toPromise();
    }

    public async DoPostAsync<T>(api: DataApi, Method: string, parametros: any){
      let request = new RequestContenido<T>();
      request.parametros = parametros;
      //console.log(request);
      
      return  await this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request).toPromise();
  }
    // public DoPostUpload<T>(api: DataApi, Method: string, files: File[]) {
    //     const formData = new FormData();
    //     files.forEach(f => { formData.append('file', f, f.name); })

    //     return this.http.post(this.baseUrl + dataApiRootMap[api] + "/" + Method, formData, { reportProgress: true, observe: 'events' });
    // }

    // public DoPostSmartWebService(Method: string, request: any): Observable<any> {
    //     const proxyurl = "https://cors-anywhere.herokuapp.com/";
    //     const url = "http://lacortina.ddns.net/wscontacto/InsertaServicioscitas.asmx"; // site that doesn’t send Access-Control-*

    //     const headers = {
    //         method: "POST",
    //         headers: {
    //             'Content-Type': 'application/json',
    //             'Accept': 'application/json'
    //         }
    //     }
    //     return this.http.post(proxyurl + url + "/" + Method, JSON.stringify(request), headers);
    // }

    public DoPostSmartWebService(servicio: string, metodo: string, request: any): Observable<any> {
        const proxyurl = "https://cors-anywhere.herokuapp.com/";
        const url = `http://lacortina.ddns.net/wscontacto/${servicio}.asmx`; // site that doesn’t send Access-Control-*

        const headers = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
        return this.http.post(proxyurl + url + "/" + metodo, JSON.stringify(request), headers);
    }

    addParametersExtra(parametros:any[]=[]){
      try {
        if(parametros.filter(x=>x.key=="CompaniaId").length<=0){
           parametros.push( { key: "CompaniaId", value: this.tokenDecoded.primarygroupsid })
        }
        return parametros;
      } catch (error) {
        console.log(error)
        return parametros;
      }
    }


   private setDecodeToken(): void {
      if (this.tokenDecoded) return;
      let token = localStorage.getItem("keyVC");
      this.tokenDecoded = this.helper.decodeToken(token);
  }

}
