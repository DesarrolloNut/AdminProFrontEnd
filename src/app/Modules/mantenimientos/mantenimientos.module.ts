import { NgModule } from '@angular/core';

import { AngularDualListBoxModule } from 'angular-dual-listbox';


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
import { PromocionesListadoComponent } from './promociones/promociones-listado/promociones-listado.component';
import { PromocionesFormularioComponent } from './promociones/promociones-formulario/promociones-formulario.component';
import { PermisosListadoComponent } from './permisos/permisos-listado/permisos-listado.component';
import { PermisosFormularioComponent } from './permisos/permisos-formulario/permisos-formulario.component';
import { PerfilFormularioComponent } from './perfil-formulario/perfil-formulario.component';

import { TreeviewModule } from 'ngx-treeview';


@NgModule({
  declarations: [
    NgbdtabsBasicComponent,
    MantenimientosComponent, ComiteComponent,
    UsuarioListadoComponent, UsuarioFormularioComponent, ClientesListadoComponent,
    ClientesFormularioComponent, MarcasListadoComponent, MarcasFormularioComponent,
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

    SapconnectionListadoComponent, 
    SapconnectionFormularioComponent ,
    PromocionesListadoComponent,
    PromocionesFormularioComponent, 
    PermisosListadoComponent, 
    PermisosFormularioComponent, 
    PerfilFormularioComponent
  ],

  imports: [
    CommonModule,
    AngularDualListBoxModule,
    MantenimientosRoutingModule,
    SharedModule,
    NgbModule,
    TreeviewModule.forRoot()
  ]
})
export class MantenimientosModule { }
