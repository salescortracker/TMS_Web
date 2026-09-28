import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

/** One place for every popup message (SweetAlert2), so all pages look the same. */
@Injectable({ providedIn: 'root' })
export class AlertService {
  success(title: string, text?: string): Promise<unknown> {
    return Swal.fire({ icon: 'success', title, text, confirmButtonColor: '#0f766e', timer: 3500, timerProgressBar: true });
  }

  error(title: string, text?: string): Promise<unknown> {
    return Swal.fire({ icon: 'error', title, text, confirmButtonColor: '#b91c1c' });
  }

  warning(title: string, text?: string): Promise<unknown> {
    return Swal.fire({ icon: 'warning', title, text, confirmButtonColor: '#0f766e' });
  }

  /** Success popup that shows a temporary password the admin must copy. */
  credentials(title: string, email: string, password: string): Promise<unknown> {
    return Swal.fire({
      icon: 'success',
      title,
      html: `Login: <b>${this.escape(email)}</b><br>Temporary password: <b>${this.escape(password)}</b><br><small>Shown once. They must change it at first sign-in.</small>`,
      confirmButtonColor: '#0f766e',
    });
  }

  /** Returns true when the user clicks the confirm button. */
  async confirm(title: string, text: string, confirmText = 'Yes'): Promise<boolean> {
    const result = await Swal.fire({
      icon: 'question',
      title,
      text,
      showCancelButton: true,
      confirmButtonText: confirmText,
      confirmButtonColor: '#0f766e',
    });
    return result.isConfirmed;
  }

  /** Asks for a rejection reason. Returns the reason, or null when cancelled. */
  async askReason(title: string, placeholder: string, required: boolean): Promise<string | null> {
    const result = await Swal.fire({
      icon: 'warning',
      title,
      input: 'textarea',
      inputPlaceholder: placeholder,
      inputAttributes: { maxlength: '500' },
      showCancelButton: true,
      confirmButtonText: 'Reject',
      confirmButtonColor: '#b91c1c',
      inputValidator: (value) =>
        required && value.trim().length < 3 ? 'Please enter a reason (at least 3 characters).' : null,
    });
    return result.isConfirmed ? String(result.value ?? '').trim() : null;
  }

  private escape(value: string): string {
    return value.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  }
}
