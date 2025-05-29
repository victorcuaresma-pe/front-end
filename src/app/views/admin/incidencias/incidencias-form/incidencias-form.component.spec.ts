import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidenciasFormComponent } from './incidencias-form.component';

describe('IncidenciasFormComponent', () => {
  let component: IncidenciasFormComponent;
  let fixture: ComponentFixture<IncidenciasFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidenciasFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidenciasFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
