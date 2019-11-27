import { Logger, ITiming, ITimingControl, TimeState } from 'node-test-bed-adapter';
import { TimeService } from './../time-service';

export interface TimeServiceState {
  name: TimeState;
  createTimeMessage(): ITiming;
  transition(controlMsg: ITimingControl): TimeServiceState;
}

export abstract class TimeServiceBaseState implements TimeServiceState {
  protected log = Logger.instance;
  protected timeService: TimeService;

  constructor(timeService: TimeService) {
    this.timeService = timeService;
  }

  public get name() {
    return TimeState.Idle;
  }

  public createTimeMessage(): ITiming {
    throw new Error('Method createTimeMessage not implemented by concrete TimeServiceState.');
  }

  public transition(_controlMsg: ITimingControl): TimeServiceState {
    throw new Error('Method transition not implemented by concrete TimeServiceState.');
  }
}
