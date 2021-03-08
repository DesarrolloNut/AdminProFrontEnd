import { Paginacion } from './Paginacion';

export class RequestContenido<T>   {
    records: T[];
    parametros: any;
    pagina: Paginacion;
}
