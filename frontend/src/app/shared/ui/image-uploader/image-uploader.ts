import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-image-uploader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-3">
      <label
        class="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        [class.border-silver]="preview"
      >
        <div class="flex flex-col items-center justify-center pt-5 pb-6">
          @if (!preview) {
          <svg
            class="w-8 h-8 mb-2 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p class="mb-1 text-sm text-gray-500">
            <span class="font-semibold">Click para subir</span>
          </p>
          <p class="text-xs text-gray-400">PNG, JPG, GIF hasta 5MB</p>
          } @else {
          <p class="text-sm text-silver font-medium">Cambiar imagen</p>
          }
        </div>
        <input
          #fileInput
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
          (change)="onFile($event)"
          class="hidden"
          [attr.aria-label]="ariaLabel"
        />
      </label>

      @if (preview) {
      <div
        class="relative w-full max-w-sm mx-auto aspect-square rounded-lg overflow-hidden border-2 border-silver"
      >
        <img [src]="preview" class="w-full h-full object-cover" alt="Vista previa" />
        <button
          type="button"
          class="absolute top-2 right-2 bg-black/70 hover:bg-black text-white text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
          (click)="clear(); fileInput.value = ''"
        >
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Quitar
        </button>
      </div>
      } @if (error) {
      <p class="text-sm text-red-600 flex items-center gap-1">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clip-rule="evenodd"
          />
        </svg>
        {{ error }}
      </p>
      }
    </div>
  `,
})
export class ImageUploaderComponent implements OnChanges {
  @Output() fileSelected = new EventEmitter<File | null>();
  @Input() resetKey = 0;
  @Input() maxSizeMB = 5;
  @Input() ariaLabel = 'Subir imagen';

  preview: string | null = null;
  error: string | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['resetKey'] && !changes['resetKey'].firstChange) {
      this.clear();
    }
  }

  onFile(e: Event): void {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.error = null;

    if (!file) {
      this.clear();
      return;
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > this.maxSizeMB) {
      this.error = `La imagen no debe superar ${this.maxSizeMB}MB`;
      input.value = '';
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      this.error = 'Solo se permiten imágenes';
      input.value = '';
      return;
    }

    this.fileSelected.emit(file);

    const reader = new FileReader();
    reader.onload = () => {
      this.preview = String(reader.result);
    };
    reader.onerror = () => {
      this.error = 'Error al leer la imagen';
      this.preview = null;
    };
    reader.readAsDataURL(file);
  }

  clear(): void {
    this.preview = null;
    this.error = null;
    this.fileSelected.emit(null);
  }
}
