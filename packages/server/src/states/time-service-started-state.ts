import { ITiming, ITimingControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Paused } from './time-service-paused-state';
import { Stopped } from './time-service-stopped-state';

export class Started extends TimeServiceBaseState {
  public get name() {
    return TimeState.Started;
  }

  public transition(controlMsg: ITimingControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Pause: {
        this.timeService.progressTrialTime(); // progress time using old speed
        this.timeService.trialTimeSpeed = 0; // set speed to 0 to pause
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Paused.');
        return new Paused(this.timeService);
      }
      case TimeCommand.Stop: {
        this.timeService.progressTrialTime(); // progress time using old speed
        this.timeService.trialTimeSpeed = 0; // set speed to 0 to stop
        this.timeService.stopScenario(); // stop sending periodic messages
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Stopped.');
        return new Stopped(this.timeService);
      }
      case TimeCommand.Update: {
        if (controlMsg.trialTimeSpeed != null) {
          this.timeService.progressTrialTime(); // progress time using old speed
          this.timeService.trialTimeSpeed = controlMsg.trialTimeSpeed;
        }
        if (controlMsg.trialTime != null) {
          this.timeService.trialTime = controlMsg.trialTime;
        }
        return this;
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Started state. Doing nothing!');
        return this;
      }
    }
  }

  createTimeMessage(): ITiming {
    const newUpdateTime = Date.now();
    const timeElapsed = newUpdateTime - this.timeService.realStartTime!;
    const trialTime = this.timeService.progressTrialTime();
    const timeMsg = {
      updatedAt: newUpdateTime,
      trialTime: trialTime,
      timeElapsed: timeElapsed,
      trialTimeSpeed: this.timeService.trialTimeSpeed,
      state: TimeState.Started
    } as ITiming;
    return timeMsg;
  }
}
