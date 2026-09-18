import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgxPermissionsService } from 'ngx-permissions';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { ResponseContenido } from 'src/app/core/http/model/ResponseContenido';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloListaPrecioViewModel } from '../../mantenimientos/articulos/models/ArticuloListaPrecioViewModel';
import * as XLSX from 'xlsx';

import { Label } from 'ng2-charts';
import { ChartDataSets } from 'chart.js';

@Component({
  selector: 'app-lista-precios-autorizacion',
  templateUrl: './lista-precios-autorizacion.component.html',
  styleUrls: ['./lista-precios-autorizacion.component.scss']
})
export class ListaPreciosAutorizacionComponent implements OnInit {
  // COPIAR AL CREAR UN LISTADO NUEVO
  Search: string = "";
  paginaNumeroActual = 1;
  Cargando: boolean = false;
  totalPaginas: number = 0;
  paginaSize: number = 100;
  paginaTotalRecords: number = 0;
  data: ArticuloListaPrecioViewModel[] = [] //tu modelo

  estadoAutorizacionComboModel: number = 0;
  estadoAutorizacionUsuario: number;
  estadosAutorizacion: ComboBox[];
  estadoIDAutorizacionDefault: number;
  estadoAutorizacionSiguiente: ComboBox;
  estadoAutorizacionAnterior: ComboBox;
  btnClicked: number;
  isAutorizando: boolean;
  cargandoAutorizacion: boolean;

  listaPrecioSeleccionada: number = 0

  //comentarios
  itemSeleccionado: any;
  comentarios: any[];
  comentario: string;
  cargandoModal: boolean = false;
  loadingListaPrecio: boolean;
  ListaPrecio: ComboBox[];
  loadingReporteExcel: boolean;
  fechaFiltro: Date = new Date();

  //chart line

  public lineChartData: ChartDataSets[] = [
    // { data: [61, 59, 80, 65, 45, 55, 40, 56, 76, 65, 77, 60], label: 'Apple' },
    // { data: [57, 50, 75, 87, 43, 46, 37, 48, 67, 56, 70, 50], label: 'Mi' },
  ];

  public lineChartLabels: Label[] = []
  //  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  public lineChartOptions = {
    responsive: true,
  };

  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];
  dataGrafico: any[];



  constructor(private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private modalService: NgbModal,
    public permissionsService: NgxPermissionsService,
  ) { }
 

  ngOnInit(): void {
    this.getEstadoAutorizacionUsuario()
    this.getListasPrecio();
  }


  getData() {
    this.Cargando = true;

    let parametros: Parametro[] = [
      { key: "EstadoAutorizacionID", value: this.estadoAutorizacionComboModel },
      { key: "Search", value: this.Search },
      { key: "ListaPrecioID", value: this.listaPrecioSeleccionada },
      // { key: "fechaFiltro", value: this.fechaFiltro },
    ]

    this.httpService.GetAllWithPagination<ArticuloListaPrecioViewModel>(DataApi.Articulo, "GetArticulosAsignadosListaPrecioPagination", "fechaaplicacion", this.paginaNumeroActual,
      this.paginaSize, false, parametros).subscribe(x => {

        if (x.ok) {
          this.data = x.records;
          console.log(x.records)
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


  getEstadosAutorizacion() {
    let parametros: Parametro[] = [{
      key: "NameKey",
      value: EstadosGeneralesKeyEnum.LISTAPRECIO
    }]

    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoForKeyComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadosAutorizacion = response.records;
          this.estadoIDAutorizacionDefault = response.records[0].codigo;
          this.getSiguienteEstado()//almacena en una variable el siguiente estado
          this.getAnteriorEstadoAutorizacion()//almacena en una variable el anterior estado
          this.getData()
        }
      }, error => {
        this.toastService.error("No se pudo obtener los estados.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });
  }

  getEstadoAutorizacionUsuario() {
    let parametro = {
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "KeynameModule": EstadosGeneralesKeyEnum.LISTAPRECIO,
    }

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "GetEstadoAutorizacionUsuario", parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.estadoAutorizacionUsuario = response.valores[0];
          this.getEstadosAutorizacion()
        }
      }, error => {
        this.toastService.error("No se pudo obtener el estado de autorización del usuario", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadoAutorizacionUsuario()
        }, 1000);

      });

  }

  getSiguienteEstado() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionSiguiente = this.estadosAutorizacion[estadoActualPosicion + 1]
  }

  getAnteriorEstadoAutorizacion() {
    let estadoUsuario = this.estadosAutorizacion.find(x => x.codigo == this.estadoAutorizacionUsuario);
    let estadoActualPosicion = this.estadosAutorizacion.indexOf(estadoUsuario);
    this.estadoAutorizacionAnterior = this.estadosAutorizacion[estadoActualPosicion - 1]

    if (this.estadoAutorizacionAnterior) {
      this.estadoAutorizacionComboModel = this.estadoAutorizacionAnterior.codigo;
    }

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

  openModal(content, btnClicked: number, item: any) {
    this.modalService.open(content, { size: 'sm' });
    this.btnClicked = btnClicked
    // this.articuloSeleccionado = item
  }

  onBtnModalOk() {

    if (this.btnClicked == 1) {
      // this.autorizar()
      // this.desautorizar()
      return;
    }
    if (this.btnClicked == 2) {
      // this.solicitarAutorizacion()
      return;
    }
    if (this.btnClicked == 3) {
      return;
    }

    this.modalService.dismissAll()



  }

  autorizar(item: any) {
    this.isAutorizando = true;
    this.actualizarEstadoArticulos(item)
  }

  desautorizar(item: any) {
    this.isAutorizando = false;
    this.actualizarEstadoArticulos(item)
  }

  autorizarMasiva() {

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "AutorizarArticulosMasivoSegunNivelUsuario", Number(this.authService.tokenDecoded.nameid)).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.toastService.success("Realizado", "OK");
          this.getData()
        }
      }, error => {
        this.toastService.error("No se pudo realizar", "Error conexion al servidor");
        console.error(error)
      });

  }


  actualizarEstadoArticulos(item: any) {

  
    item.cargando = true;
    // if (this.confirmed.filter(x => x.IsChecked).length < 1) {
    //   this.toastService.warning("Selecciona uno o más artículos para actualizar");
    //   return;
    // }

    let EstadoUsuariosNotificacion: number;

    if (this.isAutorizando) {
      EstadoUsuariosNotificacion = this.estadoAutorizacionSiguiente ? this.estadoAutorizacionSiguiente.codigo : 0
    } else {
      EstadoUsuariosNotificacion = this.estadoIDAutorizacionDefault
    }

    let ultimoEstado = this.estadosAutorizacion[this.estadosAutorizacion.length - 1].codigo;
    let articulos = []
    articulos.push(item)

    let param = {
      "IsAprobado": this.estadoAutorizacionUsuario == ultimoEstado && this.isAutorizando,
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "IsAutorizando": this.isAutorizando,
      "EstadoAutorizacion": this.isAutorizando ? this.estadoAutorizacionUsuario : this.estadoIDAutorizacionDefault,
      "EstadoDefault": this.estadoIDAutorizacionDefault,
      "EstadoUsuariosNotificacion": EstadoUsuariosNotificacion,
      "Seleccion": articulos.
        map(x => { return { "ListaPrecioID": x.listaPrecioID, "ArticuloID": x.id, "Precio": x.precio } })
    }

 

    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "ActualizarArticuloPrecioEstadoID", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);

        } else {
          this.toastService.success("Realizado", "OK");
          this.enviarCorreoActualizacionEstadoPrecio(param);
          this.getData()
        }

      }, error => {
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });

  }


  enviarCorreoActualizacionEstadoPrecio(param: any) {
    this.httpService.DoPostAny<any>(DataApi.NivelAutorizacion,
      "EnviarCorreoActualizacionEstadoPrecio", param).subscribe(response => {
        if (!response.ok) {
          console.error(response.errores[0]);
        } else {
          console.log("Correo enviado");
        }
      }, error => {
        console.error(error);
      });
  }


  openModalComments(content, item: any) {
    console.table(item)
    this.itemSeleccionado = item;
    this.getComentarios()
    this.modalService.open(content, { size: 'lg', scrollable: true });
    // this.articuloSeleccionado = item
  }


  getComentarios() {
    this.comentarios = []
    this.comentario = ""
    let parametros = { "ArticuloID": this.itemSeleccionado.id, "ListaPrecioID": this.itemSeleccionado.listaPrecioID }
    this.cargandoModal = true;
    this.httpService.DoPostAny<ComboBox>(DataApi.ListaPrecio,
      "GetListaPrecioArticuloComentarios", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          this.comentarios = response.records;
        }
        this.cargandoModal = false;

      }, error => {
        this.cargandoModal = false;
        this.toastService.error("No se pudo obtener los comentarios.", "Error conexion al servidor");
        setTimeout(() => {
          this.getEstadosAutorizacion()
        }, 1000);

      });

  }



  guardarComentario() {

    if (this.comentario.trim().length < 3) {
      return
    }

    let parametros = {
      "Id": 0,
      "Comentario": this.comentario,
      "ListaPrecioID": this.itemSeleccionado.listaPrecioID,
      "ArticuloID": this.itemSeleccionado.id,
      "UsuarioID": Number(this.authService.tokenDecoded.nameid),
      "Fecha": new Date(),
      "Usuario": this.authService.tokenDecoded.given_name,
      "ListaPrecio": this.itemSeleccionado.listaPrecio,
      "Articulo": this.itemSeleccionado.nombre
    }

    this.cargandoModal = true;
    this.httpService.DoPostAny<any>(DataApi.ListaPrecio,
      "InsertarListaPrecioArticuloComentario", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);

        } else {
          this.toastService.success("Realizado", "OK");
          this.comentario = ""
          this.enviarNotificacionCorreoNuevoComentario(parametros)
          this.getComentarios()
        }
      }, error => {
        this.cargandoModal = false;
        this.toastService.error("No se pudo actualizar el estado.",
          "Error conexion al servidor");
      });
  }

  enviarNotificacionCorreoNuevoComentario(param: any) {

    this.httpService.DoPostAny<any>(DataApi.ListaPrecio,
      "EnviarCorreoNotificacionArticuloComentario", param).subscribe(response => {

        if (!response.ok) {
          // this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {
          // this.toastService.success("Notificaciones enviadas", "OK");
        }
      }, error => {
        console.error(error)
      });

  }


  getListasPrecio() {
    this.loadingListaPrecio = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetListaPreciosComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.ListaPrecio = response.records;

          let todas = new ComboBox();
          todas.nombre = "TODAS"
          todas.codigo = 0

          this.ListaPrecio.unshift(todas);

        }
        this.loadingListaPrecio = false;
      }, error => {
        this.loadingListaPrecio = false;
        this.toastService.error("No se pudo obtener las listas de precios", "Error conexion al servidor");

        setTimeout(() => {
          this.getListasPrecio();
        }, 1000);

      });
  }

  onChangeFechaFiltro(evento: any) {

    this.fechaFiltro = new Date(evento.value)
    if (this.listaPrecioSeleccionada > 0 && this.estadoAutorizacionComboModel > 0) {
      this.getData();
    }

  }

  exportarReporteExcel() {
    this.loadingReporteExcel = true;

    this.httpService.DoPostAny<ArticuloListaPrecioViewModel>(DataApi.Articulo,
      "GetArticulosAutorizacionExcelExport", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {

          const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(response.records);

          /* generate workbook and add the worksheet */
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws2, 'Autorizaciones');

          /* save to file */
          XLSX.writeFile(wb, "Autorización listado | Reporte.xlsx");
        }


        this.loadingReporteExcel = false;
      }, error => {
        this.loadingReporteExcel = false;
        this.toastService.error("No se pudo obtener el reporte", "Error conexion al servidor");
      });
  }


  //grafico

  openModalGraphics(content, btnClicked: number, item: any) {
    this.modalService.open(content, { size: 'lg' });
    this.btnClicked = btnClicked
    this.itemSeleccionado = item

    this.dataGrafico = []
    this.lineChartData = []
    this.lineChartLabels = []

    this.getGraficoData();
  }



  getGraficoData() {
    let parametros = { "ArticuloID": this.itemSeleccionado.id, "ListaPrecioID": this.itemSeleccionado.listaPrecioID }
    this.cargandoModal = true;
    this.httpService.DoPostAny<any>(DataApi.Articulo,
      "GetArticulosHistoricoGraficoData", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
          console.error(response.errores[0]);
        } else {

          this.dataGrafico = response.records;

          if (this.dataGrafico) {
            this.lineChartData.push({
              data: this.dataGrafico.map(d => d.precio),
              label: 'Histórico'
            })

            this.dataGrafico.forEach(d => {
              this.lineChartLabels.push(d.fechaAplicacion);
            })
          }

          // public lineChartData: ChartDataSets[] = [
          //   // { data: [61, 59, 80, 65, 45, 55, 40, 56, 76, 65, 77, 60], label: 'Apple' },
          //   // { data: [57, 50, 75, 87, 43, 46, 37, 48, 67, 56, 70, 50], label: 'Mi' },
          // ];
          // public lineChartLabels: Label[] = []
          // //  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

          console.table(this.dataGrafico);
        }
        this.cargandoModal = false;

      }, error => {
        this.cargandoModal = false;
        this.toastService.error("No se pudo obtener el gráfico.", "Error conexion al servidor");
        setTimeout(() => {
          this.getGraficoData()
        }, 1000);

      });

  }













}
