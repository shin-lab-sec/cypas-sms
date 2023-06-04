# cypas-sms

Sandbox Management System

Cypas におけるサンドボックス管理の役割を持ったリポジトリ

## 開発準備

### cypas-local-tls-proxy 起動

起動方法は[cypas-local-tls-proxy](https://github.com/shin-lab-sec/cypas-local-tls-proxy)を参照

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
