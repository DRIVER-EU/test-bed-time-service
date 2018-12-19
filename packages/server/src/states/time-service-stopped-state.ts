import { TimingControlCommand, ITimingControlMessage } from './../models/timing-control-message';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { ITimeMessage, TimingState } from '../models/time-message';
import { Idle } from './time-service-idle-state';
import { States } from './states';

export class Stopped extends TimeServiceBaseState {
  public get name() {
    return States.Stopped;
  }

  public transition(controlMsg: ITimingControlMessage): TimeServiceState {
    switch (controlMsg.command) {
      case TimingControlCommand.Reset: {
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Idle.');
        return new Idle(this.timeService);
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Stopped state. Doing nothing!');
        return this;
      }
    }
  }

  createTimeMessage(): ITimeMessage {
    const newUpdateTime = Date.now();
    const timeElapsed = newUpdateTime - this.timeService.realStartTime!;
    // unlike when started, don't progress the trialtime before sending an update
    const trialTime = this.timeService.trialTime;
    const timeMsg = {
      updatedAt: newUpdateTime,
      trialTime: trialTime,
      timeElapsed: timeElapsed,
      trialTimeSpeed: 0,
      state: TimingState.Stopped
    } as ITimeMessage;
    return timeMsg;
  }
}
