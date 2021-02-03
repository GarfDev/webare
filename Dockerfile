FROM node:14.0.0-alpine as build-stage
RUN mkdir -p build
WORKDIR /build
COPY . .
RUN yarn
RUN yarn build

FROM node:14.0.0-alpine as run-stage
RUN mkdir -p app
COPY --from=build-stage /build ./app
WORKDIR /app
ENTRYPOINT [ "yarn", "start" ]
