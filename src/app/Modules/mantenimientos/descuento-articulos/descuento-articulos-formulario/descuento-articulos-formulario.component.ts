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
  ciudades: ComboBox[];
  canal:number;
  loadingCiudades: boolean;
  ciudadId: any;
  loadingDescuentoTipoSeleccion: boolean;
  descuentoTipoSeleccion: ComboBox[];
  almacenes: ComboBox[];
  loadingAlmacenes: boolean;
  marcas: ComboBox[];
  loadingMarcas: boolean;
  filtro: string;
  selectedItems=[];

  loadingEntidades: boolean;
  entidades: ComboBox[];
  search: string="";
  dropdownSettings: { singleSelection: boolean; idField: string; textField: string; selectAllText: string; unSelectAllText: string; itemsShowLimit: number; allowSearchFilter: boolean; clearSearchFilter: boolean; };
  tipoSeleccionId: number;
  tipoSeleccion: any;
  descuentoArticulo: any;
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
    this.getDescuentoTipoSeleccion();
    this.getListasPrecios();
    this.getTodosArticulos();
    this.getComboBoxCanal();
    this.getTipoDescuento();
    this.getEstadoGeneral();
    this.multiSelectSettings();
   
  }
  private CreateForm() {
    this.Formulario = this.formBuilder.group({
      id: [0],
      companiaId: [Number(this.authService.tokenDecoded.primarygroupsid), [Validators.required]],
      usuarioId:[Number(this.authService.tokenDecoded.nameid), [Validators.required]],
      fechaDesde: [null,[Validators.required]],
      fechaHasta: [null,[Validators.required]],
      estadoId: [null,[Validators.required]],
      articuloId: [0,[Validators.required]],
      porciento: [null,[Validators.required]],
      descuentoTipoId: [0,[Validators.required]],
      descuentoTipoSeleccionId: [0,],
      cantidad: [null,[Validators.required]],
      canal: [0,[Validators.required]],
    });
  }
  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html
 
  canalSeleccionado(){
    if(this.tipoSeleccion)
    {
      this.getEntidades();
    }
  }
  guardar() {
    let parametros: any = {
      "ArticuloDescuento": this.Formulario.value,
      "Entidades": this.selectedItems,
    }

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.httpService.DoPostAny<Modulo>(DataApi.DescuentoArticulo,
      metodo, parametros).subscribe(response => {
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
              this.Formulario.get('canal').setValue(this.canales[0].codigo);
             }
           }
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
           this.filtro=this.descuentoTipoSeleccion[0].nombre;
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

  getEntidadesYaGuardados(descuentoId:number,descuentoTipoSeleccionId:number) {
    this.loadingEntidades = true;
    let parametros: Parametro[] = [
      { key: "DescuentoId", value: descuentoId },
      { key: "CompaniaId", value:this.authService.tokenDecoded.primarygroupsid },
      { key: "DescuentoTipoSeleccionId", value:descuentoTipoSeleccionId },
    ];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEntidadesYaGuardadosComboBox", parametros).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.selectedItems = response.records;
        }
        this.loadingEntidades = false;
      }, error => {
        this.loadingEntidades = false;
        this.toastService.error("Error conexion al servidor");
      });
  }
  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.DescuentoArticulo,
      "GetDescuentoArticuloByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          if (response != null && response.records != null && response.records.length > 0) {
            this.descuentoArticulo = response.records[0];
            //Captirando valores para llenar el combo entidad
            this.tipoSeleccion=this.descuentoArticulo.descuentoTipoSeleccionId;
            this.canal=this.descuentoArticulo.canal;
            this.getEntidadesYaGuardados(this.descuentoArticulo.id,this.descuentoArticulo.descuentoTipoSeleccionId)
            this.getEntidades();
            this.Formulario.patchValue(this.descuentoArticulo);
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

  onFilterChange(event:any){
    this.search=event
     this.getEntidades();
  }
  onSubmit() {
    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    if(this.selectedItems ===null )
    {
      this.toastService.error("No se ha seleccionado un entidad.");
      return;
    }
    this.guardar();
  }
  tipoDescuentoSeleccion(item:ComboBox){
     if(this.actualizando)
     {
      this.getEntidadesYaGuardados(this.descuentoArticulo.id,this.tipoSeleccion);
     }
    this.filtro=item.nombre;
    this.tipoSeleccion=item.codigo;
    this.getEntidades();
  }
 


}
