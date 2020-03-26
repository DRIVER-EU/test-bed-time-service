import { ITimeManagement, ITimeControl, TimeState, TimeCommand } from 'node-test-bed-adapter';
import { TimeServiceBaseState, TimeServiceState } from './time-service-states';
import { Idle } from './time-service-idle-state';

export class Stopped extends TimeServiceBaseState {
  public get name() {
    return TimeState.Stopped;
  }

  public transition(controlMsg: ITimeControl): TimeServiceState {
    switch (controlMsg.command) {
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
    const timestamp = Date.now();
    const timeElapsed = (timestamp - this.timeService.realStartTime!).toString();
    // unlike when started, don't progress the simulationTime before sending an update
    const simulationTime = this.timeService.simulationTime;
    return {
      timestamp,
      simulationTime,
      simulationSpeed: 0,
      state: TimeState.Stopped,
      tags: { timeElapsed },
    } as ITimeManagement;
  }
}
