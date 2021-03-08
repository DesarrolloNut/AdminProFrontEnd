import { Paginacion } from './Paginacion';

export class ResponseContenido<T>  {
    ok: boolean;
    errores: string[];
    mensajes: string[];
    records: Array<T>;
    valores: any[];
    pagina: Paginacion;
}
