FROM node:10
WORKDIR /home/node/app
COPY dist/ ./
CMD ["node ./dist/main.js"]