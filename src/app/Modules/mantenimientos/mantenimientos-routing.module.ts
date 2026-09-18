import { ActividadesEconomicasFormularioComponent } from './actividadesEconomicas/actividades-economicas-formulario/actividades-economicas-formulario.component';
import { ActividadesEconomicasListadoComponent } from './actividadesEconomicas/actividades-economicas-listado/actividades-economicas-listado.component';
import { ProveedoresFormularioComponent } from './proveedores/proveedores-formulario/proveedores-formulario.component';
import { ProveedoresListadoComponent } from './proveedores/proveedores-listado/proveedores-listado.component';
import { DepartamentosFormularioComponent } from './departamentos/departamentos-formulario/departamentos-formulario.component';
import { PermisosFormularioComponent } from './permisos/permisos-formulario/permisos-formulario.component';
import { PermisosListadoComponent } from './permisos/permisos-listado/permisos-listado.component';
import { RolesFormularioComponent } from './roles/roles-formulario/roles-formulario.component';
import { RolesListadoComponent } from './roles/roles-listado/roles-listado.component';

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MantenimientosComponent } from './mantenimientos.component';
import { ComiteComponent } from './comite/comite.component';
import { UsuarioListadoComponent } from './usuarios/usuario-listado/usuario-listado.component';
import { UsuarioFormularioComponent } from './usuarios/usuario-formulario/usuario-formulario.component';
import { ClientesListadoComponent } from './clientes/clientes-listado/clientes-listado.component';
import { ClientesFormularioComponent } from './clientes/clientes-formulario/clientes-formulario.component';
import { MarcasListadoComponent } from './marcas/marcas-listado/marcas-listado.component';
import { MarcasFormularioComponent } from './marcas/marcas-formulario/marcas-formulario.component';
import { ModelosListadoComponent } from './modelos/modelos-listado/modelos-listado.component';
import { ModelosFormularioComponent } from './modelos/modelos-formulario/modelos-formulario.component';
import { DealersFormularioComponent } from './dealers/dealers-formulario/dealers-formulario.component';
import { DealersListadoComponent } from './dealers/dealers-listado/dealers-listado.component';
import { AlmacenesFormularioComponent } from './almacenes/almacenes-formulario/almacenes-formulario.component';
import { AlmacenesListadoComponent } from './almacenes/almacenes-listado/almacenes-listado.component';
import { VehiculoTiposFormularioComponent } from './vehiculoTipos/vehiculo-tipos-formulario/vehiculo-tipos-formulario.component';
import { VehiculoTiposListadoComponent } from './vehiculoTipos/vehiculo-tipos-listado/vehiculo-tipos-listado.component';
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
import { AccesoriosFormularioComponent } from './accesorios/accesorios-formulario/accesorios-formulario.component';
import { AccesoriosListadoComponent } from './accesorios/accesorios-listado/accesorios-listado.component';
import { SintomasCategoriasFormularioComponent } from './sintomasCategorias/sintomas-categorias-formulario/sintomas-categorias-formulario.component';
import { SintomasCategoriasListadoComponent } from './sintomasCategorias/sintomas-categorias-listado/sintomas-categorias-listado.component';
import { ArticuloListadoComponent } from './articulos/articulo-listado/articulo-listado.component';
import { ArticuloFormularioComponent } from './articulos/articulo-formulario/articulo-formulario.component';
import { RecallFormularioComponent } from './recall/recall-formulario/recall-formulario.component';
import { RecallListadoComponent } from './recall/recall-listado/recall-listado.component';
import { OfertasFormularioComponent } from './ofertas/ofertas-formulario/ofertas-formulario.component';
import { OfertasListadoComponent } from './ofertas/ofertas-listado/ofertas-listado.component';

import { RutasFormularioComponent } from './rutas/rutas-formulario/rutas-formulario.component';
import { RutasListadoComponent } from './rutas/rutas-listado/rutas-listado.component';
import { NivelAutorizacionFormularioComponent } from './nivelautorizacion/nivel-autorizacion-formulario/nivel-autorizacion-formulario.component';
import { NivelAutorizacionListadoComponent } from './nivelautorizacion/nivel-autorizacion-listado/nivel-autorizacion-listado.component';
import { SapconnectionListadoComponent } from './sapconnection/sapconnection-listado/sapconnection-listado.component';
import { EstadosGeneralesFormularioComponent } from './estadosgenerales/estados-generales-formulario/estados-generales-formulario.component';
import { EstadosGeneralesListadoComponent } from './estadosgenerales/estados-generales-listado/estados-generales-listado.component';
import { ListaPreciosFormularioComponent } from './listaPrecios/lista-precios-formulario/lista-precios-formulario.component';
import { ListaPreciosListadoComponent } from './listaPrecios/lista-precios-listado/lista-precios-listado.component';
import { NivelAutorizacionModuloFormularioComponent } from './NivelAutorizacionModulo/nivel-autorizacion-modulo-formulario/nivel-autorizacion-modulo-formulario.component';
import { NivelAutorizacionModuloListadoComponent } from './NivelAutorizacionModulo/nivel-autorizacion-modulo-listado/nivel-autorizacion-modulo-listado.component';
import { SapconnectionFormularioComponent } from './sapconnection/sapconnection-formulario/sapconnection-formulario.component';
import { PerfilFormularioComponent } from './perfil-formulario/perfil-formulario.component';
import { CargaMasivaPanelComponent } from './cargaMasiva/carga-masiva-panel/carga-masiva-panel.component';
import { MonedasListadoComponent } from './monedas/monedas-listado/monedas-listado.component';



import { MonedasFormularioComponent } from './monedas/monedas-formulario/monedas-formulario.component';
import { DepartamentosListadoComponent } from './departamentos/departamentos-listado/departamentos-listado.component';
import { EnrrollvendedorentregasupervisorListadoComponent } from './enrrollvendedorentregasupervisor/enrrollvendedorentregasupervisor-listado/enrrollvendedorentregasupervisor-listado.component';
import { EnrrollvendedorentregasupervisorFormularioComponent } from './enrrollvendedorentregasupervisor/enrrollvendedorentregasupervisor-formulario/enrrollvendedorentregasupervisor-formulario.component';
import { UsuarioAlmacenEnrrollListadoComponent } from './usuarioAlmacenEnrroll/usuario-almacen-enrroll-listado/usuario-almacen-enrroll-listado.component';
import { UsuarioAlmacenEnrrollFormularioComponent } from './usuarioAlmacenEnrroll/usuario-almacen-enrroll-formulario/usuario-almacen-enrroll-formulario.component';
import { TomainventarioRutaListadoComponent } from './tomainventarioruta/tomainventarioruta-listado/tomainventarioruta-listado.component';
import { ArticulosCategoriasListadoComponent } from './articulosCategorias/articulos-categorias-listado/articulos-categorias-listado.component';
import { ArticulosCategoriasFormularioComponent } from './articulosCategorias/articulos-categorias-formulario/articulos-categorias-formulario.component';
import { PlazosListadoComponent } from './plazos/plazos-listado/plazos-listado.component';
import { PlazosFormularioComponent } from './plazos/plazos-formulario/plazos-formulario.component';
import { ComprobanteFiscalListadoComponent } from './comprobanteFiscal/comprobante-fiscal-listado/comprobante-fiscal-listado.component';
import { ComprobanteFiscalFormularioComponent } from './comprobanteFiscal/comprobante-fiscal-formulario/comprobante-fiscal-formulario.component';
import { HoraPickingListadoComponent } from './horaPicking/hora-picking-listado/hora-picking-listado.component';
import { HoraPickingFormularioComponent } from './horaPicking/hora-picking-formulario/hora-picking-formulario.component';
import { AsignacionAlmacenFormularioComponent } from './asignacionDeAlmacenDestino/asignacion-almacen-formulario/asignacion-almacen-formulario.component';
import { AsignacionAlmacenListadoComponent } from './asignacionDeAlmacenDestino/asignacion-almacen-listado/asignacion-almacen-listado.component';
import { ComprobanteFiscalEnrollListadoComponent } from './comprobanteFiscalEnrroll/comprobante-fiscal-enroll-listado/comprobante-fiscal-enroll-listado.component';
import { ComprobanteFiscalEnrollFormularioComponent } from './comprobanteFiscalEnrroll/comprobante-fiscal-enroll-formulario/comprobante-fiscal-enroll-formulario.component';
import { TipoComprobanteFiscalListadoComponent } from './tipoComprobanteFiscal/tipo-comprobante-fiscal-listado/tipo-comprobante-fiscal-listado.component';
import { TipoComprobanteFiscaFormularioComponent } from './tipoComprobanteFiscal/tipo-comprobante-fiscal-formulario/tipo-comprobante-fiscal-formulario.component';
import { ModuloFormularioComponent } from './modulos/modulo-formulario/modulo-formulario.component';
import { ModuloListadoComponent } from './modulos/modulo-listado/modulo-listado.component';
import { TipoSolicitudDevolucionListadoComponent } from './tipoSolicitudDevolucion/tipoSolicitudDevolucion-listado/tipoSolicitudDevolucion-listado.component';
import { TipoSolicitudDevolucionFormularioComponent } from './tipoSolicitudDevolucion/tipoSolicitudDevolucion-formulario/tipoSolicitudDevolucion-formulario.component';
import { ConfiguracionCompaniaListadoComponent } from './configuracionCompania/configuracion-compania-listado/configuracion-compania-listado.component';
import { ConfiguracionCompaniaFormularioComponent } from './configuracionCompania/configuracion-compania-formulario/configuracion-compania-formulario.component';
import { TipoDescuentoListadoComponent } from './tipoDescuento/tipo-descuento-listado/tipo-descuento-listado.component';
import { TipoDescuentoFormularioComponent } from './tipoDescuento/tipo-descuento-formulario/tipo-descuento-formulario.component';
import { DescuentoArticulosListadoComponent } from './descuento-articulos/descuento-articulos-listado/descuento-articulos-listado.component';
import { DescuentoArticulosFormularioComponent } from './descuento-articulos/descuento-articulos-formulario/descuento-articulos-formulario.component';
import { PromocionFormularioComponent } from './promocion/promociones-formulario/promocion-formulario.component';
import { PromocionListadoComponent } from './promocion/promociones-listado/promocion-listado.component';








const routes: Routes = [
  {
    path: '', component: MantenimientosComponent,
    children: [

      {
        path: 'comprobante-fiscal', component: ComprobanteFiscalListadoComponent, data: {
          title: 'Comprobantes fiscales',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Comprobantes fiscales' },
          ]
        }
      },

      {
        path: 'comprobante-fiscal/:id', component: ComprobanteFiscalFormularioComponent, data: {
          title: 'Comprobantes fiscales',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Comprobantes fiscales' },
          ]
        }
      },

       //Asignacion almacen
       {
        path: 'asignacion-almacen', component: AsignacionAlmacenListadoComponent, data: {
          title: 'Asignación Almacén',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Asignación Almacén' }
          ]
        }
      },
      {
        path: 'asignacion-almacen/:id', component: AsignacionAlmacenFormularioComponent, data: {
          title: 'Asignación Almacén Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Asignación Almacén' },
            { title: 'Formulario' }
          ]
        }
      },

      // listas de precios
      {
        path: 'listaprecios', component: ListaPreciosListadoComponent, data: {
          title: 'Listas de precios',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Listas de precios' },
          ]
        }
      },

      // listas de precios formulario
      {
        path: 'listaprecios/:id', component: ListaPreciosFormularioComponent, data: {
          title: 'Listas de precios formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Listas de precios' },
            { title: 'Formulario' }
          ]
        }
      },

      // ruta
      {
        path: 'ruta', component: RutasListadoComponent, data: {
          title: 'Rutas',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Rutas' }
          ]
        }
      },

      {
        path: 'ruta/:id', component: RutasFormularioComponent, data: {
          title: 'Ruta Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Rutas' },
            { title: 'Formulario' }
          ]
        }
      },

      // NivelAutorizacion
      {
        path: 'nivelautorizacion', component: NivelAutorizacionListadoComponent, data: {
          title: 'Nivel autorizacion',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Nivel autorizacion' }
          ]
        }
      },

      {
        path: 'nivelautorizacion/:id', component: NivelAutorizacionFormularioComponent, data: {
          title: 'Nivel autorizacion Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Nivel autorizacion' },
            { title: 'Formulario' }
          ]
        }
      },

      // ESTADOS GENERALES
      {
        path: 'estadosgenerales', component: EstadosGeneralesListadoComponent, data: {
          title: 'Estados Generales',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Estados Generales' }
          ]
        }
      },

      {
        path: 'estadosgenerales/:id', component: EstadosGeneralesFormularioComponent, data: {
          title: 'Estados Generales Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Estados Generales' },
            { title: 'Formulario' }
          ]
        }
      },


      // NivelAutorizacionModulo
      {
        path: 'nivelautorizacionmodulo', component: NivelAutorizacionModuloListadoComponent, data: {
          title: 'Nivel Autorizacion Módulo',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Nivel Autorizacion Módulo' }
          ]
        }
      },

      {
        path: 'nivelautorizacionmodulo/:id', component: NivelAutorizacionModuloFormularioComponent, data: {
          title: 'Nivel Autorizacion Módulo Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Nivel Autorizacion Módulo' },
            { title: 'Formulario' }
          ]
        }
      },


      // EnrrollVendedorEntregaSupervisor
      {
        path: 'enrrollvendedorentregasupervisor', component: EnrrollvendedorentregasupervisorListadoComponent, data: {
          title: 'Enrrollvendedorentregasupervisor',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Enrrollvendedorentregasupervisor' }
          ]
        }
      },

      {
        path: 'enrrollvendedorentregasupervisor/:id', component: EnrrollvendedorentregasupervisorFormularioComponent, data: {
          title: 'Enrrollvendedorentregasupervisor Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Enrrollvendedorentregasupervisor' },
            { title: 'Formulario' }
          ]
        }
      },

      // SAPCONNECTION
      {
        path: 'sapconnection', component: SapconnectionListadoComponent, data: {
          title: 'Conexiones',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Conexiones' }
          ]
        }
      },

      {
        path: 'sapconnection/:id', component: SapconnectionFormularioComponent, data: {
          title: 'Conexiones Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Conexiones' },
          ]
        }
      },

      // promocion
     

      // Roles
      {
        path: 'roles', component: RolesListadoComponent, data: {
          title: 'Roles',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Roles' },
          ]
        }
      },


      {
        path: 'roles/:id', component: RolesFormularioComponent, data: {
          title: 'Roles Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Roles' },
            { title: 'Formulario' }
          ]
        }
      },

      // Permisos
      {
        path: 'permisos', component: PermisosListadoComponent, data: {
          title: 'Permisos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Permisos' },
          ]
        }
      },


      {
        path: 'permisos/:id', component: PermisosFormularioComponent, data: {
          title: 'Permisos Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Permisos' },
            { title: 'Formulario' }
          ]
        }
      },

      {
        path: 'cargamasiva', component: CargaMasivaPanelComponent, data: {
          title: 'Carga Masiva',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Carga Masiva' },
          ]
        }
      },





      // Permisos
      {
        path: 'tomainventarioruta', component: TomainventarioRutaListadoComponent, data: {
          title: 'Toma Inventario Ruta',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Toma Inventario Ruta' },
          ]
        }
      },






      // ***************************************


      // comite
      {
        path: 'comite', component: ComiteComponent, data: {
          title: 'Comites',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Comites' }
          ]
        }
      },


      // usuario
      {
        path: 'usuario', component: UsuarioListadoComponent, data: {
          title: 'Usuarios',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Usuarios' }
          ]
        }
      },

      {
        path: 'usuario/:id', component: UsuarioFormularioComponent, data: {
          title: 'Usuario Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Usuarios' },
            { title: 'Formulario' }
          ]
        }
      },

      // usuario
      {
        path: 'usuario-almacen-enrroll', component: UsuarioAlmacenEnrrollListadoComponent, data: {
          title: 'Usuario Almacen Enrroll',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Usuario Almacen Enrroll' }
          ]
        }
      },

      {
        path: 'usuario-almacen-enrroll/:id', component: UsuarioAlmacenEnrrollFormularioComponent, data: {
          title: 'Usuario Almacen Enrroll Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Usuario Almacen Enrroll' },
            { title: 'Formulario' }
          ]
        }
      },


      // cliente
      {
        path: 'cliente', component: ClientesListadoComponent, data: {
          title: 'Clientes',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Clientes' }
          ]
        }
      },

      {
        path: 'cliente/:id', component: ClientesFormularioComponent, data: {
          title: 'Clientes Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Clientes' },
            { title: 'Formulario' }
          ]
        }
      },



      // marcas
      {
        path: 'marca', component: MarcasListadoComponent, data: {
          title: 'Marcas',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Marcas' }
          ]
        }
      },

      {
        path: 'marca/:id', component: MarcasFormularioComponent, data: {
          title: 'Marcas Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Marcas' },
            { title: 'Formulario' }
          ]
        }
      },



      // modelo
      {
        path: 'modelo', component: ModelosListadoComponent, data: {
          title: 'Modelos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Modelos' }
          ]
        }
      },

      {
        path: 'modelo/:id', component: ModelosFormularioComponent, data: {
          title: 'Modelos Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Modelos', },
            { title: 'Formulario' }
          ]
        }
      },

      // dealers
      {
        path: 'dealer', component: DealersListadoComponent, data: {
          title: 'Dealers',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Dealers' }
          ]
        }
      },

      {
        path: 'dealer/:id', component: DealersFormularioComponent, data: {
          title: 'Dealers Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Dealers' },
            { title: 'Formulario' }
          ]
        }
      },

      // almacenes
      {
        path: 'almacen', component: AlmacenesListadoComponent, data: {
          title: 'Almacenes',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Almacenes' }
          ]
        }
      },
     

      {
        path: 'almacen/:id', component: AlmacenesFormularioComponent, data: {
          title: 'Almacenes Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Almacenes' },
            { title: 'Formulario' }
          ]
        }
      },
      // VehiculoTipo
      {
        path: 'vehiculotipo', component: VehiculoTiposListadoComponent, data: {
          title: 'Vehículo Tipos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Vehículo Tipos' }
          ]
        }
      },

      {
        path: 'vehiculotipo/:id', component: VehiculoTiposFormularioComponent, data: {
          title: 'Vehículo Tipos Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Vehículo Tipos' },
            { title: 'Formulario' }
          ]
        }
      },


      // combustible
      {
        path: 'combustible', component: CombustiblesListadoComponent, data: {
          title: 'Combustibles',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Combustibles' }
          ]
        }
      },

      {
        path: 'combustible/:id', component: CombustiblesFormularioComponent, data: {
          title: 'Combustibles Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Combustibles' },
            { title: 'Formulario' }
          ]
        }
      },


      // vehiculo condiciones
      {
        path: 'vehiculocondicion', component: VehiculoCondicionesListadoComponent, data: {
          title: 'Vehículo Condiciones',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Vehículo Condiciones' }
          ]
        }
      },

      {
        path: 'vehiculocondicion/:id', component: VehiculoCondicionesFormularioComponent, data: {
          title: 'Vehículo Condiciones Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Vehículo Condiciones' },
            { title: 'Formulario' }
          ]
        }
      },


      // tag
      {
        path: 'tag', component: TagsListadoComponent, data: {
          title: 'Tags',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Tags' }
          ]
        }
      },

      {
        path: 'tag/:id', component: TagsFormularioComponent, data: {
          title: 'Tags Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Tags' },
            { title: 'Formulario' }
          ]
        }
      },

      // Receptores posiciones
      {
        path: 'receptor-posicion', component: ReceptoresPosicionesListadoComponent, data: {
          title: 'Receptores Posiciones',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Receptores Posiciones' }
          ]
        }
      },

      {
        path: 'receptor-posicion/:id', component: ReceptoresPosicionesFormularioComponent, data: {
          title: 'Receptores Posiciones Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Receptores Posiciones' },
            { title: 'Formulario' }
          ]
        }
      },


      // compania
      {
        path: 'compania', component: CompaniasListadoComponent, data: {
          title: 'Compañías',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Compañías' }
          ]
        }
      },

      {
        path: 'compania/:id', component: CompaniasFormularioComponent, data: {
          title: 'Compañías Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Compañías' },
            { title: 'Formulario' }
          ]
        }
      },
      
     // Tipo Solicitud Devolucion
    {
      path: 'tipoSolicitudDevolucion', component: TipoSolicitudDevolucionListadoComponent, data: {
        title: 'Tipo Solicitud Devolución',
        urls: [
          { title: 'Mantenimientos' },
          { title: 'Tipo Solicitud Devolución' }
        ]
      }
    },

    {
      path: 'tipoSolicitudDevolucion/:id', component: TipoSolicitudDevolucionFormularioComponent, data: {
        title: 'Tipo Solicitud Devolución Formulario',
        urls: [
          { title: 'Mantenimientos' },
          { title: 'Tipo Solicitud Devolución' },
          { title: 'Formulario' }
        ]
      }
    },



     // Configuracion Compañia
     {
      path: 'configuracion-compania', component: ConfiguracionCompaniaListadoComponent, data: {
        title: 'Configuración Compañia',
        urls: [
          { title: 'Mantenimientos' },
          { title: 'Configuración Compañia' }
        ]
      }
    },

    {
      path: 'configuracion-compania/:id', component: ConfiguracionCompaniaFormularioComponent, data: {
        title: 'Configuración Compañia Formulario',
        urls: [
          { title: 'Mantenimientos' },
          { title: 'Configuración Compañia' },
          { title: 'Formulario' }
        ]
      }
    },



      // sucursal
      {
        path: 'sucursal', component: SucursalesListadoComponent, data: {
          title: 'Sucursales',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Sucursales' }
          ]
        }
      },

      {
        path: 'sucursal/:id', component: SucursalesFormularioComponent, data: {
          title: 'Sucursales Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Sucursales' },
            { title: 'Formulario' }
          ]
        }
      },

      //cita categoria
      {
        path: 'cita-categoria', component: CitaCategoriaListadoComponent, data: {
          title: 'Cita Categorias',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Cita Categorias' }
          ]
        }
      },

      {
        path: 'cita-categoria/:id', component: CitaCategoriaFormularioComponent, data: {
          title: 'Cita Categorias Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Cita Categorias' },
            { title: 'Formulario' }
          ]
        }
      },


      // sintoma
      {
        path: 'sintoma', component: SintomasListadoComponent, data: {
          title: 'Síntomas',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Síntomas' }
          ]
        }
      },

      {
        path: 'sintoma/:id', component: SintomasFormularioComponent, data: {
          title: 'Síntomas Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Síntomas' },
            { title: 'Formulario' }
          ]
        }
      },

      // sintoma categorias
      {
        path: 'sintoma-categoria', component: SintomasCategoriasListadoComponent, data: {
          title: 'Síntoma Categorias',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Síntoma Categorias' }
          ]
        }
      },

      {
        path: 'sintoma-categoria/:id', component: SintomasCategoriasFormularioComponent, data: {
          title: 'Síntoma Categorias Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Síntoma Categorias' },
            { title: 'Formulario' }
          ]
        }
      },

      // accesorio
      {
        path: 'accesorio', component: AccesoriosListadoComponent, data: {
          title: 'Accesorios',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Accesorios' }
          ]
        }
      },

      {
        path: 'accesorio/:id', component: AccesoriosFormularioComponent, data: {
          title: 'Accesorios Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Accesorios' },
            { title: 'Formulario' }
          ]
        }
      },

      // articulo
      {
        path: 'articulo', component: ArticuloListadoComponent, data: {
          title: 'Artículos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Artículos' }
          ]
        }
      },

      {
        path: 'articulo/:id', component: ArticuloFormularioComponent, data: {
          title: 'Artículos Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Artículos' },
            { title: 'Formulario' }
          ]
        }
      },

      // recall
      {
        path: 'recall', component: RecallListadoComponent, data: {
          title: 'Recall',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Recall' }
          ]
        }
      },

      {
        path: 'recall/:id', component: RecallFormularioComponent, data: {
          title: 'Recall Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Recall' },
            { title: 'Formulario' }
          ]
        }
      },

      // ofertas
      {
        path: 'oferta', component: OfertasListadoComponent, data: {
          title: 'Oferta',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Oferta' }
          ]
        }
      },

      {
        path: 'oferta/:id', component: OfertasFormularioComponent, data: {
          title: 'Oferta Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Oferta' },
            { title: 'Formulario' }
          ]
        }
      },

      {
        path: 'perfil', component: PerfilFormularioComponent, data: {
          title: 'Perfil',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Perfil' }
          ]
        }
      },
      // Moneda
      {
        path: 'moneda', component: MonedasListadoComponent, data: {
          title: 'Moneda',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Moneda' }
          ]
        }
      },
      {
        path: 'moneda/:id', component: MonedasFormularioComponent, data: {
          title: 'Moneda Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Moneda' },
            { title: 'Formulario' }
          ]
        }
      },
      //Hora Picking
      {
        path: 'hora-picking', component: HoraPickingListadoComponent, data: {
          title: 'Hora Picking',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Horario Picking' }
          ]
        }
      },
      
      {
        path: 'hora-picking/:id', component: HoraPickingFormularioComponent, data: {
          title: 'Hora Picking Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Hora Picking' },
            { title: 'Formulario' }
          ]
        }
      },
      {
        path: 'comprobante-fiscal-enrroll', component: ComprobanteFiscalEnrollListadoComponent, data: {
          title: 'Comprobante Fiscal Enrrol',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Comprobante Fiscal Enrrol' }
          ]
        }
      },
     
      {
        path: 'comprobante-fiscal-enrroll/:id', component: ComprobanteFiscalEnrollFormularioComponent, data: {
          title: 'Comprobante Fiscal Enrrol',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Comprobante Fiscal Enrrol' },
            { title: 'Formulario' }
          ]
        }
      },
      {
        path: 'tipo-comprobante-fiscal', component: TipoComprobanteFiscalListadoComponent, data: {
          title: 'Tipo Comprobante Fiscal',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Tipo Comprobante Fiscal' }
          ]
        }
      },
      {
        path: 'tipo-comprobante-fiscal/:id', component: TipoComprobanteFiscaFormularioComponent, data: {
          title: 'Comprobante Fiscal Fiscal',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Tipo Comprobante Fiscal' },
            { title: 'Formulario' }
          ]
        }
      },
      // departamento
      {
        path: 'departamento', component: DepartamentosListadoComponent, data: {
          title: 'Departamento',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Departamento' }
          ]
        }
      },

      {
        path: 'departamento/:id', component: DepartamentosFormularioComponent, data: {
          title: 'Departamento Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Departamento' },
            { title: 'Formulario' }
          ]
        }
      },
      // proveedor
      {
        path: 'proveedor', component: ProveedoresListadoComponent, data: {
          title: 'Proveedor',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Proveedor' }
          ]
        }
      },

      {
        path: 'proveedor/:id', component: ProveedoresFormularioComponent, data: {
          title: 'Proveedor Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Proveedor' },
            { title: 'Formulario' }
          ]
        }
      },
      // actividadEconomica
      {
        path: 'actividadEconomica', component: ActividadesEconomicasListadoComponent, data: {
          title: 'Proveedor',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Proveedor' }
          ]
        }
      },

      {
        path: 'actividadEconomica/:id', component: ActividadesEconomicasFormularioComponent, data: {
          title: 'Actividad Económica Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Actividad Económica' },
            { title: 'Formulario' }
          ]
        }
      },

      // articulocategorias
      {
        path: 'articulo-categoria', component: ArticulosCategoriasListadoComponent, data: {
          title: 'Articulo Categorias',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Articulo Categorias' }
          ]
        }
      },

      {
        path: 'articulo-categoria/:id', component: ArticulosCategoriasFormularioComponent, data: {
          title: 'Articulo Categorias Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Articulo Categorias' },
            { title: 'Formulario' }
          ]
        }
      },

      // plazos
      {
        path: 'plazo', component: PlazosListadoComponent, data: {
          title: 'Plazo',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Plazo' }
          ]
        }
      },

      {
        path: 'plazo/:id', component: PlazosFormularioComponent, data: {
          title: 'Plazo Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Plazo' },
            { title: 'Formulario' }
          ]
        }
      },
      {
        path: 'modulo', component: ModuloListadoComponent, data: {
          title: 'Modulo',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Modulo' }
          ]
        }
      },
      
      {
        path: 'modulo/:id', component: ModuloFormularioComponent, data: {
          title: 'Modulo Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Modulo' },
            { title: 'Formulario' }
          ]
        }
      },

      {
        path: 'tipo-descuento', component: TipoDescuentoListadoComponent, data: {
          title: 'Tipo Descuento',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Tipo Descuento' }
          ]
        }
      },
      
      {
        path: 'tipo-descuento/:id', component: TipoDescuentoFormularioComponent, data: {
          title: 'Tipo Descuento Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Tipo Descuento' },
            { title: 'Formulario' }
          ]
        }
      },

      {
        path: 'descuento-articulos', component: DescuentoArticulosListadoComponent, data: {
          title: 'Descuento Articulos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Descuento Articulos' }
          ]
        }
      },
      
      {
        path: 'descuento-articulos/:id', component: DescuentoArticulosFormularioComponent, data: {
          title: 'Descuento Articulos Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Descuento Articulos' },
            { title: 'Formulario' }
          ]
        }
      },
      {
        path: 'promociones', component: PromocionListadoComponent, data: {
          title: 'Promoción',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Promoción' }
          ]
        }
      },
      
      {
        path: 'promociones/:id', component: PromocionFormularioComponent, data: {
          title: 'Promoción Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Promoción' },
            { title: 'Formulario' }
          ]
        }
      },


      
      
   
    ]

  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MantenimientosRoutingModule { }
