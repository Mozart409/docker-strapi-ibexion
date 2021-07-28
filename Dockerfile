FROM strapi/base

LABEL authors="Amadeus Mader"

WORKDIR /app

COPY ./package.json ./
COPY ./yarn.lock ./


RUN yarn install

COPY . .

ENV NODE_ENV production
ENV DATABASE_CLIENT postgres
ENV DATABASE_HOST db
ENV DATABASE_PORT 5432
ENV DATABASE_NAME strapi
ENV DATABASE_USERNAME strapi
ENV DATABASE_PASSWORD strapi

RUN yarn build

EXPOSE 1337

CMD ["yarn", "start"]
