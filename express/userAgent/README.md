## userAgent

curriculum を`docker compose up`する時に一緒に起動するコンテナ。各ユーザーはこのコンテナに接続して curriculum を体験する。

## 仕様

- 各 userAgent のコンテナ名は `user-agent` から始まる。（curriculum のコンテナ名と衝突しないように）
- 環境変数`USER_AGENT_PORT`, `USER_AGENT_NAME`, `USER_AGENT_PASSWORD`は本番環境で注入される。
- 環境変数`USER_AGENT_PORT`のみ必須。これが無いとユーザーがコンテナに接続できない。
- それ以外の環境変数は、.env で定義して使用可能だが、本番環境でも値が変わらないので注意。
