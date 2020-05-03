import { FieldsList, FieldState, FieldStatus, ValidatorLogic } from './ValidatorTypes.ts';
import ValidatorField from './ValidatorField.ts';

export default class Validator {

  public fields: Map<string, ValidatorField> = new Map();

  /*
    * Constructor
    *
  */
  constructor(fields: FieldsList)
  {
    for(let name in fields)
    {
      /*
        Avoid inherited properties
      */
      if(fields.hasOwnProperty(name))
      {
        /*
          Logics as an array
        */
        let logics = fields[name];

        /*
          Create new named field with logics
        */
        let field = new ValidatorField(name, logics as Array<ValidatorLogic>);

        this.fields.set(name, field);
      }
    }
  }

  /*
    * getField
    *
    * @param name : string
    * @return ValidationField
  */
  getField(name: string): ValidatorField
  {
    return this.fields.get(name) as ValidatorField;
  }

  /*
    * check
    *
    * @param field : string
    * @param value : any
    * @return
  */
  check(field: string, value: any): Promise <FieldState>
  {
    return this.getField(field).validate(value);
  }

  /*
    * getField
    *
    * @param name : string
    * @return ValidationField
  */
  validate(list: FieldsList): Promise <boolean>
  {
    return new Promise <boolean> ((resolve, reject) =>
    {
      let status: boolean = true;
      let fields: FieldsList = {};

      /*
        Check field
      */
      const setStatus = (name: string, state: FieldState) => {

        /*
          Set fields status
        */
        fields[name] = state.status;

        /*
          Set overall status
        */
        status = status && state.status === FieldStatus.VALID;

        for (let name in fields)
        {
          if (fields[name] === FieldStatus.PENDING)
          {
            return void(0);
          }
        }

        status ? resolve(status) : reject(status);
      }

      /*
        Iterate fields list
      */
      for (let name in list)
      {
        if(! list.hasOwnProperty(name))
        {
          continue;
        }

        fields[name] = FieldStatus.PENDING;
        const value  = list[name];

        this.check(name, value)
        .then((state: FieldState) => setStatus(name, state))
        .catch((state: FieldState) => setStatus(name, state));
      }
    });
  }
}
