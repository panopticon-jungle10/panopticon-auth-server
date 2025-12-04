# PostgreSQL 데이터베이스 가이드

> **Last Updated**: 2025-12-04

로컬 Docker PostgreSQL 및 프로덕션 RDS 환경에서의 DB 운영 가이드입니다.

---

## 1. 로컬 환경 설정

### 기본 정보
| 항목 | 값 |
|------|-----|
| 컨테이너 이름 | `panopticon-db` |
| DB 유저 | `appuser` |
| DB 비밀번호 | `apppassword` |
| DB 이름 | `panopticon_app` |
| 호스트 포트 | `15432` |

### 컨테이너 확인
```bash
docker ps --filter "name=panopticon-db"
docker port panopticon-db 5432
```

---

## 2. DB 접속 방법

### 컨테이너 내부 접속 (권장)
```bash
docker exec -it panopticon-db psql -U appuser -d panopticon_app
```

### 호스트에서 접속
```bash
PGPASSWORD=apppassword psql -h localhost -p 15432 -U appuser -d panopticon_app
```

### 단일 쿼리 실행
```bash
docker exec -it panopticon-db psql -U appuser -d panopticon_app -c '\dt'
```

---

## 3. 자주 쓰는 쿼리

### 테이블 구조 확인
```sql
\dt                    -- 테이블 목록
\d "User"              -- User 테이블 상세
\di                    -- 인덱스 목록
```

> **주의**: 테이블명이 PascalCase이므로 반드시 큰따옴표(`"`)로 감싸세요.

### 데이터 조회
```sql
-- 최근 사용자 10명
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 10;

-- OAuth 계정 (GitHub)
SELECT * FROM "OAuthAccount" WHERE provider = 'github' LIMIT 20;

-- 사용자별 세션
SELECT * FROM "Session" WHERE "userId" = '<USER_ID>';

-- SLO 정책 목록
SELECT * FROM "SloPolicy" ORDER BY "createdAt" DESC LIMIT 50;

-- SLO-웹훅 매핑 조인
SELECT m."sloId", w."type", w."name", w."webhookUrl"
FROM "SloWebhookMapping" m
JOIN "WebhookConfig" w ON w."id" = m."webhookId"
WHERE m."sloId" = '<SLO_ID>';
```

### 통계
```sql
SELECT COUNT(*) FROM "User";
SELECT "userId", COUNT(*) FROM "SloPolicy" GROUP BY "userId";
```

---

## 4. Prisma 마이그레이션

### 개발 환경
```bash
DATABASE_URL="postgresql://appuser:apppassword@localhost:15432/panopticon_app" \
npx prisma migrate dev --name <migration_name>
```

### 프로덕션 적용
```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

### 마이그레이션 이력 확인
```sql
SELECT id, finished_at FROM _prisma_migrations ORDER BY finished_at;
```

---

## 5. 백업 및 복원

### 백업
```bash
# 호스트에서
PGPASSWORD=apppassword pg_dump -h localhost -p 15432 -U appuser -Fc panopticon_app -f backup.dump

# 컨테이너에서
docker exec -it panopticon-db pg_dump -U appuser -Fc panopticon_app -f /tmp/backup.dump
docker cp panopticon-db:/tmp/backup.dump ./backup.dump
```

### 복원
```bash
cat backup.dump | docker exec -i panopticon-db pg_restore -U appuser -d panopticon_app --clean
```

---

## 6. 프로덕션 SSL 설정 (AWS RDS)

### 필요 환경변수
| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | `?sslmode=require` 포함 |
| `PG_SSL_CA` | RDS CA 인증서 (Base64) |

### 설정 절차
1. RDS CA 인증서 다운로드 (`rds-ca.pem`)
2. SSM에 업로드: `scripts/upload-ca-to-ssm.sh rds-ca.pem`
3. ECS Task Definition에 `PG_SSL_CA` 시크릿 참조 추가
4. 배포 후 로그에서 `PG_SSL_CA=present` 확인
5. `NODE_TLS_REJECT_UNAUTHORIZED=0` 제거

### 임시 우회 (권장하지 않음)
```env
PG_SSL_REJECT_UNAUTHORIZED=0
```

---

## 7. 트러블슈팅

| 문제 | 해결 |
|------|------|
| psql 접속 실패 | `docker ps \| grep panopticon-db`로 컨테이너 확인 |
| 포트 충돌 | 호스트 5432 사용 중이면 15432 등 다른 포트 사용 |
| Prisma P1012 오류 | `DATABASE_URL` 환경변수 설정 확인 |
| SSL 인증서 오류 | `PG_SSL_CA` 설정 또는 임시로 `NODE_TLS_REJECT_UNAUTHORIZED=0` |

---

## 8. 운영 주의사항

- 민감 정보(토큰, 해시)는 전체 출력 금지 - 마스킹 처리
- `prisma migrate dev`는 데이터 리셋 가능 - 사전 백업 필수
- 프로덕션 DELETE/UPDATE 전 반드시 SELECT로 확인
