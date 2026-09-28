# Pinned: 1.3.9+ mis-decodes UTF-8 on CPUs without SSE4.2/AVX (e.g. KVM
# "Common KVM processor"), spinning a core at 100% and never serving.
FROM oven/bun:1.3.8 AS base
WORKDIR /usr/src/app

FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

FROM base AS build
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

ENV NODE_ENV=production
RUN bun run build

FROM base AS release
COPY --from=build /usr/src/app/out/ .

# run the app
USER bun
EXPOSE 3000/tcp
ENTRYPOINT [ "bun", "run", "index.js" ]