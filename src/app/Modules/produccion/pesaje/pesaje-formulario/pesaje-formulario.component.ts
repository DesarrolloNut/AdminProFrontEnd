import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { BalanzaPesajeSignalrService } from 'src/app/Services/balanza-pesaje-signalr.service';
import { BalanzaPesoGrupoSignalREnum } from 'src/app/shared/enums/BalanzaPesoGrupoSignalREnum';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloPesaje } from '../models/ArticuloPesaje';
import { ArticuloPesajeRequestModel } from '../models/ArticuloPesajeRequestModel';
import { ArticuloPesosExtrasRenderViewModel } from '../models/ArticuloPesosExtrasRenderViewModel';
import { ArticuloPesosExtrasViewModel } from '../models/ArticuloPesosExtrasViewModel copy';

@Component({
  selector: 'app-pesaje-formulario',
  templateUrl: './pesaje-formulario.component.html',
  styleUrls: ['./pesaje-formulario.component.scss']
})
export class PesajeFormularioComponent implements OnInit {
  articulo: Articulo;
  almacenID: number;
  pesoArticuloBalanza: number
  pesoBruto: number = 0;
  pesoNeto: number = 0;

  cargando: boolean;
  search: string;
  searching: boolean;
  loadingArticulosExtras: boolean;
  articulosExtras: ArticuloPesosExtrasViewModel[];
  articulosExtrasViewRender: ArticuloPesosExtrasRenderViewModel[];
  cantidades: number[] = [];

  loadingAlmacenes: boolean;
  almecenes: any[];
  fechaActual: Date;
  fechaVencimiento: Date;
  btnGuardarCargando: boolean;

  pesoBalanza: string = "0.00 Lb";
  pesoBalanzaUltimaFecha: Date = new Date();

  constructor(
    private toastService: ToastrService,
    private httpService: BackendService,
    private signalRService: BalanzaPesajeSignalrService,
    private router: Router,
    private renderer: Renderer2) { }

  ngOnInit(): void {
    this.getHoraActual()
    for (let i = 1; i <= 100; i++) {
      this.cantidades.push(i)
    }
    this.getAlmacenes()

    this.signalRService.startConnection(BalanzaPesoGrupoSignalREnum.Pantalla_Pesaje);

    this.signalRService.pesoBalanza.subscribe((peso: string) => {

      this.pesoBalanza = peso;
      this.pesoBalanzaUltimaFecha = new Date();

      console.log(peso)
      this.formatStringFromBalanza();

    })


  }

  formatStringFromBalanza() {

    // this.pesoBalanza = `5LB 
    //      765LB 
    //      765LB 
    //      765LB 
    //      765LB 
    //      765LB 
    //      765LB 
    //      765LB 
    //      765LB 
    //      765L`

    if (!this.pesoBalanza) {
      this.pesoBalanza = "0.00 Lb"
      return;
    }

    let valores = this.pesoBalanza.split(" ")
    // .filter(x => x.includes("KG") || x.includes("LB"))

    if (!valores || valores.length == 0) {
      this.pesoBalanza = "0.00 Lb"
      return;
    }

    console.table(valores)
    this.pesoBalanza = valores //filtro los que contengan libraje o kilogramo
      .reduce(//selecciono el de mayor length
        function (a, b) {
          return a.length > b.length ? a : b;
        }
      ).trim();

  }


  onSubmit() {

    //validaciones



    console.log(this.articulosExtrasViewRender)
    this.guardar()
  }

  guardar() {

    let request: ArticuloPesaje = {
      id: 0,
      almacenID: this.almacenID,
      articuloID: this.articulo.id,
      pesoBruto: this.pesoBruto,
      pesoNeto: this.pesoNeto,
      fechaVencimiento: this.fechaVencimiento,
      detalleJSON: JSON.stringify(this.articulosExtrasViewRender),
    };

    console.log(request)

    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<ArticuloPesajeRequestModel>(DataApi.ArticuloPesaje,
      "Registrar", request).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/produccion/pesaje');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  calcularTotales() {
    this.pesoBruto = 0;
    this.articulosExtrasViewRender.forEach(a => {
      if (a.cantidadSeleccionada && a.pesoSeleccionado) {
        this.pesoBruto += a.cantidadSeleccionada * (a.pesoSeleccionado.valor * a.pesoSeleccionado.medidaValor)
      }
    })

    this.pesoBruto += this.pesoNeto;

  }

  onSearchChange() {

    if (this.search && this.search.length > 3) {
      this.pesoBruto = 0;
      this.pesoNeto = 0
      this.getArticuloByCodigoReferencia(this.search)
    } else {
      this.articulo = null;
    }

  }

  onClearSearch() {
    this.search = ""
    this.pesoBruto = 0;
    this.pesoNeto = 0
    this.focusInputSearch()
    this.onSearchChange()
  }


  getArticuloByCodigoReferencia(codigoRefencia: string) {
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
    this.httpService.DoPost<ArticuloPesosExtrasViewModel>(DataApi.Articulo,
      "GetArticulosDePesosExtras", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulosExtras = response.records;
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
    this.articulosExtrasViewRender = []
    this.articulosExtras.forEach(a => {

      if (!this.articulosExtrasViewRender.some(x => x.articuloID == a.articuloID)) {
        let item: ArticuloPesosExtrasRenderViewModel = new ArticuloPesosExtrasRenderViewModel();

        item.articuloID = a.articuloID
        item.codigoReferencia = a.codigoReferencia
        item.nombre = a.nombre

        item.pesos = this.articulosExtras.
          filter(ar => ar.articuloID == a.articuloID).
          map(art => {
            return {
              "nombre": `${art.valor} ${art.abreviatura}`,
              "valor": art.valor,
              "abreviatura": art.abreviatura,
              "medidaValor": art.medidaValor
            }
          });
        this.articulosExtrasViewRender.push(item)
      }

    })
    console.log(this.articulosExtrasViewRender)
  }


  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almecenes = response.records;
        }
        this.loadingAlmacenes = false;
      }, error => {
        this.loadingAlmacenes = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenes();
        }, 1000);

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




}
