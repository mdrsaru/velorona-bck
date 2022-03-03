export interface IError {
  message?: string;
  code?: number;
  details: Array<string>;
  error?: any;
  data?: any;
}
