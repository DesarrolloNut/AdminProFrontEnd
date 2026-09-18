
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
  tipoPromocion: ComboBox[];
  loadingTipoPromocion: boolean;
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
  loadingPromocionTipoSeleccion: boolean;
  promocionTipoSeleccion: ComboBox[];
  almacenes: ComboBox[];
  loadingAlmacenes: boolean;
  marcas: ComboBox[];
  loadingMarcas: boolean;
  filtro: string;
  loadingObjeto: boolean;
  objetos: ComboBox[];
  selectedItems=[];
  dropdownSettings: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; clearSearchFilter: boolean; };
  loadingEntidades: boolean;
  tipoSeleccion: any;
  search: any="";
  canal: any;
  entidades: ComboBox[];
  promocion: any;
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
    this.getTodosArticulos();
    this.getComboBoxCanal();
    this.getTipoPromocion();
    this.getEstadoGeneral();
    this.getPromocionTipoSeleccion();
    this.getObjeto();
    this.multiSelectSettings();
  
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      companiaId: [Number(this.authService.tokenDecoded.primarygroupsid), [Validators.required]],
      usuario:[Number(this.authService.tokenDecoded.nameid), [Validators.required]],
      fechaDesde: [null,[Validators.required]],
      fechaHasta: [null,[Validators.required]],
      estado: [null,[Validators.required]],
      articuloIdCompra: [null,[Validators.required]],
      articuloIdRegala: [null,[Validators.required]],
      cantidadRegala: [null,[Validators.required]],
      condicion1: [null,[Validators.required]],
      condicion2: [null,[Validators.required]],
      condicionBase: [null,[Validators.required]],
      nombre: [null,[Validators.required]],
      objetoId: [null,[Validators.required]],
      promocionesTipoId: [null,[Validators.required]],
      promocionTipoSeleccionId: [0,],
      canalId: [null,[Validators.required]],
      
    
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
  canalSeleccionado(){
    if(this.tipoSeleccion)
    {
      this.getEntidades();
    }
  }
 
  guardar() {
    let parametros: any = {
      "Promocion": this.Formulario.value,
      "Entidades": this.selectedItems,
    }
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    console.log(parametros);
    this.httpService.DoPostAny<Modulo>(DataApi.Promociones,
      metodo, parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/promociones');
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
             if(!this.actualizando)
             {
              this.Formulario.get('canalId').setValue(this.canales[0].codigo);
          
             }
           }
        }
        this.loadingcanales = false;
      }, error => {
        this.loadingcanales = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getEntidades() {
    this.loadingEntidades = true;
    let parametros: Parametro[] = [
      { key: "TipoSeleccion", value: this.tipoSeleccion },
      { key: "CompaniaId", value:this.authService.tokenDecoded.primarygroupsid },
      { key: "search", value:this.search },
      { key: "canal", value:this.canal },
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEntidadesComboBox", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.entidades = response.records;
         if(this.entidades.length <=0)
         {
          this.search=""
          this.getEntidades()
         }
        }
        this.loadingEntidades = false;
      }, error => {
        this.loadingEntidades = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getPromocionTipoSeleccion() {
    this.loadingPromocionTipoSeleccion = true;
    let parametros: Parametro[] = [];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetPromocionTipoSeleccion", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.promocionTipoSeleccion = response.records;
          if (this.promocionTipoSeleccion && this.promocionTipoSeleccion.length > 0) {
           this.filtro=this.promocionTipoSeleccion[0].nombre
          }
        }
        this.loadingPromocionTipoSeleccion = false;
      }, error => {
        this.loadingPromocionTipoSeleccion = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getEstadoGeneral() {
    this.loadingestados = true;
    let parametros: Parametro[] = [
      { key: "NameKey", value: 'mantenimientos_descuento_articulos' }
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
  getEntidadesYaGuardados(descuentoId:number,descuentoTipoSeleccionId:number) {
    this.loadingEntidades = true;
    let parametros: Parametro[] = [
      { key: "PromocionId", value: descuentoId },
      { key: "CompaniaId", value:this.authService.tokenDecoded.primarygroupsid },
      { key: "PromocionTipoSeleccionId", value:descuentoTipoSeleccionId },
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEntidadesPromocionesYaGuardadosComboBox", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.selectedItems = response.records;
          console.log(response.records);
        }
        this.loadingEntidades = false;
      }, error => {
        this.loadingEntidades = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.Promociones,
      "GetPromocionByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0];
            this.promocion = response.records[0];
            //Captirando valores para llenar el combo entidad
            this.tipoSeleccion=this.promocion.promocionTipoSeleccionId;
            this.canal=1;
            this.getEntidadesYaGuardados(this.promocion.id,this.promocion.promocionTipoSeleccionId)
            this.getEntidades();
            this.Formulario.patchValue(record);
           
          } else {
            this.toastService.warning("Registro no encontrada");
            this.router.navigateByUrl('/mantenimientos/promociones');
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
  getObjeto() {
    this.loadingObjeto= true;
    let parametros: Parametro[] = [];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetObjetoComboBox", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.objetos = response.records;
        }
        this.loadingObjeto = false;
      }, error => {
        this.loadingObjeto = false;
        this.toastService.error("Error conexion al servidor");
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
  getTipoPromocion() {
    this.loadingTipoPromocion = true;
    let parametros: Parametro[] = [];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetTipoPromocion", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.tipoPromocion = response.records;
        
        }
        this.loadingTipoPromocion = false;
      }, error => {
        this.loadingTipoPromocion = false;
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
  multiSelectSettings()
  {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'codigo',
      textField: 'nombre',
      selectAllText: 'Seleccionar todos',
      unSelectAllText: 'Deseleccionar todos',
      itemsShowLimit: 2000,
      allowSearchFilter: true,
      clearSearchFilter: true,
    };
  }
  onSubmit() {
    this.submitted = true;
    
    if (this.Formulario.invalid) {
    
      return;
    }
    
    this.guardar();
  }
  

  tipoPromocionSeleccion(item:ComboBox){
    // if(this.actualizando)
    // {
    //  this.getEntidadesYaGuardados(this.descuentoArticulo.id,this.tipoSeleccion);
    // }
   this.filtro=item.nombre;
   this.tipoSeleccion=item.codigo;
   this.getEntidades();
 }




 


 









}
