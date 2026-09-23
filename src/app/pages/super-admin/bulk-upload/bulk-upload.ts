import { Component } from '@angular/core';
import { UploadPanel } from '../../../shared/upload-panel/upload-panel';

const COLUMNS_HINT =
  'One row per day. Columns: Candidate Email, Date, Log-In, Log-Out, Break, Task, Description.';

const VALIDATION_RULES: string[] = [
  'Candidate email must belong to an active, registered candidate.',
  'Each row is one day. Date must be a real date in MM/DD/YYYY, not in the future and not older than 8 weeks.',
  'Log-in and log-out are required (HH:mm or 9:00 AM); log-out must be after log-in.',
  'Break is a whole number of minutes. Over 60 minutes is accepted but alerts the candidate and administrator.',
  'Task is required (up to 80 characters) and Description needs 10 to 500 characters describing the work.',
  'One row per candidate per date — duplicate rows are rejected.',
  'A week can never exceed 40 hours (counting days already entered), and approved days cannot be overwritten.',
  'Every valid row is imported as a submitted day and goes to a manager for approval. Rows with errors are skipped.',
];

@Component({
  imports: [UploadPanel],
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.html',
})
export class BulkUpload {
  protected readonly columnsHint = COLUMNS_HINT;
  protected readonly validationRules = VALIDATION_RULES;
}
