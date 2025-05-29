import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProgramacionDistribucionListComponent } from './distribution-list.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProgramacionDistribucionListComponent', () => {
  let component: ProgramacionDistribucionListComponent;
  let fixture: ComponentFixture<ProgramacionDistribucionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ProgramacionDistribucionListComponent,
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProgramacionDistribucionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe alternar entre activas e inactivas', () => {
    const estadoInicial = component.mostrarInactivas;
    component.alternarProgramaciones();
    expect(component.mostrarInactivas).toBe(!estadoInicial);
  });
});
