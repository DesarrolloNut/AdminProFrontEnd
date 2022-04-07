import { Usuario } from './../../../servicios/recepcion/models/Usuario';
import { Component, ElementRef, EventEmitter, HostListener, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FocusEventArgs } from '@syncfusion/ej2-angular-calendars';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { PrintExportFile, TypeReport } from 'src/app/Services/PrintExportFile.service';
import { BalanzaPesoGrupoSignalREnum } from 'src/app/shared/enums/BalanzaPesoGrupoSignalREnum';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { DespachoInUseVM, DespachoPreventaDetalleExportVM, DespachoPreventaDetalleViewModel, DespachoPreventaRequestModel } from '../../despacho/models/DespachoPedidoDetalleViewModel';
import { DespachoListadoPreventaVM } from '../../despacho/models/DespachoPedidoListadoViewModel';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-despacho-asignacion-listado',
  templateUrl: './despacho-asignacion-listado.component.html',
  styleUrls: ['./despacho-asignacion-listado.component.scss']
})
export class DespachoAsignacionListadoComponent implements OnInit, OnDestroy {


  // COPIAR AL CREAR UN LISTADO NUEVO
  @Output() dataPreventaEmit = new EventEmitter<DespachoListadoPreventaVM[]>();

  // Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoModal: boolean = false;

  btnAsignaDespachoCargando


  totalPaginas: number = 0;
  paginaSize: number = 10;
  paginaTotalRecords: number = 0;
  dataPreventa: DespachoListadoPreventaVM[] = [] //tu modelo
  despachoPreventaSeleccionado: DespachoListadoPreventaVM;

  fecha= new Date()


  //LECTURA DEL CODIGO DE BARRA
  @ViewChild('search') searchElement: ElementRef;
  searchValue: string = ""
  enterPressed: boolean;


  @ViewChild('modalDetalle') modalElement: ElementRef;
  btnGuardarCargando: boolean;

  fechaFiltro: Date = new Date();


  Diferencia_Minima_Despacho = 0
  btnCargandoPrint: boolean;


  sucursales:ComboBox[]=[];

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private printService :PrintExportFile ,

    private modalService: NgbModal,
  ) { }
  ngOnDestroy(): void {
    //throw new Error('Method not implemented.');


  }


  ngOnInit(): void {
    this.getAllData();
  }

 async getAllData(){
   await this.getSucursales();
   await this.getDiferenciaMinima()
   this.getDataPreventa();

  }
  getDataPreventa() {

    this.Cargando = true;

   let parametros: Parametro[] = [
     { key: "Search", value: '' },
     {  key: "UsuarioId",value:Number(this.authService.tokenDecoded.nameid)},
     { key: "SucursalId", value: 0 },
     { key: "Fecha", value: this.fecha },
    ]
   this.httpService.GetAllWithPagination<DespachoListadoPreventaVM>(DataApi.Despacho,
      "GetDespachoPreventaListadoForAsignacion", "FechaEntrega", this.paginaNumeroActual,
     this.paginaSize,true, parametros).subscribe(x => {
       if (x.ok) {

         this.dataPreventa = x.valores[0];
         this.dataPreventaEmit.emit(this.dataPreventa);
         this.asignarPagination(x);
       } else {
         this.toastService.error(x.errores[0]);
         console.error(x.errores[0]);
       }

     this.Cargando = false;
     }, error => {
       console.error(error);
       this.toastService.error("Error conexion al servidor");
         this.Cargando = false;
     });

 }



  asignarPagination(x: ResponseContenido<any>) {

    if (x.pagina != null) {
      this.totalPaginas = x.pagina.totalPaginas == null ? 0 : x.pagina.totalPaginas;
      this.paginaTotalRecords = x.pagina.totalRecords == null ? 0 : x.pagina.totalRecords;
      this.paginaSize = x.pagina.paginaSize == null ? 0 : x.pagina.paginaSize;
    } else {
      this.totalPaginas = 0;
      this.paginaTotalRecords = 0;
      this.paginaSize = 0;
    }

  }





  // setFocus() {
  //   this.searchElement.nativeElement.focus();
  // }

  // @HostListener('window:keydown', ['$event'])
  // onWindowKeyDown(event: any) {
  //   if (!this.enterPressed) {
  //     this.setFocus()
  //   }
  // }


  // @HostListener('window:keyup.enter', ['$event'])
  // onWindowKeyupEnter(event: any) {
  //   this.searchElement.nativeElement.blur();

  //   if (!this.enterPressed) {
  //     this.enterPressed = true;
  //     this.modalService.dismissAll();
  //     this.modalService.open(this.modalElement, { size: "xl" })
  //   }
  // }



  exportDespachoPreventaDetalle(despacho:any) {

    //TIPO 1 = PRINT
    //TIPO 2 = EXPORTAR EXCEL
    this.btnCargandoPrint=true;
    this.despachoPreventaSeleccionado = despacho;

    let parametros={
     "Fecha":despacho.fechaEntrega
    ,"RutaId": despacho.rutaId
   }


    this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
      "GetDespachoPreventaDetalles", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          this.btnCargandoPrint=false;

        } else {
             this.despachoPreventaDetalleToPrinter(response.valores[0])
        }
        this.btnCargandoPrint=false;
      }, error => {
        console.log(error)
        this.btnCargandoPrint=false;
        this.toastService.error("No se pudo obtener el detalle", "Error conexion al servidor");
      });
  }
  despachoPreventaDetalleToPrinter(data:DespachoPreventaDetalleViewModel[]) {

    let dataFormated:DespachoPreventaDetalleExportVM[] = [];
    data.forEach(x=>{
      let piezas =0;
       if(x.unidadMedida=="LBS" ){
          piezas = Math.round(((x.pedido)/x.peso));
       }else if(x.unidadMedida=="UNIDAD"){
         if(x.pedido>=x.peso){
          piezas = Math.trunc(((x.pedido)/x.peso));
          piezas = parseFloat(piezas + "."+(x.pedido%x.peso))
         }else{
          piezas=0;
         }

       }

       dataFormated.push({
         Despachador:this.despachoPreventaSeleccionado.despachador,
         Distribuidor:this.despachoPreventaSeleccionado.distribuidor,
         Ruta:this.despachoPreventaSeleccionado.ruta,
         CodigoArticulo:x.codigoArticulo,
         Descripcion:x.articulo,
         Almacen_Desde:x.almacen_Origen,
         Almacen_Hasta:x.almacen_Destino,
         Unidad:x.unidadMedida,
         Piezas: piezas,
         Despacho:(x.despacho>0? x.despacho : undefined),
         Pedido:x.pedido,
       })
    });
     this.printService.ExportFile(dataFormated,
                                 "Industrias La Nutriciosa, SRL",
                                  "Hoja de despacho",
                                  "Transacción entre almacenes",
                                TypeReport.PDF,"RPT006")
  }



  onChangeFechaDesdeFiltro(evento: any) {
    // if(++this.primeraVez==1){return;}


     this.fecha = new Date(evento.value)
     this.getDataPreventa()
  }

  async getDiferenciaMinima(){
    await this.httpService.DoPostAnyAsync<string>(DataApi.Despacho,
       "GetDiferenciaMinimaDespacho", null).then(response => {

         if (!response.ok) {
           this.toastService.error(response.errores[0]);
         } else {
             this.Diferencia_Minima_Despacho=parseFloat(response.valores[0])
         }
       }, error => {
         console.error(error)
         this.toastService.error("ha ocurrido un error", "Error conexion al servidor");
       });
   }


  validaDiferenciaMinimaDespacho(item: DespachoListadoPreventaVM){

    let diff= item.totalMontoPedidoERP-item.totalMontoPedido;
    if(item.totalMontoPedido==0){return false}
    if(item.totalMontoPedidoERP< Math.trunc( item.totalMontoPedido)){return false}
    if(diff<=this.Diferencia_Minima_Despacho){
      return true;
    }else{return false}
}



  getRamdonDespachoAndAsign(user:Usuario){
    //Valida existe despachos sin asignacion y no esten sincronizando
    let data_filtered= this.dataPreventa.filter(x=>x.despachador==null && x.sync==false);

      if (data_filtered.length>0) {

        //Obtiene el despacho ramdon
        var item =data_filtered[Math.floor(Math.random()*data_filtered.length)];

        //Valida si el despacho ramdon cumple con la diferencia minima de monto
        if(!this.validaDiferenciaMinimaDespacho(item)){
          item.sync=true;
          this.getRamdonDespachoAndAsign(user);
          return;
        }
        this.despachoPreventaSeleccionado =item;
        this.registraDespachoPreventaInUse(user,item);
        //Imprimiendo despacho
      //  this.exportDespachoPreventaDetalle(item,1)

      }else{

        this.toastService.warning("No hay despachos disponibles para asignar")
        return;
      }


  }

  registraDespachoPreventaInUse(user:Usuario,despacho){

    this.btnAsignaDespachoCargando=true;

    let p= new DespachoPreventaRequestModel();
    p.ruta = this.despachoPreventaSeleccionado.rutaId;
    p.fechaEntrega = this.despachoPreventaSeleccionado.fechaEntrega;
    p.usuarioId =  Number(user.id)
    p.estadoId = 1;

    this.httpService.DoPostAny<DespachoInUseVM>(DataApi.Despacho,
      'RegistraDespachoPreventaInUse', p).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnAsignaDespachoCargando = false;
        } else {
          if(response.valores?.length>0){
           let m:DespachoInUseVM = response.valores[0];
           if(m.estado!=2 )  {
             this.despachoPreventaSeleccionado.despachador=user.nombres+" "+ user.apellidos;
          // this.finalizaDespacho(2);
             this.exportDespachoPreventaDetalle(this.despachoPreventaSeleccionado)
             this.toastService.success(m.mensaje)
           }else{
            this.toastService.error(m.mensaje)

           }

          }
        }
        this.btnAsignaDespachoCargando = false;

      }, error => {
       this.btnAsignaDespachoCargando = false;
        this.toastService.error("Error conexion al servidor");
      });


  }

  finalizaDespacho(estado:number){

    //ESTADO 2 INDICA QUE EL DESPACHO SE PICKEARA DE MANERA MANUAL
    //ESTADO 3 INDICA QUE EL DESPACHO SE PICKEO MEDIANTE LA PLATAFORMA WEB

     this.despachoPreventaSeleccionado.noEditable=1;
     let p= new DespachoPreventaRequestModel();
     p.ruta = this.despachoPreventaSeleccionado.rutaId;
     p.fechaEntrega = this.despachoPreventaSeleccionado.fechaEntrega;
     p.estadoId=estado;

     this.httpService.DoPostAny<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
       'finalizaDespachoPreventa', p).subscribe(response => {
         if (!response.ok) {
           this.toastService.error(response.errores[0], "Error");
           this.despachoPreventaSeleccionado.noEditable=0;
         } else {
           if(response.valores?.length>0){

                 if(response.valores[0]>0){
                   this.despachoPreventaSeleccionado.finalizado=1;
                   this.despachoPreventaSeleccionado.noEditable=1;
                   this.despachoPreventaSeleccionado.estadoDespacho=4;
                   console.log(  this.despachoPreventaSeleccionado)
                 }
           }
         }

       }, error => {
         this.despachoPreventaSeleccionado.noEditable=0;
         this.toastService.error("Error conexion al servidor");
       });


   }



  async getSucursales() {
    let parametros: Parametro[] = [
        { key: "CompaniaID", value: 0 }
    ];
   await this.httpService.DoPostAsync<ComboBox>(DataApi.ComboBox,
        "GetSucursales", null).then(response => {

            if (!response.ok) {
                this.toastService.error(response.errores[0]);
                // let thes = this;
                // this.timeOut = setTimeout(() => {
                //     thes.getSucursales();
                // }, 1000);
            } else {
                this.sucursales = response.records;
            }

        }, error => {
            // let thes = this;
            // this.timeOut = setTimeout(() => {
            //     thes.getSucursales();
            // }, 1000);

            this.toastService.error("No se pudo obtener las sucursales.", "Error conexion al servidor");
        });
}

getNameOfSucursal(sucursalId:number):string{
  return this.sucursales.find(x=>x.codigo==sucursalId).nombre;
}



}
