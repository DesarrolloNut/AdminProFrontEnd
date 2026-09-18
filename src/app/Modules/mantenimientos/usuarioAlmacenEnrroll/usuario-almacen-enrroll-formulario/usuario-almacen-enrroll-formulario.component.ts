import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { UsuarioAlmacenEnrroll } from '../models/UsuarioAlmacenEnrroll';
import { Parametro } from 'src/app/core/http/model/Parametro';

@Component({
  selector: 'app-usuario-almacen-enrroll-formulario',
  templateUrl: './usuario-almacen-enrroll-formulario.component.html',
  styleUrls: ['./usuario-almacen-enrroll-formulario.component.scss']
})
export class UsuarioAlmacenEnrrollFormularioComponent implements OnInit {
  companias: ComboBox[] = [];

  loadingCompanias = false;

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  usuarios: ComboBox[];
  loadingUsuarios: boolean;
  loadingAlmacenes: boolean;
  almacenes: ComboBox[];
  loadingNivelAutorizacionCategorias: boolean;
  NivelAutorizacionCategorias: ComboBox[];
  moduloSeleccionado:number;
  mostrarAcceso: string="";
  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private auth:AuthenticationService,
    private authService: AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.GetNivelAutorizacionModuloComboBox()
      this.getItem(id);
      this.actualizando = true;
    }

    this.getUsuarios()
    this.getAlmacenes()
    this.GetNivelAutorizacionModuloComboBox()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      usuarioID: [null, [Validators.required]],
      almacenID: [null, Validators.required],
      moduloID: [null, Validators.required],
      predeterminado: [false],
      validarInventario:[true],
      enviar:[true],
      recibir:[true],
      companiaID: [Number(this.auth.tokenDecoded.primarygroupsid),],
    });
  }


  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<UsuarioAlmacenEnrroll>(DataApi.UsuarioAlmacenEnrroll,
      "GetUsuarioAlmacenEnrrollByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
            this.mostrarAcceso= this.NivelAutorizacionCategorias.find(X=>X.codigo==record.moduloID).nombre;
          
          } else {
            this.toastService.warning("Enrroll no encontrado");
            this.router.navigateByUrl('/mantenimientos/usuario-almacen-enrroll');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  changeFn(moduloID){
    
    this.mostrarAcceso= this.NivelAutorizacionCategorias.find(X=>X.codigo==moduloID).nombre;
  }
  onSubmit() {

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }
    this.guardar();
    
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<UsuarioAlmacenEnrroll>(DataApi.UsuarioAlmacenEnrroll,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/usuario-almacen-enrroll');
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
      "GetAlmacenes", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenes = response.records;
        }
        this.loadingAlmacenes = false;
      }, error => {
        this.loadingAlmacenes = false;
        this.toastService.error("No se pudo obtener los almacenes", "Error conexion al servidor");

        setTimeout(() => {
          this.getAlmacenes()
        }, 1000);

      });
  }

  GetNivelAutorizacionModuloComboBox() {
    let param: Parametro[] = [{ key: "companiaId", value: this.authService.tokenDecoded.primarygroupsid }]
    this.loadingNivelAutorizacionCategorias = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetPermisosAlmacen", param).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.NivelAutorizacionCategorias = response.records;

        }
        this.loadingNivelAutorizacionCategorias = false;
      }, error => {
        this.loadingNivelAutorizacionCategorias = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.GetNivelAutorizacionModuloComboBox()
        }, 1000);

      });
  }

  getUsuarios() {
    this.loadingUsuarios = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetUsuarios", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.usuarios = response.records;
        }
        this.loadingUsuarios = false;
      }, error => {
        this.loadingUsuarios = false;
        this.toastService.error("No se pudo obtener los usuarios", "Error conexion al servidor");

        setTimeout(() => {
          this.getUsuarios();
        }, 1000);

      });
  }



}
