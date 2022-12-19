import { AutorizacionCotizacionComponent } from './cotizaciones/autorizacion-cotizacion/autorizacion-cotizacion.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CotizacionesFormularioComponent } from './cotizaciones/cotizaciones-formulario/cotizaciones-formulario.component';
import { CotizacionesListadoComponent } from './cotizaciones/cotizaciones-listado/cotizaciones-listado.component';
import { NotacreditoFormularioComponent } from './notacredito/notacredito-formulario/notacredito-formulario.component';
import { NotacreditoListadoComponent } from './notacredito/notacredito-listado/notacredito-listado.component';
import { OfertasConsultasFacturasComponent } from './ofertas/ofertas-consultas-facturas/ofertas-consultas-facturas.component';
import { ReporteprontopagoComponent } from './reporteprontopago/reporteprontopago.component';
import { VentasComponent } from './ventas.component';
import { PedidosEmpleadoFormularioComponent } from './pedidos-empleado/pedidos-empleado-formulario/pedidos-empleado-formulario.component';
import { PedidosEmpleadosListadoComponent } from './pedidos-empleado/pedidos-empleado-listado/pedidos-empleado-listado.component';
import { CotizacionesSeguimientoComponent } from './cotizaciones/cotizaciones-seguimiento/cotizaciones-seguimiento.component';
import { PedidosEmpleadoPedidoModalComponent } from './pedidos-empleado/pedidos-empleado-pedido-modal/pedidos-empleado-pedido-modal.component';
import { AutorizacionFacturaComponent } from './facturas/factura-cotizacion/autorizacion-factura.component';
import { FacturaSeguimientoComponent } from './facturas/factura-seguimiento/factura-seguimiento.component';
import { FacturaFormularioComponent } from './facturas/factura-formulario/factura-formulario.component';
import { FacturaListadoComponent } from './facturas/factura-listado/factura-listado.component';


const routes: Routes = [
  {
    path: '', component: VentasComponent,
    children: [



      {
        path: 'ofertas-consulta-factura', component: OfertasConsultasFacturasComponent, data: {
          title: 'Viacloud | Consulta de Ofertas',
          urls: [
            { title: 'Ventas' },
            { title: 'Consulta de Ofertas' }
          ]
        }
      },

      { path: 'reportes-de-ventas', loadChildren: () => import('./ventas-reportes/ventas-reportes.module').then(m => m.VentasReportesModule) },

      // Nota Credito
      {
        path: 'notacredito', component: NotacreditoListadoComponent, data: {
          title: 'Notas de Crédito',
          urls: [
            { title: 'Ventas' },
            { title: 'Notas de Crédito' },
          ]
        }
      },


      {
        path: 'notacredito/:id', component: NotacreditoFormularioComponent, data: {
          title: 'Nota Crédito Formulario',
          urls: [
            { title: 'Ventas' },
            { title: 'Notas de Crédito' },
            { title: 'Formulario' }
          ]
        }
      },

      // Cotizacion
      {
        path: 'cotizacion', component: CotizacionesListadoComponent, data: {
          title: 'Cotizaciones',
          urls: [
            { title: 'Ventas' },
            { title: 'Cotizaciones' },
          ]
        }
      },
      {
        path: 'cotizacion/:id', component: CotizacionesFormularioComponent, data: {
          title: 'Cotizaciones',
          urls: [
            { title: 'Ventas' },
            { title: 'Cotizaciones' },
            { title: 'Formulario' }

          ]
        }
      },
      {
        path: 'cotizacion-seguimiento', component: CotizacionesSeguimientoComponent, data: {
          title: 'Cotizaciones Seguimiento',
          urls: [
            { title: 'Ventas' },
            { title: 'Cotizaciones Seguimiento' },
          ]
        }
      },



      {
        path: 'pedidos-empleado', component: PedidosEmpleadosListadoComponent, data: {
          title: 'Pedidos Empleado',
          urls: [
            { title: 'Ventas' },
            { title: 'Pedidos Empleado' },
          ]
        },

      },
      {
        path: 'pedidos-empleado/:id', component: PedidosEmpleadoPedidoModalComponent, data: {
          title: 'Pedidos Empleado',
          urls: [
            { title: 'Ventas' },
            { title: 'Pedidos Empleado' },
            { title: 'Formulario' }
          ]
        }
      },
      //  ReporteProntoPago
      {
        path: 'reporteprontopago', component: ReporteprontopagoComponent, data: {
          title: 'ReporteProntoPago',
          urls: [
            { title: 'Ventas' },
            { title: 'Reporte de Ventas' },
            { title: 'ReporteProntoPago' },
          ]
        }
      },
      //  Autorizacion Cotizacion
      {
        path: 'autorizacioncotizacion', component: AutorizacionCotizacionComponent, data: {
          title: 'Autorizacion Cotizacion',
          urls: [
            { title: 'Autorizacion' },
            { title: 'Autorizacion Cotizacion' },
          ]
        }
      },
      // {
      //   path: 'cotizacion/:id', component: CotizacionesFormularioComponent, data: {
      //     title: 'ReporteProntoPago',
      //     urls: [
      //       { title: 'Ventas' },
      //       { title: 'ReporteProntoPago' },
      //       { title: 'Formulario' }

      //     ]
      //   }
      // },

   
      

        // Facturacion
        {
          path: 'factura', component: FacturaListadoComponent, data: {
            title: 'Facturas',
            urls: [
              { title: 'Ventas' },
              { title: 'Facturas' },
            ]
          }
        },
        {
          path: 'factura/:id', component: FacturaFormularioComponent, data: {
            title: 'Facturas',
            urls: [
              { title: 'Facturas' },
              { title: 'Facturas' },
              { title: 'Formulario' }
  
            ]
          }
        },
        {
          path: 'factura-seguimiento', component: FacturaSeguimientoComponent, data: {
            title: 'Facturas Seguimiento',
            urls: [
              { title: 'Facturas' },
              { title: 'Factura Seguimiento' },
            ]
          }
        },
        {
          path: 'autorizacionfactura', component: AutorizacionFacturaComponent, data: {
            title: 'Autorizacion Factura',
            urls: [
              { title: 'Autorizacion' },
              { title: 'Autorizacion Factura' },
            ]
          }
        },

    ]

  }];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VentasRoutingModule { }
