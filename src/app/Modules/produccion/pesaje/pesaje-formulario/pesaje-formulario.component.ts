import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ArticuloPesosExtrasViewModel } from '../models/ArticuloPesosExtrasViewModel';

@Component({
  selector: 'app-pesaje-formulario',
  templateUrl: './pesaje-formulario.component.html',
  styleUrls: ['./pesaje-formulario.component.scss']
})
export class PesajeFormularioComponent implements OnInit {
  cargando: boolean;
  articulo: Articulo;

  search: string;
  searching: boolean;
  almacenID: number;
  loadingArticulosExtras: boolean;
  articulosExtras: ArticuloPesosExtrasViewModel[];
  articulosExtrasViewRender: any[];
  cantidades: number[] = [];
  loadingAlmacenes: boolean;
  almecenes: any[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private renderer: Renderer2,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    for (let i = 1; i <= 100; i++) {
      this.cantidades.push(i)
    }
    this.getAlmacenes()
  }

  onSearchChange() {

    if (this.search && this.search.length > 3) {
      this.getArticuloByCodigoReferencia(this.search)
    } else {
      this.articulo = null;
    }

  }

  onClearSearch() {
    this.search = ""
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
        let item: any = a;
        item.pesos = this.articulosExtras.filter(ar => ar.articuloID == a.articuloID).map(art => {
          return { "nombre": `${art.valor} ${art.abreviatura}`, "valor": art.valor, "abreviatura": art.abreviatura, "medidaValor": art.medidaValor }
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


  ngAfterViewInit() {
    setTimeout(() => {
      var elem = this.renderer.selectRootElement('#inputSearch');
      this.renderer.listen(elem, "focus", () => { console.log('focus') });
      this.renderer.listen(elem, "blur", () => { console.log('blur') });
      elem.focus();

    }, 1000);

    this.focusInputSearch()

  }

  focusInputSearch() {
    this.renderer.selectRootElement('#inputSearch').focus();
  }




}
