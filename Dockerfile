# run unit tests first against the same base image
FROM node:8-slim
WORKDIR /app
ADD . .
RUN node --version && \
    apt-get update && apt-get install libaio1 unzip && \
    mkdir -p /usr/lib && \
    mv /app/instantclient-basiclite-linux.x64-18.3.0.0.0dbru.zip /usr/lib && \
    cd /usr/lib && \
    unzip instantclient-basiclite-linux.x64-18.3.0.0.0dbru.zip && \
    rm instantclient-basiclite-linux.x64-18.3.0.0.0dbru.zip && \
    ln /usr/lib/instantclient_18_3/libclntsh.so.18.1 /usr/lib/libclntsh.so && \
    ln /usr/lib/instantclient_18_3/libocci.so.18.1 /usr/lib/libocci.so && \
    ln /usr/lib/instantclient_18_3/libociei.so /usr/lib/libociei.so && \
    ln /usr/lib/instantclient_18_3/libnnz12.so /usr/lib/libnnz12.so && \
    apt-get -y remove unzip && \
    apt-get clean && \
    cd /app && \
    npm install && \
    node_modules/typescript/bin/tsc
ENV LD_LIBRARY_PATH=$LD_LIBRARY_PATH=/usr/lib/instantclient_18_3
# RUN npm run-script test

# compile image intended for production use
# FROM metaa/node-alpine-glibc
# WORKDIR /app
# ADD . .
# RUN npm install --production && \
#     node_modules/typescript/bin/tsc

# # Report to docker the health status so we can possibly use that information
# # For now mark unhealthy after 25 sec (interval*retries)
# # We could use this information in a watchtower kind of way to restart in addition to upgrade
# HEALTHCHECK --interval=5s --timeout=10s --start-period=10s --retries=5 CMD node dist/healthcheck.js || exit 1

# Run the startup script which spawns the agent and acts as a intermediary between it
# and docker to signal the containers health
ENTRYPOINT ["npm", "start"]

