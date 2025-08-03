export interface Tab<T = string> {
  key: T;
  label: string;
  icon?: React.ReactNode;
}