import { TimeService } from './../time-service';
import { Logger } from 'node-test-bed-adapter';
import { ITimingControlMessage } from './../models/timing-control-message';
import { TimeServiceState } from './time-service-states';
import { ITimeMessage } from './../models/time-message';
import { States } from './states';

export interface TimeServiceState {
  name: States;
  createTimeMessage(): ITimeMessage;
  transition(controlMsg: ITimingControlMessage): TimeServiceState;
}

export abstract class TimeServiceBaseState implements TimeServiceState {
  protected log = Logger.instance;
  protected timeService: TimeService;

  constructor(timeService: TimeService) {
    this.timeService = timeService;
  }

  public get name() {
    return States.Idle;
  }

  public createTimeMessage(): ITimeMessage {
    throw new Error('Method createTimeMessage not implemented by concrete TimeServiceState.');
  }

  public transition(_controlMsg: ITimingControlMessage): TimeServiceState {
    throw new Error('Method transition not implemented by concrete TimeServiceState.');
  }
}
