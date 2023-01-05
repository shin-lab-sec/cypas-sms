# curriculum

docker の技術を用いて、脆弱性のあるシステムなどを再現し、ユーザーに体験してもらう。

## 仕様など

- `.env`と`docker-compose.yml`は必須
- `docker compose up` で起動できる必要がある
- 本番環境では [userAgent](https://github.com/shin-lab-sec/cyber-range-server/tree/master/express/userAgent) が注入され、そこにユーザーがアクセスするので開放ポートについては特に考える必要はない
- `docker-compose.yml`内の image 名は`<curriculum名>/<service名>`に固定。例は[sample-curriculum](https://github.com/shin-lab-sec/cyber-range-server/tree/master/express/curriculum/sample-curriculum)参照
