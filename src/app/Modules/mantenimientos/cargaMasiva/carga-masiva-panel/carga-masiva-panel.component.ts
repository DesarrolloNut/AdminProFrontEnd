import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import * as XLSX from 'xlsx';
import { Cliente } from '../../clientes/models/Cliente';
import { CargaMasiva, DetalleReestructuracionClient } from '../models/CargaMasiva';

@Component({
  selector: 'app-carga-masiva-panel',
  templateUrl: './carga-masiva-panel.component.html',
  styleUrls: ['./carga-masiva-panel.component.scss']
})
export class CargaMasivaPanelComponent implements OnInit {

  loadingSincronizacionListaPrecios: boolean = false;
  showCargasReestructuracion: boolean = false;

  loadingSincronizacionArticulos: boolean;
  loadingSincronizacionPrecioArticulos: boolean;
  dataExcel: any[];
  dataTransformed: any[];
  propiedades: string[] = []
  accionId: number = 0;
  guardandoDataExcel: boolean;
  metodoEndPoint: string;
  dataApi: DataApi;
  filter: string;
  fecha:Date;

  @ViewChild('myInputFileReestructuracliente')
  myInputFileReestructuracliente: ElementRef;

  ///ESTO ES PARA REESTRUCTURACION DE CLIENTE | PENDIENTE MOVER A OTRO COMPONENTE SEPARADO
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 1;
  paginaTotalRecords: number = 0;
  arrayLoading = new Array(this.paginaSize);
  cargasMasivasReestructuracionCliente: CargaMasiva[] = [] //tu modelo
  detalleCargaMasivaReestructuracionCliente: DetalleReestructuracionClient[] = [] //tu modelo
  cargasMasivaRCliente: CargaMasiva; //tu modelo
  loadingDetalleRcliente: boolean;


  constructor(
    private toastService: ToastrService,
    config: NgbModalConfig,
    private modalService: NgbModal,
    private httpService: BackendService,
    private formBuilder: FormBuilder) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
  }

  onFileChange(event, modal, accionID: number) {
    this.accionId = accionID;
    this.openModal(modal)
    this.processFile(event)
  }

  openModal(content) {
    this.modalService.open(content, { size: "xl", backdrop: 'static', keyboard: false });
  }
  processFile(event: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      throw new Error('Cannot use multiple files');
    }
    const reader: FileReader = new FileReader();
    reader.readAsBinaryString(target.files[0]);
    reader.onload = (e: any) => {
      /* create workbook */
      const binarystr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(binarystr, { type: 'binary' });

      /* selected the first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      const data = XLSX.utils.sheet_to_json(ws); // to get 2d array pass 2nd parameter as object {header: 1}
      this.dataExcel = data
      console.log(this.dataExcel)
      this.getPropiedadesExcel()
    };
  }

  transformData() {
    if (this.accionId == 1) { //precios articulos
      if (this.validarCargaArticuloPrecios()) {

        this.dataTransformed = this.dataExcel.map((x) => {
          let arrayValues = Object.values(x);
          var parts = String(arrayValues[3]).split('-')
          return {
            "ArticuloCodigoReferencia": arrayValues[0] + '',
            "ListaPrecioCodigoReferencia": arrayValues[1] + '',
            "Precio": arrayValues[2],
            "FechaAplicacion": new Date(+parts[2], +parts[1] - 1, +parts[0])
          };
        });
        this.dataApi = DataApi.Articulo;
        this.metodoEndPoint = "UploadExcelFilePreciosArticulos"
        this.subirDatosExcel()
      }
    } else if (this.accionId == 2) { //clientes rutas tipos
      if (this.validarCargaClienteRutaTipo()) {

        this.dataTransformed = this.dataExcel.map((x) => {
          let arrayValues = Object.values(x);
          return {
            "ClienteID": Number(arrayValues[0]),
            "RutaID": Number(arrayValues[1]),
            "RutaTipoID": Number(arrayValues[2])
          };
        });

        console.table(this.dataTransformed)
        this.dataApi = DataApi.Cliente;
        this.metodoEndPoint = "UploadExcelFileClienteActualizaRuta"
        this.subirDatosExcel()
      }
    } else if (this.accionId == 3) {
      if (this.validarCargaClienteRutaTipo()) {

       
        this.dataTransformed = this.dataExcel.map((x) => {
          let arrayValues = Object.values(x);
          return {
            "CodigoCliente": arrayValues[0].toString(),
            "Ruta": arrayValues[1],
            "DiaVisita": Number(arrayValues[2]),
            "Prioridad": arrayValues[3] == null ? "" : arrayValues[4],
            "Semana": Number(arrayValues[4]),
            "Fecha":this.fecha
          };
        });
        this.dataApi = DataApi.Cliente;
        this.metodoEndPoint = "UploadExcelFileReestructuraCliente"
        this.subirDatosExcel()
      }
    }

  }

  subirDatosExcel() {
    
    if (this.dataExcel.length <= 0) {
      this.toastService.warning("No hay records para subir.")
      return;
    }
    if(this.fecha == undefined)
    {
      this.toastService.error("Selecciona un fecha sincronización.")
      return;
    }
    
    this.guardandoDataExcel = true;
    console.log(this.metodoEndPoint)
    this.httpService.DoPostAny<any>(this.dataApi,
      this.metodoEndPoint, this.dataTransformed).subscribe(response => {
        this.resetInputsFile();

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()
          this.getCargasMasivasReestructuracionclientes();
        }

        this.guardandoDataExcel = false;
      }, error => {
        this.resetInputsFile();
        console.log(error)
        this.guardandoDataExcel = false;
        this.toastService.error("Error conexion al servidor");
      });

  }

  validarCargaArticuloPrecios(): boolean {

    // if (this.dataExcel.some(x => !x.codigoReferencia)) {
    //   this.toastService.warning("Hay records sin código de referencia")
    //   return false;
    // }

    return true;
  }
  validarCargaClienteRutaTipo(): boolean {

    // if (this.dataExcel.some(x => !x.codigoReferencia)) {
    //   this.toastService.warning("Hay records sin código de referencia")
    //   return false;
    // }

    return true;
  }
  validarCargaReestructuracionCliente(): boolean {

    //  if (this.dataExcel.some(x => !x.Cardcode)) {
    //      this.toastService.warning("Hay records sin código de referencia")
    //      return false;
    //    }

    return true;
  }
  private getPropiedadesExcel(): void {
    if (this.dataExcel != null && this.dataExcel.length > 0) {
      let objeto = this.dataExcel[0];
      this.propiedades = Object.keys(objeto);
    }
  }

  ///PENDIENTE MOVER A OTRO COMPONENTE
  getCargasReestructuracion() {
    this.showCargasReestructuracion = true;
    this.getCargasMasivasReestructuracionclientes();
  }
  getCargasMasivasReestructuracionclientes() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "tipoCarga", value: 'REESTRUCTURACIONCLIENTE' }]

    this.httpService.GetAllWithPagination<CargaMasiva>(DataApi.Cliente, "GetCargasMasivasReestructuracionclientes", "Id", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.cargasMasivasReestructuracionCliente = x.valores[0];
          console.log(x);
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
          console.error(x.errores[0]);
        }
        this.arrayLoading = new Array(0);
        this.Cargando = false;
      }, error => {
        console.error(error);
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
        this.arrayLoading = new Array(0);
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


  getDetalleCargasMasivasReestructuracionclientes(id: number) {
    this.loadingDetalleRcliente = true;
    this.httpService.DoPostAny<Cliente>(DataApi.Cliente,
      "GetDetalleCargasMasivasReestructuracionclientes", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response.valores?.length > 0) {
            this.detalleCargaMasivaReestructuracionCliente = response.valores[0];
            console.log(response.valores);

          } else {
            this.toastService.warning("Ha ocurrido un error");
          }
        }
        this.loadingDetalleRcliente = false;
      }, error => {
        this.loadingDetalleRcliente = false;

        this.toastService.error("Error conexion al servidor");
      });
  }

  openModalDetalle(cm: CargaMasiva, content) {
    this.cargasMasivaRCliente = cm;
    this.modalService.open(content, { windowClass: "myCustomModalClass", backdrop: "static", });

    this.getDetalleCargasMasivasReestructuracionclientes(cm.id);
  }

  formatDescripcionByEstado(estado: number) {
    switch (estado) {
      case 0:
        return 'Sincronizado'
      case 1:
        return 'Pendiente'
      default:
        'Error';
    }

  }

  modalClose() {
    this.modalService.dismissAll();
    this.resetInputsFile();
  }

  resetInputsFile() {
    this.myInputFileReestructuracliente.nativeElement.value = "";
  } v
}
