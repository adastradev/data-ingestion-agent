# run unit tests first against the same base image
FROM node:8-slim AS build-env
ENV CLIENT_FILENAME instantclient-basiclite-linux.x64-18.3.0.0.0dbru.zip
WORKDIR /app
ADD . .
ADD https://github.com/adastradev/oracle-instantclient/raw/master/${CLIENT_FILENAME} .
RUN node --version && \
    apt-get update && apt-get install libaio1 unzip && \
    mv /app/${CLIENT_FILENAME} /usr/lib && \
    cd /usr/lib && \
    unzip ${CLIENT_FILENAME} && \
    rm ${CLIENT_FILENAME} && \
    cd instantclient_18_3 && \
    apt-get -y remove unzip && \
    apt-get clean

FROM node:8-slim
ENV LD_LIBRARY_PATH /usr/lib/instantclient_18_3
ARG INTEGRATION_TESTS_ENABLED=false
ARG ORACLE_ENDPOINT=
ARG ORACLE_USER=
ARG ORACLE_PASSWORD=
WORKDIR /app
COPY --from=build-env /app .
COPY --from=build-env /usr/lib /usr/lib
COPY --from=build-env /lib /lib
RUN npm install && \
    node_modules/typescript/bin/tsc && \
    npm run test && \
    if [ "$INTEGRATION_TESTS_ENABLED" = "true" ] ; then npm run integration-test ; else echo Integration tests disabled ; fi

# compile image intended for production use
FROM node:8-slim
ENV LD_LIBRARY_PATH /usr/lib/instantclient_18_3
ENV LOG_PATH /var/log/dia
WORKDIR /app
COPY --from=build-env /app .
COPY --from=build-env /usr/lib /usr/lib
COPY --from=build-env /lib /lib
RUN npm install --production && \
    node_modules/typescript/bin/tsc

# Report to docker the health status so we can possibly use that information
# For now mark unhealthy after 25 sec (interval*retries)
# We could use this information in a watchtower kind of way to restart in addition to upgrade
HEALTHCHECK --interval=5s --timeout=10s --start-period=10s --retries=5 CMD node dist/healthcheck.js || exit 1

# Run the startup script which spawns the agent and acts as a intermediary between it
# and docker to signal the containers health
ENTRYPOINT ["npm", "start"]
