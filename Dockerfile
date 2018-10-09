FROM node:10

ENV TZ=Europe/London
WORKDIR /home/node/app

COPY ./package.json .
RUN yarn

COPY ./resources ./resources
COPY ./src       ./src
COPY ./webpack.prod.js ./webpack.common.js ./webpack.dev.js ./tsconfig.json ./
RUN yarn dev

USER node

CMD ["yarn", "start"]