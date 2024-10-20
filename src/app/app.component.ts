import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TabMenuModule } from 'primeng/tabmenu';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TabMenuModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'cv-ui';
  isView: boolean = true;
  items: any = [];

  constructor(private router: Router) {
    this.items = [
      { label: 'User', icon: 'pi pi-user', command: () => { this.router.navigate(['user']); } },
      { label: 'CV', icon: 'pi pi-file', command: () => { this.router.navigate(['cv']);} }
    ]
  }
}
