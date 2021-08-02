export interface AutorizacionHistoricoListadoViewModel {
    id: number;
    usuario: string;
    estadoAutorizacion: string;
    moduloKey: string;
    fechaAutorizacion: Date;
    jsonInfo: any;
}