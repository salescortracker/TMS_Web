export interface TeamOption {
  label: string;
  value: string;
  dialCode: string;
}

export const TEAM_OPTIONS: TeamOption[] = [
  { label: 'USA team (+1)', value: 'usa', dialCode: '+1' },
  { label: 'India team (+91)', value: 'india', dialCode: '+91' },
  { label: 'UK team (+44)', value: 'uk', dialCode: '+44' },
];

export const APPROVERS = ['Reporting Manager', 'Team Lead', 'HR'];
