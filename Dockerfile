### Dependencies ###
FROM node:20-alpine

RUN npm install --global --unsafe-perm @medusajs/medusa-cli@latest
RUN corepack enable
RUN apk update
RUN apk add --no-cache libc6-compat
RUN apk add python3

WORKDIR /app
# Copy medusa package.json and yarn.lock from /backend
COPY ./package.json ./
COPY ./yarn.lock ./

RUN echo 'nodeLinker: "node-modules"' > ./.yarnrc.yml

# Install deps
RUN yarn install --immutable

# ### Build ###
WORKDIR /app
# FROM node:20-alpine as builder
# WORKDIR /app
RUN pwd
RUN ls -a
# RUN corepack enable

# Copy cached node_modules from deps
# COPY --from=deps /app/node_modules /app/node_modules

# Install python and medusa-cli


# Copy app source code
COPY . /app
# Rebuild admin
RUN yarn build
EXPOSE 9000

# Image entrypoint develop
CMD ["yarn", "start"]