# run unit tests first against the same base image
FROM node:8-slim AS base-env
ARG CLIENT_FILENAME=instantclient-basiclite-linux.x64-18.3.0.0.0dbru.zip
WORKDIR /app
ADD . .
RUN node --version
RUN apt-get update && apt-get install libaio1 unzip
WORKDIR /usr/lib
RUN wget -q https://github.com/adastradev/oracle-instantclient/raw/master/${CLIENT_FILENAME}
RUN unzip ${CLIENT_FILENAME} && rm ${CLIENT_FILENAME}
RUN apt-get -y remove unzip && apt-get clean

# compile image intended for building and testing
FROM node:8-slim AS build-env
ENV LD_LIBRARY_PATH /usr/lib/instantclient_18_3
ARG INTEGRATION_TESTS_ENABLED=false
ARG ORACLE_ENDPOINT=
ARG ORACLE_USER=
ARG ORACLE_PASSWORD=
ARG COVERALLS_REPO_TOKEN=false
ARG COVERALLS_GIT_COMMIT=
ARG COVERALLS_GIT_BRANCH=
WORKDIR /app
COPY --from=base-env /app .
COPY --from=base-env /usr/lib /usr/lib
COPY --from=base-env /lib /lib
RUN apt-get update && apt-get -y install git-core
RUN npm install
RUN npm run build
RUN npm run test
RUN if [ "$COVERALLS_REPO_TOKEN" = "false" ] ; then echo "Coveralls reporting disabled" ; else npm run coveralls ; fi
RUN if [ "$INTEGRATION_TESTS_ENABLED" = "true" ] ; then npm run integration-test ; else echo Integration tests disabled ; fi
RUN apt-get -y remove git-core && apt-get clean

# compile image intended for production use
FROM node:8-slim AS prod-env
ENV LD_LIBRARY_PATH /usr/lib/instantclient_18_3
ENV LOG_PATH /var/log/dia
RUN mkdir /var/log/dia
WORKDIR /app
COPY --from=base-env /app .
COPY --from=base-env /usr/lib /usr/lib
COPY --from=base-env /lib /lib
COPY --from=build-env /app/dist /app/dist
RUN apt-get update && apt-get -y install git-core && \
    npm install --production && \
    apt-get -y remove git-core && apt-get -y autoremove && apt-get clean

# Report to docker the health status so we can possibly use that information
# For now mark unhealthy after 25 sec (interval*retries)
# We could use this information in a watchtower kind of way to restart in addition to upgrade
HEALTHCHECK --interval=5s --timeout=10s --start-period=10s --retries=5 CMD node dist/healthcheck.js || exit 1

# Run the startup script which spawns the agent and acts as a intermediary between it
# and docker to signal the containers health
ENTRYPOINT ["npm", "start"]
