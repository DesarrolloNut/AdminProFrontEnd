# 🥗 NutriciosaAdminFrontEnd

Panel administrativo web de **Nutriciosa** — sistema de gestión empresarial que cubre ventas, inventario, producción, compras, finanzas, autorizaciones y turnos en tiempo real.

---

## 📋 Tabla de Contenidos

1. [Stack Tecnológico](#1--stack-tecnológico)
2. [Estructura del Proyecto](#2--estructura-del-proyecto)
3. [Instalación y Ejecución Local](#3--instalación-y-ejecución-local)
4. [Configuración de Ambientes](#4--configuración-de-ambientes)
5. [Arquitectura de Comunicación con el Backend](#5--arquitectura-de-comunicación-con-el-backend)
6. [Autenticación y Sesión](#6--autenticación-y-sesión)
7. [Módulos de Negocio](#7--módulos-de-negocio)
8. [Sistema de APIs (DataApi Enum)](#8--sistema-de-apis-dataapi-enum)
9. [Tiempo Real — SignalR](#9--tiempo-real--signalr)
10. [Guía Rápida de Mantenimiento](#10--guía-rápida-de-mantenimiento)
11. [⚠️ Hardcodes y Puntos Críticos](#11-️-hardcodes-y-puntos-críticos)
12. [Checklist para Puesta en Producción](#12--checklist-para-puesta-en-producción)

---

## 1. 🛠 Stack Tecnológico

| Tecnología | Versión | Propósito |
|---|---|---|
| **Angular** | 9 | Framework principal |
| **TypeScript** | ~3.7.5 | Lenguaje base |
| **Bootstrap** | 4.3 | Estilos y layout |
| **ng-bootstrap** | 5 | Componentes UI (modal, toast, etc.) |
| **@auth0/angular-jwt** | 4 | Decodificación y manejo de JWT |
| **ngx-permissions** | 7 | Control de permisos por roles |
| **@aspnet/signalr** | 3 preview | Comunicación en tiempo real |
| **ngx-toastr** | 8 | Notificaciones toast |
| **pdfmake** | 0.2 | Generación de PDFs en el cliente |
| **exceljs** | 4.3 | Exportación a Excel |
| **moment** | 2.29 | Manipulación de fechas |
| **Angular Reactive Forms** | — | Formularios reactivos |
| **ngx-image-cropper** | 3.3 | Recorte de imágenes |

> 📌 **Nota importante**: Angular 9 ya no tiene soporte oficial de Google. Si en el futuro se actualiza, revisar breaking changes de Angular 10+.

---

## 2. 📁 Estructura del Proyecto

```
NutriciosaAdminFrontEnd/
├── src/
│   ├── environments/              ← Configuración de ambientes (DEV / PROD)
│   │   ├── environment.ts         ← Desarrollo
│   │   └── environment.prod.ts   ← Producción (⚠️ requiere ajuste manual)
│   └── app/
│       ├── app.module.ts          ← Módulo raíz, proveedores globales, JWT config
│       ├── app-routing.module.ts  ← Rutas principales con lazy loading
│       ├── app.component.ts       ← Componente raíz (spinner global)
│       │
│       ├── core/                  ← Infraestructura transversal (no negocio)
│       │   ├── authentication/    ← AuthenticationService, TokenModel, Permiso
│       │   ├── guards/            ← AuthGuard (protección de rutas)
│       │   ├── http/              ← BackendService + modelos de request/response
│       │   └── layouts/           ← FullComponent (app completa) / BlankComponent (sin nav)
│       │
│       ├── shared/                ← Reutilizable entre módulos
│       │   ├── enums/             ← DataApi.enum.ts, EstadosGeneralesKeyEnum, Configuraciones
│       │   ├── model/             ← ComboBox, etc.
│       │   ├── pipes/             ← Pipes personalizados
│       │   ├── validators/        ← cédula-estructura.validator.ts
│       │   └── [componentes/]     ← loading, teclado-virtual, connection-balanza, etc.
│       │
│       ├── Services/              ← Servicios globales (no core)
│       │   ├── PrintExportFile.service.ts      ← PDF y Excel
│       │   ├── balanza-pesaje-signalr.service.ts ← SignalR balanza
│       │   ├── turno-signal-r.service.ts       ← SignalR turnos
│       │   └── ordenfabricacion-pesaje.service.ts
│       │
│       └── Modules/               ← 20 módulos funcionales de negocio
│           ├── autorizacion/      ← Flujos de aprobación
│           ├── compras/           ← Órdenes de compra, solicitudes
│           ├── configuraciones/   ← Config del sistema
│           ├── finanzas/          ← Conciliación, cheques devueltos
│           ├── herramientas/      ← Utilitarios
│           ├── home/              ← Dashboard
│           ├── impresion/         ← Vistas de impresión
│           ├── inventario/        ← Transferencias, despacho, toma inventario
│           ├── login/             ← Pantalla de acceso
│           ├── mantenimientos/    ← CRUD maestros (51 sub-módulos)
│           ├── produccion/        ← Órdenes de fabricación
│           ├── reportes/          ← Reportes de inventario
│           ├── servicios/         ← Recepciones, citas, órdenes de servicio
│           ├── turno/             ← Gestión de turnos en tiempo real
│           └── ventas/            ← Facturas, cotizaciones, notas de crédito
```

---

## 3. 🚀 Instalación y Ejecución Local

### Requisitos previos
- **Node.js** 12.x (recomendado para Angular 9)
- **npm** 6.x
- Backend `NutriciosaAdminBackEnd` corriendo en `http://localhost:50551/`

### Pasos

```bash
# 1. Instalar dependencias
npm install

# 2. Ejecutar en modo desarrollo
npm start
# Equivalente a: ng serve
# La app abre en http://localhost:4200
```

### Verificar que el backend está corriendo
Antes de iniciar el frontend, el backend debe estar activo en el puerto configurado en `environment.ts`:

```typescript
// src/environments/environment.ts
apiUrl: 'http://localhost:50551/'
```

---

## 4. ⚙️ Configuración de Ambientes

### Ambiente de Desarrollo (`environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:50551/',      // ← Backend local activo
  // apiUrl: 'http://192.168.0.174/NutriciosaAdmin/'    // LAN interno (comentado)
  // apiUrl: 'https://appadmin.nutriciosa.com/NutriciosaAdminWeb/' // Producción (comentado)
};
```

### Ambiente de Producción (`environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  // ⚠️ ATENCIÓN: El archivo está configurado como localhost por defecto.
  // ANTES DE HACER BUILD DE PRODUCCIÓN, ajustar manualmente:

  apiUrl: 'http://localhost:50551/',   // ← ❌ ESTO ES INCORRECTO PARA PRODUCCIÓN

  // Opciones disponibles (descomentar la correcta):
  // apiUrl: 'https://appadmin.nutriciosa.com/NutriciosaAdminWeb/',  // ← ✅ Producción HTTPS
  // apiUrl: 'http://192.168.0.174/NutriciosaAdmin/',                // ← ✅ IP LAN interno
  // apiUrl: 'http://testapp.nutriciosa.com:8888/NutriciosaAdmin/',  // ← ✅ Servidor de pruebas
};
```

### Build para producción

```bash
# Primero: editar src/environments/environment.prod.ts con la URL correcta

# Luego:
ng build --prod
# Los archivos generados quedan en /dist/xtreme-admin-angular/
```

Angular reemplaza automáticamente `environment.ts` con `environment.prod.ts` al hacer `--prod`.

---

## 5. 🌐 Arquitectura de Comunicación con el Backend

### Flujo de una petición

```
Componente Angular
      ↓
  BackendService (core/http/service/backend.service.ts)
      ↓
  HTTP POST: {BASE_URL} + {dataApiRootMap[api]} + "/" + {Método}
      ↓
  Ejemplo: http://localhost:50551/api/Usuario/GetUsuarioByID
      ↓
  Backend ASP.NET Core → Base de datos SQL Server
```

### Estructura de Request

Todos los llamados al backend usan **HTTP POST** y este envelope estándar:

```typescript
// RequestContenido<T>
{
  records: T[],       // entidades a enviar (para guardar/actualizar)
  parametros: any,    // filtros/parámetros de búsqueda
  pagina: {           // paginación (solo para GetAllWithPagination)
    paginaNo: number,
    paginaSize: number,
    ordenAsc: boolean,
    ordenColumna: string
  }
}
```

### Estructura de Response

```typescript
// ResponseContenido<T>
{
  ok: boolean,        // true = éxito, false = error de negocio
  errores: string[],  // mensajes de error del servidor (leer errores[0])
  mensajes: string[], // mensajes informativos del servidor
  records: Array<T>,  // lista principal de entidades devueltas
  valores: any[],     // valores extra (ej: login devuelve token + permisos)
  pagina: {           // metadata de paginación
    totalPaginas: number,
    totalRecords: number,
    paginaSize: number,
    paginaNo: number
  }
}
```

> ⚡ **Regla de oro**: Siempre verificar `response.ok` para errores de negocio. El bloque `error =>` del `subscribe()` solo captura errores HTTP de red (timeout, 500, etc.).

### Los 4 métodos del BackendService

```typescript
// 1. Listados paginados (lectura con paginación)
httpService.GetAllWithPagination<Modelo>(
  DataApi.Xxx,        // controlador
  "GetXxxListado",    // método del controlador
  "ID",               // columna de ordenamiento
  paginaNo,           // página actual (inicia en 1)
  paginaSize,         // registros por página (defecto 10)
  false,              // orden ASC (false = DESC)
  parametros          // filtros adicionales [{key, value}]
)

// 2. Consultas simples (con parámetros tipados)
httpService.DoPost<ComboBox>(DataApi.ComboBox, "GetMarcas", parametros)

// 3. Operaciones flexibles (guardar, actualizar, acciones)
httpService.DoPostAny<any>(DataApi.Usuario, "Registrar", formulario.value)

// 4. Operaciones async/await (uso mínimo)
await httpService.DoPostAsync<any>(DataApi.Xxx, "Metodo", params)
```

### Inyección automática de CompaniaID

`GetAllWithPagination()` inyecta automáticamente `CompaniaId` en cada request (tomado del JWT token). Esto filtra los datos por empresa multi-tenant sin que el componente lo tenga que hacer manualmente.

```typescript
// backend.service.ts — se ejecuta internamente
addParametersExtra(parametros) {
  parametros.push({ key: "CompaniaId", value: this.tokenDecoded.primarygroupsid });
  return parametros;
}
```

---

## 6. 🔐 Autenticación y Sesión

### Flujo de login

```
1. Usuario ingresa credenciales en LoginComponent
2. POST http://...api/Authentication/Login
3. Backend devuelve:
   - response.valores[0] → JWT token (string)
   - response.valores[1] → Lista de permisos (Permiso[])
4. Token guardado: localStorage.setItem("keyVC", token)
5. Permisos cargados en NgxPermissionsService
```

### Información del usuario en el JWT (TokenModel)

```typescript
// Se accede via: auth.tokenDecoded
{
  nameid: string         // ID del usuario (número como string)
  unique_name: string    // username de login
  given_name: string     // nombre completo
  primarygroupsid: string // ← CompaniaID (multi-empresa)
  groupsid: string       // ← SucursalID
  role: string           // nombre del rol asignado
  email: string          // email del usuario
}
```

### Claves de localStorage

| Clave | Contenido | Dónde se usa |
|---|---|---|
| `"keyVC"` | JWT Token del usuario logueado | AuthService, BackendService |
| `"cart_items"` | Carrito de pedidos (módulo ventas empleado) | cart.service.ts |

> ⚠️ **Bug conocido**: El interceptor automático de `@auth0/angular-jwt` (configurado en `app.module.ts`) busca el token en `localStorage.getItem("token")`, pero el token **real** se guarda en `"keyVC"`. El interceptor JWT **nunca adjunta el Bearer token automáticamente**. El backend probablemente no lo requiere en headers, o tiene otra forma de autenticar.

### Guard de rutas (AuthGuard)

```typescript
// Solo verifica que el token no esté expirado
canActivate() {
  if (authService.loggedIn()) return true;
  router.navigate(["/login"]);
  return false;
}
```

No hay sistema de **refresh token**. Cuando el JWT expira, el usuario es redirigido automáticamente al login.

---

## 7. 📦 Módulos de Negocio

| Módulo | Ruta | Layout | Guard | Descripción |
|---|---|---|---|---|
| **login** | `/login` | Sin layout | ❌ | Acceso al sistema |
| **home** | `/home` | Full | ✅ | Dashboard |
| **mantenimientos** | `/mantenimientos` | Full | ✅ | 51 sub-módulos CRUD maestros |
| **ventas** | `/ventas` | Full | ✅ | Facturas, cotizaciones, notas de crédito, pedidos |
| **compras** | `/compras` | Full | ✅ | Órdenes de compra, solicitudes, proveedores |
| **inventario** | `/inventario` | Full | ✅ | Despacho, transferencias, toma inventario, pesaje |
| **produccion** | `/produccion` | Full | ✅ | Órdenes de fabricación |
| **autorizacion** | `/autorizacion` | Full | ✅ | Flujos de aprobación multi-nivel |
| **finanzas** | `/finanzas` | Full | ✅ | Conciliación interna, cheques devueltos |
| **configuraciones** | `/configuraciones` | Full | ✅ | Configuración del sistema |
| **herramientas** | `/herramientas` | Full | ✅ | Utilitarios administrativos |
| **reportes** | `/reportes/inventario` | Full | ✅ | Reportes de inventario |
| **servicios** | `/servicios` | Full | ✅ | Recepciones, citas, órdenes |
| **turno** | `/turno` | Blank | ✅ | Sistema de turnos (realtime) |
| **impresion** | `/impresion` | Blank | ✅ | Vistas de impresión dedicadas |
| **consultas** | `/consultas` | Blank | ❌ | Consulta pública para clientes |

### Mantenimientos — Sub-módulos más importantes

| Sub-módulo | API Backend |
|---|---|
| Artículos | `api/Articulo` |
| Clientes | `api/Cliente` |
| Usuarios | `api/Usuario` |
| Roles | `api/Rol` |
| Rutas | `api/Ruta` |
| Almacenes | `api/Almacen` |
| Compañías / Sucursales | `api/Compania` / `api/Sucursal` |
| Lista de Precios | `api/ListaPrecio` |
| Comprobantes Fiscales | `api/ComprobanteFiscal` |

---

## 8. 🗺️ Sistema de APIs (DataApi Enum)

El archivo `src/app/shared/enums/DataApi.enum.ts` define **todos los controladores del backend disponibles**.

```typescript
// Cómo se construye cada URL:
BASE_URL + dataApiRootMap[api] + "/" + Método

// Ejemplo:
"http://localhost:50551/" + "api/Usuario" + "/" + "GetUsuarioByID"
// → http://localhost:50551/api/Usuario/GetUsuarioByID
```

### Mapa de APIs más usadas

| DataApi | Ruta Backend | Propósito |
|---|---|---|
| `Authentication` | `api/Authentication` | Login |
| `Usuario` | `api/Usuario` | CRUD usuarios, permisos, password |
| `ComboBox` | `api/ComboBox` | **Todos los dropdowns de la app** |
| `Cliente` | `api/Cliente` | CRUD y búsqueda de clientes |
| `Articulo` | `api/Articulo` | CRUD artículos |
| `Factura` | `api/Factura` | Listado y gestión de facturas |
| `Cotizacion` | `api/Cotizacion` | Cotizaciones |
| `NotaCredito` | `api/SAPNotaCredito` | Notas de crédito hacia SAP |
| `OrdenCompra` | `api/OrdenCompra` | Órdenes de compra |
| `AutorizacionHistorico` | `api/AutorizacionHistorico` | Historial de aprobaciones |
| `Upload` | `api/Upload` | Subida de archivos/imágenes |
| `Despacho` | `api/Despacho` | Despacho de inventario |
| `TransferenciaInventario` | `api/TransferenciaInventario` | Transferencias entre almacenes |

> 💡 **`DataApi.ComboBox`** es especial: un único controlador con múltiples métodos para llenar todos los `<select>` de la aplicación (`GetMarcas`, `GetRoles`, `GetSucursales`, `GetArticuloCategorias`, etc.).

---

## 9. 📡 Tiempo Real — SignalR

### SignalR de Turnos (TurnoSignalRService)

- **Hub URL**: `{BASE_URL}turnos` → usa la URL del environment ✅
- **Grupos**: `Pantalla_Turnos_Sucursal_{sucursalID}`
- **Reconexión**: Manual vía `setTimeout` de 3 segundos
- **Eventos escuchados**:
  - `EnviarTurnosAPantallas` → actualiza lista de turnos en pantalla
  - `LlamarTurnoVoice` → habla el turno por el navegador (Web Speech API)
- **Eventos invocados**:
  - `EnviarTurnosAPantallas` → dispara actualización a todas las pantallas
  - `JoinGroup` / `ExitGroup` → entrada y salida de grupos

### SignalR de Balanza de Pesaje (BalanzaPesajeSignalrService)

- **Hub URL**: `https://appadmin.nutriciosa.com/nutriciosabalanza/balanzaPesaje` — **⚠️ HARDCODEADO**
- **Grupos**: `GRUPO_PANTALLA_PESAJE_USUARIO_{userId}` / `GRUPO_PANTALLA_PESAJE_ALMACEN_{almacenID}`
- **Reconexión**: Automática via `withAutomaticReconnect()`
- **Eventos escuchados**:
  - `SendPesoToScreen` → recibe el peso de la balanza
  - `RefreshListScreen` → refresca el listado de pesajes
- **Eventos invocados**:
  - `SendPesoToScreen` → solicita lectura de balanza (IP + Puerto)
  - `DisconnectBalanza` → cierra conexión con balanza física

---

## 10. 🔧 Guía Rápida de Mantenimiento

### Patrón de un Listado con Paginación

```typescript
@Component({ ... })
export class MiListadoComponent implements OnInit {
  data: MiViewModel[] = [];
  Cargando = false;
  Search = "";
  paginaNumeroActual = 1;
  paginaSize = 10;
  totalPaginas = 0;
  paginaTotalRecords = 0;

  constructor(
    private httpService: BackendService,
    private toastService: ToastrService,
  ) {}

  ngOnInit() { this.getData(); }

  getData() {
    this.Cargando = true;
    let parametros = [{ key: "Search", value: this.Search }];

    this.httpService.GetAllWithPagination<MiViewModel>(
      DataApi.MiApi, "GetMiListado", "ID",
      this.paginaNumeroActual, this.paginaSize,
      false, parametros
    ).subscribe(
      x => {
        if (x.ok) {
          this.data = x.records;
          this.asignarPagination(x);
        } else {
          this.toastService.error(x.errores[0]);
        }
        this.Cargando = false;
      },
      error => {
        this.toastService.error("Error conexion al servidor");
        this.Cargando = false;
      }
    );
  }

  asignarPagination(x: ResponseContenido<any>) {
    this.totalPaginas = x.pagina?.totalPaginas ?? 0;
    this.paginaTotalRecords = x.pagina?.totalRecords ?? 0;
    this.paginaSize = x.pagina?.paginaSize ?? 0;
  }
}
```

### Patrón de un Formulario CRUD

```typescript
// En guardar():
let metodo = this.actualizando ? "Update" : "Registrar";
this.httpService.DoPostAny<any>(DataApi.MiApi, metodo, this.Formulario.value)
  .subscribe(response => {
    if (!response.ok) {
      this.toastService.error(response.errores[0], "Error");
    } else {
      this.toastService.success("Realizado", "OK");
      this.router.navigateByUrl('/mantenimientos/mi-modulo');
    }
  });

// Navegación: la ruta de detalle siempre recibe el ID como parámetro
// Ej: /mantenimientos/articulo-formulario/:id
let id = Number(this.route.snapshot.paramMap.get('id'));
if (id > 0) { this.actualizando = true; this.getItem(id); }
```

### Cómo llenar un dropdown (ComboBox)

```typescript
miCombo: ComboBox[] = [];

getMiCombo() {
  let parametros = [{ key: "CompaniaId", value: this.auth.tokenDecoded.primarygroupsid }];
  this.httpService.DoPost<ComboBox>(DataApi.ComboBox, "GetMiRecurso", parametros)
    .subscribe(response => {
      if (response.ok) this.miCombo = response.records;
    });
}
```

El modelo `ComboBox` es `{ codigo: any, nombre: string }` — en HTML se usa `[value]="item.codigo"` y `{{item.nombre}}`.

### Cómo agregar un nuevo controlador de backend

1. Agregar al enum en `DataApi.enum.ts`:
   ```typescript
   MiNuevoController = 95,   // siguiente número disponible
   ```
2. Agregar al mapa:
   ```typescript
   "95": "api/MiNuevoController",
   ```
3. Usar en componentes: `DataApi.MiNuevoController`

### Cómo acceder a datos del usuario logueado

```typescript
// En el constructor: private auth: AuthenticationService

this.auth.tokenDecoded.nameid           // ID del usuario
this.auth.tokenDecoded.unique_name      // username
this.auth.tokenDecoded.given_name       // nombre completo
this.auth.tokenDecoded.primarygroupsid  // CompaniaID
this.auth.tokenDecoded.groupsid         // SucursalID
this.auth.tokenDecoded.role             // nombre del rol
```

### Exportar a PDF / Excel

Usar el servicio `PrintExportFile` (inyectarlo en el componente):

```typescript
// PDF vertical (vista previa en el navegador)
this.printService.ExportFile(data, "Nutriciosa", "Reporte X", "Encabezado", TypeReport.VIEW, 'RPT005')

// PDF para imprimir directamente (silent print)
this.printService.ExportFile(data, "Nutriciosa", "Reporte X", "Encabezado", TypeReport.PDF, 'RPT005')
```

Los templates de reportes se agregan como métodos privados `TemplateReport_XxxPDF()` en el mismo servicio.

---

## 11. ⚠️ Hardcodes y Puntos Críticos

### 🔴 CRÍTICO — `environment.prod.ts` apunta a localhost

**Archivo**: `src/environments/environment.prod.ts`

```typescript
// ❌ Estado actual — INCORRECTO para producción
export const environment = {
  production: true,
  apiUrl: 'http://localhost:50551/',
};

// ✅ Lo que DEBE quedar cuando se hace deploy
export const environment = {
  production: true,
  apiUrl: 'https://appadmin.nutriciosa.com/NutriciosaAdminWeb/',
};
```

**Impacto**: Si se hace `ng build --prod` sin corregir esto, la app de producción intentará llamar a `localhost` — completamente rota para cualquier usuario externo.

---

### 🔴 CRÍTICO — SignalR de Balanza hardcodeado en producción

**Archivo**: `src/app/Services/balanza-pesaje-signalr.service.ts`, línea 61

```typescript
// ❌ Código actual — no usa environment
public startConnection = async (grupo) => {
  let url_1 = "https://appadmin.nutriciosa.com/nutriciosabalanza/balanzaPesaje";
  let url_2 = "http://localhost:50552/balanzaPesaje";  // ← declarada pero nunca usada
  let url_3 = "http://localhost:50551/balanzaPesaje";  // ← declarada pero nunca usada
  
  this.hubConnection = new signalR.HubConnectionBuilder()
    .withUrl(url_1)  // ← siempre usa producción
    ...

// ✅ Corrección recomendada
  .withUrl(this.baseUrl + "nutriciosabalanza/balanzaPesaje")
```

**Impacto**: En desarrollo local, la balanza siempre intentará conectar al servidor de producción, no al backend local. Para pruebas de balanza en local se debe cambiar manualmente.

---

### 🟡 ATENCIÓN — Inconsistencia en clave del token JWT

**Archivo**: `src/app/app.module.ts` vs `src/app/core/authentication/service/authentication.service.ts`

```typescript
// app.module.ts — configura el interceptor JWT
export function tokenGetter() {
  return localStorage.getItem("token");  // ← busca clave "token"
}

// authentication.service.ts — donde se guarda el token
localStorage.setItem("keyVC", token);   // ← guarda en clave "keyVC"
```

**Impacto**: El interceptor automático de JWT **nunca encuentra el token** y no adjunta el `Bearer` header a las peticiones HTTP. El backend funciona porque probablemente tiene su propia validación o usa cookies. No reparar esto a menos que el backend empiece a requerir el header `Authorization`.

---

### 🟡 ATENCIÓN — Servicio `DoPostSmartWebService` no funcional

**Archivo**: `src/app/core/http/service/backend.service.ts`, líneas 90-101

```typescript
public DoPostSmartWebService(servicio: string, metodo: string, request: any) {
  const proxyurl = "https://cors-anywhere.herokuapp.com/";  // ← servicio externo desactivado
  const url = `http://lacortina.ddns.net/wscontacto/${servicio}.asmx`; // ← dominio de otro proyecto
  ...
}
```

**Impacto**: Este método no funciona. `cors-anywhere.herokuapp.com` fue desactivado como proxy público. El dominio `lacortina.ddns.net` pertenece a otro sistema. **No usar este método**.

---

### 🟡 ATENCIÓN — `console.log` expuestos en producción

Hay más de 150 sentencias `console.log` activas en los módulos de negocio. En producción, exponen datos sensibles (pedidos, clientes, estados) en las DevTools del navegador.

**Para limpiarlos al hacer build de producción**, agregar en `angular.json`:
```json
// angular.json → projects → build → configurations → production
"optimization": true
```
Esta opción ya suele estar activa y elimina los console automáticamente con Terser.

---

### 🟡 ATENCIÓN — Reintento infinito en errores de carga de combos

Varios métodos de carga de combos tienen un patrón de reintento automático:

```typescript
}, error => {
  setTimeout(() => {
    this.getMarcas();  // ← se llama a sí mismo infinitamente si el servidor no responde
  }, 1000);
});
```

Si el backend está caído, esto genera requests infinitos. Considerar agregar un contador de reintentos máximo.

---

## 12. ✅ Checklist para Puesta en Producción

### Antes de hacer build

- [ ] **Editar `src/environments/environment.prod.ts`**:
  - Comentar: `// apiUrl: 'http://localhost:50551/'`
  - Descomentar: `apiUrl: 'https://appadmin.nutriciosa.com/NutriciosaAdminWeb/'`

- [ ] **Verificar URL del backend de balanza** en `src/app/Services/balanza-pesaje-signalr.service.ts`:
  - Confirmar que `url_1` apunta al hub correcto de producción

- [ ] **Verificar que las URLs comentadas** en `environment.ts` de desarrollo no interfieran

### Build de producción

```bash
# Build optimizado para producción
ng build --prod

# Los archivos quedan en:
dist/xtreme-admin-angular/
├── index.html
├── main.*.js
├── polyfills.*.js
├── runtime.*.js
├── styles.*.css
└── assets/
```

### Deploy

- Copiar contenido de `dist/xtreme-admin-angular/` al servidor web (IIS, Nginx, Apache)
- El servidor debe estar configurado para servir `index.html` para todas las rutas (SPA routing con hash `#`)
- La app usa **HashLocationStrategy** (`/#/home`, `/#/login`) — esto simplifica la configuración del servidor porque no requiere reescritura de URLs

### Variables de configuración del sistema (en BD)

El enum `Configuraciones` define IDs de configuraciones guardadas en base de datos. Si el sistema se despliega en un nuevo ambiente, verificar que estas entradas existen en BD:

| ID | Clave | Descripción |
|---|---|---|
| 1 | `URL_REPORTE_RECEPCION` | URL del reporte de recepción |
| 2 | `URL_REPORTE_ORDEN_SERVICIO` | URL del reporte de orden de servicio |
| 15 | `EMPRESA_NOMBRE` | Nombre de la empresa |
| 16 | `URL_AUTORIZACION_PRECIOS` | URL para autorización de precios |
| 17 | `EMAIL_APP` | Email del sistema para envíos |
| 18 | `EMAIL_PASSWORD_APP` | Contraseña del email del sistema |
| 19 | `USER_PASSWORD_DEFAULT` | Contraseña default para nuevos usuarios |
| 20 | `IMPUESTO_PORCIENTO` | Porcentaje de impuesto (ITBIS) |
| 21 | `URL_AUTORIZACION_SOLICITUD_COMPRAS` | URL autorización solicitudes compras |
| 24 | `URL_ORDEN_COMPRAS` | URL de órdenes de compra |
| 27 | `URL_ARCHIVOS_COMPARTIDOS_WEB_ADMIN` | Carpeta compartida para anexos |
| 30 | `ORDENFABRICACION_CONSUMO_MAXIMO` | Límite máximo de consumo por OF |
| 31 | `ORDENFABRICACION_CONSUMO_MINIMO` | Límite mínimo de consumo por OF |
| 32 | `ORDENFABRICACION_CONSUMO_REPROCESO` | Límite de reproceso por OF |

---

## 🗝️ Información de Conexión de Referencia

| Ambiente | URL Backend | SignalR Turnos | SignalR Balanza |
|---|---|---|---|
| **Local DEV** | `http://localhost:50551/` | `localhost:50551/turnos` | `appadmin.nutriciosa.com/nutriciosabalanza/...` ⚠️ |
| **LAN Interno** | `http://192.168.0.174/NutriciosaAdmin/` | `:ruta/turnos` | Mismo hardcode ⚠️ |
| **Pruebas** | `http://testapp.nutriciosa.com:8888/NutriciosaAdmin/` | `:ruta/turnos` | Mismo hardcode ⚠️ |
| **Producción** | `https://appadmin.nutriciosa.com/NutriciosaAdminWeb/` | `:ruta/turnos` | `appadmin.nutriciosa.com/nutriciosabalanza/...` ✅ |

---

*Documentación generada en Febrero 2026. Actualizar ante cualquier cambio de infraestructura o APIs.*
