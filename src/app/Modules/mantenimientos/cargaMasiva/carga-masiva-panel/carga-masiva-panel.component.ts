import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-carga-masiva-panel',
  templateUrl: './carga-masiva-panel.component.html',
  styleUrls: ['./carga-masiva-panel.component.scss']
})
export class CargaMasivaPanelComponent implements OnInit {

  loadingSincronizacionListaPrecios: boolean = false;
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

  constructor(
    private toastService: ToastrService,
    private modalService: NgbModal,
    private httpService: BackendService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }


  onFileChange(event, modal, accionID: number) {
    console.log("file change")
    console.log(accionID)
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
      this.getPropiedadesExcel()
    };
  }




  transformData() {
    console.log("TransformDataFunc")
    console.log(this.accionId)

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
    }else if(this.accionId==3){
      if (this.validarCargaClienteRutaTipo()) {

        this.dataTransformed = this.dataExcel.map((x) => {
          let arrayValues = Object.values(x);
          return {
            "CodigoReferencia": arrayValues[0].toString(),
            "Memo ": arrayValues[1],
            "DiaVisita": Number(arrayValues[2]),
            "RutaCodigoReferencia": Number(arrayValues[3]),
            "Prioridad": arrayValues[4] ==null?"" :arrayValues[4],
            "TerritorioId": Number(arrayValues[5])
          };
        });
        console.table(this.dataTransformed)

        this.dataApi = DataApi.Cliente;
        this.metodoEndPoint = "UploadExcelFileReestructuraCliente"
       this.subirDatosExcel()
      }
    }

  }

  subirDatosExcel() {

    if (this.dataExcel.length <= 0) {
      this.toastService.warning("No hay records para subir.")
      return
    }

    this.guardandoDataExcel = true;

    this.httpService.DoPostAny<any>(this.dataApi,
      this.metodoEndPoint, this.dataTransformed).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()
        }

        this.guardandoDataExcel = false;
      }, error => {
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



}
