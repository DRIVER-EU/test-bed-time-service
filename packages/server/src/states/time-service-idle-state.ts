import { ITiming, ITimingControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Initialized } from './time-service-initialized-state';

export class Idle extends TimeServiceBaseState {
  public get name() {
    return TimeState.Idle;
  }

  public transition(controlMsg: ITimingControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Init: {
        if (!controlMsg.trialTime) {
          this.log.warn('Received Init command but no TrialTime was provided. Will default to current real-time.');
          this.timeService.trialTime = (new Date).getTime();
        } else {
          this.timeService.trialTime = controlMsg.trialTime!;
          this.log.info('Initialized Trial Time to UTC: ' + new Date(controlMsg.trialTime).toUTCString());
        }
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Initialized.');
        return new Initialized(this.timeService);
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Idle state. Doing nothing!');
        return this;
      }
    }
  }

  createTimeMessage(): ITiming {
    return {
      updatedAt: Date.now(),
      trialTime: 0,
      timeElapsed: 0,
      trialTimeSpeed: 0,
      state: TimeState.Idle
    } as ITiming;
  }

}
