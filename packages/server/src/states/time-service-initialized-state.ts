import { ITiming, ITimingControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Started } from './time-service-started-state';
import { Idle } from './time-service-idle-state';

export class Initialized extends TimeServiceBaseState {
  public get name() {
    return TimeState.Initialized;
  }

  public transition(controlMsg: ITimingControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Start: {
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
      case TimeCommand.Reset: {
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Idle.');
        return new Idle(this.timeService);
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Initialized state. Doing nothing!');
        return this;
      }
    }
  }

  createTimeMessage(): ITiming {
    const timeMsg = {
      updatedAt: Date.now(),
      trialTime: this.timeService.trialTime,
      timeElapsed: 0,
      trialTimeSpeed: this.timeService.trialTimeSpeed,
      state: TimeState.Initialized
    } as ITiming;
    return timeMsg;
  }
}
