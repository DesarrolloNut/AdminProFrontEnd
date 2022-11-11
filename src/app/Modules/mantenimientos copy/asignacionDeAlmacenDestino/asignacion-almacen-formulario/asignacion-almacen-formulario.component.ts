import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { UsuarioAlmacenEnrroll } from '../models/UsuarioAlmacenEnrroll';

@Component({
  selector: 'app-asignacion-almacen-formulario',
  templateUrl: './asignacion-almacen-formulario.component.html',
  styleUrls: ['./asignacion-almacen-formulario.component.scss']
})
export class AsignacionAlmacenFormularioComponent implements OnInit {
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
  almacenesOrigin: ComboBox[];
  almacenesDestino: ComboBox[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private auth:AuthenticationService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
    this.getAlmacenes()
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      almacenOrigin: [null, [Validators.required]],
      almacenDestino: [null, Validators.required],
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
          } else {
            this.toastService.warning("Enrroll no encontrado");
            this.router.navigateByUrl('/mantenimientos/asignacion-almacen');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  onSubmit() {

    this.submitted = true;
    if (this.Formulario.invalid) {
      return;
    }

    console.log(this.Formulario.value)

    //this.guardar();
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

  getAlmacenDestino(event:any){
    this.almacenesDestino=this.almacenesOrigin.filter(x=> x.codigo !== event.codigo)
  }

  getAlmacenes() {
    this.loadingAlmacenes = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetAlmacenes", null).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.almacenesOrigin = response.records;
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

}
