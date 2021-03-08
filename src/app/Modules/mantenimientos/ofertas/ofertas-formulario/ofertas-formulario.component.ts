import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { Parametro } from 'src/app/core/http/model/Parametro';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { Articulo } from 'src/app/Modules/servicios/recepcion/models/Articulo';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ComboBox } from 'src/app/shared/model/ComboBox';
import { Oferta } from '../models/Oferta';
import { OfertaArticuloEnrroll } from '../models/OfertaArticuloEnrroll';
import { OfertaArticuloPromocionEnrroll } from '../models/OfertaArticuloPromocionEnrroll';

@Component({
  selector: 'app-ofertas-formulario',
  templateUrl: './ofertas-formulario.component.html',
  styleUrls: ['./ofertas-formulario.component.scss']
})
export class OfertasFormularioComponent implements OnInit {
  Cargando: boolean = false;
  Formulario: FormGroup;
  FormularioArticulo: FormGroup;
  FormularioArticuloPromocion: FormGroup;
  submitted = false;
  btnGuardarCargando = false;
  actualizando = false;

  articulos: Articulo[] = []
  loadingArticulos: boolean;

  submittedArticulo = false;
  indexArticuloSeleccionado: number;
  actualizandoArticulo = false;

  submittedArticuloPromocion = false;
  indexArticuloPromocionSeleccionado: number;
  actualizandoArticuloPromocion = false;

  ofertaArticulos: OfertaArticuloEnrroll[] = [];
  ofertaArticulosPromocion: OfertaArticuloPromocionEnrroll[] = []


  margenGeneralOrferta: number = 0

  estados: ComboBox[] = []
  edicionBloqueada: boolean;
  canSubmitForm: boolean = true;

  constructor(
    private toastService: ToastrService,
    private route: ActivatedRoute,
    private httpService: BackendService,
    private modalService: NgbModal,
    private router: Router,
    private authService: AuthenticationService,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {

    let cb1 = new ComboBox();
    let cb2 = new ComboBox();

    cb1.codigo = 0;
    cb1.nombre = 'No autorizada'

    cb2.codigo = 1;
    cb2.nombre = 'Autorizada'

    this.estados.push(cb1)
    this.estados.push(cb2)

    let id = Number(this.route.snapshot.paramMap.get('id'));

    if (id > 0) {
      this.getItem(id);
      this.actualizando = true;
    }
    this.CreateForm();
    this.getArticulos();
  }

  openModal(content) {
    this.modalService.open(content, { backdrop: 'static', keyboard: false });
  }

  private CreateForm() {

    this.Formulario = this.formBuilder.group({
      id: [0],
      nombre: [null, [Validators.required]],
      descripcion: ["",],
      margenPorciento: [0],
      estadoID: [0],
      fechaInicio: [null, [Validators.required]],
      fechaFinal: [null, [Validators.required]],
    });

    this.FormularioArticulo = this.formBuilder.group({
      id: [0],
      ofertaID: [0],
      articuloID: [null, [Validators.required]],
      cantidad: [null, [Validators.required]],
      descuentoMinPorcentaje: [null, [Validators.required]],
      costoProyectado: [0],
      margen: [0],
      articuloNombre: [null, [Validators.required]],
      costoArticulo: [0, [Validators.required]],
      precioArticulo: [0, [Validators.required]],

    });

    this.FormularioArticuloPromocion = this.formBuilder.group({
      id: [0],
      ofertaID: [0],
      articuloID: [null, [Validators.required]],
      articuloPromocionID: [null, [Validators.required]],
      cantidad: [null, [Validators.required]],
      precio: [null, [Validators.required]],
      total: [null, [Validators.required]],
      costoArticulo: [0, [Validators.required]],
      articuloNombre: [null, [Validators.required]],
    });

  }

  get f() { return this.Formulario.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  get fa() { return this.FormularioArticulo.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html

  get fap() { return this.FormularioArticuloPromocion.controls; } // acceder a los controles del formulario para no escribir tanto codigo en el html



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


    let parametro = {
      "Oferta": this.Formulario.value,
      "OfertaArticulos": this.ofertaArticulos,
      "OfertaArticuloPromociones": this.ofertaArticulosPromocion,
    }
    console.log(parametro)
    this.httpService.DoPostAny<Oferta>(DataApi.Oferta,
      metodo, parametro).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0], "Error");
        } else {
          this.toastService.success("Realizado", "OK");
          let ofertaid = response.valores[0];

          this.getOfertaToSendSmart(ofertaid);

          this.router.navigateByUrl('/mantenimientos/oferta');
        }

        this.btnGuardarCargando = false;
      }, error => {
        this.btnGuardarCargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  getOfertaToSendSmart(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<any>(DataApi.Oferta,
      "GetOfertaByIDSmart", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let oferta = response.records[0]
            let ofertaArticulos = response.valores[0]
            let ofertaArticulosPromocion = response.valores[1]

            oferta.articuloEnrroll = JSON.stringify(ofertaArticulos)
            oferta.articuloPromocion = JSON.stringify(ofertaArticulosPromocion)

            this.enviarOfertaASmart(oferta);

          } else {
            this.toastService.warning("Oferta no encontrado");
            this.router.navigateByUrl('/mantenimientos/oferta');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }


  enviarOfertaASmart(oferta) {
    console.log(oferta)
    this.Cargando = true;
    this.httpService.DoPostSmartWebService("InsertaOfertaWeb", "inserta_Ofertas", oferta).subscribe(response => {
      let mensajeRespuesta = response.d + '';
      console.log(response)

      if (mensajeRespuesta.includes("Error")) {
        this.Cargando = false;
        this.toastService.error(mensajeRespuesta, "Smart Servicio");
        return;
      }
      this.toastService.success("Oferta registrada en Smart.", "Smart Servicio");
      // this.asignarCodigoReferenciaCliente(Number(clienteID), mensajeRespuesta);

    }, error => {
      this.Cargando = false;
      console.error(error)
      this.toastService.error("Error conexion al servidor", "Smart Servicio");
    });
  }











  openArticuloModal(modal: any, articulo: OfertaArticuloEnrroll = new OfertaArticuloEnrroll(), actualizandoArticulo: boolean = false, index = 0) {
    this.submittedArticulo = false;

    this.getArticulos(null, articulo.articuloID)

    this.actualizandoArticulo = actualizandoArticulo;
    this.indexArticuloSeleccionado = index;
    this.FormularioArticulo.setValue(articulo);
    this.openModal(modal);
  }


  onSubmitArticulo() {

    this.submittedArticulo = true;
    if (this.FormularioArticulo.invalid) {
      return;
    }

    if (!this.actualizandoArticulo && this.ofertaArticulos.some(a => a.articuloID == this.fa.articuloID.value)) {
      this.toastService.warning("Ya este artículo existe en esta oferta.");
      return;
    }

    this.guardarArticuloToArray();
  }

  guardarArticuloToArray() {

    if (this.actualizandoArticulo) {
      this.ofertaArticulos[this.indexArticuloSeleccionado] = this.FormularioArticulo.value;
    } else {
      this.ofertaArticulos.push(this.FormularioArticulo.value);
    }
    this.calcularCostoProyectado()
    // this.calcularMargenGanancia()
    this.modalService.dismissAll()
  }

  onArticuloOfertaComboboxChange(articulo: Articulo) {

    this.fa.articuloNombre.setValue(articulo.nombre)
    this.fa.costoArticulo.setValue(articulo.costo)
    this.fa.precioArticulo.setValue(articulo.precio)
  }

  onDeleteOfertaArticulo(index: number, art: OfertaArticuloEnrroll) {
    this.ofertaArticulos.splice(index, 1);
    this.ofertaArticulosPromocion = this.ofertaArticulosPromocion.filter(x => x.articuloID != art.articuloID)
    this.calcularCostoProyectado()
    // this.calcularMargenGanancia()
  }








  openArticuloPromocionModal(articulo: OfertaArticuloEnrroll, modal: any, articuloPromocion: OfertaArticuloPromocionEnrroll = new OfertaArticuloPromocionEnrroll(), actualizandoArticuloPromocion: boolean = false, index = 0) {
    this.submittedArticuloPromocion = false;
    articuloPromocion.articuloID = articulo.articuloID;

    this.getArticulos(null, articuloPromocion.articuloPromocionID)

    this.actualizandoArticuloPromocion = actualizandoArticuloPromocion;
    this.indexArticuloPromocionSeleccionado = index;
    this.FormularioArticuloPromocion.setValue(articuloPromocion);
    this.openModal(modal);
  }

  onSubmitArticuloPromocion() {

    this.submittedArticuloPromocion = true;
    if (this.FormularioArticuloPromocion.invalid) {
      return;
    }

    if (!this.actualizandoArticuloPromocion && this.ofertaArticulosPromocion.some(a => a.articuloID == this.fap.articuloID.value && a.articuloPromocionID == this.fap.articuloPromocionID.value)) {
      this.toastService.warning("Ya este artículo existe en esta oferta.");
      return;
    }

    this.guardarArticuloPromocionToArray();
  }

  guardarArticuloPromocionToArray() {

    if (this.actualizandoArticuloPromocion) {
      this.ofertaArticulosPromocion[this.indexArticuloPromocionSeleccionado] = this.FormularioArticuloPromocion.value;
    } else {
      this.ofertaArticulosPromocion.push(this.FormularioArticuloPromocion.value);
    }
    this.calcularCostoProyectado()
    // this.calcularMargenGanancia()
    this.modalService.dismissAll()
  }

  onArticuloPromocionOfertaComboboxChange(articulo: Articulo) {

    this.fap.articuloNombre.setValue(articulo.nombre)
    this.fap.precio.setValue(articulo.precio)
    this.fap.costoArticulo.setValue(articulo.costo)
  }

  onDeleteOfertaArticuloPromocion(index: number) {
    this.ofertaArticulosPromocion.splice(index, 1);
    this.calcularCostoProyectado()
    // this.calcularMargenGanancia()
  }


  calcularCostoProyectado() {
    this.ofertaArticulosPromocion.forEach(x => x.total = x.cantidad * x.costoArticulo);

    this.ofertaArticulos.forEach(a => {

      let articulosPromocion = this.ofertaArticulosPromocion.filter(ap => ap.articuloID == a.articuloID);

      let artPromoTotales = articulosPromocion.map(artp => artp.total).reduce((sum, current) => sum + current, 0);
      a.costoProyectado = artPromoTotales + (a.costoArticulo * a.cantidad);
    })

    this.calcularMargenGanancia()

  }


  calcularMargenGanancia() {
    this.ofertaArticulos.forEach(a => {

      let subTotal = a.precioArticulo * a.cantidad;
      let descuento = subTotal * (a.descuentoMinPorcentaje / 100)
      let totalNeto = subTotal - descuento;
      a.margen = ((totalNeto - a.costoProyectado) / totalNeto) * 100
    })

    let totalArticulos = this.ofertaArticulos.map(a => (a.precioArticulo * a.cantidad) - ((a.precioArticulo * a.cantidad) * (a.descuentoMinPorcentaje / 100))).reduce((sum, current) => sum + current, 0);
    let totalCostosProyectados = this.ofertaArticulos.map(a => (a.costoArticulo * a.cantidad)).reduce((sum, current) => sum + current, 0);
    totalCostosProyectados += this.ofertaArticulosPromocion.map(a => (a.precio * a.cantidad)).reduce((sum, current) => sum + current, 0);

    this.margenGeneralOrferta = ((totalArticulos - totalCostosProyectados) / totalArticulos) * 100;
    this.f.margenPorciento.setValue(this.margenGeneralOrferta);

  }


  getItem(id: number) {
    this.Cargando = true;
    this.httpService.DoPostAny<Oferta>(DataApi.Oferta,
      "GetOfertaByID", id).subscribe(response => {
        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          //validar que existe
          if (response != null && response.records != null && response.records.length > 0) {

            let record = response.records[0]
            this.Formulario.setValue(record);

            if (record.estadoID == 1) {
              this.canSubmitForm = false;
              this.edicionBloqueada = true;
            }

            this.ofertaArticulos = response.valores[0];
            this.ofertaArticulosPromocion = response.valores[1];
            this.calcularCostoProyectado()
          } else {
            this.toastService.warning("Oferta no encontrado");
            this.router.navigateByUrl('/mantenimientos/oferta');
          }
        }

      }, error => {
        this.Cargando = false;
        this.toastService.error("Error conexion al servidor");
      });
  }

  habilitaEdicion() {
    this.edicionBloqueada = false;
    this.canSubmitForm = true;
  }


  getArticulos(searchObj: any = null, articuloID: number = 0) {
    let search = ""

    if (searchObj)
      search = searchObj.term;

    this.loadingArticulos = true;
    let parametros: Parametro[] = [
      { key: "CompaniaID", value: this.authService.tokenDecoded.primarygroupsid },
      { key: "Search", value: search },
      { key: "articuloID", value: articuloID },
    ];
    this.httpService.DoPost<Articulo>(DataApi.Articulo,
      "GetArticulos", parametros).subscribe(response => {

        if (!response.ok) {
          this.toastService.error(response.errores[0]);
        } else {
          this.articulos = response.records;
        }

        this.loadingArticulos = false;
      }, error => {
        this.loadingArticulos = false;
        this.toastService.error("Obtener Articulos", "Error conexion al servidor");

        setTimeout(() => {
          this.getArticulos(searchObj, articuloID);
        }, 1000);

      });
  }




}
