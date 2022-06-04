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

@Component({
  selector: 'app-despacho-asignacion-formulario',
  templateUrl: './despacho-asignacion-formulario.component.html',
  styleUrls: ['./despacho-asignacion-formulario.component.scss']
})
export class DespachoAsignacionFormularioComponent implements OnInit, OnDestroy {

  data :  DespachoListadoPreventaVM[]=[];
  @ViewChild(DespachoAsignacionListadoComponent) hijo: DespachoAsignacionListadoComponent;


  cargando: boolean;
  search: string;
  searching: boolean;


  searchChanged: Subject<string> = new Subject<string>();
  fechaActual: Date;


  btnGuardarCargando: boolean;



  random: number;

  intervalRefreshFocus: NodeJS.Timeout

  @ViewChild('modalConfirm') myModal:ElementRef;

  usuario: Usuario;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    private router: Router,
    private renderer: Renderer2) {

      this.searchChanged.pipe(
        debounceTime(500))
        .subscribe(model => {
          this.search=model;
         this.findForSearch()
        });
     }

  ngOnInit(): void {

    this.getHoraActual()
    this.getUsuarioLogueado()


    // this.empezarAmbientePrueba();

  }


  @ViewChild('default')
  public datepickerObj: any;

  onFocus(args: FocusEventArgs): void {
    this.datepickerObj.show();
  }











  onSubmit() {


    // if (this.lote.cantidad < this.pesoNeto) {
    //   this.toastService.warning(`No tiene lote disponible para hacer esta transferencia, favor verificar.`);
    //   return;
    // }

    this.guardar()
  }

  guardar() {

    let request: any = {
      id: 0,
    };

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<any>(DataApi.Despacho,
      "Registrar", request).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          let id = response.valores[0];
          this.router.navigateByUrl('/impresion/produccion/pesaje-resultado-codigo-barra/' + id);
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }










  findForSearch(){

    if (this.search && this.search.length >= 10) {
      this.getUsuarioByDoc(this.search)
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
              this.searching=false;
              return;
             }

             this.hijo.getRamdonDespachoAndAsign(this.usuario)

         //   this.modalService.open(this.myModal)

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





  getUsuarioLogueado() {
    let usuarioID: number = Number(this.authService.tokenDecoded.nameid)

    this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let usuario = response.records[0];
            this.usuario = usuario;

          } else {
            this.toastService.warning("Usuario no encontrado");
          }
        }

      }, error => {
        this.toastService.error("Error conexion al servidor");
      });
  }


  getHoraActual() {
    this.cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
        }

        this.cargando = false;
      }, error => {
        this.cargando = false;
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



  onChangeFechaDesdeFiltro(evento: any) {
    // if(++this.primeraVez==1){return;}


    // this.fecha = new Date(evento.value)
    // this.getDataByCondicional()
  }
  ngOnDestroy(): void {
    window.clearInterval(this.intervalRefreshFocus);
  }



}
