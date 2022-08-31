# cyber-range-server

テーマ「クラウドベースのセキュリティ演習」の server 側のリポジトリ

## 開発準備

api.localhost.com
wettyproxy.localhost.com
この二つがローカルで`127.0.0.1`に名前解決されるように hosts に設定する必要がある

## コンテナ起動

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
