import { HttpErrorResponse, HttpParams } from '@angular/common/http';

/** Pulls the friendly { message } the API sends, or falls back to a generic sentence. */
export function errorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Cannot reach the server. Is the API running?';
    }
    const body = error.error;
    if (body?.message) {
      return body.message;
    }
    // ASP.NET validation errors: { errors: { Field: ['message'] } }
    if (body?.errors) {
      const first = Object.values(body.errors as Record<string, string[]>)[0];
      if (first?.length) {
        return first[0];
      }
    }
    if (error.status === 403) {
      return 'You do not have permission to do that.';
    }
  }
  return fallback;
}

/** Builds query params, skipping empty values. */
export function toParams(values: Record<string, string | number | null | undefined>): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Saves a file returned by the API (Excel export / templates). */
export function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}
