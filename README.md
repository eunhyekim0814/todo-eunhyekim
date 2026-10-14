# 은혜 킴의 할 일 목록

브라우저에서 바로 쓰는 할 일 목록 웹앱입니다. 할 일은 Supabase 데이터베이스에 저장되어, 새로고침하거나 다른 컴퓨터에서 열어도 그대로 남아 있습니다.

## 주요 기능

- **추가:** 할 일을 입력하고 "추가" 버튼이나 Enter를 누릅니다.
- **완료 표시:** 체크박스를 누르면 줄이 그어지고, 다시 누르면 되돌아갑니다.
- **수정:** 할 일 글자를 두 번 누르면 고칠 수 있습니다. Enter는 저장, Esc는 취소입니다.
- **삭제:** "삭제" 버튼으로 지웁니다.
- **작성자 (선택):** 할 일마다 작성자 이름을 적으면 오른쪽에 이름표로 보입니다.
- **마감일 (선택):** 마감이 가까운 순서로 보여 주고, 마감일이 없는 할 일은 맨 아래에 둡니다. `D-3`처럼 남은 날을 보여 주며, 이틀 이내면 파란색, 지나면 빨간색으로 표시합니다.
- **골라 보기:** 전체 / 진행 중 / 완료 버튼으로 원하는 것만 봅니다.
- **남은 할 일 개수:** 완료하지 않은 할 일이 몇 개인지 보여 줍니다.
- **오류 표시:** 저장에 실패하면 화면에 빨간 상자로 이유를 알려 줍니다.
- **서울 하늘과 날씨:** 서울 시간에 따라 하늘이 새벽, 일출, 낮, 점심, 오후, 일몰, 밤, 한밤중으로 바뀌고, 서울 날씨(맑음, 구름, 흐림, 안개, 비, 눈, 뇌우)가 배경에 나타납니다. 카드 오른쪽에 날씨 그림과 기온을 보여 줍니다. 날씨는 [Open-Meteo](https://open-meteo.com)에서 10분마다 받아옵니다.
  - 미리보기: 주소 뒤에 `?phase=sunset&weather=rain`처럼 붙이면 그 하늘로 고정됩니다.

## 실행 방법

1. 이 저장소를 내려받습니다.
2. `index.html`을 더블클릭해서 브라우저로 엽니다.

설치할 것은 없지만, Supabase 라이브러리를 인터넷에서 불러오고 Supabase에 저장하므로 **인터넷 연결이 필요합니다.**

| 파일 | 설명 |
|---|---|
| `index.html` | 화면, 모양, 동작 코드가 모두 들어 있는 앱 본체 |
| `config.js` | Supabase 주소와 publishable key |
| `critters.js` | 들판을 돌아다니는 캐릭터들과 말풍선, 마우스를 따라다니는 친구 |
| `sky.js` | 서울 시간과 날씨에 맞춰 바뀌는 하늘, 카드 옆 날씨 표시 |
| `.mcp.json` | Claude Code에서 Supabase를 다루기 위한 연결 설정 |
| `CLAUDE.md` | Claude Code에게 주는 프로젝트 안내 |

## Supabase 표 구조

할 일은 `public.todos` 표에 저장됩니다.

| 칸 | 종류 | 설명 |
|---|---|---|
| `id` | 숫자, 자동 증가 | 할 일마다 붙는 고유 번호 |
| `text` | 글자 (필수) | 할 일 내용 |
| `done` | 참/거짓 (기본값 `false`) | 완료 여부 |
| `created_at` | 날짜·시간 (기본값 지금) | 만든 시각 |
| `author` | 글자 (선택) | 작성자 이름 |
| `due_date` | 날짜 (선택) | 마감일 |

새 Supabase 프로젝트에서 같은 표와 권한을 만들려면 SQL Editor에서 아래를 실행합니다. 그다음 `config.js`의 주소와 키를 새 프로젝트 것으로 바꿉니다.

```sql
create table public.todos (
  id bigint generated always as identity primary key,
  text text not null,
  done boolean not null default false,
  created_at timestamptz not null default now(),
  author text,
  due_date date
);

alter table public.todos enable row level security;

create policy "anon can read todos"   on public.todos for select to anon using (true);
create policy "anon can add todos"    on public.todos for insert to anon with check (true);
create policy "anon can update todos" on public.todos for update to anon using (true) with check (true);
create policy "anon can delete todos" on public.todos for delete to anon using (true);
```

## 보안 주의사항

- `config.js`의 `sb_publishable_...` 키는 웹페이지에 공개하도록 만든 **공개용 키**입니다. 비밀이 아니므로 저장소에 올려도 됩니다.
- 데이터를 지키는 것은 키가 아니라 RLS 정책입니다. 지금 정책은 **로그인 없이 누구나 할 일을 읽고, 추가하고, 고치고, 지울 수 있게** 되어 있습니다. 비밀번호나 개인 정보 같은 중요한 내용은 넣지 마세요.
- `sb_secret_...`으로 시작하는 secret key나 `service_role` 키는 모든 권한을 가진 열쇠이므로 **절대 이 저장소나 웹페이지에 넣으면 안 됩니다.**

## 만든 사람과 도구

- **만든 사람:** [eunhyekim0814](https://github.com/eunhyekim0814)
- **도구:** HTML, CSS, JavaScript, [Supabase](https://supabase.com) (데이터베이스), [Claude Code](https://claude.com/claude-code) (AI 코딩 도우미)
