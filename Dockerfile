# Install dependencies only when needed
FROM node:lts-bullseye-slim
WORKDIR /app
COPY ./build ./build
COPY  ./node_modules ./node_modules
COPY  ./package.json ./package.json

ENV NODE_ENV=production

EXPOSE 3000


CMD ["yarn serve"]
 