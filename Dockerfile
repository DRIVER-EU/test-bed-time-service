FROM rinzeb/node-python-typescript-git AS builder
RUN mkdir -p /src
WORKDIR /src
COPY . /src/
RUN npm i --production
RUN ls /src/packages/server/dist

FROM node:alpine
RUN mkdir -p /app
COPY --from=builder /src/packages/server/package.json /app/package.json
COPY --from=builder /src/packages/server/dist /app/dist
COPY --from=builder /src/packages/server/node_modules /app/node_modules
COPY --from=builder /src/packages/server/public /app/public
COPY --from=builder /src/packages/server/schemas  /app/schemas
WORKDIR /app
CMD ["node", "./dist/index.js"]