import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Observable } from 'rxjs';
import { GlobalService } from '../../features/services/global.service';
@Component({
  selector: 'app-loader',
  imports: [CommonModule, ProgressSpinnerModule],
  templateUrl: './loader.component.html',
  styleUrl: './loader.component.scss',
  standalone: true
})
export class LoaderComponent {
loading$: Observable<boolean>;

  constructor(private globalService: GlobalService) {
    this.loading$ = this.globalService.loading$;
  }
}
