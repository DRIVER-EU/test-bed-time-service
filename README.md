# test-bed-time-service

The test-bed time service can be controlled via Apache Kafka. It listens to state changes of the test-bed, e.g. scenario start and stop messages.

It publishes messages in regular intervals (default 5 seconds) and after receiving a change. The messages contain:
- Local system time: This is the same time that the NTP server should use.
- Fictive simulation time: The time that is used in the scenario. Note that it may run faster than realtime.
- Speed factor: How much faster than realtime are we running.
- Scenario duration: The duration that the scenario is active (from start to stop, expressed in real-time)