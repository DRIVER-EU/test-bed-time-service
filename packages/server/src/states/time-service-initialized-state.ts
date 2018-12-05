import { TimingControlCommand, ITimingControlMessage } from './../models/timing-control-message';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { ITimeMessage } from '../models/time-message';
import { Started } from './time-service-started-state';
import { States } from './states';
import { Idle } from './time-service-idle-state';

export class Initialized extends TimeServiceBaseState {
  public get name() {
    return States.Initialized;
  }

  public transition(controlMsg: ITimingControlMessage): TimeServiceState {
    switch (controlMsg.command) {
      case TimingControlCommand.Start: {
        if (!controlMsg.trialTimeSpeed) {
          this.log.info('Received Start command but no TrialTimeSpeed was provided. Will default to 1.0.');
          this.timeService.trialTimeSpeed = 1.0;
        } else {
          this.timeService.trialTimeSpeed = controlMsg.trialTimeSpeed;
        }
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Started.');
        this.timeService.startScenario();
        return new Started(this.timeService);
      }
      case TimingControlCommand.Reset: {
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Idle.');
        return new Idle(this.timeService);
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Initialized state. Doing nothing!');
        return this;
      }
    }
  }

  createTimeMessage(): ITimeMessage {
    const newUpdateTime = Date.now();
    const timeElapsed = newUpdateTime - this.timeService.realStartTime!;
    // unlike when started, don't progress the trialtime before sending an update
    const trialTime = this.timeService.trialTime;
    const trialTimeSpeed = this.timeService.trialTimeSpeed;
    const timeMsg = {
      updatedAt: newUpdateTime,
      trialTime: trialTime,
      timeElapsed: timeElapsed,
      trialTimeSpeed: trialTimeSpeed
    } as ITimeMessage;
    return timeMsg;
  }
}
