FROM node:alpine AS builder
RUN mkdir -p /src
COPY . /src/
WORKDIR /src
RUN npm i -g typescript
RUN npm i -g parcel-bundler
RUN npm i
WORKDIR /src/packages/gui
RUN parcel build index.html --out-dir ../server/public
WORKDIR /src/packages/server
RUN tsc

FROM node:alpine
RUN mkdir -p /app
COPY --from=builder /src/packages/server/package.json /app/package.json
COPY --from=builder /src/packages/server/dist /app/dist
COPY --from=builder /src/packages/server/node_modules /app/node_modules
COPY --from=builder /src/packages/server/public /app/public
COPY --from=builder /src/packages/server/schemas  /app/schemas
WORKDIR /app
CMD ["node", "./dist/index.js"]