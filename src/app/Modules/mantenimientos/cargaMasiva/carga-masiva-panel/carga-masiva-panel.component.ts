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

  constructor(
    private toastService: ToastrService,
    private modalService: NgbModal,
    private httpService: BackendService,
    private formBuilder: FormBuilder) { }

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
      console.table(this.dataExcel)

      this.transformData()
    };
  }


  private getPropiedadesExcel(): void {
    if (this.dataExcel != null && this.dataExcel.length > 0) {
      let objeto = this.dataExcel[0];
      this.propiedades = Object.keys(objeto);
    }
  }

  transformData() {

    this.getPropiedadesExcel()

    if (this.accionId == 1) { //precios articulos
      this.dataTransformed = this.dataExcel;
      return;
    }


  }


}
