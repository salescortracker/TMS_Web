import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { AdminApi, UploadBatch, UploadResult } from '../api/admin.api';
import { errorMessage, saveBlob } from '../api/api-helpers';

@Component({
  imports: [DatePipe],
  selector: 'app-upload-panel',
  templateUrl: './upload-panel.html',
})
export class UploadPanel implements OnInit {
  private readonly api = inject(AdminApi);

  readonly columnsHint = input('');
  readonly rules = input<string[]>([]);

  protected readonly isDragging = signal(false);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly uploading = signal(false);
  protected readonly errorText = signal('');
  protected readonly result = signal<UploadResult | null>(null);
  protected readonly history = signal<UploadBatch[]>([]);

  ngOnInit(): void {
    this.loadHistory();
  }

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
    this.pick(event.dataTransfer?.files?.[0]);
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.pick(input.files?.[0]);
    input.value = '';
  }

  private pick(file: File | undefined): void {
    this.result.set(null);
    this.errorText.set('');
    if (!file) {
      return;
    }
    if (!file.name.toLowerCase().endsWith('.xlsx')) {
      this.errorText.set('Please choose an Excel (.xlsx) file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorText.set('The file is larger than 5 MB.');
      return;
    }
    this.selectedFile.set(file);
  }

  download(kind: 'blank' | 'valid' | 'errors'): void {
    this.api.template(kind).subscribe({
      next: (blob) =>
        saveBlob(blob, kind === 'blank' ? 'timesheet-template.xlsx' : `timesheet-${kind}-sample.xlsx`),
      error: (error) => this.errorText.set(errorMessage(error)),
    });
  }

  upload(): void {
    const file = this.selectedFile();
    if (!file) {
      this.errorText.set('Choose a file first.');
      return;
    }
    this.uploading.set(true);
    this.errorText.set('');
    this.api.upload(file).subscribe({
      next: (result) => {
        this.result.set(result);
        this.selectedFile.set(null);
        this.uploading.set(false);
        this.loadHistory();
      },
      error: (error) => {
        this.uploading.set(false);
        this.errorText.set(errorMessage(error));
      },
    });
  }

  private loadHistory(): void {
    this.api.uploadHistory().subscribe({
      next: (batches) => this.history.set(batches),
      error: () => {
        // History is optional.
      },
    });
  }
}
