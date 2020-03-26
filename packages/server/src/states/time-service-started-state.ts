import { ITimeManagement, ITimeControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Paused } from './time-service-paused-state';
import { Stopped } from './time-service-stopped-state';

export class Started extends TimeServiceBaseState {
  public get name() {
    return TimeState.Started;
  }

  public transition(controlMsg: ITimeControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Pause: {
        this.timeService.progressTrialTime(); // progress time using old speed
        this.timeService.simulationSpeed = 0; // set speed to 0 to pause
        const newState = new Paused(this.timeService);
        this.log.info(`Received command ${controlMsg.command}. Transitioning to $${newState.name}.`);
        return newState;
      }
      case TimeCommand.Stop: {
        this.timeService.progressTrialTime(); // progress time using old speed
        this.timeService.simulationSpeed = 0; // set speed to 0 to stop
        this.timeService.stopScenario(); // stop sending periodic messages
        const newState = new Stopped(this.timeService);
        this.log.info(`Received command ${controlMsg.command}. Transitioning to $${newState.name}.`);
        return newState;
      }
      case TimeCommand.Update: {
        if (controlMsg.simulationSpeed != null) {
          this.timeService.progressTrialTime(); // progress time using old speed
          this.timeService.simulationSpeed = controlMsg.simulationSpeed;
        }
        if (controlMsg.simulationTime != null) {
          this.timeService.simulationTime = controlMsg.simulationTime;
        }
        return this;
      }
      default: {
        this.log.warn(`Received command ${controlMsg.command} while in ${this.name} state. Doing nothing!`);
        return this;
      }
    }
  }

  createTimeMessage() {
    const timestamp = Date.now();
    const timeElapsed = (timestamp - this.timeService.realStartTime!).toString();
    const simulationTime = this.timeService.progressTrialTime();
    return {
      timestamp,
      simulationTime,
      simulationSpeed: this.timeService.simulationSpeed,
      state: TimeState.Started,
      tags: { timeElapsed },
    } as ITimeManagement;
  }
}
