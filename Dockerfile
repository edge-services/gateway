ARG ARCH=arm64v8
ARG NODE_VERSION=12.22.1
ARG OS=buster-slim

FROM ${ARCH}/node:${NODE_VERSION}-${OS}

LABEL org.label-schema.build-date=${BUILD_DATE} \
    org.label-schema.docker.dockerfile=".docker/Dockerfile.arm" \
    org.label-schema.license="Apache-2.0" \
    org.label-schema.name="EdgeGateway" \
    org.label-schema.version=${BUILD_VERSION} \
    org.label-schema.description="Edge Computing - Edge Gateway Service" \
    org.label-schema.url="https://github.com/sinny777/edge-computing" \
    org.label-schema.vcs-ref=${BUILD_REF} \
    org.label-schema.vcs-type="Git" \
    org.label-schema.vcs-url="https://github.com/sinny777/edge-computing" \
    org.label-schema.arch=${ARCH} \
    authors="Gurvinder Singh <sinny777@gmail.com>"

USER root

# Updates and adds system required packages
RUN apt-get update && \
    apt-get -qy install curl ca-certificates nano python make \
    build-essential \
    cmake \
    gcc \
    bluetooth bluez libbluetooth-dev libudev-dev  \
    -y --no-install-recommends --fix-missing apt-utils netcat && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app
WORKDIR /app

ADD ./app .

RUN npm install -g node-gyp
RUN npm install -g node-pre-gyp
# RUN npm i -g @loopback/build@6.1.1

RUN npm install
RUN npm i edge-sx127x
RUN npm run build

ENV HOST=0.0.0.0 PORT=9000
ENV TZ=Asia/Kolkata

EXPOSE ${PORT}

CMD [ "node", "." ]
