import type { Locale } from "./config";

export interface UIStrings {
  metaTitle: string;
  metaDescription: string;
  /** Big H1 in the hero. */
  heroTitle: string;
  /** Eyebrow pill above the title; contains a {count} placeholder. */
  heroEyebrow: string;
  heroLede: string;
  heroCta: string;
  /** Logo wordmark: "Animation" stays English; the dim half is localized. */
  brandWord: string;
  brandDim: string;
  homeAria: string;
  langLabel: string;
  navSearchPlaceholder: string;
  navSearchAria: string;
  navCategoriesAria: string;
  navJumpAria: string;
  navOnThisPage: string;
  /** "No patterns match {q}." — {q} marks where the searched text appears. */
  navNoMatch: string;
  navHint: string;
  footerTagline: string;
  footerInspired: string;
  pgCode: string;
  pgUnavailable: string;
  pgNoSnippet: string;
}

export const ui: Record<Locale, UIStrings> = {
  en: {
    metaTitle: "Animation Vocabulary — A Glossary of Animation Patterns",
    metaDescription:
      "A glossary of common animation patterns — with a live, adjustable demo for every term. Learn the names so you can describe the motion you want.",
    heroTitle: "Animation Vocabulary",
    heroEyebrow: "Animation glossary · {count} patterns",
    heroLede:
      "A glossary of common animation patterns. Use these names to describe what you want when prompting an AI — and tweak each one live to feel how it moves.",
    heroCta: "Explore the glossary",
    brandWord: "Animation",
    brandDim: "Vocabulary",
    homeAria: "Animation Vocabulary home",
    langLabel: "Language",
    navSearchPlaceholder: "Search patterns…",
    navSearchAria: "Search animation patterns",
    navCategoriesAria: "Categories",
    navJumpAria: "Jump to category",
    navOnThisPage: "On this page",
    navNoMatch: "No patterns match {q}.",
    navHint: "Hover any card to play its animation on a loop — no clicking required.",
    footerTagline: "An interactive showcase of common animation patterns.",
    footerInspired: "Inspired by",
    pgCode: "Code",
    pgUnavailable: "Demo unavailable",
    pgNoSnippet: "// No snippet for this demo.",
  },
  "zh-tw": {
    metaTitle: "動畫詞彙 — 常見動畫模式詞彙表",
    metaDescription:
      "常見動畫模式的詞彙表，每個術語都附有可即時調整的互動示範。學會這些名稱，就能準確描述你想要的動態效果。",
    heroTitle: "動畫詞彙",
    heroEyebrow: "動畫詞彙表 · {count} 種模式",
    heroLede:
      "常見動畫模式的詞彙表。用這些名稱向 AI 描述你想要的效果，並即時調整每個示範，感受它如何運動。",
    heroCta: "瀏覽詞彙表",
    brandWord: "Animation",
    brandDim: "詞彙",
    homeAria: "Animation Vocabulary 首頁",
    langLabel: "語言",
    navSearchPlaceholder: "搜尋模式…",
    navSearchAria: "搜尋動畫模式",
    navCategoriesAria: "分類",
    navJumpAria: "跳至分類",
    navOnThisPage: "本頁內容",
    navNoMatch: "沒有符合 {q} 的模式。",
    navHint: "將游標移到任一卡片即可循環播放動畫，無需點擊。",
    footerTagline: "常見動畫模式的互動展示。",
    footerInspired: "靈感來自",
    pgCode: "程式碼",
    pgUnavailable: "示範無法載入",
    pgNoSnippet: "// 此示範沒有程式碼片段。",
  },
  ja: {
    metaTitle: "アニメーション用語集 — よく使われるアニメーションパターン辞典",
    metaDescription:
      "よく使われるアニメーションパターンの用語集。各用語にその場で調整できるライブデモ付き。名前を覚えれば、求める動きを的確に伝えられます。",
    heroTitle: "アニメーション用語集",
    heroEyebrow: "アニメーション用語集 · {count} パターン",
    heroLede:
      "よく使われるアニメーションパターンの用語集。これらの名前を使えば、AI に求める動きを伝えられます。各デモをその場で調整して、動きを体感しましょう。",
    heroCta: "用語集を見る",
    brandWord: "Animation",
    brandDim: "用語集",
    homeAria: "Animation Vocabulary ホーム",
    langLabel: "言語",
    navSearchPlaceholder: "パターンを検索…",
    navSearchAria: "アニメーションパターンを検索",
    navCategoriesAria: "カテゴリ",
    navJumpAria: "カテゴリへ移動",
    navOnThisPage: "このページの内容",
    navNoMatch: "{q} に一致するパターンはありません。",
    navHint: "カードにカーソルを合わせるとアニメーションがループ再生されます。クリックは不要です。",
    footerTagline: "よく使われるアニメーションパターンのインタラクティブなショーケース。",
    footerInspired: "インスピレーション元：",
    pgCode: "コード",
    pgUnavailable: "デモを読み込めません",
    pgNoSnippet: "// このデモにはコードスニペットがありません。",
  },
  ko: {
    metaTitle: "애니메이션 용어집 — 자주 쓰는 애니메이션 패턴 사전",
    metaDescription:
      "자주 쓰는 애니메이션 패턴 용어집. 모든 용어에 실시간으로 조절 가능한 데모가 있습니다. 이름을 익히면 원하는 움직임을 정확히 설명할 수 있습니다.",
    heroTitle: "애니메이션 용어집",
    heroEyebrow: "애니메이션 용어집 · 패턴 {count}개",
    heroLede:
      "자주 쓰는 애니메이션 패턴 용어집. 이 이름들을 사용해 AI에게 원하는 움직임을 설명하고, 각 데모를 실시간으로 조절하며 움직임을 느껴보세요.",
    heroCta: "용어집 살펴보기",
    brandWord: "Animation",
    brandDim: "용어집",
    homeAria: "Animation Vocabulary 홈",
    langLabel: "언어",
    navSearchPlaceholder: "패턴 검색…",
    navSearchAria: "애니메이션 패턴 검색",
    navCategoriesAria: "카테고리",
    navJumpAria: "카테고리로 이동",
    navOnThisPage: "이 페이지에서",
    navNoMatch: "{q}과(와) 일치하는 패턴이 없습니다.",
    navHint: "카드에 마우스를 올리면 애니메이션이 반복 재생됩니다. 클릭할 필요가 없습니다.",
    footerTagline: "자주 쓰는 애니메이션 패턴을 보여주는 인터랙티브 쇼케이스.",
    footerInspired: "영감을 준 사람:",
    pgCode: "코드",
    pgUnavailable: "데모를 사용할 수 없음",
    pgNoSnippet: "// 이 데모에는 코드 스니펫이 없습니다.",
  },
  "pt-br": {
    metaTitle: "Vocabulário de Animação — Um Glossário de Padrões de Animação",
    metaDescription:
      "Um glossário de padrões de animação comuns — com uma demonstração ao vivo e ajustável para cada termo. Aprenda os nomes para descrever o movimento que você quer.",
    heroTitle: "Vocabulário de Animação",
    heroEyebrow: "Glossário de animação · {count} padrões",
    heroLede:
      "Um glossário de padrões de animação comuns. Use esses nomes para descrever o que você quer ao conversar com uma IA — e ajuste cada um ao vivo para sentir como ele se move.",
    heroCta: "Explorar o glossário",
    brandWord: "Animation",
    brandDim: "Vocabulário",
    homeAria: "Página inicial do Animation Vocabulary",
    langLabel: "Idioma",
    navSearchPlaceholder: "Buscar padrões…",
    navSearchAria: "Buscar padrões de animação",
    navCategoriesAria: "Categorias",
    navJumpAria: "Ir para a categoria",
    navOnThisPage: "Nesta página",
    navNoMatch: "Nenhum padrão corresponde a {q}.",
    navHint: "Passe o cursor sobre qualquer cartão para reproduzir a animação em loop — sem precisar clicar.",
    footerTagline: "Uma vitrine interativa de padrões de animação comuns.",
    footerInspired: "Inspirado em",
    pgCode: "Código",
    pgUnavailable: "Demonstração indisponível",
    pgNoSnippet: "// Nenhum trecho de código para esta demonstração.",
  },
  es: {
    metaTitle: "Vocabulario de Animación — Un Glosario de Patrones de Animación",
    metaDescription:
      "Un glosario de patrones de animación comunes, con una demostración en vivo y ajustable para cada término. Aprende los nombres para describir el movimiento que quieres.",
    heroTitle: "Vocabulario de Animación",
    heroEyebrow: "Glosario de animación · {count} patrones",
    heroLede:
      "Un glosario de patrones de animación comunes. Usa estos nombres para describir lo que quieres al darle instrucciones a una IA, y ajusta cada uno en vivo para sentir cómo se mueve.",
    heroCta: "Explorar el glosario",
    brandWord: "Animation",
    brandDim: "Vocabulario",
    homeAria: "Inicio de Animation Vocabulary",
    langLabel: "Idioma",
    navSearchPlaceholder: "Buscar patrones…",
    navSearchAria: "Buscar patrones de animación",
    navCategoriesAria: "Categorías",
    navJumpAria: "Ir a la categoría",
    navOnThisPage: "En esta página",
    navNoMatch: "Ningún patrón coincide con {q}.",
    navHint: "Pasa el cursor sobre cualquier tarjeta para reproducir su animación en bucle, sin necesidad de hacer clic.",
    footerTagline: "Una muestra interactiva de patrones de animación comunes.",
    footerInspired: "Inspirado en",
    pgCode: "Código",
    pgUnavailable: "Demostración no disponible",
    pgNoSnippet: "// No hay fragmento de código para esta demostración.",
  },
  fr: {
    metaTitle: "Vocabulaire de l'Animation — Un Glossaire des Motifs d'Animation",
    metaDescription:
      "Un glossaire des motifs d'animation courants, avec une démo interactive et réglable pour chaque terme. Apprenez les noms pour décrire le mouvement que vous voulez.",
    heroTitle: "Vocabulaire de l'Animation",
    heroEyebrow: "Glossaire d'animation · {count} motifs",
    heroLede:
      "Un glossaire des motifs d'animation courants. Utilisez ces noms pour décrire ce que vous voulez lorsque vous sollicitez une IA, et ajustez chacun en direct pour ressentir son mouvement.",
    heroCta: "Explorer le glossaire",
    brandWord: "Animation",
    brandDim: "Vocabulaire",
    homeAria: "Accueil d'Animation Vocabulary",
    langLabel: "Langue",
    navSearchPlaceholder: "Rechercher des motifs…",
    navSearchAria: "Rechercher des motifs d'animation",
    navCategoriesAria: "Catégories",
    navJumpAria: "Aller à la catégorie",
    navOnThisPage: "Sur cette page",
    navNoMatch: "Aucun motif ne correspond à {q}.",
    navHint: "Survolez n'importe quelle carte pour lire son animation en boucle, sans avoir à cliquer.",
    footerTagline: "Une vitrine interactive de motifs d'animation courants.",
    footerInspired: "Inspiré par",
    pgCode: "Code",
    pgUnavailable: "Démo indisponible",
    pgNoSnippet: "// Aucun extrait de code pour cette démo.",
  },
  de: {
    metaTitle: "Animations-Vokabular — Ein Glossar der Animationsmuster",
    metaDescription:
      "Ein Glossar gängiger Animationsmuster – mit einer live anpassbaren Demo für jeden Begriff. Lerne die Namen, um die gewünschte Bewegung zu beschreiben.",
    heroTitle: "Animations-Vokabular",
    heroEyebrow: "Animationsglossar · {count} Muster",
    heroLede:
      "Ein Glossar gängiger Animationsmuster. Verwende diese Namen, um einer KI zu beschreiben, was du willst – und passe jedes Muster live an, um seine Bewegung zu spüren.",
    heroCta: "Glossar erkunden",
    brandWord: "Animation",
    brandDim: "Vokabular",
    homeAria: "Animation Vocabulary Startseite",
    langLabel: "Sprache",
    navSearchPlaceholder: "Muster suchen…",
    navSearchAria: "Animationsmuster suchen",
    navCategoriesAria: "Kategorien",
    navJumpAria: "Zur Kategorie springen",
    navOnThisPage: "Auf dieser Seite",
    navNoMatch: "Kein Muster passt zu {q}.",
    navHint: "Bewege den Mauszeiger über eine Karte, um ihre Animation in einer Schleife abzuspielen – ganz ohne Klick.",
    footerTagline: "Eine interaktive Schau gängiger Animationsmuster.",
    footerInspired: "Inspiriert von",
    pgCode: "Code",
    pgUnavailable: "Demo nicht verfügbar",
    pgNoSnippet: "// Kein Code-Snippet für diese Demo.",
  },
};

export function t(locale: Locale): UIStrings {
  return ui[locale] ?? ui.en;
}
