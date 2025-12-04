# Panopticon Auth Server - Development Guidelines

> **Version**: 1.0.0
> **Last Updated**: 2025-12-04

이 문서는 프로젝트 개발 환경 설정, 명령어, 컨벤션을 포함합니다.

---

## 1. Quick Start

### 1.1 Prerequisites

- Node.js 20+
- npm 9+
- Docker (PostgreSQL 로컬 실행용)

### 1.2 Installation

```bash
# 저장소 클론 (또는 디렉토리 이동)
cd panopticon_authserver

# 의존성 설치
npm install

# Prisma 클라이언트 생성
npx prisma generate

# 개발 서버 실행 (http://localhost:8080)
npm run start:dev
```

---

## 2. Environment Setup

### 2.1 Environment Files

| File | Purpose |
|------|---------|
| `.env` | 로컬 개발 환경 |
| `.env.production` | 프로덕션 환경 |

### 2.2 Required Environment Variables

```env
# Server
NODE_ENV=development
PORT=8080

# Database
DATABASE_URL=postgresql://appuser:apppassword@localhost:15432/panopticon_app

# JWT
JWT_SECRET=your_jwt_secret_here

# OAuth - GitHub
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URI=http://localhost:8080/auth/github/callback

# OAuth - Google
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8080/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:3000
```

---

## 3. Database Setup

### 3.1 PostgreSQL with Docker

> PostgreSQL Docker 상세 명령어는 [POSTGRES_DOC.md](./POSTGRES_DOC.md) 참조

```bash
# PostgreSQL 컨테이너 실행 (예시)
docker run -d \
  --name panopticon-postgres \
  -e POSTGRES_USER=appuser \
  -e POSTGRES_PASSWORD=apppassword \
  -e POSTGRES_DB=panopticon_app \
  -p 15432:5432 \
  postgres:15
```

### 3.2 Prisma Commands

| Command | Description |
|---------|-------------|
| `npx prisma generate` | Prisma 클라이언트 생성 |
| `npx prisma migrate dev --name <name>` | 개발용 마이그레이션 생성 및 적용 |
| `npx prisma migrate deploy` | 프로덕션 마이그레이션 적용 |
| `npx prisma db push` | 스키마 빠른 동기화 (마이그레이션 이력 없음) |
| `npx prisma studio` | DB GUI 실행 (http://localhost:5555) |

**개발 마이그레이션 예시:**
```bash
DATABASE_URL="postgresql://appuser:apppassword@localhost:15432/panopticon_app" \
npx prisma migrate dev --name init --schema=./prisma/schema.prisma
```

**프로덕션 마이그레이션 적용:**
```bash
DATABASE_URL="postgresql://..." \
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

## 4. NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run start` | 프로덕션 서버 실행 |
| `npm run start:dev` | 개발 서버 실행 (watch mode) |
| `npm run build` | TypeScript 컴파일 |
| `npm run lint` | ESLint 실행 |
| `npm run format` | Prettier 포맷팅 |
| `npm run prisma:generate` | Prisma 클라이언트 생성 |
| `npm run prisma:migrate:dev` | 개발 마이그레이션 |
| `npm run prisma:migrate:deploy` | 프로덕션 마이그레이션 |

---

## 5. Project Structure

```
src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── auth/                   # Authentication (OAuth, tokens)
├── users/                  # User management
├── slos/                   # SLO policy management
├── webhooks/               # Webhook configuration
├── jwt/                    # JWT service
├── prisma/                 # Database service
└── common/                 # Shared utilities
    ├── decorators/         # Custom decorators
    └── guards/             # Auth guards
```

---

## 6. Coding Conventions

### 6.1 Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `jwt-auth.guard.ts` |
| Classes | PascalCase | `JwtAuthGuard` |
| Functions/Variables | camelCase | `validateToken` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| DTO Classes | PascalCase + Dto suffix | `CreateUserDto` |

### 6.2 Module Structure

```typescript
// module-name.module.ts
@Module({
  imports: [...],
  controllers: [ModuleNameController],
  providers: [ModuleNameService],
  exports: [ModuleNameService],
})
export class ModuleNameModule {}
```

### 6.3 DTO Validation

```typescript
// 항상 class-validator 데코레이터 사용
import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  displayName?: string;
}
```

### 6.4 Error Handling

```typescript
// NestJS 내장 예외 사용
throw new UnauthorizedException('Invalid token');
throw new NotFoundException('User not found');
throw new BadRequestException('Invalid input');
```

---

## 7. API Documentation

### 7.1 Swagger UI

- **개발 환경**: http://localhost:8080/docs
- **프로덕션**: 비활성화

### 7.2 OpenAPI Spec

- 자동 생성: `/openapi.yaml`
- Swagger 데코레이터로 문서화:

```typescript
@ApiOperation({ summary: 'Get user profile' })
@ApiResponse({ status: 200, type: UserResponseDto })
@Get('me')
getProfile() { ... }
```

---

## 8. Testing

### 8.1 Test Structure (권장)

```
src/
├── users/
│   ├── users.service.ts
│   ├── users.service.spec.ts    # Unit test
│   └── users.e2e-spec.ts        # E2E test
```

### 8.2 Running Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

---

## 9. Git Workflow

### 9.1 Branch Naming

| Type | Format | Example |
|------|--------|---------|
| Feature | `feature/<description>` | `feature/add-google-oauth` |
| Bugfix | `fix/<description>` | `fix/token-expiry-bug` |
| Hotfix | `hotfix/<description>` | `hotfix/critical-auth-issue` |

### 9.2 Commit Message Format

```
<type>: <subject>

<body>
```

**Types:**
- `feat`: 새로운 기능
- `fix`: 버그 수정
- `refactor`: 리팩토링
- `docs`: 문서 변경
- `chore`: 설정, 빌드 관련

**예시:**
```
feat: Add Google OAuth support

- Implement Google OAuth callback handler
- Add GOOGLE_CLIENT_ID/SECRET environment variables
- Update auth.controller.ts with new endpoints
```

---

## 10. Deployment

### 10.1 Docker Build

```bash
# 빌드
docker build -t panopticon-auth .

# 실행
docker run -d \
  -p 8080:8080 \
  --env-file .env.production \
  panopticon-auth
```

### 10.2 Production Checklist

- [ ] `NODE_ENV=production` 설정
- [ ] JWT_SECRET 안전한 값으로 변경
- [ ] DATABASE_URL 프로덕션 DB 연결
- [ ] OAuth 콜백 URL 프로덕션 도메인으로 설정
- [ ] CORS origin 프로덕션 도메인만 허용

---

## 11. Troubleshooting

### 11.1 Common Issues

**Prisma 클라이언트 오류**
```bash
# 해결: 클라이언트 재생성
npx prisma generate
```

**Database 연결 실패**
```bash
# 해결: DATABASE_URL 확인 및 PostgreSQL 실행 상태 확인
docker ps  # PostgreSQL 컨테이너 확인
```

**OAuth 콜백 오류**
```
# 해결: 환경변수의 REDIRECT_URI와 OAuth 앱 설정 일치 확인
```

---

## 12. References

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [jose JWT Library](https://github.com/panva/jose)
- [PostgreSQL Docker Setup](./POSTGRES_DOC.md)
