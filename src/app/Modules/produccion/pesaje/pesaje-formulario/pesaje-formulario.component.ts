import { Component, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CalendarComponent, FocusEventArgs } from '@syncfusion/ej2-angular-calendars';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { Usuario } from 'src/app/Modules/servicios/recepcion/models/Usuario';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { BalanzaPesoGrupoSignalREnum } from 'src/app/shared/enums/BalanzaPesoGrupoSignalREnum';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { EstadosGeneralesKeyEnum } from 'src/app/shared/enums/EstadosGeneralesKeyEnum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloPesaje } from '../models/ArticuloPesaje';
import { ArticuloPesosExtras } from '../models/ArticuloPesosExtras';
import { ArticuloPesosExtrasViewModel } from '../models/ArticuloPesosExtrasViewModel';
import { LoteAlmacen } from '../models/LoteAlmacen';

@Component({
  selector: 'app-pesaje-formulario',
  templateUrl: './pesaje-formulario.component.html',
  styleUrls: ['./pesaje-formulario.component.scss']
})
export class PesajeFormularioComponent implements OnInit, OnDestroy {

  readonly PESO_BALANZA_DEFAULT_VALUE: string = "0.00 KG";
  readonly KILOGRAMO_A_LIBRA: number = 2.20462;

  articulo: Articulo;
  pesoArticuloBalanza: number
  pesoCanastos: number = 0;
  pesoNeto: number = 0;
  
  cargando: boolean;
  search: string;
  searching: boolean;
  loadingArticulosExtras: boolean;
  articulosExtrasComboBox: ArticuloPesosExtras[];
  articulosExtras: ArticuloPesosExtrasViewModel[];
  cantidades: number[] = [];

  fechaActual: Date;

  fechaVencimiento: Date;
  btnGuardarCargando: boolean;

  pesoBalanza: string = "0.00 KG";

  pesoBalanzaUltimaFecha: Date = new Date();
  pesoBalanzaLBNumber: number = 0;

  random: number;

  almacenesDesde: ComboBox[];
  loadingAlmacenesDesde: boolean;

  almacenesHasta: ComboBox[];
  loadingAlmacenesHasta: boolean;
  almacenesDesdeSeleccionado: number;
  almacenesHastaSeleccionado: number;

  usuario: Usuario;
  loadingPeso: boolean = false;

  loteSearch: string
  lote: LoteAlmacen;
  loadingLote: boolean;

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private authService: AuthenticationService,
    private signalRService: BalanzaPesajeSignalrService,
    private router: Router,
    private renderer: Renderer2) { }

  ngOnInit(): void {

    this.getHoraActual()
    this.getAlmacenesUsuarioEnrroll()
    this.subscribirPesoBalanzaCambios()
    this.getUsuarioLogueado()
    

    for (let i = 1; i <= 100; i++) {
      this.cantidades.push(i)
    }


    this.startPingingBalanza()
    // this.empezarAmbientePrueba();

  }


  @ViewChild('default')
  public datepickerObj: any;

  onFocus(args: FocusEventArgs): void {
    this.datepickerObj.show();
  }

  startPingingBalanza() {

    setInterval(() => {

      if (!this.loadingPeso && this.usuario) {
        this.loadingPeso = true;
        this.signalRService.getPesajeFromBalanza(Number(this.usuario.puertoEquipo),
          this.usuario.ipEquipo)
      }

    }, 2000);
  }


  empezarAmbientePrueba() {

    setInterval(() => {
      this.pesoBalanza = this.getRandomInt(1, 100) + 'KGZ';
      this.pesoBalanzaUltimaFecha = new Date();

      this.formatStringFromBalanza();
      this.getKilogramosNumberFromPesoBalanza();
      this.calcularTotales();
    }, 3000);

  }


  //prueba
  getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return (Math.floor(Math.random() * (max - min + 1)) + min)
  }


  subscribirPesoBalanzaCambios() {

    this.signalRService.startConnection(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje);

    this.signalRService.pesoBalanza.subscribe((peso: string) => {
      this.loadingPeso = false;

      this.pesoBalanza = peso;
      this.pesoBalanzaUltimaFecha = new Date();

      this.formatStringFromBalanza();
      this.getKilogramosNumberFromPesoBalanza();
      this.calcularTotales();

    })

  }

  formatStringFromBalanza() {

    if (!this.pesoBalanza) {
      this.pesoBalanza = this.PESO_BALANZA_DEFAULT_VALUE
      return;
    }

    let valores = this.pesoBalanza.split(" ")
    // .filter(x => x.includes("KG") || x.includes("LB"))

    if (!valores || valores.length == 0) {
      this.pesoBalanza = this.PESO_BALANZA_DEFAULT_VALUE
      return;
    }

    // console.table(valores)
    this.pesoBalanza = valores //filtro los que contengan libraje o kilogramo
      .reduce(//selecciono el de mayor length
        function (a, b) {
          return a.length > b.length ? a : b;
        }
      ).trim();

  }


  onSubmit() {

    //validaciones

    if (
      !this.almacenesDesdeSeleccionado || this.almacenesDesdeSeleccionado <= 0 ||
      !this.almacenesHastaSeleccionado || this.almacenesHastaSeleccionado <= 0
    ) {
      this.toastService.warning("Selecciona los almacenes.");
      return;
    }

    if (this.almacenesDesdeSeleccionado == this.almacenesHastaSeleccionado) {
      this.toastService.warning("El almacen no puede ser el mismo.");
      return;
    }


    if (!this.fechaVencimiento) {
      this.toastService.warning("Selecciona la fecha de vencimiento.");
      return;
    }

    if (this.pesoCanastos >= this.pesoBalanzaLBNumber) {
      this.toastService.warning("El peso de los canastos no puede ser mayor o igual al de la balanza.");
      return;
    }

    if (!this.articulosExtras.some(x => x.cantidadSeleccionada > 0 && x.pesoSeleccionado)) {
      this.toastService.warning("No hay canastos con cantidad o peso seleccionados.");
      return;
    }

    if (!this.loteSearch) {
      this.toastService.warning("Digita el lote.");
      return;
    }

    // if (this.lote.cantidad < this.pesoNeto) {
    //   this.toastService.warning(`No tiene lote disponible para hacer esta transferencia, favor verificar.`);
    //   return;
    // }

    this.guardar()
  }

  guardar() {

    let request: ArticuloPesaje = {
      id: 0,
      estadoID: 1,
      articuloID: this.articulo.id,
      almacenDesde: this.almacenesDesdeSeleccionado,
      almacenHasta: this.almacenesHastaSeleccionado,
      fechaVencimiento: this.fechaVencimiento,
      pesoCanastos: this.pesoCanastos,
      pesoNeto: this.pesoNeto,
      pesoBalanza: this.pesoBalanzaLBNumber,
      lote: this.loteSearch,
      usuarioID: Number(this.authService.tokenDecoded.nameid),
      detalleJSON: JSON.stringify(this.articulosExtras.filter(x => x.pesoSeleccionado && x.cantidadSeleccionada > 0)),
    };

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<ArticuloPesaje>(DataApi.ArticuloPesaje,
      "Registrar", request).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.signalRService.refrescarListadoPesajes(request.almacenHasta);
          let id = response.valores[0];
          this.router.navigateByUrl('/impresion/produccion/pesaje-resultado-codigo-barra/' + id);
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getKilogramosNumberFromPesoBalanza() {

    this.pesoBalanzaLBNumber = 0

    if (this.pesoBalanza) {

      let indexKg = this.pesoBalanza.toLowerCase().indexOf("k") //donde empieza la k de kilogramo (kg)
      if (indexKg > 0) {

        let kilogramos = this.pesoBalanza.substring(0, indexKg)
        this.pesoBalanzaLBNumber = Number(kilogramos) * this.KILOGRAMO_A_LIBRA;
      }

      let indexLb = this.pesoBalanza.toLowerCase().indexOf("l") //donde empieza la k de kilogramo (kg)
      if (indexLb > 0) {

        let libras = this.pesoBalanza.substring(0, indexLb)
        this.pesoBalanzaLBNumber = Number(libras);
      }


    }

  }




  calcularTotales() {
    this.pesoCanastos = 0;

    if (this.articulosExtras) {
      this.articulosExtras.forEach(a => {
        if (a.cantidadSeleccionada && a.pesoSeleccionado) {
          this.pesoCanastos += a.cantidadSeleccionada * (a.pesoSeleccionado.valor * a.pesoSeleccionado.medidaValor)
        }
      })
    }

    this.pesoNeto = this.pesoBalanzaLBNumber - this.pesoCanastos;

  }







  onSearchChange() {

    if (this.search && this.search.length > 3) {
      this.pesoCanastos = 0;
      this.pesoNeto = 0
      this.getArticuloByCodigoReferencia(this.search)
      this.getArticulosDePesosExtras()
    } else {
      this.articulo = null;
    }

  }

  onClearSearch() {
    this.search = ""
    this.pesoCanastos = 0;
    this.pesoNeto = 0
    this.focusInputSearch()
    this.onSearchChange()
  }


  getArticuloByCodigoReferencia(codigoRefencia: string) {
    console.log('s')

    this.searching = true;
    this.httpService.DoPostAny<Articulo>(DataApi.Articulo,
      "GetArticuloByCodigoReferencia", { codigoRefencia }).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.articulo = record;
            this.getArticulosDePesosExtras();
          }
          else {
            this.articulo = null;
          }
          this.searching = false;
        }

      }, error => {
        this.searching = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getArticulosDePesosExtras() {
    this.loadingArticulosExtras = true;
    this.httpService.DoPost<ArticuloPesosExtras>(DataApi.Articulo,
      "GetArticulosDePesosExtras", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulosExtrasComboBox = response.records;


          this.formatArticulosExtras()
        }
        this.loadingArticulosExtras = false;
      }, error => {
        this.loadingArticulosExtras = false;
        this.toastService.error("No se pudo obtener los articulos extras", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulosDePesosExtras();
        }, 1000);
      });
  }

  formatArticulosExtras() {
    this.articulosExtras = []
    this.articulosExtrasComboBox.forEach(a => {

      if (!this.articulosExtras.some(x => x.articuloID == a.articuloID)) {
        let item: ArticuloPesosExtrasViewModel = new ArticuloPesosExtrasViewModel();

        item.articuloID = a.articuloID
        item.codigoReferencia = a.codigoReferencia
        item.nombre = a.nombre
        item.cantidadSeleccionada = a.cantidadDefault;


        item.pesos = this.articulosExtrasComboBox.
          filter(ar => ar.articuloID == a.articuloID).
          map(art => {
            return {
              "nombre": `${art.valor} ${art.abreviatura}`,
              "valor": art.valor,
              "abreviatura": art.abreviatura,
              "medidaValor": art.medidaValor
            }
          });

        this.articulosExtras.push(item)
      }

    })
  }


  getAlmacenesUsuarioEnrroll() {

    let parametros: Parametro[] = [
      { key: "usuarioID", value: this.authService.tokenDecoded.nameid },
      { key: "ModuloKey", value: EstadosGeneralesKeyEnum.PRODUCCION },
    ]

    this.loadingAlmacenesDesde = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarioAlmacenesModulo", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenesDesde = response.records;
          this.almacenesHasta = response.records;

          if (this.almacenesDesde && this.almacenesDesde.length > 0) {
            this.almacenesDesdeSeleccionado = this.almacenesDesde[0].codigo
          }

        }
        this.loadingAlmacenesDesde = false;
      }, error => {
        this.loadingAlmacenesDesde = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenesUsuarioEnrroll();
        }, 1000);

      });
  }


  getUsuarioLogueado() {
    let usuarioID: number = Number(this.authService.tokenDecoded.nameid)

    this.httpService.DoPostAny<Usuario>(DataApi.Usuario,
      "GetUsuarioByID", usuarioID).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let usuario = response.records[0];
            this.usuario = usuario;

          } else {
            this.toastService.warning("Usuario no encontrado");
          }
        }

      }, error => {
        this.toastService.error("Error conexion al servidor");
      });
  }


  getHoraActual() {
    this.cargando = true;
    this.httpService.DoPost<ComboBox>(DataApi.Public,
      "GetHoraActual", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.fechaActual = new Date(response.valores[0]);
        }

        this.cargando = false;
      }, error => {
        this.cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  ngAfterViewInit() {
    setTimeout(() => {
      var elem = this.renderer.selectRootElement('#inputSearch');
      // this.renderer.listen(elem, "focus", () => { console.log('focus') });
      // this.renderer.listen(elem, "blur", () => { console.log('blur') });
      elem.focus();

    }, 1000);

    this.focusInputSearch()

  }

  focusInputSearch() {
    this.renderer.selectRootElement('#inputSearch').focus();
  }

  ngOnDestroy(): void {

    this.signalRService.ExitGroup(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje);

  }



}
