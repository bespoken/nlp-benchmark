FROM node:16

EXPOSE 3000

WORKDIR /opt

RUN mkdir benchmark

WORKDIR /opt/benchmark

COPY src/ ./src/

COPY web/ ./web/

COPY *.json ./

RUN npm install pnpm -g

RUN pnpm install