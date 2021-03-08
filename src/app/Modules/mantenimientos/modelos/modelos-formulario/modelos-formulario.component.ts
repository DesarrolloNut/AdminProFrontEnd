import { Component, OnInit } from '@angular/core';
import { Validators, FormGroup, FormBuilder } from '@angular/forms';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { Modelo } from '../models/Modelo';

@Component({
  selector: 'app-modelos-formulario',
  templateUrl: './modelos-formulario.component.html',
  styleUrls: ['./modelos-formulario.component.scss']
})
export class ModelosFormularioComponent implements OnInit {


  marcas: ComboBox[];

  Cargando: boolean = false;
  Formulario: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;
  loadingMarcas: boolean;



  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private router: Router,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getDataByID(id);
      this.actualizando = true;
    }

    this.getMarcas();
    this.CreateForm();
  }


  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      version: [null, [Validators.required]],
      marcaID: [null,[Validators.required]],
      precio: [0, [Validators.required,]],
      imagenNombre: [null,],
      descripcion: [null,],
      garantia: [null,],
      motor: [null,],
      transmision: [null,],
      tecnico: [null,],
      seguridad: [null,],
      estadoID: [0,],
      pcvID: [0,],
      ano: [0,],
    });
  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html



  getDataByID(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Modelo>(DataApi.Modelo,
      "GetModeloByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {
            let record = response.records[0]
            this.Formulario.setValue(record);
          } else {
            this.toastService.warning("Modelo no encontrado");
            this.router.navigateByUrl('/mantenimientos/modelo');
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
    this.enviarFormulario();
  }


  enviarFormulario() {
   
    let metodo: string = this.actualizando ? "Update" : "Registrar";
    this.btnGuardarCargando = true;

    this.httpService.DoPostAny<Modelo>(DataApi.Modelo,
      metodo, this.Formulario.value).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          this.router.navigateByUrl('/mantenimientos/modelo');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  
  getMarcas() {
    this.loadingMarcas = true;
    this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
      "GetMarcas", null).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.marcas = response.records;
        }
        this.loadingMarcas = false;
      }, error => {
        this.loadingMarcas = false;
        this.toastService.error("No se pudo obtener las marcas", "Error conexion al servidor");

        setTimeout(() => {
          this.getMarcas()
        }, 1000);

      });
  }










}
