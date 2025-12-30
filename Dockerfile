FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y \
      imagemagick \
      nodejs \
      npm \
      fontconfig \
      fonts-liberation \
      fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*



WORKDIR /app
COPY . .

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]
