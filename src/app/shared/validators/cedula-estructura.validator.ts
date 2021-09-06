import { FormGroup } from '@angular/forms';
import { ValidatorLogic } from './ValidatorLogic';

// custom validator to check that two fields match
export function cedulaestructura(controlName: string, tipodocID:string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const controltipoDoc = formGroup.controls[tipodocID];

        if (control.errors) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (controltipoDoc.value == '1') {
            if(control.value==null || control.value=='' ){ return;}
            if (!ValidatorLogic.ValidaCedulaFormacion(control.value)) {
                control.setErrors({ cedulaestructura: true });
            } else {
                control.setErrors(null);
            }
        }
    }
}
export function validaExistCedulaORNC(controlName: string, tipodocID:string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const controltipoDoc = formGroup.controls[tipodocID];

        if (control.errors) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
            if(control.value==null || control.value=='' ){ return;}
            if (!ValidatorLogic.ValidaExisteCedulaORNC(control.value)) {
                control.setErrors({ validaExistCedulaORNC: true });
            } else {
                control.setErrors(null);
            }
    }
}
