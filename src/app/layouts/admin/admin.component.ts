import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from "../../shared/components/layout/sidebar.component";

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule], // si luego agregas más componentes, los importas aquí
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
login() {
throw new Error('Method not implemented.');
}
logout() {
throw new Error('Method not implemented.');
}
}
