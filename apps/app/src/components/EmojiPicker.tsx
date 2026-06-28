import { useMemo, useState } from "react";

// 구독 앱에 자주 쓰는 이모지 큐레이션 (의존성 없는 경량 피커).
// [이모지, 검색 키워드(ko/en, 소문자)]
type Entry = [string, string];
type Category = { id: string; label: string; emojis: Entry[] };

const CATEGORIES: Category[] = [
  {
    id: "media",
    label: "미디어",
    emojis: [
      ["🎵", "음악 music spotify"],
      ["🎬", "영화 movie netflix"],
      ["📺", "tv 티비 streaming"],
      ["🎮", "게임 game xbox"],
      ["🎧", "헤드폰 음악 audio"],
      ["🎤", "노래 mic karaoke"],
      ["🎸", "기타 음악 guitar"],
      ["🎙️", "팟캐스트 podcast"],
      ["📻", "라디오 radio"],
      ["🎟️", "티켓 ticket"],
      ["🍿", "영화 팝콘 popcorn"],
      ["📹", "비디오 video"],
    ],
  },
  {
    id: "app",
    label: "앱·서비스",
    emojis: [
      ["📱", "폰 app 모바일"],
      ["💻", "노트북 laptop"],
      ["🖥️", "컴퓨터 pc desktop"],
      ["☁️", "클라우드 cloud icloud"],
      ["📦", "박스 구독 box prime"],
      ["🛒", "쇼핑 shopping coupang"],
      ["🔧", "도구 tool"],
      ["⚙️", "설정 settings"],
      ["🗂️", "파일 files notion"],
      ["📊", "통계 chart data"],
      ["🔐", "보안 security vpn"],
      ["🌐", "웹 web internet"],
      ["💾", "저장 storage"],
      ["🤖", "ai 봇 bot chatgpt"],
    ],
  },
  {
    id: "money",
    label: "돈·결제",
    emojis: [
      ["💳", "카드 card 결제"],
      ["💰", "돈 money"],
      ["💵", "달러 dollar"],
      ["🪙", "코인 coin"],
      ["🏦", "은행 bank"],
      ["🧾", "영수증 receipt"],
      ["💎", "프리미엄 premium"],
    ],
  },
  {
    id: "life",
    label: "생활",
    emojis: [
      ["☕", "커피 coffee"],
      ["🍔", "버거 food"],
      ["🍕", "피자 food"],
      ["🍽️", "식사 food meal"],
      ["🚗", "자동차 car"],
      ["🏠", "집 home rent"],
      ["🛏️", "침대 bed"],
      ["🧺", "세탁 laundry"],
      ["🧴", "생활 care"],
      ["🌿", "식물 plant"],
      ["🐶", "강아지 dog pet"],
      ["🐱", "고양이 cat pet"],
    ],
  },
  {
    id: "health",
    label: "건강",
    emojis: [
      ["💪", "운동 gym"],
      ["🧘", "요가 yoga"],
      ["🏃", "러닝 run"],
      ["🚴", "자전거 bike"],
      ["🏋️", "헬스 fitness"],
      ["🥗", "샐러드 diet food"],
      ["💊", "약 health"],
      ["🩺", "건강 health"],
    ],
  },
  {
    id: "study",
    label: "학습·기타",
    emojis: [
      ["📚", "책 book"],
      ["📖", "독서 reading"],
      ["✏️", "연필 write"],
      ["📝", "메모 note"],
      ["🎓", "학습 study"],
      ["🧠", "brain 뇌"],
      ["🗞️", "뉴스 news"],
      ["💡", "아이디어 idea"],
      ["✨", "반짝 sparkle"],
      ["⭐", "별 star"],
      ["🔥", "불 fire hot"],
      ["❤️", "하트 heart"],
      ["🎁", "선물 gift"],
      ["🔔", "알림 bell"],
      ["🏷️", "태그 tag"],
      ["🚀", "로켓 rocket"],
    ],
  },
];

const ALL: Entry[] = CATEGORIES.flatMap((c) => c.emojis);
const DEFAULT_CAT = CATEGORIES[0]?.id ?? "media";

export function EmojiPicker({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (emoji: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [catId, setCatId] = useState(DEFAULT_CAT);

  const q = query.trim().toLowerCase();
  const shown = useMemo<Entry[]>(() => {
    if (q) return ALL.filter(([, kw]) => kw.includes(q));
    return CATEGORIES.find((c) => c.id === catId)?.emojis ?? [];
  }, [q, catId]);

  const pickRandom = () => {
    // 라벨/검색과 무관하게 전체에서 무작위
    const entry = ALL[Math.floor(Math.random() * ALL.length)];
    if (entry) onSelect(entry[0]);
  };

  return (
    <div>
      {/* 검색 + 랜덤 */}
      <div className="mb-2.5 flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-[#4a3aff]"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 검색 (예: 음악, card)"
        />
        <button
          type="button"
          onClick={pickRandom}
          title="랜덤"
          className="flex-shrink-0 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm"
        >
          🎲
        </button>
      </div>

      {/* 카테고리 칩 (검색 중엔 숨김) */}
      {!q && (
        <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCatId(c.id)}
              className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] ${
                c.id === catId
                  ? "bg-[rgba(74,58,255,0.25)] text-[#8b7fff]"
                  : "bg-white/[0.06] text-white/45"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      )}

      {/* 이모지 그리드 */}
      {shown.length === 0 ? (
        <p className="py-6 text-center text-xs text-white/30">검색 결과가 없습니다.</p>
      ) : (
        <div className="grid max-h-[180px] grid-cols-8 gap-1 overflow-y-auto">
          {shown.map(([emoji, kw]) => (
            <button
              key={emoji + kw}
              type="button"
              onClick={() => onSelect(emoji)}
              className={`flex h-9 items-center justify-center rounded-lg text-xl hover:bg-white/[0.08] ${
                value === emoji ? "bg-[rgba(74,58,255,0.25)]" : ""
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
