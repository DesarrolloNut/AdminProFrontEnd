export interface AutorizacionHistoricoListadoViewModel {
    id: number;
    usuario: string;
    estadoAutorizacion: string;
    estadoAutorizacionColor: string;
    moduloKey: string;
    fechaAutorizacion: Date;
    jsonInfo: any;
    comentario: string;
    showDetailsAuth: boolean;

}   