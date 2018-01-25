# test-bed-time-service
Acts as an NTP (Network Time Protocol) service for the test-bed, and publishes the fictive time.

## Introduction
In the test-bed, there will be one or more simulations that, together, create a virtual incident and reasonable responses of the environment. For example, there may be a flooding simulation or earthquake, after which the traffic (simulation) is disturbed too.

In particular, this service will publish the fictive time, the real time, and speed of the simulation at least every 5 seconds, and after a change of the fictive time status (e.g. a speed change, or pause/stop of the simulation). The time message will be described in AVRO, as detailed in the [avro-schemas repository](https://github.com/DRIVER-EU/avro-schemas), and contain:
- Fictive time
- Real time
- Scenario duration (the time that the simulation was in play state)
- Scenario speed
- Status enum: play, paused, stopped, idle

Time will also be transmitted as long (UTC, in msec since 1 january 1970 0:00).

It may also check whether there are (simulation) services that are lagging behind, e.g. by requiring a response ("I'm done"). In case a simulation cannot keep up, the whole scenario needs to be slowed down (either pause or slowdown the total simulation).

The service will be combined with an NTP service to get the real time. For example, by running [Ubuntu Chrony](https://linuxschool.net/note?os=Ubuntu_16.04&p=ntp&f=2) in a Docker container.
