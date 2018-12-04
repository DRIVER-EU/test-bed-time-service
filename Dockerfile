FROM node:alpine AS builder
RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh && \
    npm config set unsafe-perm true && \
    npm -g install cssnano parcel-bundler requirejs postcss@">=6" postcss-cli@latest postcss-import-url postcss-css-variables
# RUN curl -sL https://unpkg.com/@pnpm/self-installer | node
# RUN npm install -g parcel-bundler
RUN mkdir -p /src
RUN mkdir -p ~/.ssh && ssh-keyscan -t rsa github.com >> ~/.ssh/known_hosts
COPY . /src/
WORKDIR /src
RUN npm i
WORKDIR /src/packages/gui
RUN npm run build
WORKDIR /src/packages/server
RUN npm run build

FROM node:alpine
RUN mkdir -p /app
COPY --from=builder /src/packages/server/package.json /app/package.json
COPY --from=builder /src/packages/server/dist /app/dist
COPY --from=builder /src/packages/server/node_modules /app/node_modules
COPY --from=builder /src/packages/server/public /app/public
COPY --from=builder /src/packages/server/schemas  /app/schemas
WORKDIR /app
CMD ["node", "./dist/index.js"]