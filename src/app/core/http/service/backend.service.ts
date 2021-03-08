import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RequestContenido } from '../model/RequestContenido';
import { ResponseContenido } from '../model/ResponseContenido';
import { Observable } from 'rxjs';
import { Paginacion } from '../model/Paginacion';
import { DataApi, dataApiRootMap } from '../../../shared/enums/DataApi.enum';


@Injectable({
    providedIn: 'root'
})
export class BackendService {


    http: HttpClient;
    baseUrl: string;

    constructor(_http: HttpClient, @Inject('BASE_URL') _baseUrl: string) {
        this.http = _http;
        this.baseUrl = _baseUrl;
    }

    public GetAllWithPagination<T>(api: DataApi, Method: string, Columna: string, PaginaNo: number = 1, PaginaSize: number = 10, OrderASC: boolean = true, parametros: any = {}): Observable<ResponseContenido<T>> {
        let request = new RequestContenido<T>();
        request.parametros = parametros;
        request.pagina = new Paginacion();
        request.pagina.paginaNo = PaginaNo;
        request.pagina.paginaSize = PaginaSize;
        request.pagina.ordenAsc = OrderASC;
        request.pagina.ordenColumna = Columna;
        return this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request);
    }

    public DoPost<T>(api: DataApi, Method: string, parametros: any): Observable<ResponseContenido<T>> {
        let request = new RequestContenido<T>();
        request.parametros = parametros;
        return this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request);
    }

    public DoPostAny<T>(api: DataApi, Method: string, request: any): Observable<ResponseContenido<T>> {
        return this.http.post<ResponseContenido<T>>(this.baseUrl + dataApiRootMap[api] + "/" + Method, request);
        //return this.http.post<ResponseContenido<T>>(this.baseUrl + this.dataApiRootMap[api] + "/" + Method, request, httpOptions);
    }

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


} 
