# Panopticon Auth Server - Product Requirements Document (PRD)

> **Version**: 1.0.0
> **Last Updated**: 2025-12-04
> **Status**: Production
> **Owner**: Panopticon Team

---

## 1. Overview

### 1.1 Product Summary

Panopticon Auth Server는 **Panopticon 모니터링 플랫폼**의 중앙 인증 및 사용자 관리 서비스입니다. OAuth 기반 소셜 로그인, JWT 토큰 관리, SLO(Service Level Objective) 정책 관리, 알림 웹훅 설정 등 통합 인증/인가 기능을 제공합니다.

### 1.2 Problem Statement

| 문제점 | 영향 |
|--------|------|
| 분산된 사용자 인증 시스템 | 일관성 없는 사용자 경험, 보안 취약점 |
| 수동 SLO 모니터링 | 장애 대응 지연, 서비스 품질 저하 |
| 알림 채널 파편화 | 중요 알림 누락, 팀 협업 비효율 |

### 1.3 Solution

중앙화된 인증 서버를 통해:
- **단일 인증 진입점** 제공 (OAuth 2.0)
- **SLO 정책 기반** 자동화된 모니터링 설정
- **멀티 채널 웹훅**을 통한 통합 알림 관리

---

## 2. Goals & Success Metrics

### 2.1 Business Goals

| 목표 | 설명 |
|------|------|
| 사용자 온보딩 간소화 | 소셜 로그인으로 3초 내 회원가입 |
| 보안 강화 | JWT + Refresh Token 기반 인증 |
| 알림 효율화 | SLO 위반 시 30초 내 알림 발송 |

### 2.2 Key Performance Indicators (KPIs)

| KPI | Target | Measurement |
|-----|--------|-------------|
| 인증 성공률 | > 99.9% | OAuth 콜백 성공/실패 비율 |
| 토큰 발급 지연시간 | < 100ms | JWT 생성 평균 시간 |
| API 가용성 | > 99.95% | Uptime 모니터링 |

---

## 3. User Personas

### 3.1 Primary Users

#### DevOps Engineer (주요 사용자)
- **니즈**: 서비스 SLO 설정, 장애 알림 수신
- **Pain Points**: 여러 도구에서 분산된 알림 관리
- **사용 기능**: SLO 정책 CRUD, 웹훅 설정

#### Platform Administrator
- **니즈**: 사용자 관리, 권한 제어
- **Pain Points**: 중앙화된 사용자 관리 부재
- **사용 기능**: 사용자 조회, 역할 관리

#### External Service (B2B)
- **니즈**: API 기반 인증 통합
- **Pain Points**: 복잡한 인증 플로우
- **사용 기능**: OAuth API, Token 검증

---

## 4. Functional Requirements

### 4.1 인증 (Authentication)

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| AUTH-001 | GitHub OAuth 로그인 지원 | P0 | ✅ 완료 |
| AUTH-002 | Google OAuth 로그인 지원 | P0 | ✅ 완료 |
| AUTH-003 | JWT Access Token 발급 (24시간 유효) | P0 | ✅ 완료 |
| AUTH-004 | Refresh Token 발급 (30일 유효) | P0 | ✅ 완료 |
| AUTH-005 | 토큰 갱신 (Refresh) 기능 | P0 | ✅ 완료 |
| AUTH-006 | 로그아웃 (세션 무효화) | P0 | ✅ 완료 |
| AUTH-007 | 쿠키 & Bearer 토큰 동시 지원 | P1 | ✅ 완료 |

### 4.2 사용자 관리 (User Management)

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| USER-001 | OAuth 기반 사용자 자동 생성 | P0 | ✅ 완료 |
| USER-002 | 사용자 프로필 조회 | P0 | ✅ 완료 |
| USER-003 | 사용자 정보 수정 | P1 | ✅ 완료 |
| USER-004 | 다중 OAuth 계정 연동 | P2 | ⏳ 예정 |

### 4.3 SLO 정책 관리

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| SLO-001 | SLO 정책 생성 (이름, 서비스명, 메트릭, 목표값) | P0 | ✅ 완료 |
| SLO-002 | SLO 정책 조회 (목록/상세) | P0 | ✅ 완료 |
| SLO-003 | SLO 정책 수정 | P0 | ✅ 완료 |
| SLO-004 | SLO 정책 삭제 | P0 | ✅ 완료 |
| SLO-005 | 메트릭별 활성화/비활성화 토글 | P1 | ✅ 완료 |
| SLO-006 | SLO-웹훅 연결 관리 | P1 | ✅ 완료 |

### 4.4 웹훅 관리

| ID | 요구사항 | 우선순위 | 상태 |
|----|----------|----------|------|
| HOOK-001 | Slack 웹훅 지원 | P0 | ✅ 완료 |
| HOOK-002 | Discord 웹훅 지원 | P1 | ✅ 완료 |
| HOOK-003 | Microsoft Teams 웹훅 지원 | P1 | ✅ 완료 |
| HOOK-004 | Email (SMTP) 알림 지원 | P1 | ✅ 완료 |
| HOOK-005 | 웹훅 테스트 발송 | P1 | ✅ 완료 |
| HOOK-006 | 웹훅 활성화/비활성화 | P1 | ✅ 완료 |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| 항목 | 요구사항 |
|------|----------|
| Response Time | API 응답 95th percentile < 200ms |
| Throughput | 동시 사용자 1,000명 지원 |
| Token Generation | JWT 발급 < 50ms |

### 5.2 Security

| 항목 | 구현 방식 |
|------|----------|
| 토큰 저장 | Refresh Token SHA256 해시 저장 |
| 전송 보안 | HTTPS Only (프로덕션) |
| 쿠키 보안 | HttpOnly, Secure, SameSite=Lax |
| CORS | 화이트리스트 기반 Origin 제한 |

### 5.3 Availability

| 항목 | 목표 |
|------|------|
| Uptime SLA | 99.95% (월간 22분 이하 다운타임) |
| Recovery Time | RTO < 15분 |
| Backup | 일일 DB 백업 |

---

## 6. Technical Constraints

### 6.1 Technology Stack

| 영역 | 기술 |
|------|------|
| Runtime | Node.js 20+ |
| Framework | NestJS 10.x |
| Database | PostgreSQL 15+ (AWS RDS) |
| ORM | Prisma 5.x |
| Authentication | jose (JWT), OAuth 2.0 |
| Deployment | Docker, AWS ECS |

### 6.2 Integration Points

```
┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Auth Server   │
│  (Next.js)      │     │   (NestJS)      │
└─────────────────┘     └────────┬────────┘
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                        ▼
┌───────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub OAuth │     │   PostgreSQL     │     │  Alert Channels │
│  Google OAuth │     │   (AWS RDS)      │     │  (Slack, etc.)  │
└───────────────┘     └──────────────────┘     └─────────────────┘
```

---

## 7. Out of Scope (현재 버전)

| 항목 | 사유 |
|------|------|
| SAML/LDAP 인증 | 엔터프라이즈 요구사항 - 추후 검토 |
| 2FA/MFA | 보안 강화 - v2.0 예정 |
| API Rate Limiting | 트래픽 증가 시 구현 예정 |
| 감사 로그 | 컴플라이언스 요구 시 추가 |

---

## 8. Milestones

| Phase | 내용 | 상태 |
|-------|------|------|
| Phase 1 | OAuth 인증 + JWT 토큰 관리 | ✅ 완료 |
| Phase 2 | SLO 정책 CRUD | ✅ 완료 |
| Phase 3 | 웹훅 통합 | ✅ 완료 |
| Phase 4 | 성능 최적화 & 모니터링 | 🔄 진행중 |

---

## 9. Risks & Mitigations

| 리스크 | 영향 | 완화 방안 |
|--------|------|----------|
| OAuth Provider 장애 | 로그인 불가 | 다중 Provider 지원, 로컬 세션 유지 |
| DB 연결 실패 | 서비스 중단 | Connection Pool, Health Check |
| JWT Secret 유출 | 전체 토큰 무효화 필요 | Secret Rotation 절차 수립 |

---

## 10. Appendix

### 10.1 Related Documents

- [Architecture Document](./ARCHITECTURE.md)
- [API Documentation](../openapi.yaml)
- [PostgreSQL Setup Guide](../POSTGRES_DOC.md)

### 10.2 Glossary

| 용어 | 설명 |
|------|------|
| SLO | Service Level Objective - 서비스 품질 목표 |
| JWT | JSON Web Token - 상태 비저장 인증 토큰 |
| OAuth | Open Authorization - 위임 인증 표준 |
| Refresh Token | 액세스 토큰 갱신용 장기 토큰 |
