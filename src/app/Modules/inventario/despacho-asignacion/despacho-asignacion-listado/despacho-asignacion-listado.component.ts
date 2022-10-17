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
import { DespachoInUseVM, DespachoPreventaDetalleExportVM, DespachoPreventaDetalleViewModel, DespachoPreventaRequestModel, DespachoRangoHoraRequestModel } from '../../despacho/models/DespachoPedidoDetalleViewModel';
import { DepachoHorasVM, DespachoListadoPreventaAsignacionVM } from '../../despacho/models/DespachoPedidoListadoViewModel';
import * as XLSX from 'xlsx';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-despacho-asignacion-listado',
  templateUrl: './despacho-asignacion-listado.component.html',
  styleUrls: ['./despacho-asignacion-listado.component.scss']
})
export class DespachoAsignacionListadoComponent implements OnInit, OnDestroy {


  // COPIAR AL CREAR UN LISTADO NUEVO
  @Output() dataPreventaEmit = new EventEmitter<DespachoListadoPreventaAsignacionVM[]>();

  // Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoRealtime =false;
  btnAsignaDespachoCargando=false;
  loadingStatusMessaje='Asignando despacho random...';

 

  totalPaginas: number = 0;
  paginaSize: number = 40;
  paginaTotalRecords: number = 0;
  dataPreventa: DespachoListadoPreventaAsignacionVM[] = [] //tu modelo
  dataPreventaF:DespachoListadoPreventaAsignacionVM[] = [] //tu modelo
  despachoPreventaSeleccionado: DespachoListadoPreventaAsignacionVM;

  fecha= new Date()
  fechaConsultaPantalla= new Date()


  //LECTURA DEL CODIGO DE BARRA
  @ViewChild('search') searchElement: ElementRef;
  searchValue: string = ""
  enterPressed: boolean;


  @ViewChild('modalLoadingDespacho') myModal:ElementRef;
  btnGuardarCargando: boolean;

  fechaFiltro: Date = new Date();


  Diferencia_Minima_Despacho = 0
  btnCargandoPrint: boolean;


  sucursales:ComboBox[]=[];



  //PUEDE VER PANTALLA
  intervalRefreshData: NodeJS.Timeout
  intervalRefreshFecha: NodeJS.Timeout

   fDesde = new Date();
   fHasta = new Date();
   dia : string;
   despachoPuedeHorario = true;
   loadingRangosFechaDespacho =false;
   despachoOn = 1

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private printService :PrintExportFile ,

    private modalService: NgbModal,
  ) { }
  ngOnDestroy(): void {
    window.clearInterval(this.intervalRefreshData);
    window.clearInterval(this.intervalRefreshFecha);
  }


  ngOnInit(): void {

    this.getAllData();
    this.setDateToday();
  }

  setDateToday()
  {
 this.intervalRefreshFecha= setInterval(() => {
    this.fecha = new Date();
    }, (60 * 60 * 1000));
  }

 async getAllData(){
   await this.getSucursales();
   await this.getDiferenciaMinima()
   this.validaHorarioAndGetData();
  }
validaHorarioAndGetData(showLoading=false){
 // this.getDataPreventa(false)
 window.clearInterval(this.intervalRefreshData);
 this.validaHorarioDespacho()

}

  getDataPreventa(showLoading:boolean) {

    if(this.Cargando){
      return;
    }
    if(showLoading){
     this.Cargando = true;

    }else{
     this.CargandoRealtime =true;
    }


   let parametros: Parametro[] = [
     { key: "Search", value: '' },
     {  key: "UsuarioId",value:Number(this.authService.tokenDecoded.nameid)},
     { key: "SucursalId", value: 0 },
     { key: "Fecha", value: formatDate(this.fecha,'yyyy-MM-dd', 'en-US')  }, 
    ]

    
   this.httpService.GetAllWithPagination<DespachoListadoPreventaAsignacionVM>(DataApi.Despacho,
      "GetDespachoPreventaListadoForAsignacion", "FechaInicioDespachador", this.paginaNumeroActual,
     this.paginaSize,false, parametros).subscribe(x => {
       if (x.ok) {
        
         this.dataPreventa = x.valores[0];
         console.log(this.dataPreventa)
         this.formatDataPreventa(this.dataPreventa)

      
         this.dataPreventaEmit.emit(this.dataPreventa);
         this.asignarPagination(x);
       } else {
         this.toastService.error(x.errores[0]);
         console.error(x.errores[0]);
       }

       if(showLoading){
        this.Cargando = false;
       }
       this.CargandoRealtime =false;
     }, error => {
       console.error(error);
       this.toastService.error("Error conexion al servidor");
       if(showLoading){
        this.Cargando = false;
       }
       this.CargandoRealtime =false;

     });

 }
  formatDataPreventa(dataPreventa: DespachoListadoPreventaAsignacionVM[]) {
    this.dataPreventaF=[];
    this.dataPreventa.forEach(x=>{

    this.getEstadoAsignacion(x)

     if(x.despachoDispositivo){

      if((x.fechaInicioDespachador!=null) &&
         (x.fechaFinDespachador==null || x.fechainicioValidador==null || x.fechaFinalizacionValidador==null)){
           this.dataPreventaF.push(x);
         }
       }else{
          if((x.fechaInicioDespachador!=null) && (x.fechaFinDespachador==null)){
            this.dataPreventaF.push(x);
          }
       }
    })

  }



 validaHorarioDespacho() {
  this.dataPreventa =  [];
   this.loadingRangosFechaDespacho=true;
    let p= new DespachoRangoHoraRequestModel();
     p.fecha = this.fecha;

  this.httpService.DoPostAny<string>(DataApi.Despacho,
    "GetDespachoRangoValor", p).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
          let h:DepachoHorasVM =  response.valores[0]
          this.despachoPuedeHorario=h.puedeDespachar;
          this.dia=h.diaNombre;

          this.fDesde.setHours(h.horaDesde.hours);
          this.fDesde.setMinutes(h.horaDesde.minutes);
          this.fHasta.setHours(h.horaHasta.hours);
          this.fHasta.setMinutes(h.horaHasta.minutes);

        if (this.despachoPuedeHorario) {
          setTimeout(() => {
            this.loadingRangosFechaDespacho=false;
            this.getDataPreventa(true)

            }, 200);

          this.intervalRefreshData = setInterval(() => {
            this.getDataPreventa(false)
          }, 10000)
        }else{
          setTimeout(() => {

          }, 60000);
        }
      }
      this.loadingRangosFechaDespacho=false;

    }, error => {
      this.loadingRangosFechaDespacho=false;
      console.error(error)
      this.toastService.error("ha ocurrido un error", "Error conexion al servidor");
    });
}


  setFocus() {
    this.searchElement.nativeElement.focus();
  }


  getRamdonDespachoAndAsign(user:Usuario){
    this.btnAsignaDespachoCargando=true;
    this.loadingStatusMessaje='Asignando despacho random...';

    this.modalService.open(this.myModal,{backdrop:true,centered:true,windowClass:'modalLoadingDespacho'})

      //Valida existe despachos sin asignacion y no esten sincronizando
      let data= this.dataPreventa.filter(x=>x.despachador==null && x.sync==false);

       let data_filtered=  this.getDataByPrioridadOrden(data);

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
          this.registraDespachoPreventaInUse(user);
          //Imprimiendo despacho
        //  this.exportDespachoPreventaDetalle(item,1)

        }else{



          this.toastService.warning("No hay despachos disponibles para asignar")
          this.modalService.dismissAll();

          let items= this.dataPreventa.filter(x=>x.despachador==user.nombres+" "+ user.apellidos && x.estadoAsignacion==2)
          if(items.length>0){
            this.despachoPreventaSeleccionado= items[0]
            this.registraDespachoPreventaInUse(user,3)
          }

          return;
        }


    }
  getDataByPrioridadOrden(data_filtered: DespachoListadoPreventaAsignacionVM[]):DespachoListadoPreventaAsignacionVM[] {
    if(data_filtered.filter(x=>x.prioridadOrden==1).length>0){return data_filtered.filter(x=>x.prioridadOrden==1)}
    if(data_filtered.filter(x=>x.prioridadOrden==2).length>0){return data_filtered.filter(x=>x.prioridadOrden==2)}
    if(data_filtered.filter(x=>x.prioridadOrden==3).length>0){return data_filtered.filter(x=>x.prioridadOrden==3)}
    if(data_filtered.filter(x=>x.prioridadOrden==4).length>0){return data_filtered.filter(x=>x.prioridadOrden==4)}
    if(data_filtered.filter(x=>x.prioridadOrden==5).length>0){return data_filtered.filter(x=>x.prioridadOrden==5)}
    if(data_filtered.filter(x=>x.prioridadOrden==6).length>0){return data_filtered.filter(x=>x.prioridadOrden==6)}
    if(data_filtered.filter(x=>x.prioridadOrden==7).length>0){return data_filtered.filter(x=>x.prioridadOrden==7)}
    return  [];
  }



  async registraDespachoPreventaInUse(user:Usuario,estadoId=1){

    this.btnAsignaDespachoCargando=true;

    let p= new DespachoPreventaRequestModel();
    p.ruta = this.despachoPreventaSeleccionado.rutaId;
    p.fechaEntrega = this.despachoPreventaSeleccionado.fechaEntrega;
    p.usuarioId =  Number(user.id)
    p.estadoId = estadoId;

   await this.httpService.DoPostAnyAsync<DespachoInUseVM>(DataApi.Despacho,
      'RegistraDespachoPreventaInUse', p).then(async response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
          this.btnAsignaDespachoCargando = false;
          this.closeModal()

        } else {
          if(response.valores?.length>0){
           let m:DespachoInUseVM = response.valores[0];
           if(m.estado!=2 )  {
             this.despachoPreventaSeleccionado.despachador=user.nombres+" "+ user.apellidos;

             this.loadingStatusMessaje='Enviando despacho para SAP...'
            if(!this.despachoPreventaSeleccionado.despachoDispositivo && m.estado!=4){
              await this.finalizaDespacho(2);
            }

             this.getDataPreventa(true);
             this.toastService.success(m.mensaje)
             this.loadingStatusMessaje='Imprimiendo despacho...'
             this.closeModal()

            if(estadoId!=3 && m.estado!=4){
              setTimeout(() => {
                this.exportDespachoPreventaDetalle(this.despachoPreventaSeleccionado)
                }, 500);
            }



           }else{
            this.toastService.error(m.mensaje)
            this.closeModal()

           }

          }
        }
      }, error => {
       this.btnAsignaDespachoCargando = false;
        this.toastService.error("Error conexion al servidor");
      });


  }

  async finalizaDespacho(estado:number){

    //ESTADO 2 INDICA QUE EL DESPACHO SE PICKEARA DE MANERA MANUAL
    //ESTADO 3 INDICA QUE EL DESPACHO SE PICKEO MEDIANTE LA PLATAFORMA WEB

     this.despachoPreventaSeleccionado.noEditable=1;
     let p= new DespachoPreventaRequestModel();
     p.ruta = this.despachoPreventaSeleccionado.rutaId;
     p.fechaEntrega = this.despachoPreventaSeleccionado.fechaEntrega;
     p.estadoId=estado;

    await this.httpService.DoPostAnyAsync<DespachoPreventaDetalleViewModel>(DataApi.Despacho,
       'finalizaDespachoPreventa', p).then(response => {
         if (!response.ok) {
           this.toastService.error(response.errores[0], "Error");
           this.despachoPreventaSeleccionado.noEditable=0;
         } else {
           if(response.valores?.length>0){

                 if(response.valores[0]>0){
                   this.despachoPreventaSeleccionado.finalizado=1;
                   this.despachoPreventaSeleccionado.noEditable=1;
                   this.despachoPreventaSeleccionado.estadoDespacho=4;
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
       RutaId:this.despachoPreventaSeleccionado.rutaId,
       FechaEntrega:this.despachoPreventaSeleccionado.fechaEntrega,
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
   this.getDataPreventa(true)
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


validaDiferenciaMinimaDespacho(item: DespachoListadoPreventaAsignacionVM){
  let diff= item.totalMontoPedidoERP-item.totalMontoPedido;
  if(item.totalMontoPedido==0){return false}
  if(item.totalMontoPedidoERP< Math.trunc( item.totalMontoPedido)){return false}
  if(diff<=this.Diferencia_Minima_Despacho){
    return true;
  }else{return false}
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





getNameOfSucursal(sucursalId:number):string{
  return this.sucursales.find(x=>x.codigo==sucursalId).nombre;
}

getLapsoTime(dateini: string,datefin:string,s){
 let  dateTwo = new Date().getTime();

let dateOne = new Date().getTime() ;

if (datefin !=undefined && datefin !=null && datefin!='0001-01-01T00:00:00') {
   dateTwo = new Date(datefin).getTime();
}
if (dateini !=undefined && dateini !=null && dateini!='0001-01-01T00:00:00') {
  dateOne = new Date(dateini).getTime();
}
 var hourDiff = dateTwo - dateOne; //in ms
 var minDiff = hourDiff / 60 / 1000; //in minutes
 var hDiff = hourDiff / 3600 / 1000; //in hours

 let horas  =  Math.floor(hDiff) ;
 let minutos = (minDiff - 60 * horas);

 let str=  horas+ " hr " + Math.trunc(minutos)+" min";

 if (horas<=0) {
  str = Math.trunc(minutos)+" min";
 }

if ( dateini=='0001-01-01T00:00:00') {
   str=  0 + " hr " +0+" min";
}
 return str;
}

getEstadoAsignacion(item:DespachoListadoPreventaAsignacionVM){


  if(item.fechaInicioDespachador ==null){
     item.estadoAsignacion=1
     item.estadoAsignacionMsg='Pendiente'
  }else if(item.fechaInicioDespachador !=null && item.fechaFinDespachador==null){
    item.estadoAsignacion=2
    item.estadoAsignacionMsg='Pickiando'
  }else  if(item.fechainicioValidador ==null ){
    item.estadoAsignacion=1
    item.estadoAsignacionMsg='Pendiente validar'
  }else if(item.fechainicioValidador !=null  && item.fechaFinalizacionValidador==null){
    item.estadoAsignacion=2
    item.estadoAsignacionMsg='Validando'
    return;
  }else{
    item.estadoAsignacion=3
    item.estadoAsignacionMsg='Finalizado'
  }
  if(item.fechaInicioDespachador !=null && item.fechaFinDespachador!=null && item.despachoDispositivo==false){
    item.estadoAsignacion=3
    item.estadoAsignacionMsg='Finalizado'
  }

}


closeModal(){
  setTimeout(() => {
   this.modalService.dismissAll();
  }, 500);
}

}
