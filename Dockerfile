# compile image intended for building and testing
FROM node:10-slim AS build-env
ENV LD_LIBRARY_PATH /usr/lib/oracle/18.3/client64/lib

ARG DEFAULT_STAGE
ARG INTEGRATION_TESTS_ENABLED=false
ARG ORACLE_ENDPOINT
ARG ORACLE_USER
ARG ORACLE_PASSWORD
ARG CODECOV_TOKEN
ARG COVERALLS_GIT_COMMIT
ARG COVERALLS_GIT_BRANCH
ARG AWS_REGION
ARG DISCOVERY_SERVICE
ARG ASTRA_CLOUD_USERNAME
ARG ASTRA_CLOUD_PASSWORD
ARG INGEST_RESTORATION_RESOURCES
ARG LOG_LEVEL=silly
ARG RUN_MATILLION=false
ENV DEFAULT_STAGE=$DEFAULT_STAGE
ENV ASTRA_CLOUD_USERNAME=$ASTRA_CLOUD_USERNAME
ENV ASTRA_CLOUD_PASSWORD=$ASTRA_CLOUD_PASSWORD
ENV AWS_REGION=$AWS_REGION
ENV LOG_LEVEL=$LOG_LEVEL
ENV RUN_MATILLION=$RUN_MATILLION
ENV DISCOVERY_SERVICE=$DISCOVERY_SERVICE
ENV INGEST_RESTORATION_RESOURCES=$INGEST_RESTORATION_RESOURCES

RUN apt-get update && apt-get -y install git-core && apt-get -y install git

WORKDIR /app
COPY --from=adastradev/oracle-instantclient:18.3-lite /usr/lib/oracle /usr/lib/oracle
COPY --from=adastradev/oracle-instantclient:18.3-lite /usr/lib64/libaio* /lib/
COPY package.json package-lock.json .snyk tslint.json *.ts *config* ./
COPY source ./source
COPY test ./test
COPY docs ./docs
COPY cli ./cli
COPY git ./.git

RUN npm ci &&\
    npm run lint &&\
    npm run snyk:protect &&\
    npm run build &&\
    npm run test:clean &&\
    npm run unit-test &&\
    if [ "$INTEGRATION_TESTS_ENABLED" = "true" ] ; then npm run test ; else echo Integration tests disabled ; fi &&\
    if [ "$CODECOV_TOKEN" = "false" ] ; then echo "Codecov reporting disabled" ; else npm run test:codecov ; fi
RUN rm -rf node_modules dist/test &&\
    npm ci --production &&\
    apt-get -y remove git-core && apt-get clean

# compile image intended for production use
FROM node:10-slim AS prod-env
ARG DEFAULT_STAGE
ARG DISCOVERY_SERVICE
ARG AWS_REGION
ARG INGEST_RESTORATION_RESOURCES
ARG RUN_MATILLION=false
ENV INGEST_RESTORATION_RESOURCES=$INGEST_RESTORATION_RESOURCES
ENV DEFAULT_STAGE=$DEFAULT_STAGE
ENV DISCOVERY_SERVICE=$DISCOVERY_SERVICE
ENV AWS_REGION=$AWS_REGION
ENV RUN_MATILLION=$RUN_MATILLION
ENV LD_LIBRARY_PATH /usr/lib/oracle/18.3/client64/lib
ENV LOG_PATH /var/log/dia
RUN mkdir /var/log/dia
WORKDIR /app
COPY --from=adastradev/oracle-instantclient:18.3-lite /usr/lib/oracle /usr/lib/oracle
COPY --from=adastradev/oracle-instantclient:18.3-lite /usr/lib64/libaio* /lib/
COPY --from=build-env /app/package.json package.json
COPY --from=build-env /app/dist dist
COPY --from=build-env /app/docs docs
COPY --from=build-env /app/node_modules node_modules

# Report to docker the health status so we can possibly use that information
# For now mark unhealthy after 25 sec (interval*retries)
# We could use this information in a watchtower kind of way to restart in addition to upgrade
HEALTHCHECK --interval=5s --timeout=10s --start-period=10s --retries=5 CMD node dist/healthcheck.js || exit 1

# Run the startup script which spawns the agent and acts as a intermediary between it
# and docker to signal the containers health
ENTRYPOINT ["npm", "start"]
