import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'filterFunc',
    pure: false
})
export class FilterFuncPipe implements PipeTransform {
    transform(items: any[], callback: (item: any) => boolean): any {
        if (!items || !callback) {
            return items;
        }
        return items.filter(item => callback(item));
    }
}