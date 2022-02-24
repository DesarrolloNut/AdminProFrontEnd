export interface ChequeDevuelto {
    id: number;
    clienteId: number;
    cheque: string;
    monto: number;
    fechaRegistro: Date;
    usuarioRegistroId: number;
    bancoID: number;
    motivoID: number;
}