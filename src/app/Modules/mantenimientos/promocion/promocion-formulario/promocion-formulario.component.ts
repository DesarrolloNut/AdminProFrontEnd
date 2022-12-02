
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
  selector: 'app-promocion-formulario',
  templateUrl: './promocion-formulario.component.html',
  styleUrls: ['./promocion-formulario.component.scss']
})
export class PromocionFormularioComponent implements OnInit {

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
  ciudades: ComboBox[];
  loadingCiudades: boolean;
  ciudadId: any;
  loadingDescuentoTipoSeleccion: boolean;
  descuentoTipoSeleccion: ComboBox[];
  almacenes: ComboBox[];
  loadingAlmacenes: boolean;
  marcas: ComboBox[];
  loadingMarcas: boolean;
  filtro: string;
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
    this.getDescuentoTipoSeleccion();
    this.getMarcas();
    this.getAlmacenes();
  
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      companiaId: [Number(this.authService.tokenDecoded.primarygroupsid), [Validators.required]],
      usuarioId:[Number(this.authService.tokenDecoded.nameid), [Validators.required]],
      fechaDesde: [null,[Validators.required]],
      fechaHasta: [null,[Validators.required]],
      estadoId: [1,[Validators.required]],
      articuloId: [0,[Validators.required]],
      listaPrecioId: [0,],
      porciento: [0,[Validators.required]],
      descuentoTipoId: [0,[Validators.required]],
      clienteId: [0,],
      rutaId: [0,],
      canalId: [0,],
      provinciaId: [0,],
      sectorId: [0,],
      ciudadId: [0,],
      descuentoTipoSeleccionId: [0,],
      almacenId: [0,],
      marcaId: [0,],
    });
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  buscarCiudades()
  {
    this.getCiudades(); 
  }

  buscarSectores(){
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
          this.router.navigateByUrl('/mantenimientos/descuento-articulos');
        }
        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenesComboBox", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenes = response.records;
         
        }
        this.loadingAlmacenes = false;
      }, error => {
        this.loadingAlmacenes = false;
        this.toastService.error("No se pudo obtener las listas de almaces", "Error conexion al servidor");
      });
  }
  getCiudades() {
    let parametros: Parametro[] = [
      { key: "ProvinciaId", value: this.provinciaId? this.provinciaId:0 }
    ];
    this.loadingCiudades = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetCiudadComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.ciudades = response.records;
          if (this.ciudades && this.ciudades.length > 0) {
           
            this.getsectores();
           }
        }
        this.loadingCiudades = false;
      }, error => {
        this.loadingCiudades = false;
        this.toastService.error("No se pudo obtener las listas de ciudades", "Error conexion al servidor");
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
          
        }
        this.loadingcanales = false;
      }, error => {
        this.loadingcanales = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getDescuentoTipoSeleccion() {
    this.loadingDescuentoTipoSeleccion = true;
    let parametros: Parametro[] = [];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetDescuentoTipoSeleccion", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.descuentoTipoSeleccion = response.records;
          if (this.descuentoTipoSeleccion && this.descuentoTipoSeleccion.length > 0) {
           this.Formulario.get('descuentoTipoSeleccionId').setValue(this.descuentoTipoSeleccion[0].codigo);
           this.filtro=this.descuentoTipoSeleccion[0].nombre
          }
        }
        this.loadingDescuentoTipoSeleccion = false;
      }, error => {
        this.loadingDescuentoTipoSeleccion = false;
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
          
        }
        this.loadingListaPrecios = false;
      }, error => {
        this.loadingListaPrecios = false;
        this.toastService.error("No se pudo obtener las listas de precios", "Error conexion al servidor");
      });
  }
  getMarcas() {
    this.loadingMarcas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMarcasComboBox", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.marcas = response.records;
          
        }
        this.loadingMarcas = false;
      }, error => {
        this.loadingMarcas = false;
        this.toastService.error("No se pudo obtener las listas de almaces", "Error conexion al servidor");
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
            
            this.getCiudades();
           
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
      { key: "CiudadId", value: this.ciudadId?this.ciudadId:0 }
    ];
    this.loadingSectores = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetSectorComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.sectores = response.records;
          
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

    this.guardar();
  }
  tipoDescuentoSeleccion(item:ComboBox){
    console.log(item)
    this.filtro=item.nombre;
  }




 


 









}
