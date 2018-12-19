import { App } from './app';
import * as commandLineArgs from 'command-line-args';
import { OptionDefinition } from 'command-line-args';
import * as npmPackage from '../package.json';
import { Application } from 'express';

export interface ICommandOptions {
  port: number;
  interval: number;
  kafkaHost: string;
  schemaRegistryUrl: string;
  autoRegisterSchemas: boolean;
  help?: boolean;
  version?: boolean;
}

export interface IOptionDefinition extends OptionDefinition {
  typeLabel: string;
  description: string;
}

export class CommandLineInterface {
  static optionDefinitions: IOptionDefinition[] = [
    {
      name: 'help',
      alias: 'h',
      type: Boolean,
      typeLabel: '[Boolean]',
      description: 'Show help text',
    },
    {
      name: 'version',
      alias: 'v',
      type: Boolean,
      typeLabel: '[Boolean]',
      description: 'Show version number',
    },
    {
      name: 'kafkaHost',
      alias: 'k',
      type: String,
      defaultValue: process.env.KAFKA_BROKER_URL || 'driver-testbed.eu:3501',
      typeLabel: '[String]',
      description: 'Kafka Broker address, e.g. localhost:3501',
    },
    {
      name: 'schemaRegistryUrl',
      alias: 's',
      type: String,
      defaultValue: process.env.SCHEMA_REGISTRY_URL || 'http://driver-testbed.eu:3502',
      typeLabel: '[String]',
      description: 'Schema Registry URL, e.g. http://localhost:3502',
    },
    {
      name: 'autoRegisterSchemas',
      alias: 'a',
      type: Boolean,
      typeLabel: '[Boolean]',
      defaultValue: process.env.AUTO_REGISTER_SCHEMAS || false,
      description: 'Automatically register all schemas in the ./schemas folder.',
    },
    {
      name: 'port',
      alias: 'p',
      type: Number,
      defaultValue: process.env.PORT || 8100,
      typeLabel: '[Number]',
      description: 'Endpoint port, e.g. http://localhost:PORT/time',
    },
    {
      name: 'interval',
      alias: 'i',
      type: Number,
      defaultValue: process.env.INTERVAL || 5000,
      defaultOption: true,
      typeLabel: '[Number]',
      description: 'Default time interval between time messages in msec.',
    },
  ];

  static sections = [
    {
      header: `${npmPackage.name}, v${npmPackage.version}`,
      content: `${npmPackage.license} license.

      ${npmPackage.description}

      The test-bed time service can be controlled via Apache Kafka. It listens to
      state changes of the test-bed, e.g. scenario start and stop messages.
      It publishes three times:
      - Local system time: This is the same time that the NTP server should use.
      - Fictive simulation time: The time that is used in the scenario. Note that
        it may run faster than realtime.
      - Speed factor: How much faster than realtime are we running.
      - Scenario duration: The duration that the scenario is active (from start to
        stop, expressed in real-time).

      Environment variables:
      - KAFKA_BROKER_URL
      - SCHEMA_REGISTRY_URL
      - AUTO_REGISTER_SCHEMAS
      - PORT
      - INTERVAL
      `,
    },
      {
        header: 'Options',
        optionList: CommandLineInterface.optionDefinitions,
      },
    {
      header: 'Examples',
      content: [
        {
          desc: '01. Start the service.',
          example: `$ ${npmPackage.name}`,
        },
        {
          desc: '02. Start the service, sending out time messages every second.',
          example: `$ ${npmPackage.name} -i 1000`,
        },
        {
          desc: '03. Start the service on port 8080.',
          example: `$ ${npmPackage.name} - 8080`,
        },
        {
          desc: '04. Start the service specifying kafka host and schema registry.',
          example: `$ ${npmPackage.name} -k localhost:3501 -s localhost:3502`,
        },
      ],
    },
  ];
}

const options = commandLineArgs(CommandLineInterface.optionDefinitions) as ICommandOptions;

if (options.version) {
  console.log(`v${npmPackage.version}`);
}
if (options.help) {
  const getUsage = require('command-line-usage');
  const usage = getUsage(CommandLineInterface.sections);
  console.log(usage);
  process.exit(0);
}
const app: Application = new App(options).getApp();
export { app };
