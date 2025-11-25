# 📘 PDF CONVERTER

브라우저 환경에서 이미지를 PDF로 변환하는 프로젝트입니다.  
별도의 서버 요청 없이 **클라이언트에서 즉시 처리**되며, 용지 크기, 방향, 화질 등 출력 옵션을 유연하게 조절할 수 있습니다.

🔗 **Demo:**  
https://pdf-converter-18eb5.web.app/

---

## 💡 Key Features

### 📂 파일 관리 (File & Folder)
- 이미지 단일 업로드 + 폴더 전체 업로드 지원  
- `webkitRelativePath` 기반 경로 정렬로 **폴더 구조 유지한 채 안정적 로딩**

### 🖱️ 드래그 기반 UX (Drag & Drop)
- 드래그 앤 드롭으로 이미지 추가  
- 리스트 내부 순서를 드래그로 조절  

### 🖼 자동 이미지 방향 보정 (EXIF Auto Orientation)
- 스마트폰 촬영 이미지의 EXIF Orientation 값을 분석  
- Canvas 렌더링 시 **올바른 방향으로 자동 회전 처리**  
- iOS/Android에서 흔한 90°/180° 회전 문제 해결

### ⚙️ PDF 출력 옵션
- **용지 크기**: A4 / A3 / A5 / Letter / Legal  
- **용지 방향**: 세로 / 가로  
- **압축 옵션**: 화질 0.5 ~ 1.0 (4단계)  
→ 고화질 · 용량 최적화 선택 가능

---

## 🛠️ Tech Stack

| Category | Technology | Version |
|---------|------------|---------|
| Framework | Next.js (App Router) | `v16.0.1` |
| Library | React | `v19.2.0` |
| Language | TypeScript | `^5` |
| State Mgmt | Zustand | `^5.0.8` |
| PDF Engine | pdf-lib | `^1.17.1` |
| Styling | Tailwind CSS | - |

---

## 💡 Technical Decisions & Challenges

### 1. 데이터 무결성을 위한 UUID 도입
`useRef` 카운터 기반 ID는  
- 파일 탭/폴더 탭 각각에서 `1, 2, 3…` 중복 생성  
- Key 충돌로 DnD 렌더링 오류 발생  
- 상위에서 ID 관리 시 컴포넌트 결합도 증가

**해결**  
- `crypto.randomUUID()` 사용 → 전역 고유 ID 생성

**결과**  
- 파일/폴더 탭 관계없이 ID 충돌 0%  
- 렌더링 안정성 확보  
- 컴포넌트 독립성 유지

---

### 2. 데이터 유지 전략: Lifting State Up
탭 내부에서 상태를 관리하면  
탭 전환 시 unmount → 파일 목록 초기화 문제 발생.

**해결**  
- 상태를 상위(Home)로 끌어올려 유지  
- 탭 이동에도 상태 유지 → UX 안정성 향상

---

### 3. Zustand 선택 이유
- Recoil 유지보수 이슈로 제외  
- Redux는 프로젝트 규모 대비 오버헤드 큼  
- Zustand는 가볍고 Hook 중심 → 파일 리스트 · 옵션 전역 상태 관리에 적합

---

### 4. 폴더 처리와 브라우저 보안 제약
브라우저는 절대 경로나 파일 시스템 정보를 제공하지 않음.

**해결**
- 선택된 파일을 즉시 메모리에 로딩  
- `webkitRelativePath` 기반 정렬로 폴더 구조 유지  
- 폴더 탭은 요약 렌더링 방식으로 성능 확보

---

### 5. EXIF 기반 자동 이미지 방향 보정 (Auto Orientation)

스마트폰 사진은 EXIF Orientation 값으로 방향만 저장하고,  
픽셀은 회전된 상태라 PDF 생성 시 90°/180° 틀어지는 문제가 있음.

**해결**
- `createImageBitmap()` + `{ imageOrientation: "from-image" }` 사용  
- Canvas에 그리기 전에 자동으로 올바른 방향으로 회전  
- iOS Safari, Android Chrome 등 모든 모바일 환경 안정적

**결과**
- 출력 PDF에서 항상 올바른 방향 유지  
- 별도 회전 연산 없이 성능 저하 없음  
- 모바일 사진에서도 완전 일관된 결과 제공


