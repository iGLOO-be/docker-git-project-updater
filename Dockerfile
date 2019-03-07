FROM node:10.15.2

ENV NODE_ENV=production
ENV PORT 3000
ENV PROJECTS []

WORKDIR /app

RUN apt update -qq && apt install -y jq curl ca-certificates git

COPY . /app

RUN npm install --production

EXPOSE 3000
CMD ["node", "./app"]
