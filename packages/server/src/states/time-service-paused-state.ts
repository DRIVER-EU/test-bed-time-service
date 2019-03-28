import { ITiming, ITimingControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Stopped } from './time-service-stopped-state';
import { Started } from './time-service-started-state';

export class Paused extends TimeServiceBaseState {
  public get name() {
    return TimeState.Paused;
  }

  public transition(controlMsg: ITimingControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Start: {
        this.timeService.progressTrialTime(); // progress time using old speed (zero)
        if (controlMsg.trialTimeSpeed == null) {
          this.log.warn('No Trial Time Speed provided when resuming the Time Service. Defaulting to 1.0');
          this.timeService.trialTimeSpeed = 1.0;
        } else {
          this.timeService.trialTimeSpeed = controlMsg.trialTimeSpeed;
        }
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Started.');
        return new Started(this.timeService);
      }
      case TimeCommand.Stop: {
        this.timeService.progressTrialTime(); // progress time using old speed (zero)
        this.timeService.stopScenario(); // stop sending periodic messages
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Stopped.');
        return new Stopped(this.timeService);
      }
      case TimeCommand.Update: {
        if (controlMsg.trialTimeSpeed != null) {
          this.log.info('Received command ' + controlMsg.command + ', but cannot update trial time speed when in paused state.');
        }
        if (controlMsg.trialTime != null) {
          this.timeService.trialTime = controlMsg.trialTime;
        }
        return this;
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Paused state. Doing nothing!');
        return this;
      }
    }
  }

  createTimeMessage(): ITiming {
    const newUpdateTime = Date.now();
    const timeElapsed = newUpdateTime - this.timeService.realStartTime!;
    // unlike when started, don't progress the trialtime before sending an update
    const trialTime = this.timeService.trialTime;
    const trialTimeSpeed = this.timeService.trialTimeSpeed;
    const timeMsg = {
      updatedAt: newUpdateTime,
      trialTime: trialTime,
      timeElapsed: timeElapsed,
      trialTimeSpeed: trialTimeSpeed,
      state: TimeState.Paused
    } as ITiming;
    return timeMsg;
  }
}
