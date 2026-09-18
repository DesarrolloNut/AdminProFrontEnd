import { NgModule } from '@angular/core';

import { AngularDualListBoxModule } from 'angular-dual-listbox';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import { CommonModule } from '@angular/common';
import { MantenimientosRoutingModule } from './mantenimientos-routing.module';
import { MantenimientosComponent } from './mantenimientos.component';
import { ComiteComponent } from './comite/comite.component';
import { SharedModule } from '../shared/shared.module';
import { UsuarioListadoComponent } from './usuarios/usuario-listado/usuario-listado.component';
import { UsuarioFormularioComponent } from './usuarios/usuario-formulario/usuario-formulario.component';
import { ClientesListadoComponent } from './clientes/clientes-listado/clientes-listado.component';
import { ClientesFormularioComponent } from './clientes/clientes-formulario/clientes-formulario.component';
import { MarcasListadoComponent } from './marcas/marcas-listado/marcas-listado.component';
import { MarcasFormularioComponent } from './marcas/marcas-formulario/marcas-formulario.component';
import { ModelosListadoComponent } from './modelos/modelos-listado/modelos-listado.component';
import { ModelosFormularioComponent } from './modelos/modelos-formulario/modelos-formulario.component';
import { DealersListadoComponent } from './dealers/dealers-listado/dealers-listado.component';
import { DealersFormularioComponent } from './dealers/dealers-formulario/dealers-formulario.component';
import { AlmacenesListadoComponent } from './almacenes/almacenes-listado/almacenes-listado.component';
import { AlmacenesFormularioComponent } from './almacenes/almacenes-formulario/almacenes-formulario.component';
import { VehiculoTiposListadoComponent } from './vehiculoTipos/vehiculo-tipos-listado/vehiculo-tipos-listado.component';
import { VehiculoTiposFormularioComponent } from './vehiculoTipos/vehiculo-tipos-formulario/vehiculo-tipos-formulario.component';
import { CombustiblesListadoComponent } from './combustibles/combustibles-listado/combustibles-listado.component';
import { CombustiblesFormularioComponent } from './combustibles/combustibles-formulario/combustibles-formulario.component';
import { VehiculoCondicionesListadoComponent } from './vehiculoCondiciones/vehiculo-condiciones-listado/vehiculo-condiciones-listado.component';
import { VehiculoCondicionesFormularioComponent } from './vehiculoCondiciones/vehiculo-condiciones-formulario/vehiculo-condiciones-formulario.component';
import { TagsListadoComponent } from './tags/tags-listado/tags-listado.component';
import { TagsFormularioComponent } from './tags/tags-formulario/tags-formulario.component';
import { ReceptoresPosicionesListadoComponent } from './receptoresPosiciones/receptores-posiciones-listado/receptores-posiciones-listado.component';
import { ReceptoresPosicionesFormularioComponent } from './receptoresPosiciones/receptores-posiciones-formulario/receptores-posiciones-formulario.component';
import { CompaniasListadoComponent } from './companias/companias-listado/companias-listado.component';
import { CompaniasFormularioComponent } from './companias/companias-formulario/companias-formulario.component';
import { SucursalesListadoComponent } from './sucursales/sucursales-listado/sucursales-listado.component';
import { SucursalesFormularioComponent } from './sucursales/sucursales-formulario/sucursales-formulario.component';
import { CitaCategoriaListadoComponent } from './citaCategorias/cita-categoria-listado/cita-categoria-listado.component';
import { CitaCategoriaFormularioComponent } from './citaCategorias/cita-categoria-formulario/cita-categoria-formulario.component';
import { SintomasListadoComponent } from './sintomas/sintomas-listado/sintomas-listado.component';
import { SintomasFormularioComponent } from './sintomas/sintomas-formulario/sintomas-formulario.component';
import { AccesoriosListadoComponent } from './accesorios/accesorios-listado/accesorios-listado.component';
import { AccesoriosFormularioComponent } from './accesorios/accesorios-formulario/accesorios-formulario.component';
import { SintomasCategoriasListadoComponent } from './sintomasCategorias/sintomas-categorias-listado/sintomas-categorias-listado.component';
import { SintomasCategoriasFormularioComponent } from './sintomasCategorias/sintomas-categorias-formulario/sintomas-categorias-formulario.component';
import { ArticuloListadoComponent } from './articulos/articulo-listado/articulo-listado.component';
import { ArticuloFormularioComponent } from './articulos/articulo-formulario/articulo-formulario.component';
import { RecallListadoComponent } from './recall/recall-listado/recall-listado.component';
import { RecallFormularioComponent } from './recall/recall-formulario/recall-formulario.component';
import { OfertasListadoComponent } from './ofertas/ofertas-listado/ofertas-listado.component';
import { OfertasFormularioComponent } from './ofertas/ofertas-formulario/ofertas-formulario.component';
import { ListaPreciosListadoComponent } from './listaPrecios/lista-precios-listado/lista-precios-listado.component';
import { ListaPreciosFormularioComponent } from './listaPrecios/lista-precios-formulario/lista-precios-formulario.component';
import { RutasListadoComponent } from './rutas/rutas-listado/rutas-listado.component';
import { RutasFormularioComponent } from './rutas/rutas-formulario/rutas-formulario.component';
import { NgbdtabsBasicComponent } from 'src/app/component/tabs/tabs.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { NivelAutorizacionListadoComponent } from './nivelautorizacion/nivel-autorizacion-listado/nivel-autorizacion-listado.component';
import { NivelAutorizacionFormularioComponent } from './nivelautorizacion/nivel-autorizacion-formulario/nivel-autorizacion-formulario.component';
import { EstadosGeneralesListadoComponent } from './estadosgenerales/estados-generales-listado/estados-generales-listado.component';
import { EstadosGeneralesFormularioComponent } from './estadosgenerales/estados-generales-formulario/estados-generales-formulario.component';
import { NivelAutorizacionModuloFormularioComponent } from './NivelAutorizacionModulo/nivel-autorizacion-modulo-formulario/nivel-autorizacion-modulo-formulario.component';
import { NivelAutorizacionModuloListadoComponent } from './NivelAutorizacionModulo/nivel-autorizacion-modulo-listado/nivel-autorizacion-modulo-listado.component';
import { RolesListadoComponent } from './roles/roles-listado/roles-listado.component';
import { RolesFormularioComponent } from './roles/roles-formulario/roles-formulario.component';
import { SapconnectionListadoComponent } from './sapconnection/sapconnection-listado/sapconnection-listado.component';
import { SapconnectionFormularioComponent } from './sapconnection/sapconnection-formulario/sapconnection-formulario.component';

import { PermisosListadoComponent } from './permisos/permisos-listado/permisos-listado.component';
import { PermisosFormularioComponent } from './permisos/permisos-formulario/permisos-formulario.component';
import { PerfilFormularioComponent } from './perfil-formulario/perfil-formulario.component';

import { TreeviewModule } from 'ngx-treeview';
import { CargaMasivaPanelComponent } from './cargaMasiva/carga-masiva-panel/carga-masiva-panel.component';
import { MonedasListadoComponent } from './monedas/monedas-listado/monedas-listado.component';

import { MonedasFormularioComponent } from './monedas/monedas-formulario/monedas-formulario.component';
import { DepartamentosFormularioComponent } from './departamentos/departamentos-formulario/departamentos-formulario.component';
import { DepartamentosListadoComponent } from './departamentos/departamentos-listado/departamentos-listado.component';
import { ProveedoresListadoComponent } from './proveedores/proveedores-listado/proveedores-listado.component';
import { ProveedoresFormularioComponent } from './proveedores/proveedores-formulario/proveedores-formulario.component';
import { ActividadesEconomicasListadoComponent } from './actividadesEconomicas/actividades-economicas-listado/actividades-economicas-listado.component';
import { ActividadesEconomicasFormularioComponent } from './actividadesEconomicas/actividades-economicas-formulario/actividades-economicas-formulario.component';

import { EnrrollvendedorentregasupervisorListadoComponent } from './enrrollvendedorentregasupervisor/enrrollvendedorentregasupervisor-listado/enrrollvendedorentregasupervisor-listado.component';
import { EnrrollvendedorentregasupervisorFormularioComponent } from './enrrollvendedorentregasupervisor/enrrollvendedorentregasupervisor-formulario/enrrollvendedorentregasupervisor-formulario.component';

import { UsuarioAlmacenEnrrollListadoComponent } from './usuarioAlmacenEnrroll/usuario-almacen-enrroll-listado/usuario-almacen-enrroll-listado.component';
import { UsuarioAlmacenEnrrollFormularioComponent } from './usuarioAlmacenEnrroll/usuario-almacen-enrroll-formulario/usuario-almacen-enrroll-formulario.component';
import { TomainventarioRutaListadoComponent } from './tomainventarioruta/tomainventarioruta-listado/tomainventarioruta-listado.component';
import { ArticulosCategoriasListadoComponent } from './articulosCategorias/articulos-categorias-listado/articulos-categorias-listado.component';
import { ArticulosCategoriasFormularioComponent } from './articulosCategorias/articulos-categorias-formulario/articulos-categorias-formulario.component';


import { ClienteVisitasComponent } from './clientes/cliente-visitas/cliente-visitas.component';
import { ClienteFinanzasComponent } from './clientes/cliente-finanzas/cliente-finanzas.component';
import { ClienteContactosComponent } from './clientes/cliente-contactos/cliente-contactos.component';
import { ClienteDatosGeneralesComponent } from './clientes/cliente-datos-generales/cliente-datos-generales.component';
import { AgmCoreModule } from '@agm/core';
import { ClienteMapComponent } from './clientes/cliente-map/cliente-map.component';

import { PlazosListadoComponent } from './plazos/plazos-listado/plazos-listado.component';
import { PlazosFormularioComponent } from './plazos/plazos-formulario/plazos-formulario.component';
import { ClienteComercialComponent } from './clientes/cliente-comercial/cliente-comercial.component';
import { ClienteNegocioComponent } from './clientes/cliente-negocio/cliente-negocio.component';
import { ComprobanteFiscalListadoComponent } from './comprobanteFiscal/comprobante-fiscal-listado/comprobante-fiscal-listado.component';
import { ComprobanteFiscalFormularioComponent } from './comprobanteFiscal/comprobante-fiscal-formulario/comprobante-fiscal-formulario.component';

import { ImageCropperModule } from 'ngx-image-cropper';
import { HoraPickingListadoComponent } from './horaPicking/hora-picking-listado/hora-picking-listado.component';
import { AsignacionAlmacenListadoComponent } from './asignacionDeAlmacenDestino/asignacion-almacen-listado/asignacion-almacen-listado.component';
import { AsignacionAlmacenFormularioComponent } from './asignacionDeAlmacenDestino/asignacion-almacen-formulario/asignacion-almacen-formulario.component';
import { HoraPickingFormularioComponent } from './horaPicking/hora-picking-formulario/hora-picking-formulario.component';
import { ComprobanteFiscalEnrollListadoComponent } from './comprobanteFiscalEnrroll/comprobante-fiscal-enroll-listado/comprobante-fiscal-enroll-listado.component';
import { ComprobanteFiscalEnrollFormularioComponent } from './comprobanteFiscalEnrroll/comprobante-fiscal-enroll-formulario/comprobante-fiscal-enroll-formulario.component';
import { TipoComprobanteFiscaFormularioComponent } from './tipoComprobanteFiscal/tipo-comprobante-fiscal-formulario/tipo-comprobante-fiscal-formulario.component';
import { TipoComprobanteFiscalListadoComponent } from './tipoComprobanteFiscal/tipo-comprobante-fiscal-listado/tipo-comprobante-fiscal-listado.component';
import { ModuloFormularioComponent } from './modulos/modulo-formulario/modulo-formulario.component';
import { ModuloListadoComponent } from './modulos/modulo-listado/modulo-listado.component';
import { TipoSolicitudDevolucionListadoComponent } from './tipoSolicitudDevolucion/tipoSolicitudDevolucion-listado/tipoSolicitudDevolucion-listado.component';
import { TipoSolicitudDevolucionFormularioComponent } from './tipoSolicitudDevolucion/tipoSolicitudDevolucion-formulario/tipoSolicitudDevolucion-formulario.component';
import { ConfiguracionCompaniaListadoComponent } from './configuracionCompania/configuracion-compania-listado/configuracion-compania-listado.component';
import { ConfiguracionCompaniaFormularioComponent } from './configuracionCompania/configuracion-compania-formulario/configuracion-compania-formulario.component';
import { TipoDescuentoFormularioComponent } from './tipoDescuento/tipo-descuento-formulario/tipo-descuento-formulario.component';
import { TipoDescuentoListadoComponent } from './tipoDescuento/tipo-descuento-listado/tipo-descuento-listado.component';
import { DescuentoArticulosFormularioComponent } from './descuento-articulos/descuento-articulos-formulario/descuento-articulos-formulario.component';
import { DescuentoArticulosListadoComponent } from './descuento-articulos/descuento-articulos-listado/descuento-articulos-listado.component';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { PromocionFormularioComponent } from './promocion/promociones-formulario/promocion-formulario.component';
import { PromocionListadoComponent } from './promocion/promociones-listado/promocion-listado.component';





@NgModule({
  declarations: [
    NgbdtabsBasicComponent,
    MantenimientosComponent, ComiteComponent,
    UsuarioListadoComponent, UsuarioFormularioComponent, ClientesListadoComponent,
    ClientesFormularioComponent, ClienteComercialComponent, ClienteNegocioComponent, ClienteVisitasComponent, ClienteFinanzasComponent,
    ClienteContactosComponent, ClienteDatosGeneralesComponent, ClienteMapComponent, MarcasListadoComponent, MarcasFormularioComponent,
    ModelosListadoComponent, ModelosFormularioComponent, DealersListadoComponent, DealersFormularioComponent,
    AlmacenesListadoComponent, AlmacenesFormularioComponent, VehiculoTiposListadoComponent, VehiculoTiposFormularioComponent,
    CombustiblesListadoComponent, CombustiblesFormularioComponent, VehiculoCondicionesListadoComponent, VehiculoCondicionesFormularioComponent,
    TagsListadoComponent, TagsFormularioComponent, ReceptoresPosicionesListadoComponent, ReceptoresPosicionesFormularioComponent,
    CompaniasListadoComponent, CompaniasFormularioComponent, SucursalesListadoComponent, SucursalesFormularioComponent, CitaCategoriaListadoComponent,
    CitaCategoriaFormularioComponent, SintomasListadoComponent, SintomasFormularioComponent, AccesoriosListadoComponent,
    AccesoriosFormularioComponent, SintomasCategoriasListadoComponent, SintomasCategoriasFormularioComponent, ArticuloListadoComponent,
    ArticuloFormularioComponent, RecallListadoComponent, RecallFormularioComponent, OfertasListadoComponent, OfertasFormularioComponent,
    ListaPreciosListadoComponent, ListaPreciosFormularioComponent, RutasListadoComponent, RutasFormularioComponent,
    NivelAutorizacionListadoComponent, NivelAutorizacionFormularioComponent, EstadosGeneralesListadoComponent, EstadosGeneralesFormularioComponent,
    NivelAutorizacionModuloFormularioComponent, NivelAutorizacionModuloListadoComponent, RolesListadoComponent, RolesFormularioComponent,
    AsignacionAlmacenListadoComponent,
    AsignacionAlmacenFormularioComponent,
    HoraPickingFormularioComponent,
    ModuloFormularioComponent,
    SapconnectionListadoComponent,
    SapconnectionFormularioComponent,
 
    PermisosListadoComponent,
    PermisosFormularioComponent,
    PerfilFormularioComponent,
    ComprobanteFiscalEnrollListadoComponent,
    ComprobanteFiscalEnrollFormularioComponent,
    CargaMasivaPanelComponent,
    MonedasListadoComponent,
    HoraPickingListadoComponent,
    ModuloListadoComponent,
    MonedasFormularioComponent,
    DepartamentosFormularioComponent,
    DepartamentosListadoComponent,
    ProveedoresListadoComponent,
    ProveedoresFormularioComponent,
    TipoSolicitudDevolucionListadoComponent,
    TipoSolicitudDevolucionFormularioComponent,
    ConfiguracionCompaniaListadoComponent,
    ConfiguracionCompaniaFormularioComponent,
    ActividadesEconomicasListadoComponent,
    ActividadesEconomicasFormularioComponent,
    EnrrollvendedorentregasupervisorListadoComponent,
    EnrrollvendedorentregasupervisorFormularioComponent,
    UsuarioAlmacenEnrrollListadoComponent,
    UsuarioAlmacenEnrrollFormularioComponent,
    TomainventarioRutaListadoComponent,
    ArticulosCategoriasFormularioComponent,
    ArticulosCategoriasListadoComponent,
    PlazosListadoComponent,
    PlazosFormularioComponent,
    ComprobanteFiscalListadoComponent,
    ComprobanteFiscalFormularioComponent,
    TipoComprobanteFiscaFormularioComponent,
    TipoComprobanteFiscalListadoComponent,
    TipoDescuentoFormularioComponent,
    TipoDescuentoListadoComponent,
    DescuentoArticulosFormularioComponent,
    DescuentoArticulosListadoComponent,
    PromocionFormularioComponent,
   
    PromocionListadoComponent
  ],

  imports: [
    CommonModule,
    AngularDualListBoxModule,
    MantenimientosRoutingModule,
    SharedModule,
   
    NgxMaterialTimepickerModule,
    ImageCropperModule,
    AgmCoreModule.forRoot({ //mapas
      //  apiKey: 'AIzaSyBaddDDv0d9zuun9qiWj3VkLEzpJot9UQ4',
      libraries: ["places"],
      apiKey: 'AIzaSyAwEdWMJcAO6XvfXi97HVqBNeRixGd1QBU'
    }),
    NgbModule, //ng bootstrap
    TreeviewModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot()

  ]
})
export class MantenimientosModule { }
