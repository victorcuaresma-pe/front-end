import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncidentsFormComponent } from './incidents-form.component';

describe('IncidenciasFormComponent', () => {
  let component: IncidentsFormComponent;
  let fixture: ComponentFixture<IncidentsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IncidentsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IncidentsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
