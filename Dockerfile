FROM node:latest
ENV WORKDIR=/converter
RUN mkdir -p $WORKDIR $WORKDIR/devices $WORKDIR/result
WORKDIR $WORKDIR
COPY package*.json ./
# RUN npm install
RUN npm install \
  zigbee-herdsman-converters \
  uri-js \
  sync-request \
  then-request
COPY src/ .
CMD ["node", "index.js"]
