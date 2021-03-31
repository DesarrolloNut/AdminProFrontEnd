import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { TreeviewItem } from 'ngx-treeview';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Permisos } from '../../permisos/models/Permisos';
import { Roles } from '../models/Roles';

@Component({
  selector: 'app-roles-listado',
  templateUrl: './roles-listado.component.html',
  styleUrls: ['./roles-listado.component.scss']
})
export class RolesListadoComponent implements OnInit {
// COPIAR AL CREAR UN LISTADO NUEVO
Search: string = "";
paginaNumeroActual = 1;
Cargando: boolean = false;
CargandoBar: boolean = false;
totalPaginas: number = 0;
paginaSize: number = 5;
paginaTotalRecords: number = 0;
data: Roles[] = [] //tu modelo
RolID: number = 0;
loadingRolesSeleccionados: boolean;
guardandoArticulos: boolean;
confirmed: Array<any>;
loadingPermisos: boolean;
source: Array<Permisos>;

config: any = {
  hasAllCheckBox: true,
  hasFilter: true,
  hasCollapseExpand: true,
  decoupleChildFromParent: false,
  maxHeight: 500
};
items: TreeviewItem[] = new Array<TreeviewItem>();

itCategory = new TreeviewItem({
  text: 'IT', value: 9, children: [
    {
      text: 'Programming', value: 91, children: [{
        text: 'Frontend', value: 911, children: [
          { text: 'Angular 1', value: 9111 },
          { text: 'Angular 2', value: 9112 },
          { text: 'ReactJS', value: 9113, disabled: true }
        ]
      }, {
        text: 'Backend', value: 912, children: [
          { text: 'C#', value: 9121 },
          { text: 'Java', value: 9122 },
          { text: 'Python', value: 9123, checked: false, disabled: true }
        ]
      }]
    },
    {
      text: 'Networking', value: 92, children: [
        { text: 'Internet', value: 921 },
        { text: 'Security', value: 922 }
      ]
    }
  ]
});

constructor(private toastService: ToastrService,
  private httpService: BackendService,
  private modalService: NgbModal,
  public permissionsService: NgxPermissionsService,
) { }


ngOnInit(): void {
  this.getData();
  this.items.push(this.itCategory);
  this.getPermisos();
  //let data = this.CreateObjectTreeView();

}
getData() {
  this.Cargando = true;

  let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

  this.httpService.GetAllWithPagination<Roles>(DataApi.Rol, "GetRolListado", "ID", this.paginaNumeroActual,
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


openModal(content, listaId: number) {
  this.RolID = listaId;
  //this.getRolesSeleccionadosLista(listaId);
  this.modalService.open(content, { size: 'lg', backdrop: "static", });
}

CreateObjectTreeView():TreeviewItem {

  console.log(this.source);
  let permisosPadres = this.source.map(x => {
    if(x.PermisoPadreID == 0 ){
      return x;
    }
  });

  console.log(permisosPadres);




  return null;
}

getPermisosSeleccionadosLista(listaId: number) {

}

getPermisos() {
  this.loadingPermisos = true;
  this.httpService.DoPost<Permisos>(DataApi.Permisos,
    "GetAllPermisos", null).subscribe(response => {

      if (!response.ok) {
        this.toastService.error(response.errores[0]);
      } else {
        // this.Permisos = response.records;
        this.source = response.records;

      }
      this.loadingPermisos = false;
    }, error => {
      this.loadingPermisos = false;
      this.toastService.error("No se pudo obtener todos los Permisos", "Error conexion al servidor");

      setTimeout(() => {
        this.getPermisos()
      }, 1000);

    });
}

onSelectedChange(value){

}

}
