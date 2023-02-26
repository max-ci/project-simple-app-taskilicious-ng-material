import { Directive, HostListener } from '@angular/core';
import { Location } from '@angular/common';

@Directive({
  selector: '[appGoBack]',
})
export class GoBackDirective {
  constructor(private _location: Location) {}

  @HostListener('click')
  onClick() {
    this._location.back();
  }
}
