import { Component, OnInit } from '@angular/core';
import { RecepcionViewModel } from '../../servicios/recepcion/models/RecepcionViewMoodel';
import { ActivatedRoute, Router } from '@angular/router';
import { BackendService } from 'src/app/core/http/service/backend.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticationService } from 'src/app/core/authentication/service/authentication.service';
import { DataApi } from 'src/app/shared/enums/DataApi.enum';
import { ToastrService } from 'ngx-toastr';
import { MultipuntoRespuestaViewModel } from '../../servicios/recepcion/multipuntos/models/MultipuntoRespuestaViewModel';
import { ComboBox } from 'src/app/shared/model/ComboBox';

@Component({
  selector: 'app-consulta-cliente-recepcion',
  templateUrl: './consulta-cliente-recepcion.component.html',
  styleUrls: ['./consulta-cliente-recepcion.component.scss']
})
export class ConsultaClienteRecepcionComponent implements OnInit {

  // Cargando: boolean = false;
  // recepcion: RecepcionViewModel = new RecepcionViewModel();
  // citaIDEncriptada: string = "";
  // imageSrcSeleccionada: string = "";

  // loadingOpciones: boolean;
  // opciones: MultipuntoRespuestaViewModel[] = [];
  // loadingColores: boolean;
  // colores: ComboBox[] = [];
  // categoriasPadres: string[] = []
  // categoriasHijas: { "categoria": string, "categoriaPadre": string }[] = []
  // btnGuardarCargando: boolean;

  // constructor(
  //   private route: ActivatedRoute,
  //   private httpService: BackendService,
  //   private router: Router,
  //   private toastService: ToastrService,
  //   private modalService: NgbModal,) { }


  ngOnInit() {


  }

  // //Al darle clic al boton de la camara del vehiculo
  // openLg(content, ImageSrc: string) {
  //   this.imageSrcSeleccionada = ImageSrc;
  //   this.modalService.open(content, { size: 'lg' });
  // }

  // getRecepcionByCitaID(citaID: string) {

  //   this.Cargando = true;

  //   this.httpService.DoPostAny<RecepcionViewModel>(DataApi.Recepcion,
  //     "GetRecepcionReporte", Number(citaID)).subscribe(response => {

  //       if (!response.ok) {
  //         this.router.navigateByUrl("error/404");
  //         // this.toastr.error("Error interno en el servidor.", "Error interno.")
  //         console.log(response.errores[0])
  //       } else {
  //         if (response.records != null && response.records.length > 0) {
  //           this.recepcion = response.records[0];
  //         } else {
  //           this.router.navigateByUrl("error/404");
  //         }
  //       }
  //       this.Cargando = false;

  //     }, error => {
  //       this.Cargando = false;
  //       this.router.navigateByUrl("error/505");
  //       this.toastService.error("No se pudo obtener el reporte.", "Error conexión servidor.");
  //     });
  // }



  // getMultipuntoColores() {
  //   this.loadingColores = true;

  //   this.httpService.DoPost<ComboBox>(DataApi.ComboBox,
  //     "GetMultipuntoColores", null).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error("Error colores", response.errores[0]);
  //       } else {
  //         this.colores = response.records;
  //       }

  //       this.loadingColores = false;
  //     }, error => {

  //       setTimeout(() => {
  //         this.getMultipuntoColores()
  //       }, 1000);

  //       console.error(error)
  //       this.loadingColores = false;
  //       this.toastService.error("Error conexion al servidor");
  //     });
  // }


  // getMultipuntoRespuestas() {
  //   this.loadingOpciones = true;
  //   this.httpService.DoPostAny<MultipuntoRespuestaViewModel>(DataApi.Multipunto,
  //     "GetMultipuntoRespuestas", Number(this.citaIDEncriptada)).subscribe(response => {

  //       if (!response.ok) {
  //         this.toastService.error(response.errores[0]);
  //       } else {
  //         console.table(response.records)
  //         this.opciones = response.records
  //         this.formatearOpciones()
  //       }
  //       this.loadingOpciones = false;

  //     }, error => {

  //       setTimeout(() => {
  //         this.getMultipuntoRespuestas()
  //       }, 1000);

  //       this.loadingOpciones = false;
  //       this.toastService.error("Multipuntos", "Error conexion al servidor");
  //     });
  // }

  // formatearOpciones() {
  //   // this.opciones.forEach(x => x.respuesta1 = 1)
  //   this.categoriasPadres = Array.from(new Set(this.opciones.map(x => x.categoriaPadre)))
  //   this.categoriasPadres.forEach(cp => {

  //     let categoriaHijasNombres = Array.from(new Set(this.opciones.filter(x => x.categoriaPadre == cp).map(x => x.categoria)));
  //     categoriaHijasNombres.forEach(chn => this.categoriasHijas.push({ "categoria": chn, "categoriaPadre": cp }))
  //   })

  // }



}
