FROM ruby:2.7

ENV LANG C.UTF-8
ENV TZ Asia/Tokyo

RUN apt-get update && \
    apt-get install -y build-essential

RUN gem install bundler

WORKDIR /app

COPY --chown=rails Gemfile Gemfile.lock /app/

RUN bundle install

#実行時にコマンド指定が無い場合に実行されるコマンド
CMD ["bin/rails", "s", "-b", "0.0.0.0"]

### BUID ###
# docker build -t myrailsapp . # myrailsappは任意の名前
# docker run -p 3000:3000 myrailsapp
