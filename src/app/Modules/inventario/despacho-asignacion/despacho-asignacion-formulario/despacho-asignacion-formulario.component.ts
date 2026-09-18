import { DespachoAsignacionListadoComponent } from './../despacho-asignacion-listado/despacho-asignacion-listado.component';
import { Component, ElementRef, OnDestroy, OnInit, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { CalendarComponent, FocusEventArgs } from '@syncfusion/ej2-angular-calendars';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { BalanzaPesoGrupoSignalREnum } from 'src/app/shared/enums/BalanzaPesoGrupoSignalREnum';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DespachoListadoPreventaVM } from '../../despacho/models/DespachoPedidoListadoViewModel';
import { DespachoInUseVM, DespachoPreventaRequestModel } from '../../despacho/models/DespachoPedidoDetalleViewModel';

@Component({
  selector: 'app-despacho-asignacion-formulario',
  templateUrl: './despacho-asignacion-formulario.component.html',
  styleUrls: ['./despacho-asignacion-formulario.component.scss']
})
export class DespachoAsignacionFormularioComponent implements OnInit, OnDestroy {

  data :  DespachoListadoPreventaVM[]=[];
  @ViewChild(DespachoAsignacionListadoComponent) dAsignacionListado: DespachoAsignacionListadoComponent;

  search: string;
  searching: boolean;


  searchChanged: Subject<string> = new Subject<string>();


  intervalRefreshFocus: NodeJS.Timeout
  intervalRefreshCountDown: NodeJS.Timeout


  @ViewChild('modalConfirm') myModal:ElementRef;
  @ViewChild('modalLoadingApertura') myModalLoadingApertura:ElementRef;

  usuario: Usuario;

  timerSeconds:number;
  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private renderer: Renderer2) {

      this.searchChanged.pipe(
        debounceTime(500))
        .subscribe(model => {
          this.search=model;
          this.findForSearch()
        });
     }

  ngOnInit(): void {

  }


  @ViewChild('default')
  public datepickerObj: any;

  onFocus(args: FocusEventArgs): void {
    this.datepickerObj.show();
  }


  findForSearch(){

    if (this.search && this.search.length >= 10)
     {
       this.identifyAccionBySearch(this.search);
     }

  }
  onSearchChange(text: string) {
    this.searchChanged.next(text);
  }

  onClearSearch() {
    this.search = ""
    this.focusInputSearch()
    //this.onSearchChange()
  }


  getUsuarioByDoc(documento:string) {
    let u = new Usuario();
    u.documento= documento;

    this.searching=true;


    this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
      "GetUsuarioByDoc", u).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records[0] != null && response.records.length > 0) {

            this.usuario =  response.records[0];

            if (this.usuario.rol!='PICKEADOR') {
              this.toastService.warning("Usted no es un despachador.");
              this.usuario= new Usuario();
              this.search="";
              this.searching=false;
              return;
             }

             this.dAsignacionListado.getRamdonDespachoAndAsign(this.usuario)

          } else {
            this.toastService.warning("Usuario no encontrado");
          }
        }
        this.search="";
        this.searching=false;

      }, error => {
        this.toastService.error("Error conexion al servidor");
      });
  }







  refreshData(data){
    this.data= data;

  }

  ngAfterViewInit() {

    if(this.authService.tokenDecoded.role!='PantallaAsignadorDespacho'){
      this.intervalRefreshFocus = setInterval(() => {
        var elem = this.renderer.selectRootElement('#inputSearch');

        // this.renderer.listen(elem, "focus", () => { console.log('focus') });
        // this.renderer.listen(elem, "blur", () => { console.log('blur') });
        elem.focus();
        this.focusInputSearch()

      }, 500)
    }

  }

  focusInputSearch() {
    this.renderer.selectRootElement('#inputSearch').focus();
  }


  identifyAccionBySearch(searchValue:string){

   if(searchValue.includes('A')){
    //  CODIGO DE APERTURA
    //  decodeArr[0] =  Prefijo Apertura
    //  decodeArr[1] =  RutaId
    //  decodeArr[2] =  Fecha

    let decodeArr = searchValue.split('-');
    let parametros= new DespachoPreventaRequestModel();
    parametros.ruta = parseInt(decodeArr[1]) ;
    parametros.fechaEntrega = decodeArr[2];

    this.logicForAperturaDespacho(parametros)

   }
   else{
    //DOCUMENTO DEL USUARIO
    this.getUsuarioByDoc(this.search)
   }

  }
  logicForAperturaDespacho(parametros:DespachoPreventaRequestModel){

    this.timerSeconds=4;
    this.modalService.open(this.myModal,{backdrop:true,centered:true,windowClass:'modalLoadingDespacho'})
    this.intervalRefreshCountDown= setInterval(() => {
        this.timerSeconds--;
      }, 1000);


    setTimeout(() => {
      window.clearInterval(this.intervalRefreshCountDown);
      this.modalService.dismissAll();
      this.modalService.open(this.myModalLoadingApertura,{backdrop:true,centered:true,windowClass:'modalLoadingDespacho'})
      setTimeout(() => {
        this.aperturaDespacho(parametros)
      }, 500);

    }, 4000);

  }
  aperturaDespacho(parametros:DespachoPreventaRequestModel){
     this.httpService.DoPostAny<any>(DataApi.Despacho,
      'AperturaDespachoPreventa', parametros).subscribe( response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          if(response.valores?.length>0){
            let m:DespachoInUseVM = response.valores[0];
            if(m.estado!=2 )  {
              this.toastService.success(m.mensaje)
            }else{
              this.toastService.error(m.mensaje)

            }
          }
        }
        this.search="";
        this.modalService.dismissAll();

      }, error => {
        this.modalService.dismissAll();
        this.toastService.error("Error conexion al servidor");
      });
  }

  onChangeFechaDesdeFiltro(evento: any) {
    // if(++this.primeraVez==1){return;}
    // this.fecha = new Date(evento.value)
    // this.getDataByCondicional()
  }
  ngOnDestroy(): void {
    window.clearInterval(this.intervalRefreshFocus);
  }

}
