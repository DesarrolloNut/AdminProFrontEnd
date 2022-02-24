import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { EnrrollVendedorEntregaSupervisor } from '../models/Enrrollvendedorentregasupervisor';

@Component({
  selector: 'app-enrrollvendedorentregasupervisor-formulario',
  templateUrl: './enrrollvendedorentregasupervisor-formulario.component.html',
  styleUrls: ['./enrrollvendedorentregasupervisor-formulario.component.scss']
})
export class EnrrollvendedorentregasupervisorFormularioComponent implements OnInit {



  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingEmpleados: boolean;
  Empleados: any[];
  loadingRutasVendedor: boolean;
  RutasVendedor: any[];
  loadingRutasEntrega: boolean;
  RutasEntrega: any[];

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
    this.getEmpleados()
    this.getRutasVendedor();
    this.getRutasEntrega();
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      empleadoIdVendedor: [null, [Validators.required]], //tabla empleado
      rutaIdVendedor: [null, [Validators.required]],
      empleadoIdEntrega: [null, [Validators.required]],
      rutaIdEntrega: [null, [Validators.required]],
      empleadoIdSupervisor: [null, [Validators.required]],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<EnrrollVendedorEntregaSupervisor>(DataApi.EnrrollVendedorEntregaSupervisor,
      "GetEnrrollVendedorEntregaSupervisorByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Sintoma no encontrado");
            this.router.navigateByUrl('/mantenimientos/enrrollvendedorentregasupervisor');
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
    this.guardar();
  }


  guardar() {

    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<EnrrollVendedorEntregaSupervisor>(DataApi.EnrrollVendedorEntregaSupervisor,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/enrrollvendedorentregasupervisor');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  getEmpleados() {
    this.loadingEmpleados = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetEmpleados", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.Empleados = response.records;
        }
        this.loadingEmpleados = false;
      }, error => {
        this.loadingEmpleados = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getEmpleados()
        }, 1000);

      });
  }

  getRutasVendedor() {
    this.loadingRutasVendedor = true;
    let parametros: Parametro[] = [{ key: "tipoRuta", value: 1 }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.RutasVendedor = response.records;
        }
        this.loadingRutasVendedor = false;
      }, error => {
        this.loadingRutasVendedor = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutasVendedor()
        }, 1000);

      });
  }

  getRutasEntrega() {
    this.loadingRutasEntrega = true;
    let parametros: Parametro[] = [{ key: "tipoRuta", value: 2 }];
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetRutasComboBox", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.RutasEntrega = response.records;
        }
        this.loadingRutasEntrega = false;
      }, error => {
        this.loadingRutasEntrega = false;
        this.toastService.error("No se pudo obtener las categorias", "Error conexion al servidor");

        setTimeout(() => {
          this.getRutasEntrega()
        }, 1000);

      });
  }



}
