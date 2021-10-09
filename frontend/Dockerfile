FROM node:14.3

WORKDIR /app

ENV LANG C.UTF-8
ENV TZ Asia/Tokyo

RUN apt-get update && \
    npm install -g @vue/cli nuxt create-nuxt-app

ADD . /app
