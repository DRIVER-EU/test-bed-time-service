
import { TimingControlCommand, ITimingControlMessage } from "./../models/timing-control-message";
import { TimeServiceBaseState, TimeServiceState } from "./time-service-states";
import { ITimeMessage } from "../models/time-message";
import { Paused } from "./time-service-paused-state";
import { Stopped } from "./time-service-stopped-state";

export class Started extends TimeServiceBaseState {
  transition(controlMsg: ITimingControlMessage): TimeServiceState {
    switch (controlMsg.command) {
      case TimingControlCommand.Pause: {
        this.timeService.progressTrialTime(); // progress time using old speed
        this.timeService.TrialTimeSpeed = 0; // set speed to 0 to pause
        this.timeService.sendTimeUpdate(); // send the time speed update message ASAP
        this.log.info("Received command " + controlMsg.command +". Transitioning to Paused.");
        return new Paused(this.timeService);
      }
      case TimingControlCommand.Stop: {
        this.timeService.progressTrialTime(); // progress time using old speed
        this.timeService.TrialTimeSpeed = 0; // set speed to 0 to stop
        this.timeService.sendTimeUpdate(); // send the time speed update message ASAP
        this.timeService.stopScenario(); // stop sending periodic messages
        this.log.info("Received command " + controlMsg.command + ". Transitioning to Stopped.");
        return new Stopped(this.timeService);
      }
      case TimingControlCommand.Update: {
        if (controlMsg.trialTimeSpeed != null) {
          this.timeService.progressTrialTime(); // progress time using old speed
          this.timeService.TrialTimeSpeed = controlMsg.trialTimeSpeed;
        }
        if (controlMsg.trialTime != null) {
          this.timeService.TrialTime = controlMsg.trialTime;
        }
        this.timeService.sendTimeUpdate(); // send updated values ASAP
        return this;
      }
      default: {
        this.log.warn(
          "Received command " +
            controlMsg.command +
            " while in Started state. Doing nothing!"
        );
        return this;
      }
    }
  }

  createTimeMessage(): ITimeMessage {
    const newUpdateTime = Date.now();
    const timeElapsed = newUpdateTime - this.timeService.RealStartTime!;
    this.timeService.progressTrialTime();
    const trialTime = this.timeService.TrialTime;
    const timeMsg = {
      updatedAt: newUpdateTime,
      trialTime: trialTime,
      timeElapsed: timeElapsed,
      trialTimeSpeed: this.timeService.TrialTimeSpeed
    } as ITimeMessage;
    return timeMsg;
  }
}
