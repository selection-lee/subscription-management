# 구독 관리 서비스

Full-Stack TypeScript Monorepo — pnpm workspace 기반으로 프론트엔드(React)와 백엔드(Express)를 하나의 저장소에서 관리합니다.
패키지 간 타입을 공유하여 end-to-end 타입 안전성을 확보합니다.

## 런타임 & 패키지 매니저

| 항목    | 버전                               |
| ------- | ---------------------------------- |
| Node.js | 24+                                |
| pnpm    | 9+ (workspace + catalog 기능 활용) |

## 모노레포 구조

```
apps/
  api/          # Express 5 + tRPC 백엔드 서버
  admin/        # Admin 대시보드 (React + Vite)
  tasker/       # Tasker 앱 (React + Vite)

packages/
  schema/       # Prisma Client, Zod 스키마, 공유 타입
  server/       # 백엔드 유틸 (tRPC, 로깅, AWS, 이메일)
  shared/       # 공유 비즈니스 로직
  ui/           # 공용 UI 컴포넌트 라이브러리
```

## Workspace 설정 (pnpm-workspace.yaml)

```yaml
packages:
  - apps/*
  - packages/*

catalog:
  react: 19.0.0
  typescript: ~5.8.0
  zod: ~4.0.0
  tailwindcss: ^4.1.5
  # ... 공통 버전을 catalog로 일원 관리
```

- `catalog` 기능으로 모든 패키지의 공통 의존성 버전을 한 곳에서 관리
- 각 `package.json`에서 `"react": "catalog:"`로 참조

## 패키지 간 참조

```json
"dependencies": {
  "@lib/schema": "workspace:*",
  "@lib/server": "workspace:*",
  "@lib/shared": "workspace:*",
  "@lib/ui": "workspace:*"
}
```

## 프론트엔드

| 기술              | 버전 | 용도                                        |
| ----------------- | ---- | ------------------------------------------- |
| React             | 19   | UI 프레임워크                               |
| Vite              | 7    | 빌드 도구 & 개발 서버                       |
| TanStack Router   | 1.x  | 파일 기반 라우팅                            |
| TanStack Query    | 5.x  | 서버 상태 관리                              |
| tRPC Client       | 11.4 | 타입 안전 API 호출                          |
| Tailwind CSS      | 4    | 유틸리티 CSS                                |
| Radix UI          | -    | Headless UI 컴포넌트                        |
| tailwind-variants | 1.x  | 컴포넌트 variant 스타일링                   |
| Lucide React      | -    | 아이콘                                      |
| Tiptap            | 2.x  | 리치 텍스트 에디터 (UI 패키지)              |
| vite-plugin-pwa   | -    | PWA 지원 (Service Worker, Web App Manifest) |

## 백엔드

| 기술        | 버전 | 용도                            |
| ----------- | ---- | ------------------------------- |
| Express     | 5    | HTTP 서버                       |
| tRPC Server | 11.4 | 타입 안전 API 프로시저          |
| Passport    | 0.7  | 인증 (Google OAuth)             |
| JWT         | -    | 토큰 기반 인증                  |
| bcryptjs    | 3.x  | 비밀번호 해싱                   |
| SuperJSON   | 2.x  | tRPC 직렬화 (Date, Map 등 지원) |

## 데이터베이스

| 기술               | 버전 | 용도               |
| ------------------ | ---- | ------------------ |
| PostgreSQL         | -    | 메인 데이터베이스  |
| Prisma             | 7    | ORM & 마이그레이션 |
| @prisma/adapter-pg | 7    | PostgreSQL 어댑터  |

## 스키마 & 검증

| 기술          | 용도                           |
| ------------- | ------------------------------ |
| Prisma Schema | DB 모델 정의 → 마이그레이션    |
| Zod 4         | 런타임 유효성 검증 + 타입 추론 |

## 인프라 & DevOps

| 기술          | 용도                   |
| ------------- | ---------------------- |
| Docker        | 컨테이너화             |
| AWS S3        | 파일 스토리지          |
| AWS KMS       | 암호화 키 관리         |
| OpenTelemetry | 로깅 & 옵저빌리티      |
| dotenvx       | 암호화된 환경변수 관리 |

## 개발 도구

| 기술        | 용도                                         |
| ----------- | -------------------------------------------- |
| TypeScript  | 5.8 (strict, ESNext target, NodeNext module) |
| ESLint      | 9.x (프론트엔드 린팅)                        |
| oxfmt       | 코드 포매팅                                  |
| Husky       | Git hooks                                    |
| lint-staged | 커밋 전 린트/포맷 자동 실행                  |

## TypeScript 설정

```jsonc
{
  "strict": true,
  "target": "esnext",
  "module": "nodenext",
  "rewriteRelativeImportExtensions": true,
  "erasableSyntaxOnly": true,
  "verbatimModuleSyntax": true,
}
```

- **Native TypeScript Execution**: Node.js 24의 `--conditions=development`으로 `.ts` 파일 직접 실행 (번들러 불필요)
- **Conditional Exports**: 개발 시 소스 `.ts` 직접 참조, 프로덕션에서는 빌드된 `.js` 참조

```json
"exports": {
  ".": {
    "development": "./src/index.ts",
    "types": "./dist/index.d.ts",
    "import": "./dist/index.js"
  }
}
```

## 타입 안전성 흐름

```
Prisma Schema → DB 모델
      ↓
Zod 스키마 → 런타임 검증 + 타입 추론
      ↓
tRPC Router → 타입 안전 API 프로시저
      ↓
React 클라이언트 → tRPC 훅으로 자동 타입 추론
```

## 주요 커맨드

```bash
# 개발 서버
pnpm admin              # Admin 대시보드 (port 5174)
pnpm api                # API 서버 (port 3000)
pnpm tasker             # Tasker 앱 (port 5173)

# 빌드
pnpm build              # 전체 패키지 빌드

# 데이터베이스
pnpm --filter @lib/schema run db:generate   # Prisma 클라이언트 생성
pnpm --filter @lib/schema run db:migrate    # 마이그레이션 생성
pnpm --filter @lib/schema run db:deploy     # 마이그레이션 적용
pnpm --filter @lib/schema run db:reset      # DB 초기화

# 초기화
pnpm reset              # clean → install → generate → build
```

> **Note**: 위 커맨드는 다른 레포에서 가져온 것으로, 실제 스크립트는 개발 진행하면서 수정될 수 있습니다.

---

## MVP 기능 요구사항

### 1. 구독 항목 관리

- 서비스명, 아이콘(이모지/이미지), 시작일, 종료일
- 금액, 통화, 결제 주기(주간/월간/연간), 결제 수단, 메모
- 항목 복제, 아카이브
- 결제 수단/주기 변경
- "언제 예정, 며칠 남음" 표시

### 2. 알림 시스템

- 전역 알림 on/off
- 알림 기본 시간 (기본 09:00)
- 결제 1일 전 알림
- 결제 당일 알림

### 3. 지출 통계

- 연간 총 지출 금액
- 월 평균 지출

### 4. 위젯

- 다음 결제 예정 항목 (디데이/금액/항목명)

### 5. 사용자 관리

- 구글 로그인 (Apple도 고려)
- 로그인 없이도 사용 가능 (백업/동기화 불가)

### 6. 앱 설정

- 언어 (한국어로 시작)
- 기본 통화 (원화)
- 첫 화면 설정 (일단 구독 목록)
- 개인정보처리방침, 이용약관
