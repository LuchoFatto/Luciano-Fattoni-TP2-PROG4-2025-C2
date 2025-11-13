import { Component, ContentChild, TemplateRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [ngClass]="{ 'hover:shadow-lg transition-shadow': hoverable }">
      @if (headerTpl) {
      <div class="px-4 py-3 border-b border-gray-100">
        <ng-container *ngTemplateOutlet="headerTpl"></ng-container>
      </div>
      }

      <div [ngClass]="padding ? 'p-4' : ''">
        <ng-content></ng-content>
      </div>

      @if (footerTpl) {
      <div class="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
        <ng-container *ngTemplateOutlet="footerTpl"></ng-container>
      </div>
      }
    </div>
  `,
})
export class CardComponent {
  @Input() hoverable = false;
  @Input() padding = true;
  @ContentChild('cardHeader') headerTpl?: TemplateRef<any>;
  @ContentChild('cardFooter') footerTpl?: TemplateRef<any>;
}
