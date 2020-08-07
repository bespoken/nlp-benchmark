FROM node:12

EXPOSE 3000

WORKDIR /opt

RUN mkdir benchmark

WORKDIR /opt/benchmark

COPY src/ ./src/

COPY web/ ./web/

COPY *.json ./

RUN npm install