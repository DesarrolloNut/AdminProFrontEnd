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

const routes: Routes = [
  {
    path: '', component: MantenimientosComponent,
    children: [


      // comite
      {
        path: 'comite', component: ComiteComponent, data: {
          title: 'Viacloud | Comites',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Comites' }
          ]
        }
      },


      // usuario
      {
        path: 'usuario', component: UsuarioListadoComponent, data: {
          title: 'Viacloud | Usuarios',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Usuarios' }
          ]
        }
      },

      {
        path: 'usuario/:id', component: UsuarioFormularioComponent, data: {
          title: 'Viacloud | Usuario Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Usuarios' },
            { title: 'Formulario' }
          ]
        }
      },


      // cliente
      {
        path: 'cliente', component: ClientesListadoComponent, data: {
          title: 'Viacloud | Clientes',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Clientes' }
          ]
        }
      },

      {
        path: 'cliente/:id', component: ClientesFormularioComponent, data: {
          title: 'Viacloud | Clientes Formulario',
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
          title: 'Viacloud | Marcas',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Marcas' }
          ]
        }
      },

      {
        path: 'marca/:id', component: MarcasFormularioComponent, data: {
          title: 'Viacloud | Marcas Formulario',
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
          title: 'Viacloud | Modelos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Modelos' }
          ]
        }
      },

      {
        path: 'modelo/:id', component: ModelosFormularioComponent, data: {
          title: 'Viacloud | Modelos Formulario',
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
          title: 'Viacloud | Dealers',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Dealers' }
          ]
        }
      },

      {
        path: 'dealer/:id', component: DealersFormularioComponent, data: {
          title: 'Viacloud | Dealers Formulario',
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
          title: 'Viacloud | Almacenes',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Almacenes' }
          ]
        }
      },

      {
        path: 'almacen/:id', component: AlmacenesFormularioComponent, data: {
          title: 'Viacloud | Almacenes Formulario',
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
          title: 'Viacloud | Vehículo Tipos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Vehículo Tipos' }
          ]
        }
      },

      {
        path: 'vehiculotipo/:id', component: VehiculoTiposFormularioComponent, data: {
          title: 'Viacloud | Vehículo Tipos Formulario',
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
          title: 'Viacloud | Combustibles',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Combustibles' }
          ]
        }
      },

      {
        path: 'combustible/:id', component: CombustiblesFormularioComponent, data: {
          title: 'Viacloud | Combustibles Formulario',
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
          title: 'Viacloud | Vehículo Condiciones',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Vehículo Condiciones' }
          ]
        }
      },

      {
        path: 'vehiculocondicion/:id', component: VehiculoCondicionesFormularioComponent, data: {
          title: 'Viacloud | Vehículo Condiciones Formulario',
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
          title: 'Viacloud | Tags',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Tags' }
          ]
        }
      },

      {
        path: 'tag/:id', component: TagsFormularioComponent, data: {
          title: 'Viacloud | Tags Formulario',
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
          title: 'Viacloud | Receptores Posiciones',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Receptores Posiciones' }
          ]
        }
      },

      {
        path: 'receptor-posicion/:id', component: ReceptoresPosicionesFormularioComponent, data: {
          title: 'Viacloud | Receptores Posiciones Formulario',
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
          title: 'Viacloud | Compañías Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Compañías' },
            { title: 'Formulario' }
          ]
        }
      },


      // sucursal
      {
        path: 'sucursal', component: SucursalesListadoComponent, data: {
          title: 'Viacloud | Sucursales',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Sucursales' }
          ]
        }
      },

      {
        path: 'sucursal/:id', component: SucursalesFormularioComponent, data: {
          title: 'Viacloud | Sucursales Formulario',
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
          title: 'Viacloud | Cita Categorias',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Cita Categorias' }
          ]
        }
      },

      {
        path: 'cita-categoria/:id', component: CitaCategoriaFormularioComponent, data: {
          title: 'Viacloud | Cita Categorias Formulario',
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
          title: 'Viacloud | Síntomas',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Síntomas' }
          ]
        }
      },

      {
        path: 'sintoma/:id', component: SintomasFormularioComponent, data: {
          title: 'Viacloud | Síntomas Formulario',
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
          title: 'Viacloud | Síntoma Categorias',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Síntoma Categorias' }
          ]
        }
      },

      {
        path: 'sintoma-categoria/:id', component: SintomasCategoriasFormularioComponent, data: {
          title: 'Viacloud | Síntoma Categorias Formulario',
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
          title: 'Viacloud | Accesorios',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Accesorios' }
          ]
        }
      },

      {
        path: 'accesorio/:id', component: AccesoriosFormularioComponent, data: {
          title: 'Viacloud | Accesorios Formulario',
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
          title: 'Viacloud | Artículos',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Artículos' }
          ]
        }
      },

      {
        path: 'articulo/:id', component: ArticuloFormularioComponent, data: {
          title: 'Viacloud | Artículos Formulario',
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
          title: 'Viacloud | Recall',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Recall' }
          ]
        }
      },

      {
        path: 'recall/:id', component: RecallFormularioComponent, data: {
          title: 'Viacloud | Recall Formulario',
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
          title: 'Viacloud | Oferta',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Oferta' }
          ]
        }
      },

      {
        path: 'oferta/:id', component: OfertasFormularioComponent, data: {
          title: 'Viacloud | Oferta Formulario',
          urls: [
            { title: 'Mantenimientos' },
            { title: 'Oferta' },
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
