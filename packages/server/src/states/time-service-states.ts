import { ITimeManagement, ITimeControl, TimeState, AdapterLogger } from 'node-test-bed-adapter';
import { TimeService } from './../time-service.js';

export interface TimeServiceState {
  name: TimeState;
  createTimeMessage(): ITimeManagement;
  transition(controlMsg: ITimeControl): TimeServiceState;
}

export abstract class TimeServiceBaseState implements TimeServiceState {
  protected log = AdapterLogger.instance;
  protected timeService: TimeService;

  constructor(timeService: TimeService) {
    this.timeService = timeService;
  }

  public get name() {
    return TimeState.Reset;
  }

  public createTimeMessage(): ITimeManagement {
    throw new Error('Method createTimeMessage not implemented by concrete TimeServiceState.');
  }

  public transition(_controlMsg: ITimeControl): TimeServiceState {
    throw new Error('Method transition not implemented by concrete TimeServiceState.');
  }
}
