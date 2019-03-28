import { ITiming, ITimingControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Idle } from './time-service-idle-state';

export class Stopped extends TimeServiceBaseState {
  public get name() {
    return TimeState.Stopped;
  }

  public transition(controlMsg: ITimingControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Reset: {
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Idle.');
        return new Idle(this.timeService);
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Stopped state. Doing nothing!');
        return this;
      }
    }
  }

  createTimeMessage(): ITiming {
    const newUpdateTime = Date.now();
    const timeElapsed = newUpdateTime - this.timeService.realStartTime!;
    // unlike when started, don't progress the trialtime before sending an update
    const trialTime = this.timeService.trialTime;
    const timeMsg = {
      updatedAt: newUpdateTime,
      trialTime: trialTime,
      timeElapsed: timeElapsed,
      trialTimeSpeed: 0,
      state: TimeState.Stopped
    } as ITiming;
    return timeMsg;
  }
}
