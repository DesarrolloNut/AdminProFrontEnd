import { Component, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Comite, Miembro } from './Comite';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-comite',
  templateUrl: './comite.component.html',
  styleUrls: ['./comite.component.scss']
})
export class ComiteComponent implements OnInit {
  page = 1;
  pageSize = 4;
  collectionSize = 0;


  pageMiembro = 1;
  pageSizeMiembro = 2;
  collectionSizeMiembro = 0;

  selectedComite: Comite = new Comite();

  comites$: BehaviorSubject<Comite[]> = new BehaviorSubject<Comite[]>(null);
  miembros: Miembro[] = [];

  constructor(public httpService: BackendService, private modalService: NgbModal) { }

  ngOnInit(): void {

    this.getComites();
  }

  open1(content1,comite:Comite) {

    this.selectedComite = comite;
    this.getMiembros();
    this.modalService.open(content1, { size: 'lg', centered: true });
    

  }

   


  getMiembros(){
    console.log("mensaje")
    this.httpService.DoPostAny<Miembro>(DataApi.Mantenimientos, "GetMiembrosByComite", {}).subscribe(res => {
      if (res.ok) {
        this.miembros = res.records;
        this.collectionSizeMiembro =res.records.length;
        
      } else {

        console.log(res.errores[0]);
      }
    },
      err => {
        console.log(err);
      });
  }

  getComites() {

    this.httpService.GetAllWithPagination<Comite>(DataApi.Mantenimientos, "GetComites", "FechaCreacion", this.page, this.pageSize, true, null).subscribe(res => {

      if (res.ok) {
        this.comites$.next(res.records);
        this.collectionSize = res.pagina.totalRecords;
      } else {

        console.log(res.errores[0]);
      }


    },
      err => {
        console.log(err);
      });

  }

}
