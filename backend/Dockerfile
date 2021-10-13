FROM ruby:2.7

ENV LANG C.UTF-8
ENV TZ Asia/Tokyo

RUN apt-get update && \
    apt-get install -y build-essential vim nginx sudo

RUN gem install bundler

WORKDIR /app

# Dockerのビルドステップキャッシュを利用するため先にGemfileを転送し、bundle installする
COPY Gemfile Gemfile.lock /app/
RUN bundle install

COPY . /app

RUN mkdir -p tmp/sockets
RUN mkdir tmp/pids

# nginx
RUN groupadd nginx
RUN useradd -g nginx nginx
ADD nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

RUN chmod +x /app/entrypoint.sh
CMD ["/app/entrypoint.sh"]
