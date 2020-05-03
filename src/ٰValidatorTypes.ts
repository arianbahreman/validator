export interface FieldsList {
  [key: string]: Array<ValidatorLogic> | FieldStatus;
}

export enum FieldStatus {
  NONE
, PENDING
, INVALID
, VALID
}

export interface FieldState {
  status: FieldStatus;
  name?: string;
}

export interface ValidatorLogic {
  type: string;
  error: string | number;
  value?: any;
  condition: string | RegExp | CallableFunction;
}
