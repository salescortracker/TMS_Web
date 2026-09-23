import { Component, input, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-upload-panel',
  templateUrl: './upload-panel.html',
})
export class UploadPanel {
  readonly columnsHint = input('');
  readonly rules = input<string[]>([]);

  protected readonly isDragging = signal(false);
  protected readonly selectedFileName = signal('');

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(): void {
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.selectedFileName.set(file.name);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFileName.set(file.name);
    }
  }

  useBuiltInSample(name: string): void {
    this.selectedFileName.set(name);
  }
}
