export interface ITimingControlMessage {
  /** Sequence ID */
  id: number;
  /** The date and time the distribution message was sent as the number of milliseconds from the unix epoch, 1 January 1970 00:00:00.000 UTC. */
  trialTime?: number;
  /** The Trialtime speed factor */
  trialTimeSpeed?: number;
}