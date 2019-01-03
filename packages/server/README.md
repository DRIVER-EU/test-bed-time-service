# test-bed-time-service

This is the time-service server: it listens to control messages from Kafka, and from (any) connected GUI via socket.io. Assuming you have installed it successfully using `npm i -g test-bed-time-service`, run `test-bed-time-service --help` to see a list of options.

![Alt text](./doc/test-bed-time-service-gui.png?raw=true "Screenshot of the GUI.")

```console
test-bed-time-service, v0.1.0

  MIT license.

  A time service for the test-bed, producing messages with real time, fictive
  time and scenario duration.

  The test-bed time service can be controlled via Apache Kafka. It listens to
  state changes of the test-bed, e.g. scenario start and stop messages.
  It publishes three times:
  - Local system time: This is the same time that the NTP server should use.
  - Fictive simulation time: The time that is used in the scenario. Note that
  it may run faster than realtime.
  - Speed factor: How much faster than realtime are we running.
  - Scenario duration: The duration that the scenario is active (from start to
  stop, expressed in real-time).

Options

  -h, --help [Boolean]                  Show help text
  -v, --version [Boolean]               Show version number
  -k, --kafkaHost [String]              Kafka Broker address, e.g. localhost:3501
  -s, --schemaRegistryUrl [String]      Schema Registry URL, e.g.
                                        http://localhost:3502
  -a, --autoRegisterSchemas [Boolean]   Automatically register all schemas in the
                                        ./schemas folder.
  -p, --port [Number]                   Endpoint port, e.g.
                                        http://localhost:PORT/time
  -i, --interval [Number]               Default time interval between time
                                        messages in msec.

Examples

  01. Start the service.                        $ test-bed-time-service
  02. Start the service, sending out time       $ test-bed-time-service -i 1000
  messages every second.
  03. Start the service on port 8080.        $ test-bed-time-service - 8080
  04. Start the service specifying kafka host   $ test-bed-time-service -k localhost:3501
  and schema registry.                          -s localhost:3502
```
