import commandLineArgs from 'command-line-args';
import { OptionDefinition } from 'command-line-args';
import { Application } from 'express';
import { App } from './app.js';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { cwd } from 'process';

const npmPackage = {
  name: process.env.npm_package_name,
  version: process.env.npm_package_version,
};

export interface ICommandOptions {
  port: number;
  interval: number;
  groupId: string;
  kafkaHost: string;
  schemaRegistryUrl: string;
  autoRegisterSchemas: boolean;
  /** Show informative messages, such as billboard and videos, on the screen */
  billboard?: boolean;
  help?: boolean;
  version?: boolean;
  /** Path to video folder - no CLI option, hardcoded */
  videos: string;
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
      defaultValue: process.env.KAFKA_BROKER_URL || 'localhost:3501',
      typeLabel: '[String]',
      description: 'Kafka Broker address, e.g. localhost:3501',
    },
    {
      name: 'schemaRegistryUrl',
      alias: 's',
      type: String,
      defaultValue: process.env.SCHEMA_REGISTRY_URL || 'http://localhost:3502',
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
      name: 'groupId',
      alias: 'g',
      type: Number,
      defaultValue: process.env.GROUP_ID || process.env.CLIENT_ID || 'TimeService',
      typeLabel: '[String]',
      description: 'Group ID, e.g. TimeService',
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
    {
      name: 'billboard',
      alias: 'b',
      type: Boolean,
      typeLabel: '[Boolean]',
      description: 'If set, listen to billboard and video messages.',
    },
  ];

  static sections = [
    {
      header: `${npmPackage.name}, v${npmPackage.version}`,
      content: `MIT license.

      A time service for the test-bed, producing messages with real time, fictive
      time and scenario duration.

      The test-bed time service can be controlled via Apache Kafka. It listens to
      state changes of the test-bed, e.g. scenario start and stop messages. Also,
      it can receive RolePlayerMessages that are displayed in the billboard, and
      videos (NOTE: Videos need to be stored in the 'videos' folder, which can be
      mounted in Docker).

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
      - BILLBOARD
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

const videos = join(cwd(), 'videos');
if (!existsSync(videos)) mkdirSync(videos, { recursive: true });
options.videos = videos;

const app: Application = new App(options).getApp();
export { app };
