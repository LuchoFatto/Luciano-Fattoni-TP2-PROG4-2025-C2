import { Component, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-session-warning-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-warning-modal.html',
  styleUrl: './session-warning-modal.css',
})
export class SessionWarningModalComponent {
  @Input() timeRemaining = '05:00'; // Tiempo restante formateado

  @Output() extend = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  onExtend() {
    this.extend.emit();
  }

  onLogout() {
    this.logout.emit();
  }
}
