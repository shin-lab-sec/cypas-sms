FROM wettyoss/wetty
LABEL maintainer "tosssssy"

ENV LC_ALL C.UTF-8

# SSH serverのインストール
RUN apk add --update --no-cache openssh
RUN echo 'PasswordAuthentication yes' >> /etc/ssh/sshd_config
RUN adduser -h /home/test -s /bin/sh -D test
RUN echo -n 'test:test' | chpasswd

# httpsにするための処理
# RUN apk add --update openssl && \
#     rm -rf /var/cache/apk/*
# RUN openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 30000 -nodes


ENTRYPOINT [ "yarn","start"]