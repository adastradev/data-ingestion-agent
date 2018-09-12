# run unit tests first against the same base image
FROM node:alpine
WORKDIR /app
ADD . .
RUN \
    node --version \
    npm install && \
    npm run-script test

# compile image intended for production use
FROM node:alpine
WORKDIR /app
ADD . .
RUN npm install --production

CMD [$parameters]
ENTRYPOINT ["npm", "start"]