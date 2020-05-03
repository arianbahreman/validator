import {
  FieldState,
  FieldStatus,
  ValidatorLogic
} from './ValidatorTypes.ts';

export default class ValidatorField
{
  public name: string;
  public state: FieldState;
  public logics: Array<ValidatorLogic>;

  /*
    * validate
    *
    * @param name : any
    * @param logics : Array<ValidatorLogic>
  */
  constructor(name: string, logics: Array<ValidatorLogic>)
  {
    this.state  = { status: FieldStatus.NONE };
    this.name   = name;
    this.logics = logics;
  }

  /*
    * validate
    *
    * @param value : any
    * @return Promise <FieldState>
  */
  validate(value: any): Promise <FieldState>
  {
    return new Promise <FieldState> ((resolve, reject) => {
      this.getState(value)
        .then(state =>
        {
          this.state = state;
          resolve(result);
        })
        .catch(state =>
        {
          this.state = state;
          reject(state);
        });
    });
  }

  /*
    * getState
    *
    * @param value : any
    * @return Promise <FieldState>
  */
  getState(value: any): Promise <FieldState>
  {
    return new Promise <FieldState> (async (resolve, reject) => {

      for(let index = 0; index < this.logics.length; index ++)
      {
        const logic = this.logics[index] as ValidatorLogic;

        switch(logic.type)
        {
          case 'empty':

            if (value === '')
            {
              reject({status: FieldStatus.INVALID, error: logic.error});
            }

            break;

          case 'equals':

            if (value !== logic.value)
            {
              reject({status: FieldStatus.INVALID, error: logic.error});
            }

            break;

          case 'match':

            if (! (logic.condition as RegExp).test(value))
            {
              reject({status: FieldStatus.INVALID, error: logic.error});
            }

            break;

          case 'func':

            const status = (logic.condition as CallableFunction)(value);

            if(status instanceof Promise)
            {
              this.state.status = FieldStatus.PENDING;

              status
                .then(res => resolve({status: FieldStatus.VALID}))
                .catch(res => reject({status: FieldStatus.INVALID, error: logic.error}));
            }
            else
            {
              ! status && reject({status: FieldStatus.INVALID, error: logic.error});
            }

            break;
        }
      }

      if(this.state.status !== FieldStatus.PENDING)
      {
        resolve({status: FieldStatus.VALID});
      }
    });
  }
}
