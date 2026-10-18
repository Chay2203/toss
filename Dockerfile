FROM node:22-alpine@sha256:0a7108bf6c7bf5de370ffb1a3ed6be93d405b43ff159f681a8d18c0e2bc2e402
# The runtime needs Node only; remove unused package managers.
RUN rm -rf /usr/local/lib/node_modules /opt/yarn* /usr/local/bin/npm /usr/local/bin/npx /usr/local/bin/yarn /usr/local/bin/yarnpkg
ARG VERSION=development
LABEL org.opencontainers.image.revision=$VERSION
ENV APP_VERSION=$VERSION PORT=3000 NODE_ENV=production
WORKDIR /app
COPY --chown=1000:1000 app app
COPY --chown=1000:1000 public public
USER 1000:1000
EXPOSE 3000
CMD ["node","app/server.mjs"]
