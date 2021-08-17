import { FrecuenciaVisita } from './../../clientes/models/FrecuenciaVisita';
import { Component, OnInit } from '@angular/core';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { TomaInventarioRuta } from '../models/TomaInventarioRuta';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DualListComponent } from 'angular-dual-listbox';

@Component({
  selector: 'app-tomainventario-listado',
  templateUrl: './tomainventarioruta-listado.component.html',
  styleUrls: ['./tomainventarioruta-listado.component.scss']
})
export class TomainventarioRutaListadoComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  CargandoBar: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 5;
  paginaTotalRecords: number = 0;
  dataListado: TomaInventarioRuta[] = [] //tu modelo
  btnGuardarCargando: boolean = false;
  loadingTipoRutas: boolean;
  loadingFrecuenciaVisita: boolean;

  Dias: ComboBox[] = [
    { codigo: 1, nombre: 'Lunes', grupo: '', grupoID: '' },
    { codigo: 2, nombre: 'Martes', grupo: '', grupoID: '' },
    { codigo: 3, nombre: 'Miercoles', grupo: '', grupoID: '' },
    { codigo: 4, nombre: 'Jueves', grupo: '', grupoID: '' },
    { codigo: 5, nombre: 'Viernes', grupo: '', grupoID: '' },
    { codigo: 6, nombre: 'Sabado', grupo: '', grupoID: '' },
    { codigo: 7, nombre: 'Domingo', grupo: '', grupoID: '' },
  ];
  FrecuenciaVisita: FrecuenciaVisita[];
  TipoRutas: ComboBox[];
  TipoRutaId: number = 1;

  // Dual List options
  tab = 1;
  keepSorted = true;
  key: string;
  display: string;
  filter = true;
  source: Array<TomaInventarioRuta> = [];
  confirmed: Array<TomaInventarioRuta> = [];
  userAdd = '';
  disabled = false;
  sourceLeft = true;
  // format: any = DualListComponent.DEFAULT_FORMAT;
  format = {
    add: 'Agregar', remove: 'Remover', all: 'Seleccionar Todos', none: 'Deseleccionar',
    direction: DualListComponent.LTR, draggable: true, locale: 'da'
  };
  loadingDualLits: boolean;
  loadingClientesTomaInventario: boolean;
  IsRecogida: boolean = false;
  loadingRutasPorTipo: boolean;
  rutasPorTipo: ComboBox[];


  selectData: TomaInventarioRuta = new TomaInventarioRuta(); //tu modelo
  modelSelected: TomaInventarioRuta;


  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }


  ngOnInit(): void {
    this.getData();
    this.getTipoRutas();
    this.getRutasByTipoRutaComboBox();
    this.configDualList();
  }

  configDualList() {
    this.key = 'clienteId';
    this.display = 'cliente';
    this.keepSorted = true;
  }

  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "Search", value: this.Search },
      { key: "tipoRutaId", value: this.TipoRutaId }
    ]

    this.httpService.GetAllWithPagination<TomaInventarioRuta>(DataApi.TomaInventarioRuta, "GetListadoUsuarioRutas", "id", this.paginaNumeroActual, this.paginaSize, true, parametros).subscribe(x => {

      if (x.ok) {
        //x.records.forEach(x => x.editarUsuarioConfirmado = true);
        this.dataListado = x.records;
        // console.log(x);
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


  getClientebyRutaTipoId() {
    this.loadingDualLits = true;

    this.httpService.DoPostAny<TomaInventarioRuta>(DataApi.TomaInventarioRuta, "GetClientesByTipoRutaId", this.TipoRutaId).subscribe(x => {

      if (x.ok) {
        this.source = x.records;
        // console.log(this.source);
      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
      this.loadingDualLits = false;
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
      this.loadingDualLits = false;
    });

  }

  openModal(content, model: TomaInventarioRuta) {

    // this.selectData.zonaId =

    this.modelSelected = model;

    if (this.TipoRutaId == 3) {
      this.IsRecogida = true;
      this.getClientesTomaInventario(model.rutaId, this.selectData.zonaId);
      this.getRutasByTipoRutaComboBox();

    } else {
      this.IsRecogida = true;
      this.getClientebyRutaTipoId();
    }
    this.modalService.open(content, { size: 'xl', backdrop: "static", });
  }

  //zona y ruta
  getClientesTomaInventario(ruta: number, zona: number) {

    let param = new TomaInventarioRuta();
    param.rutaId = ruta
    param.zonaId = zona
    param.tipoRutaId = this.TipoRutaId;
    param.diaId = this.selectData.diaId;

    this.loadingDualLits = true;
    // console.log("source")
    // console.table({ "source": '', "ruta": ruta, "zona": zona })

    this.httpService.DoPostAny<TomaInventarioRuta>(DataApi.TomaInventarioRuta, "GetClientesTomaInventarioPendiente", param).subscribe(x => {

      if (x.ok) {
        // this.source = [];
        // let data = x.records;
        // for (let index = 0; index < data.length; index++) {
        //   data[index].id = index + 1;
        //   this.source.push(data[index]);
        // }
        // console.log("source", x.records);

        this.source = x.records;
        console.log("source")
        console.table(this.source)
        this.getClientesTomaInventarioSelecionados(ruta);


      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
      this.loadingDualLits = false;
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
      this.loadingDualLits = false;
    });

  }

  //solo ruta
  getClientesTomaInventarioSelecionados(rutaid: number) {
    let param = new TomaInventarioRuta();
    param.rutaId = rutaid
    this.loadingDualLits = true;

    console.log("confirmed")
    console.table({ "confirmed": '', "rutaid": rutaid })

    this.httpService.DoPostAny<TomaInventarioRuta>(DataApi.TomaInventarioRuta, "GetClientesTomaInventarioPendiente", param).subscribe(x => {

      if (x.ok) {
        // this.confirmed = [];
        // let data = x.records;
        // for (let index = 0; index < data.length; index++) {
        //   data[index].id = index + 1;
        //   this.confirmed.push(data[index]);
        // }

        this.confirmed = x.records
        console.log("barbaro")
        console.table(this.confirmed)
        // this.source = []
        this.confirmed.forEach(x => this.source.push(x))

        // console.log("confirmed")
        // console.table(this.confirmed)

        if (this.confirmed && this.confirmed.length > 0) {
          this.selectData.diaId = x.records[0].diaId;
        }

      } else {
        this.toastService.error(x.errores[0]);
        console.error(x.errores[0]);
      }
      this.loadingDualLits = false;
    }, error => {
      console.error(error);
      this.toastService.error("Error conexion al servidor");
      this.loadingDualLits = false;
    });

  }



  SaveChanges() {
    this.btnGuardarCargando = true;
    let parametro = {
      "RutaID": this.modelSelected.rutaId,
      "ZonaID": this.selectData.zonaId,
      "DiaID": this.selectData.diaId,
      "TipoRutaId": this.TipoRutaId,
      "ClientesJSON": JSON.stringify(
        this.confirmed.map((x) => {
          return { "id": x.clienteId, "cliente": x.cliente }
        })
      )
    }
    this.httpService.DoPostAny<any>(DataApi.TomaInventarioRuta,
      "GuardarTomaInventarioRuta", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.toastService.success("OK")
          this.modalService.dismissAll()
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("No se pudo guardar", "Error conexion al servidor");

      });


  }

  getTipoRutas() {
    this.loadingTipoRutas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutaTipoComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.TipoRutas = response.records;
        }
        this.loadingTipoRutas = false;
      }, error => {
        this.loadingTipoRutas = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoRutas()
        }, 1000);

      });
  }

  getProvincia() {
    this.loadingTipoRutas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetProvincias", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.TipoRutas = response.records;
        }
        this.loadingTipoRutas = false;
      }, error => {
        this.loadingTipoRutas = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoRutas()
        }, 1000);

      });
  }

  getSector() {
    this.loadingTipoRutas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutaTipoComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.TipoRutas = response.records;
        }
        this.loadingTipoRutas = false;
      }, error => {
        this.loadingTipoRutas = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoRutas()
        }, 1000);

      });
  }

  getZonas() {
    this.loadingTipoRutas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutaTipoComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.TipoRutas = response.records;
        }
        this.loadingTipoRutas = false;
      }, error => {
        this.loadingTipoRutas = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          this.getTipoRutas()
        }, 1000);

      });
  }

  getFrecuenciaVisita(value: TomaInventarioRuta) {
    this.loadingFrecuenciaVisita = true;
    this.httpService.DoPostAny<FrecuenciaVisita>(DataApi.TomaInventarioRuta,
      "getClienteFrecuenciaVisitaEnrrollByID", value.rutaId).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.FrecuenciaVisita = response.records;
        }
        this.loadingFrecuenciaVisita = false;
      }, error => {
        this.loadingFrecuenciaVisita = false;
        this.toastService.error("No se pudo obtener los supervisores", "Error conexion al servidor");

        setTimeout(() => {
          //this.getUsuariobyRolID()
        }, 1000);

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




  getRutasByTipoRutaComboBox() {
    this.loadingRutasPorTipo = true;
    let param: Parametro[] = [{ key: "tiporutaid", value: "1" }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasByTipoRutaComboBox", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.rutasPorTipo = response.records;
          this.selectData.rutaId = this.rutasPorTipo[0].codigo

        }
        this.loadingRutasPorTipo = false;
      }, error => {
        this.loadingRutasPorTipo = false;
        this.toastService.error("No se pudo obtener las rutas por tipo", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutasByTipoRutaComboBox()
        }, 1000);

      });
  }

  //dia,clienteid,



}
