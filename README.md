# cyber-range-server

テーマ「クラウドベースのセキュリティ演習」の server 側のリポジトリ

## 開発準備

### DNS 設定

`api.cyber-range.test`
`useragent.cyber-range.test`
この二つがローカルで`127.0.0.1`に名前解決されるように hosts に設定する必要がある

### 証明局(CA)作成

これを作成しておかないと、ブラウザが url を信頼してくれずにエラーが出る。
[こちら](https://www.mitsue.co.jp/knowledge/blog/frontend/202208/30_1021.html)を参考に証明局(CA)を作成する。
もしかしたらサーバー証明書と秘密鍵も作成して置き換える必要があるかも（未確認）

## コンテナ起動

今の状況だと userAgent を手動でビルドする必要がある

```
docker compose up
```

## コンテナ停止

```
docker compose down
```

## コンテナ再生成・起動

```
docker compose up --build
```
