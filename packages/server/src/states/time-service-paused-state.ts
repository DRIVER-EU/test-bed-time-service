import { ITimeManagement, ITimeControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Stopped } from './time-service-stopped-state';
import { Started } from './time-service-started-state';

export class Paused extends TimeServiceBaseState {
  public get name() {
    return TimeState.Paused;
  }

  public transition(controlMsg: ITimeControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Start: {
        this.timeService.progressTrialTime(); // progress time using old speed (zero)
        if (controlMsg.simulationSpeed == null) {
          this.log.info('No Trial Time Speed provided when resuming the Time Service. Defaulting to 1.0');
          this.timeService.simulationSpeed = 1.0;
        } else {
          this.timeService.simulationSpeed = controlMsg.simulationSpeed;
        }
        const newState = new Started(this.timeService);
        this.log.info(`Received command ${controlMsg.command}. Transitioning to $${newState.name}.`);
        return newState;
      }
      case TimeCommand.Stop: {
        this.timeService.progressTrialTime(); // progress time using old speed (zero)
        this.timeService.stopScenario(); // stop sending periodic messages
        const newState = new Stopped(this.timeService);
        this.log.info(`Received command ${controlMsg.command}. Transitioning to $${newState.name}.`);
        return newState;
      }
      case TimeCommand.Update: {
        if (controlMsg.simulationSpeed != null) {
          this.log.info(
            'Received command ' + controlMsg.command + ', but cannot update trial time speed when in paused state.'
          );
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
    const updatedAt = Date.now();
    const timeElapsed = (updatedAt - this.timeService.realStartTime!).toString();
    // unlike when started, don't progress the simulationTime before sending an update
    const simulationTime = this.timeService.simulationTime;
    const simulationSpeed = this.timeService.simulationSpeed;
    return {
      updatedAt,
      simulationTime,
      simulationSpeed,
      state: TimeState.Paused,
      tags: { timeElapsed },
    } as ITimeManagement;
  }
}
