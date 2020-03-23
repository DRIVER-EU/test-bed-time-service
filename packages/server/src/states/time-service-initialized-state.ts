import { ITimeManagement, ITimeControl, TimeState, Command as TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Started } from './time-service-started-state';
import { Idle } from './time-service-idle-state';

export class Initialized extends TimeServiceBaseState {
  public get name() {
    return TimeState.Initialization;
  }

  public transition(controlMsg: ITimeControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Start: {
        if (!controlMsg.simulationSpeed) {
          this.log.info('Received Start command but no simulationSpeed was provided. Will default to 1.0.');
          this.timeService.simulationSpeed = 1.0;
        } else {
          this.timeService.simulationSpeed = controlMsg.simulationSpeed;
        }
        const newState = new Started(this.timeService);
        this.log.info(`Received command ${controlMsg.command}. Transitioning to $${newState.name}.`);
        return newState;
      }
      case TimeCommand.Reset: {
        const newState = new Idle(this.timeService);
        this.log.info(`Received command ${controlMsg.command}. Transitioning to $${newState.name}.`);
        return newState;
      }
      default: {
        this.log.warn(`Received command ${controlMsg.command} while in ${this.name} state. Doing nothing!`);
        return this;
      }
    }
  }

  createTimeMessage() {
    return {
      updatedAt: Date.now(),
      simulationTime: this.timeService.simulationTime,
      simulationSpeed: this.timeService.simulationSpeed,
      state: TimeState.Initialization,
      tags: { timeElapsed: '0' },
    } as ITimeManagement;
  }
}
