# Creates the Test-bed-time-service, including a simple GUI / Wall clock
#
# You can access the container using:
#   docker run -it test-bed-time-service sh
# To start it stand-alone:
#   docker run -it -p 8100:8100 test-bed-time-service

FROM node:alpine AS builder
RUN mkdir -p /src && \
    npm install webpack webpack-cli typescript -g
COPY . /src/
WORKDIR /src
RUN npm i && \
    npm run build

FROM node:alpine
RUN mkdir -p /app
COPY --from=builder /src/packages/server/package.json /app/package.json
COPY --from=builder /src/packages/server/dist /app/dist
COPY --from=builder /src/packages/server/node_modules /app/node_modules
COPY --from=builder /src/packages/server/public /app/public
COPY --from=builder /src/packages/server/schemas  /app/schemas
WORKDIR /app
CMD ["node", "./dist/index.js"]