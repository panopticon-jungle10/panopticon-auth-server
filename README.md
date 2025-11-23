# @krsy0411/panopticon_authserver

> 🥕 [PostgreSQL Docker 실행 및 명령어](./POSTGRES_DOC.md)

## 개발 시작

- `cd panopticon_authserver`
- `npm install`
- `npm run start:dev`  # 개발 서버 실행 (기본: http://localhost:8080)

## 환경 변수 설정

- 프로젝트 루트에 `.env` 파일 생성
- 최소 설정 예시:
  - `DATABASE_URL=postgresql://appuser:apppassword@localhost:15432/panopticon_app`
  - `JWT_SECRET=your_jwt_secret`
  - `GITHUB_CLIENT_ID=...`
  - `GITHUB_CLIENT_SECRET=...`

## prisma 명령어

- `npx prisma generate`
- 개발(스키마 변경 → 마이그레이션 생성/적용):
  - `DATABASE_URL="postgresql://appuser:apppassword@localhost:15432/panopticon_app" npx prisma migrate dev --name init --schema=./prisma/schema.prisma`
- 프로덕션/CI에서 마이그레이션 적용:
  - `DATABASE_URL="postgresql://appuser:apppassword@localhost:15432/panopticon_app" npx prisma migrate deploy --schema=./prisma/schema.prisma`
- 빠른 스키마 동기화(마이그레이션 이력 불필요):
  - `DATABASE_URL="postgresql://appuser:apppassword@localhost:15432/panopticon_app" npx prisma db push --schema=./prisma/schema.prisma`


