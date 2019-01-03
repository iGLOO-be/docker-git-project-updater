FROM node:10-alpine

ENV NODE_ENV=production
ENV PORT 3000
ENV PROJECTS []

WORKDIR /app

RUN apk update -q && apk add -q jq curl ca-certificates openssh git

COPY . /app

RUN npm install --production

EXPOSE 3000
CMD ["node", "./app"]
