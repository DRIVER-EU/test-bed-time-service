import { TimingControlCommand, ITimingControlMessage } from './../models/timing-control-message';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Initialized } from './time-service-initialized-state';

export class Idle extends TimeServiceBaseState {
  transition(controlMsg: ITimingControlMessage): TimeServiceState {
    switch (controlMsg.command) {
      case TimingControlCommand.Init: {
        if (controlMsg.trialTime == null) {
          this.log.warn('Received Init command but no TrialTime was provided. Will default to current real-time.');
        } else {
          this.timeService.TrialTime = controlMsg.trialTime!;
          this.log.info('Initialized Trial Time to: ' + controlMsg.trialTime!);
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
}
