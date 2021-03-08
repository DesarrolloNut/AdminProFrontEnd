import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CitaListadoComponent } from './cita-listado.component';

describe('CitaListadoComponent', () => {
  let component: CitaListadoComponent;
  let fixture: ComponentFixture<CitaListadoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CitaListadoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CitaListadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
