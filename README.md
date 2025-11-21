# panopticon-auth-server

NestJS-based auth microservice (minimal scaffold).

Run locally:

```bash
cd panopticon-auth-server
npm install
npm run start:dev
```

Environment variables: copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.

SSL & Database TLS options:

- `PG_SSL` (default: "true"): whether to use SSL/TLS for Postgres connections.
- `PG_SSL_REJECT_UNAUTHORIZED` (default: "true"): if set to "0" or "false" disables server certificate validation (short-term only).
- `PG_SSL_CA`: optional; pass a PEM-formatted CA bundle (or base64-encoded PEM) that will be used to verify the RDS server certificate.
  - For containers running on ECS, we recommend storing the CA in Secrets Manager (or an SSM SecureString) and referencing it from the task definition.
  - If `PG_SSL_CA` is provided, the app will set ssl.ca and enable certificate validation (`rejectUnauthorized: true`).
  - Avoid using `PG_SSL_REJECT_UNAUTHORIZED=0` or `NODE_TLS_REJECT_UNAUTHORIZED=0` in production.

Example: store base64-encoded CA in Secrets Manager and reference as `PG_SSL_CA` in your task definition.

Storing RDS CA in SSM (example):

1. Fetch the RDS CA bundle (PEM file) from AWS documentation or the DB provider and save it locally as `rds-ca.pem`.
2. Base64 encode and put it in SSM as a secure string (or create a secret in Secrets Manager):

```bash
cat rds-ca.pem | base64 | tr -d '\n' > rds-ca.base64
aws ssm put-parameter --name /panopticon/pg_ssl_ca --type SecureString --value "$(cat rds-ca.base64)" --overwrite --region ap-northeast-2
```

3. Update `task-definition.json` to reference that SSM secure parameter as a secret called `PG_SSL_CA` and re-register/update your task definition.

4. Redeploy ECS service and verify logs show `PG_SSL_CA=present` and returned sslOption has ca and rejectUnauthorized: true.

Deployment checklist (quick):

1. Build and push a new image containing the code changes and tag it.
2. Upload the CA to SSM or Secrets Manager (`scripts/upload-ca-to-ssm.sh rds-ca.pem`).
3. Ensure `task-definition.json` references `PG_SSL_CA` and `PG_SSL=true`.
4. Confirm `DATABASE_URL` now includes `?sslmode=require`.
5. Register the task definition and update the ECS service with `--force-new-deployment`.
6. Monitor CloudWatch logs for `PG_SSL_CA=present` and `rejectUnauthorized: true` to confirm validation.
7. Remove `NODE_TLS_REJECT_UNAUTHORIZED=0` or `PG_SSL_REJECT_UNAUTHORIZED=0` once validation is working.

---

```shell
docker run -d --name panopticon-pg \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=apppassword \
  -e POSTGRES_DB=panopticon_app \
  -p 5432:5432 \
  postgres:15
```

```txt
# JWT for testing
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJsb2NhbC10ZXN0IiwiaWF0IjoxNzYzNjIzMzIwLCJleHAiOjE3NjM2MzA1MjB9.fWUlgHuE7NqwrWLsKzfJijOGvXEdEPWcTuLvxcKBOC0
```