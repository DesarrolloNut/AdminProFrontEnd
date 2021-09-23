import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { RecallListadoViewModel } from '../models/RecallListadoViewModel';
import * as XLSX from 'xlsx';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ComboBox } from 'src/app/shared/model/ComboBox';
@Component({
  selector: 'app-recall-listado',
  templateUrl: './recall-listado.component.html',
  styleUrls: ['./recall-listado.component.scss']
})
export class RecallListadoComponent implements OnInit {

  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  data: RecallListadoViewModel[] = [] //tu modelo

  dataExcel: any[] = null
  loadingRecallSintomas: boolean;
  recallSintomas: ComboBox[];

  recallID: number;
  guardandoDataExcel: boolean;
 

  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    public permissionsService: NgxPermissionsService,
    private modalService: NgbModal,

  ) { }


  ngOnInit(): void {
    this.getData()
  }
  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

    this.httpService.GetAllWithPagination<RecallListadoViewModel>(DataApi.Recall, "GetRecallListado", "Id", this.paginaNumeroActual,
      this.paginaSize, true, parametros).subscribe(x => {

        if (x.ok) {
          this.data = x.records;
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

  getRecallSintomas() {
    this.loadingRecallSintomas = true;

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRecallSintomasComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.recallSintomas = response.records;
          console.log(this.recallSintomas)
        }
        this.loadingRecallSintomas = false;
      }, error => {
        this.loadingRecallSintomas = false;
        this.toastService.error("No se pudo obtener los recalls", "Error conexion al servidor");

        setTimeout(() => {
          this.getRecallSintomas()
        }, 1000);

      });
  }


  openModal(content) {
    this.getRecallSintomas()
    this.recallID = null
    this.dataExcel = null
    this.modalService.open(content, { backdrop: 'static', keyboard: false, size: "lg" });
  }



  onFileChange(event: any) {
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
      console.log(data); // Data will be logged in array format containing objects


      this.dataExcel = data.map(x => {
        let arrayValues = Object.values(x);
        return { "chasis": arrayValues[0], "codigoReferencia": arrayValues[1] + '' };
      });

      console.table(this.dataExcel)

    };
  }

  subirDatosExcel() {

    if (!this.recallID) {
      this.toastService.warning("Selecciona el recall.")
      return
    }

    if (this.dataExcel.length <= 0) {
      this.toastService.warning("No hay records para subir.")
      return
    }

    if (this.dataExcel.some(x => !x.codigoReferencia)) {
      this.toastService.warning("Hay records sin código de referencia")
      return
    }

    if (this.dataExcel.some(x => !x.chasis)) {
      this.toastService.warning("Hay records sin código de referencia")
      return
    }

    this.dataExcel.forEach(x => x.sintomaID = this.recallID)

    this.guardandoDataExcel = true;

    this.httpService.DoPostAny<any>(DataApi.Recall,
      "UploadExcelFile", this.dataExcel).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.getData()
          this.toastService.success("Realizado", "OK");
          this.modalService.dismissAll()
        }

        this.guardandoDataExcel = false;
      }, error => {
        this.guardandoDataExcel = false;
        this.toastService.error("Error conexion al servidor");
      });

  }


  exportarReporteExcel() {
    this.Cargando = true;

    this.httpService.DoPostAny<RecallListadoComponent>(DataApi.Recall,
      "GetAllRecalls", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.records);

          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws2, 'Recalls');

          /* save to file */
          XLSX.writeFile(wb, "Recalls.xlsx");
        }


        this.Cargando = false;
      }, error => {
        this.Cargando = false;
        this.toastService.error("No se pudo obtener los recalls", "Error conexion al servidor");
      });
  }






}
