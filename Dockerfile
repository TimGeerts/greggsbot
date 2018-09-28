FROM node:10

WORKDIR /home/node/app

COPY package.json ./
RUN npm install

COPY src               ./
COPY tsconfig.json     ./
COPY webpack.config.js ./
RUN npm run build

CMD ["node ./dist/main.js"]