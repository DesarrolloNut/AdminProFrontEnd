export interface ChequeDevueltoListadoViewModel {
    id: number;
    cheque: string;
    fechaRegistro: string;
    monto: number;
    clienteId: number;
    cliente: string;
    usuarioRegistroId: number;
    usuario: string;
    banco: string;
}