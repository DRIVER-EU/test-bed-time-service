import { TimingControlCommand, ITimingControlMessage } from './../models/timing-control-message';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { ITimeMessage } from '../models/time-message';
import { Stopped } from './time-service-stopped-state';
import { Started } from './time-service-started-state';
import { States } from './states';

export class Paused extends TimeServiceBaseState {
  public get name() {
    return States.Paused;
  }

  public transition(controlMsg: ITimingControlMessage): TimeServiceState {
    switch (controlMsg.command) {
      case TimingControlCommand.Start: {
        this.timeService.progressTrialTime(); // progress time using old speed (zero)
        if (controlMsg.trialTimeSpeed == null) {
          this.log.warn('No Trial Time Speed provided when resuming the Time Service. Defaulting to 1.0');
          this.timeService.trialTimeSpeed = 1.0;
        } else {
          this.timeService.trialTimeSpeed = controlMsg.trialTimeSpeed;
        }
        this.timeService.sendTimeUpdate(); // send the time speed update message ASAP
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Started.');
        return new Started(this.timeService);
      }
      case TimingControlCommand.Stop: {
        this.timeService.progressTrialTime(); // progress time using old speed (zero)
        this.timeService.sendTimeUpdate(); // send the time speed update message ASAP
        this.timeService.stopScenario(); // stop sending periodic messages
        this.log.info('Received command ' + controlMsg.command + '. Transitioning to Stopped.');
        return new Stopped(this.timeService);
      }
      case TimingControlCommand.Update: {
        if (controlMsg.trialTimeSpeed != null) {
          this.timeService.progressTrialTime(); // progress time using old speed
          this.timeService.trialTimeSpeed = controlMsg.trialTimeSpeed;
        }
        if (controlMsg.trialTime != null) {
          this.timeService.trialTime = controlMsg.trialTime;
        }
        this.timeService.sendTimeUpdate(); // send updated values ASAP
        return this;
      }
      default: {
        this.log.warn('Received command ' + controlMsg.command + ' while in Paused state. Doing nothing!');
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
    } as ITimeMessage;
    return timeMsg;
  }
}
