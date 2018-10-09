# run unit tests first against the same base image
FROM oraclelinux:7-slim
WORKDIR /app
ADD . .
ENV PATH=$PATH:/usr/lib/oracle/18.3/client64/bin
RUN yum -y install /app/oracle-instantclient*.rpm && \
    rm -rf /var/cache/yum && \
    rm -f /app/oracle-instantclient*.rpm && \
    echo /usr/lib/oracle/18.3/client64/lib > /etc/ld.so.conf.d/oracle-instantclient18.3.conf && \
    ldconfig && \
    yum -y install yum-utils && \
    yum-config-manager --enable ol7_developer_nodejs8 && \
    yum -y install nodejs && \
    npm install && \
    node_modules/typescript/bin/tsc
ENV PATH=$PATH:/usr/lib/oracle/18.3/client64/bin
# RUN npm run-script test 

# compile image intended for production use
# FROM oraclelinux:7-slim
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

