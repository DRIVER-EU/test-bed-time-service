import { ITimeManagement, ITimeControl, TimeState, Command as TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Initialized } from './time-service-initialized-state';

export class Idle extends TimeServiceBaseState {
  public get name() {
    return TimeState.Reset;
  }

  public transition(controlMsg: ITimeControl): TimeServiceState {
    switch (controlMsg.command) {
      case TimeCommand.Init: {
        if (!controlMsg.simulationTime) {
          this.log.warn('Received Init command but no simulationTime was provided. Will default to current real-time.');
          this.timeService.simulationTime = new Date().getTime();
        } else {
          this.timeService.simulationTime = controlMsg.simulationTime!;
          this.log.info('Initialized Trial Time to UTC: ' + new Date(controlMsg.simulationTime).toUTCString());
        }
        const newState = new Initialized(this.timeService);
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
      simulationTime: 0,
      simulationSpeed: 0,
      state: TimeState.Reset,
      tags: { timeElapsed: '0' },
    } as ITimeManagement;
  }
}
