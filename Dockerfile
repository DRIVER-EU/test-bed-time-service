# Creates the Test-bed-time-service, including a simple GUI / Wall clock
#
# You can access the container using:
#   docker run -it test-bed-time-service sh
# To start it stand-alone:
#   docker run -it -p 8100:8100 test-bed-time-service

FROM node:18.18-alpine3.18 AS builder
RUN mkdir -p /src
COPY . /src/
WORKDIR /src/packages/server
RUN npm i && \
    npm run build
WORKDIR /src/packages/gui
RUN npm i && \
    npm run build

FROM node:18.18-alpine3.18
RUN mkdir -p /app
COPY --from=builder /src/packages/server/package.json /app/package.json
COPY --from=builder /src/packages/server/LICENSE /app/LICENSE
COPY --from=builder /src/packages/server/dist /app/dist
COPY --from=builder /src/packages/server/public /app/public
COPY --from=builder /src/packages/server/schemas /app/schemas
# COPY --from=builder /src/packages/server/node_modules /app/node_modules
WORKDIR /app
RUN npm i --omit=dev
CMD ["node", "./dist/index.js"]