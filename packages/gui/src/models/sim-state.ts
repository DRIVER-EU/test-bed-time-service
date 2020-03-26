import { TimeState, ITimeMessage } from './time-message';

export const SimulationState = {
  /**
   * The date and time the simulationTime was updated as the number of milliseconds
   * from the unix epoch, 1 January 1970 00:00:00.000 UTC.
   */
  timestamp: Date.now(),
  /**
   * The fictive date and time of the simulation / trial as the number of milliseconds
   * from the UNIX epoch, 1 January 1970 00:00:00.000 UTC.
   */
  simulationTime: Date.now(),
  /**
   * Positive number, indicating how fast the simulation / trial time moves with respect
   * to the actual time. A value of 0 means a pause, 1 is as fast as real-time.
   */
  simulationSpeed: 0,
  /**
   * Current active state
   */
  state: TimeState.Reset,
  /** Tag for maintaining the elapsed time */
  tags: {
    timeElapsed: '0',
  },
  /**
   * Queue with role player messages for the billboard
   */
  messageQueue: [],
} as ITimeMessage;
