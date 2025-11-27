import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../../../services/loading.service';
import { SpinnerComponent } from '../spinner/spinner';

@Component({
  selector: 'ui-loading-overlay',
  standalone: true,
  imports: [CommonModule, SpinnerComponent],
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.css',
})
export class LoadingOverlayComponent {
  private loading = inject(LoadingService);

  isVisible = computed(() => this.loading.isLoading());
  message = computed(() => this.loading.message());
}
