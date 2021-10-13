FROM node:14.3

WORKDIR /app

ENV LANG C.UTF-8
ENV TZ Asia/Tokyo

ADD package.json /app/package.json
ADD package-lock.json /app/package-lock.json

RUN apt-get update && \
    npm install -g @vue/cli nuxt create-nuxt-app

ADD . /app

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
