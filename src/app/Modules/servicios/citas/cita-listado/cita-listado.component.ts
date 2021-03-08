import { Component, OnInit } from '@angular/core';
import { BackendService } from '../../../../core/http/service/backend.service';
 
import { DataApi } from '../../../../shared/enums/DataApi.enum';
import { ResponseContenido } from '../../../../core/http/model/ResponseContenido';
import { Parametro } from '../../../../core/http/model/Parametro';
import { ToastrService } from 'ngx-toastr';
import { CitaListadoViewModel } from '../model/CitaViewModel';
import { NgxPermissionsService } from 'ngx-permissions';
@Component({
    selector: 'app-cita-listado',
    templateUrl: './cita-listado.component.html',
    styleUrls: ['./cita-listado.component.css']
})
export class CitaListadoComponent implements OnInit {

    // COPIAR AL CREAR UN LISTADO NUEVO
    Search: string = "";
    paginaNumeroActual = 1;
    Cargando: boolean = false;
    CargandoBar: boolean = false;
    totalPaginas: number = 0;
    paginaSize: number = 5;
    paginaTotalRecords: number = 0;
    arrayLoading = new Array(this.paginaSize);
    citas: CitaListadoViewModel[] = [] //tu modelo


    constructor( 
        private httpService: BackendService,
        private toastService: ToastrService,
        public permissionsService: NgxPermissionsService,
    ) { }

    ngOnInit() {

        this.getCitas();
        // var permissions = this.permissionsService.getPermissions();
    }

    getCitas() {

        this.Cargando = true;

        let parametros: Parametro[] = [{ key: "Search", value: this.Search }]

        this.httpService.GetAllWithPagination<CitaListadoViewModel>(DataApi.Cita, "GetAllCitas", "CitaID", this.paginaNumeroActual,
            this.paginaSize, false, parametros).subscribe(x => {

                if (x.ok) {
                    this.citas = x.records;
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



}
