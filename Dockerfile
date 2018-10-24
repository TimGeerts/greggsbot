FROM node:10

# Set the timzeone (important for scheduled messages)
ENV TZ=Europe/London

WORKDIR /home/node/app

# Install dependencies
COPY ./package.json .
RUN yarn

# Build the application
COPY ./resources ./resources
COPY ./src       ./src
COPY ./webpack.prod.js ./webpack.common.js ./tsconfig.json ./
RUN yarn build

USER node
CMD ["yarn", "start"]