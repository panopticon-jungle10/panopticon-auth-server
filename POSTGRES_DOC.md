# Docker로 PostgreSQL 실행 & PostgreSQL 명령어
이 문서는 Docker를 사용하여 PostgreSQL을 실행하는 방법과 PostgreSQL 명령어에 대해 설명합니다.

## Docker로 PostgreSQL 실행하기
```bash
docker run --name panopticon-db \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=apppassword \
  -e POSTGRES_DB=panopticon_app \
  -p 15432:5432 \
  -d postgres:15
```

## PostgreSQL 명령어
다음 명령어들을 통해 도커 컨테이너 내에서 PostgreSQL 데이터베이스에 접속하고 데이터를 조회하거나 수정할 수 있습니다.

### PostgreSQL 데이터베이스 접속
```bash
docker exec -it panopticon-db psql -U appuser -d panopticon_app
``` 

### 데이터베이스 목록 조회
```sql
\l
```

### 테이블 목록 조회
```sql
\dt
```

### 특정 테이블의 스키마 조회
```sql
\d table_name
```

### 데이터 조회
```sql
SELECT * FROM table_name;
```