
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Modulo } from '../models/Modulo';
@Component({
  selector: 'app-descuento-articulos-formulario',
  templateUrl: './descuento-articulos-formulario.component.html',
  styleUrls: ['./descuento-articulos-formulario.component.scss']
})
export class DescuentoArticulosFormularioComponent implements OnInit {

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingArticulosCombobox=false;
  loadingDias = false;
  loadingSucursal = false;
  horaValida:any;
  horaExiste = false;
  loadingListaPrecios: boolean;
  listasPrecios: ComboBox[];
  cargadoRutas: boolean;
  rutas: ComboBox[];
  loadingClientes: boolean;
  clientes: ComboBox[];
  loadingArticulos: boolean;
  articulos: ComboBox[];
  tipoDescuento: ComboBox[];
  loadingTipoDescuento: boolean;
  canales: ComboBox[];
  loadingcanales: boolean;
  loadingestados: boolean;
  estados: ComboBox[];
  loadingProvincias: boolean;
  provincias: ComboBox[];
  loadingSectores: boolean;
  sectores: ComboBox[];
  provinciaId: any;
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));
    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
    this.CreateForm();
    this.getListasPrecios();
    this.getRutas();
    this.getClientes();
    this.getTodosArticulos();
    this.getComboBoxCanal();
    this.getTipoDescuento();
    this.getEstadoGeneral();
    this.getProvincias();
  
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      companiaId: [Number(this.authService.tokenDecoded.primarygroupsid), [Validators.required]],
      fechaDesde: [null,[Validators.required]],
      fechaHasta: [null,[Validators.required]],
      estadoId: [1,[Validators.required]],
      articuloId: [null,[Validators.required]],
      listaPrecioId: [null,],
      porciento: [null,[Validators.required]],
      descuentoTipoId: [null,[Validators.required]],
      clienteId: [null,],
      rutaId: [null,],
      canalId: [null,],
      provinciaId: [null,],
      sectorId: [null,],
      
  
    });
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  buscarSectores()
  {
      this.getsectores();
  }
 
  guardar() {
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.httpService.DoPostAny<Modulo>(DataApi.DescuentoArticulo,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/tipo-descuento');
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getClientes() {
    this.loadingClientes = true;
    let parametros: Parametro[] = [
      { key: "Compania", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "UsuarioId", value:this.authService.tokenDecoded.nameid },
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetClientesComboBox", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.clientes = response.records;
          if (this.clientes && this.clientes.length > 0) {
            this.Formulario.get('clienteId').setValue(this.clientes[0].codigo);
           }
        }
        this.loadingClientes = false;
      }, error => {
        this.loadingClientes = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getComboBoxCanal() {
    this.loadingcanales = true;
    let parametros: Parametro[] = [];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetComboBoxCanal", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.canales = response.records;
          if (this.canales && this.canales.length > 0) {
            this.Formulario.get('canalId').setValue(this.canales[0].codigo);
           }
         
        }
        this.loadingcanales = false;
      }, error => {
        this.loadingcanales = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getEstadoGeneral() {
    this.loadingestados = true;
    let parametros: Parametro[] = [
      { key: "NameKey", value: 'DESCEUNTOARTICULO' }
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEstadoGeneral", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.estados = response.records;
          if (this.estados && this.estados.length > 0) {
            this.Formulario.get('estadoId').setValue(this.estados[0].codigo);
           }
        }
        this.loadingestados = false;
      }, error => {
        this.loadingestados = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Modulo>(DataApi.DescuentoArticulo,
      "GetDescuentoArticuloByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.patchValue(record);
          } else {
            this.toastService.warning("Registro no encontrada");
            this.router.navigateByUrl('/mantenimientos/tipo-descuento');
          }
      }
      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getListasPrecios() {
    this.loadingListaPrecios = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetListaPreciosComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.listasPrecios = response.records;
          if (this.listasPrecios && this.listasPrecios.length > 0) {
            this.Formulario.get('listaPrecioId').setValue(this.listasPrecios[0].codigo);
           }
        }
        this.loadingListaPrecios = false;
      }, error => {
        this.loadingListaPrecios = false;
        this.toastService.error("No se pudo obtener las listas de precios", "Error conexion al servidor");
      });
  }
  getProvincias() {
    this.loadingProvincias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetProvinciaComboBox", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.provincias = response.records;
          if (this.provincias && this.provincias.length > 0) {
            this.Formulario.get('provinciaId').setValue(this.provincias[0].codigo);
            this.getsectores();
           }
        }
        this.loadingProvincias = false;
      }, error => {
        this.loadingProvincias = false;
        this.toastService.error("No se pudo obtener las listas de províncias", "Error conexion al servidor");
      });
  }
  getsectores() {
    let parametros: Parametro[] = [
      { key: "ProvinciaId", value: this.provinciaId }
    ];
    this.loadingSectores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSectorComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sectores = response.records;
          if (this.sectores && this.sectores.length > 0) {
            this.Formulario.get('sectorId').setValue(this.sectores[0].codigo);
           }
        }
        this.loadingSectores = false;
      }, error => {
        this.loadingSectores = false;
        this.toastService.error("No se pudo obtener las listas de sectores", "Error conexion al servidor");
      });
  }
  getTodosArticulos() {
    this.loadingArticulos = true;
    let parametros: Parametro[] = [];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTodosArticulos", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulos = response.records;
          if (this.articulos && this.articulos.length > 0) {
            this.Formulario.get('articuloId').setValue(this.articulos[0].codigo);
           }
        }
        this.loadingArticulos = false;
      }, error => {
        this.loadingArticulos = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getTipoDescuento() {
    this.loadingTipoDescuento = true;
    let parametros: Parametro[] = [];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoDescuento", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tipoDescuento = response.records;
          if (this.tipoDescuento && this.tipoDescuento.length > 0) {
           this.Formulario.get('descuentoTipoId').setValue(this.tipoDescuento[0].codigo);
          }
        }
        this.loadingTipoDescuento = false;
      }, error => {
        this.loadingTipoDescuento = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getRutas(tipoRuta?:number) {
    this.cargadoRutas = true;
    let parametros: Parametro[] = [{ key: "tipoRuta", value: 0}]
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasComboBox", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.rutas = response.records;
          if (this.rutas && this.rutas.length > 0) {
            this.Formulario.get('rutaId').setValue(this.rutas[0].codigo);
           }
        }
        this.cargadoRutas = false;
      }, error => {
        this.cargadoRutas = false;
        this.toastService.error("No se pudo obtener las rutas", "Error conexion al servidor");
      });
  }
  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    console.log(this.Formulario.value)
    this.guardar();
  }




 


 









}
