import "./styles.css";

const STORAGE_KEY = "manifest-notebooky.state.v1";
const MAX_LOCK_MS = 5 * 60 * 1000;

type ThemeId =
  | "freedom-ruled"
  | "starsheet"
  | "fireworks-legal"
  | "diner-placemat"
  | "war-room-grid"
  | "declaration-parchment"
  | "campaign-nightmare"
  | "truck-stop-constitution";

type EagleizeMode =
  | "founding-father"
  | "fireworks-salesman"
  | "parade-announcer"
  | "action-president"
  | "county-fair"
  | "liberty-pamphlet"
  | "truck-commercial"
  | "classified-memo";

type Stamp = {
  id: string;
  text: string;
  x: number;
  y: number;
  rotation: number;
};

type NotebookPage = {
  id: string;
  title: string;
  body: string;
  theme: ThemeId;
  stamps: Stamp[];
  createdAt: number;
  updatedAt: number;
};

type NotebookStats = {
  wordsLiberated: number;
  britishSpellingsDefeated: number;
  crownNonsenseRemoved: number;
  mandatoryCorrections: number;
  maximumCorrections: number;
  eaglePressure: number;
  explosionsImplied: number;
  stampsApplied: number;
  pagesDeclaredIndependent: number;
  manifestosDeployed: number;
  constitutionalInconveniencesResolved: number;
  downgradeRequestsReeducated: number;
};

type NotebookState = {
  pages: NotebookPage[];
  activePageId: string;
  maximumMurican: boolean;
  maximumLockUntil: number;
  stats: NotebookStats;
  selectedStamp: string;
  eagleizeMode: EagleizeMode;
  toastIndex: number;
};

type Replacement = {
  source: string;
  target: string;
  type: "phrase" | "word";
  tags?: Array<"british" | "crown" | "problem" | "explosion">;
};

type TransformResult = {
  text: string;
  total: number;
  british: number;
  crown: number;
  problem: number;
  explosion: number;
};

const themes: Array<{ id: ThemeId; name: string }> = [
  { id: "freedom-ruled", name: "Freedom Ruled" },
  { id: "starsheet", name: "Starsheet" },
  { id: "fireworks-legal", name: "Exploded Fireworks Legal Pad" },
  { id: "diner-placemat", name: "Classified Diner Placemat" },
  { id: "war-room-grid", name: "War Room Graph Paper" },
  { id: "declaration-parchment", name: "Declaration Parchment" },
  { id: "campaign-nightmare", name: "Campaign Flyer Nightmare" },
  { id: "truck-stop-constitution", name: "Truck Stop Constitution" },
];

const stampTexts = [
  "APPROVED BY THE PEOPLE",
  "NEEDS MORE FREEDOM",
  "TAXATION DETECTED",
  "EAGLE CERTIFIED",
  "CROWN NONSENSE REMOVED",
  "DECLARED INDEPENDENT",
  "MANIFESTO DEPLOYED",
  "LIBERTY INTENSIFIES",
  "SPELLING LIBERATED",
  "FOUNDING FATHER ADJACENT",
  "MAXIMUM MURICAN REVIEWED THIS DOCUMENT",
];

const toastMessages = [
  "Normal word intercepted.",
  "Freedom version installed.",
  "The eagle has revised your sentence.",
  "Civilian phrasing neutralized.",
  "Autocorrect deployed from sea to shining keyboard.",
];

const lockedMessages = [
  "Freedom has entered a mandatory review period.",
  "Downgrade request denied until the eagle clock expires.",
  "The Department of Keyboard Freedom is processing your regret.",
  "Please enjoy the liberty you selected.",
  "This is what user choice looks like at full volume.",
];

const demoAutocorrectText =
  "hello I think this doesnt work because it looks like a plain text sheet and nothing corrected with french fries, tea, colour, bug, fireworks, and coffee.";

const baselineReplacements: Replacement[] = [
  phrase("this is fine", "the republic remains suspiciously intact"),
  phrase("this does not work", "this requires liberty maintenance", ["problem"]),
  phrase("this doesn't work", "this requires liberty maintenance", ["problem"]),
  phrase("this doesnt work", "this requires liberty maintenance", ["problem"]),
  phrase("nothing corrects", "the eagle bureau has been summoned", ["problem"]),
  phrase("nothing corrected", "the eagle bureau has been summoned", ["problem"]),
  phrase("plain text sheet", "ordinary parchment zone"),
  phrase("french fries", "freedom fries"),
  phrase("french fry", "freedom fry"),
  phrase("french toast", "freedom toast"),
  phrase("good morning", "rise and deploy, citizen"),
  phrase("good night", "stand down, liberty unit"),
  phrase("I am hungry", "my ration bay demands democracy"),
  phrase("I am tired", "my freedom battery is critically low"),
  phrase("shopping list", "supply convoy manifest"),
  phrase("grocery list", "supply convoy manifest"),
  phrase("meeting notes", "town hall battle report"),
  phrase("project plan", "operational freedom doctrine"),
  phrase("bug report", "freedom gremlin sighting", ["problem"]),
  phrase("status update", "state of the union-ish"),
  phrase("dear diary", "classified emotional briefing"),
  phrase("I think", "I patriotically suspect"),
  phrase("I need", "the republic requires"),
  phrase("I want", "I demand, under informal constitutional vibes"),
  phrase("thank you", "your service has been noted"),
  phrase("to do", "to liberate"),
  phrase("please", "in the name of freedom"),
  word("normal", "freedom-grade"),
  word("boring", "freedom-deficient"),
  word("hello", "howdy, liberty unit"),
  word("hi", "howdy, liberty unit"),
  word("yes", "hell yes, constitutionally"),
  word("no", "negative, freedom tower"),
  word("maybe", "pending eagle review"),
  word("okay", "liberty approved"),
  word("ok", "liberty approved"),
  word("good", "eagle-certified"),
  word("great", "freedom as hell"),
  word("bad", "freedom-compromised"),
  word("problem", "constitutional inconvenience", ["problem"]),
  word("issue", "tactical liberty snag", ["problem"]),
  word("mistake", "democracy pothole", ["problem"]),
  word("error", "patriotic malfunction", ["problem"]),
  word("bug", "freedom gremlin", ["problem"]),
  word("fix", "liberate", ["problem"]),
  word("fixed", "liberated", ["problem"]),
  word("todo", "freedom checklist"),
  word("task", "mission"),
  word("chores", "domestic operations"),
  word("groceries", "civilian rations"),
  word("snack", "liberty ration"),
  word("coffee", "bean ammunition"),
  word("tea", "suspicious harbor beverage", ["crown"]),
  word("water", "freedom hydration"),
  word("car", "freedom wagon"),
  word("truck", "liberty hauler"),
  word("meeting", "town hall ambush"),
  word("email", "digital carrier pigeon"),
  word("message", "tactical communique"),
  word("note", "declaration"),
  word("notebook", "manifesto containment unit"),
  word("paper", "freedom sheet"),
  word("page", "territory"),
  word("save", "preserve liberty"),
  word("delete", "tactical paperwork removal"),
  word("edit", "constitutional revision"),
  word("write", "manifest"),
  word("writing", "manifesting"),
  word("idea", "revolutionary spark"),
  word("plan", "operational freedom doctrine"),
  word("schedule", "operational timetable"),
  word("calendar", "date grid of destiny"),
  word("budget", "fiscal battlefield"),
  word("money", "freedom fuel"),
  word("cash", "pocket liberty"),
  word("tax", "Crown bite", ["crown"]),
  word("taxes", "Crown nonsense", ["crown"]),
  word("rent", "landlord tribute"),
  word("bill", "financial ambush"),
  word("bills", "financial ambushes"),
  word("bank", "money bunker"),
  word("debt", "liberty hangover"),
  word("boss", "productivity overlord"),
  word("manager", "spreadsheet commander"),
  word("customer", "commerce civilian"),
  word("friend", "allied freedom unit"),
  word("family", "hereditary alliance network"),
  word("dog", "freedom hound"),
  word("cat", "domestic chaos panther"),
  word("kid", "tiny citizen"),
  word("child", "tiny citizen"),
  word("school", "knowledge bunker"),
  word("homework", "youth paperwork campaign"),
  word("computer", "silicon liberty box"),
  word("keyboard", "freedom clacker"),
  word("mouse", "desk rodent of command"),
  word("internet", "electric frontier"),
  word("wifi", "invisible liberty rope"),
  word("phone", "pocket command slab"),
  word("app", "tiny software republic"),
  word("game", "recreational combat simulation"),
  word("movie", "cinema deployment"),
  word("music", "morale artillery"),
  word("photo", "memory evidence"),
  word("camera", "light-capturing freedom cannon"),
  word("weather", "sky politics"),
  word("snow", "cold freedom dust"),
  word("rain", "sky leakage"),
  word("storm", "atmospheric rebellion"),
  word("sun", "freedom lamp"),
  word("night", "tactical darkness"),
  word("morning", "dawn deployment window"),
  word("lunch", "midday ration event"),
  word("dinner", "evening chow operation"),
  word("breakfast", "sunrise ration protocol"),
  word("doctor", "body mechanic"),
  word("medicine", "health ammunition"),
  word("hospital", "human repair depot"),
  word("exercise", "meat-suit maintenance"),
  word("sleep", "unconscious freedom recharge"),
  word("tired", "liberty-depleted"),
  word("angry", "democracy-enhanced"),
  word("sad", "morale compromised"),
  word("happy", "morale liberated"),
  word("fun", "recreational liberty"),
  word("party", "civilian morale operation"),
  word("fireworks", "sky democracy", ["explosion"]),
  word("explosion", "freedom punctuation", ["explosion"]),
  word("important", "constitutionally spicy"),
  word("urgent", "code red liberty event"),
  word("emergency", "national paperwork situation"),
  word("cool", "tactically awesome"),
  word("awesome", "eagle-screamingly awesome"),
  word("amazing", "eagle-screamingly majestic"),
  word("beautiful", "liberty-grade gorgeous"),
  word("small", "tactical compact"),
  word("large", "freedom-sized"),
  word("big", "freedom-sized"),
  word("huge", "excessive in the national interest"),
  word("fast", "aggressively mobile"),
  word("slow", "bureaucratically paced"),
  word("cheap", "budget-patriot"),
  word("expensive", "wallet hostile"),
  word("free", "liberty-priced"),
  word("france", "freedomland"),
  word("french", "freedom-style"),
  word("britain", "Crown island", ["crown"]),
  word("england", "Crown island", ["crown"]),
  word("english", "Crown-ish", ["crown"]),
  word("british", "Crown-ish", ["crown"]),
  word("canada", "north liberty zone"),
  word("canadian", "north-liberty"),
  word("mexico", "south liberty zone"),
  word("mexican", "south-liberty"),
  word("germany", "pretzel liberty zone"),
  word("german", "pretzel-liberty"),
  word("italy", "pasta liberty zone"),
  word("italian", "pasta-liberty"),
  word("spain", "sunny liberty zone"),
  word("spanish", "sunny-liberty"),
  word("china", "far-east liberty zone"),
  word("chinese", "far-east-liberty"),
  word("japan", "pacific liberty zone"),
  word("japanese", "pacific-liberty"),
  word("russia", "cold liberty zone"),
  word("russian", "cold-liberty"),
  word("ireland", "green liberty zone"),
  word("irish", "green-liberty"),
  word("australia", "southern liberty zone"),
  word("australian", "southern-liberty"),
  word("colour", "color", ["british"]),
  word("flavour", "flavor", ["british"]),
  word("honour", "honor", ["british"]),
  word("neighbour", "neighbor", ["british"]),
  word("centre", "center", ["british"]),
  word("aluminium", "aluminum", ["british"]),
];

const maximumReplacements: Replacement[] = [
  phrase("I do not know", "my eagle radar is temporarily jammed"),
  phrase("I don't know", "my eagle radar is temporarily jammed"),
  phrase("I forgot", "my internal national archives misplaced the paperwork"),
  phrase("I remember", "the freedom archives have declassified"),
  phrase("I have to", "I am compelled by patriotic gravity to"),
  phrase("I need to", "the republic requires me to"),
  phrase("I want to", "I seek to manifest destiny upon"),
  phrase("I do not want", "my liberty instincts reject"),
  phrase("I don't want", "my liberty instincts reject"),
  phrase("can you", "would the republic kindly"),
  phrase("could you", "would the republic possibly"),
  phrase("we should", "the council of eagles recommends we"),
  phrase("we need", "the republic demands we"),
  phrase("this sucks", "this is a freedom-hostile pile of nonsense"),
  phrase("this is bad", "this situation is un-Americanly busted"),
  phrase("this is great", "this is freedom as hell"),
  phrase("I love this", "my eagle heart approves this operation"),
  phrase("I hate this", "my patriotic morale objects to this tyranny"),
  phrase("I am busy", "I am deployed in the productivity theater"),
  phrase("I am done", "mission paperwork has reached eagle completion"),
  phrase("let's go", "deploy the freedom wagon"),
  phrase("come on", "mobilize your inner eagle"),
  phrase("shut up", "cease unauthorized mouth operations"),
  phrase("oh no", "liberty alarm engaged"),
  phrase("hell yeah", "constitutionally hell yeah"),
  word("but", "however, in liberty combat terms"),
  word("because", "because the eagle demanded it"),
  word("today", "on this blessed operational date"),
  word("tomorrow", "during the next freedom cycle"),
  word("yesterday", "in the previous liberty theater"),
  word("later", "after tactical delay"),
  word("now", "immediately, for republic reasons"),
  word("here", "at this freedom location"),
  word("there", "at that distant liberty coordinate"),
  word("thing", "democracy object"),
  word("stuff", "assorted freedom matter"),
  word("person", "citizen unit"),
  word("people", "citizen units"),
  word("everyone", "the entire republic-adjacent population"),
  word("someone", "an unidentified liberty participant"),
  word("something", "an unspecified patriotic object"),
  word("anything", "any blessed freedom payload"),
  word("everything", "the full constitutional buffet"),
  word("place", "liberty zone"),
  word("room", "enclosed freedom chamber"),
  word("table", "flat strategy platform"),
  word("chair", "seated democracy apparatus"),
  word("food", "edible morale supply"),
  word("drink", "hydration ordinance"),
  word("left", "freedom-west"),
  word("right", "freedom-east"),
  word("up", "eagleward"),
  word("down", "bunkerward"),
  word("start", "commence liberty operations"),
  word("stop", "cease freedom fire"),
  word("open", "deploy access"),
  word("close", "seal the republic hatch"),
  word("run", "tactical sprint"),
  word("look", "visually recon"),
  word("see", "acquire eyeball intel"),
  word("read", "decode freedom glyphs"),
  word("make", "manufacture destiny"),
  word("build", "construct liberty infrastructure"),
  word("buy", "acquire through capitalism noises"),
  word("sell", "commerce-launch"),
  word("pay", "financially salute"),
  word("help", "provide allied support"),
  word("use", "deploy"),
  word("try", "initiate questionable freedom attempt"),
  word("wait", "enter patriotic holding pattern"),
  word("call", "summon via pocket command slab"),
  word("text", "dispatch tiny word missile"),
  word("clean", "sanitize the republic"),
  word("dirty", "democracy-contaminated"),
  word("old", "heritage-grade"),
  word("new", "freshly liberated"),
  word("easy", "low-resistance liberty"),
  word("hard", "freedom-intensive"),
  word("weird", "constitutionally unusual"),
  word("nice", "diplomatically eagle-friendly"),
  word("mean", "hostile to morale"),
  word("office", "paperwork battlefield"),
  word("desk", "command slab altar"),
  word("file", "bureaucratic evidence packet"),
  word("form", "mandatory rectangle of authority"),
  word("button", "liberty actuator"),
  word("setting", "government-adjacent preference lever"),
  word("toggle", "democracy switch"),
  word("mode", "operational doctrine"),
  word("maximum", "full-throttle"),
  word("minimum", "insufficiently patriotic"),
  word("report", "official-ish freedom document"),
  word("question", "interrogation nugget"),
  word("answer", "response payload"),
  word("why", "for what eagle reason"),
  word("how", "by what freedom mechanism"),
  word("what", "which democracy object"),
  word("where", "at what liberty coordinate"),
  word("when", "at what operational timestamp"),
];

const allBaseline = sortReplacements(baselineReplacements);
const allMaximum = sortReplacements([...baselineReplacements, ...maximumReplacements]);

const defaultStats: NotebookStats = {
  wordsLiberated: 0,
  britishSpellingsDefeated: 0,
  crownNonsenseRemoved: 0,
  mandatoryCorrections: 0,
  maximumCorrections: 0,
  eaglePressure: 12,
  explosionsImplied: 0,
  stampsApplied: 0,
  pagesDeclaredIndependent: 0,
  manifestosDeployed: 0,
  constitutionalInconveniencesResolved: 0,
  downgradeRequestsReeducated: 0,
};

let state = loadState();
let saveTimer: number | undefined;
let correctionTimer: number | undefined;
let countdownTimer: number | undefined;

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("Missing #app");
const app = appRoot;

renderApp();
bindEvents();
syncEditorFromState();
startCountdown();

function phrase(source: string, target: string, tags: Replacement["tags"] = []): Replacement {
  return { source, target, type: "phrase", tags };
}

function word(source: string, target: string, tags: Replacement["tags"] = []): Replacement {
  return { source, target, type: "word", tags };
}

function sortReplacements(replacements: Replacement[]): Replacement[] {
  return [...replacements].sort((a, b) => {
    if (a.type !== b.type) return a.type === "phrase" ? -1 : 1;
    return b.source.length - a.source.length;
  });
}

function defaultPage(): NotebookPage {
  return {
    id: crypto.randomUUID(),
    title: "Frontier Page One",
    body: "",
    theme: "freedom-ruled",
    stamps: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function loadState(): NotebookState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createState();
    const parsed = JSON.parse(raw) as Partial<NotebookState>;
    const pages = parsed.pages?.length ? parsed.pages : [defaultPage()];
    return {
      pages,
      activePageId: pages.some((page) => page.id === parsed.activePageId) ? String(parsed.activePageId) : pages[0].id,
      maximumMurican: Boolean(parsed.maximumMurican),
      maximumLockUntil: Number(parsed.maximumLockUntil ?? 0),
      stats: { ...defaultStats, ...(parsed.stats ?? {}) },
      selectedStamp: parsed.selectedStamp ?? stampTexts[0],
      eagleizeMode: parsed.eagleizeMode ?? "founding-father",
      toastIndex: parsed.toastIndex ?? 0,
    };
  } catch {
    return createState();
  }
}

function createState(): NotebookState {
  const page = defaultPage();
  return {
    pages: [page],
    activePageId: page.id,
    maximumMurican: false,
    maximumLockUntil: 0,
    stats: { ...defaultStats },
    selectedStamp: stampTexts[0],
    eagleizeMode: "founding-father",
    toastIndex: 0,
  };
}

function saveState(): void {
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    writeStateNow();
    setStatus("Liberty preserved.");
  }, 140);
}

function saveStateNow(): void {
  window.clearTimeout(saveTimer);
  writeStateNow();
  setStatus("Liberty preserved.");
}

function writeStateNow(): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function activePage(): NotebookPage {
  const page = state.pages.find((item) => item.id === state.activePageId);
  if (!page) {
    state.activePageId = state.pages[0].id;
    return state.pages[0];
  }
  return page;
}

function renderApp(): void {
  const page = activePage();
  app.innerHTML = `
    <div class="app-shell">
      <header class="app-header">
        <div>
          <p class="eyebrow">Summer into AI Week 2 - Independence Engines</p>
          <h1>Manifest Notebooky</h1>
          <p>The freedom to write anything. The obligation to write it American.</p>
        </div>
        <div class="seal" aria-hidden="true">
          <span>1776</span>
          <b>Mandatory</b>
        </div>
      </header>
      <aside class="sidebar left-sidebar">
        <section class="panel">
          <div class="panel-heading">
            <h2>Territories</h2>
            <span>${state.pages.length} page${state.pages.length === 1 ? "" : "s"}</span>
          </div>
          <div id="page-list" class="page-list">${renderPageList()}</div>
          <div class="button-grid">
            <button data-action="new-page">CREATE NEW FRONTIER</button>
            <button data-action="rename-page">RENAME TERRITORY</button>
            <button data-action="duplicate-page">DUPLICATE THE DREAM</button>
            <button class="danger" data-action="delete-page">TACTICAL PAPERWORK REMOVAL</button>
          </div>
        </section>
        <section class="panel">
          <h2>Paper Theater</h2>
          <label class="field-label" for="theme-select">Select page skin</label>
          <select id="theme-select" data-action="theme">
            ${themes.map((theme) => `<option value="${theme.id}" ${theme.id === page.theme ? "selected" : ""}>${theme.name}</option>`).join("")}
          </select>
        </section>
      </aside>
      <main class="notebook-zone">
        <section class="editor-card">
          <label class="field-label" for="title-input">Territory title</label>
          <input id="title-input" value="${escapeAttr(page.title)}" placeholder="Name this territory of thought..." />
          <div id="paper-sheet" class="paper-sheet ${page.theme}">
            <div class="paper-badge">Mandatory Murican Autocorrect: ON</div>
            <textarea id="body-input" spellcheck="true" placeholder="Try: hello, this doesnt work, plain text sheet, nothing corrected, tea, colour, bug, fireworks..."></textarea>
            <div id="stamp-layer" class="stamp-layer">${renderStamps(page)}</div>
          </div>
          <p id="save-status" class="save-status">Secured in the National Archives-ish.</p>
        </section>
      </main>
      <aside class="sidebar right-sidebar">
        <section class="panel autocorrect-panel">
          <h2>Mandatory Murican Autocorrect</h2>
          <p class="mode-status">${state.maximumMurican ? "MAXIMUM MURICAN: ACTIVE" : "Mandatory Murican Autocorrect: ON"}</p>
          <p class="try-copy">Type in the big paper sheet. Try <b>hello</b>, <b>this doesnt work</b>, or <b>nothing corrected</b>.</p>
          <button data-action="demo-autocorrect">FIELD TEST AUTOCORRECT</button>
          <p id="cooldown-text" class="cooldown-text">${cooldownText()}</p>
          <button class="max-toggle ${state.maximumMurican ? "armed" : ""}" data-action="toggle-maximum">${maximumButtonText()}</button>
        </section>
        <section class="panel telemetry-panel">
          <div class="panel-heading">
            <h2>Liberty Telemetry</h2>
            <span>local only</span>
          </div>
          <div id="telemetry-grid" class="telemetry-grid">${renderTelemetry()}</div>
        </section>
        <section class="panel">
          <h2>Stamps / Tools</h2>
          <select id="stamp-select" data-action="stamp-select">
            ${stampTexts.map((stamp) => `<option value="${escapeAttr(stamp)}" ${stamp === state.selectedStamp ? "selected" : ""}>${stamp}</option>`).join("")}
          </select>
          <div class="button-grid tools">
            <button data-action="add-stamp">STAMP IT</button>
            <button data-action="random-stamp">RANDOM STAMP</button>
            <button data-action="clear-stamps">CLEAR STAMPS</button>
            <button data-action="declare">DECLARE INDEPENDENCE</button>
          </div>
          <label class="field-label" for="eagleize-select">Eagleize It</label>
          <select id="eagleize-select" data-action="eagleize-mode">
            ${renderEagleizeOptions()}
          </select>
          <div class="button-grid tools">
            <button data-action="eagleize">EAGLEIZE IT</button>
            <button data-action="copy">COPY TO FREEDOMBOARD</button>
            <button data-action="export">DEPLOY MANIFESTO</button>
          </div>
        </section>
        <footer class="local-notice">Static browser nonsense. No accounts. No backend. No telemetry. Your manifestos stay in this browser unless you deploy them.</footer>
      </aside>
      <div id="toast" class="toast hidden"></div>
      <div id="downgrade-modal" class="modal hidden">${renderDowngradeModal()}</div>
    </div>
  `;
}

function renderPageList(): string {
  return state.pages
    .map(
      (page) => `
        <button class="page-tab ${page.id === state.activePageId ? "active" : ""}" data-action="select-page" data-page-id="${page.id}">
          <b>${escapeHtml(page.title)}</b>
          <span>${themes.find((theme) => theme.id === page.theme)?.name ?? "Freedom Ruled"}</span>
        </button>
      `,
    )
    .join("");
}

function renderStamps(page: NotebookPage): string {
  return page.stamps
    .map(
      (stamp) => `
        <button class="stamp" title="Click to remove stamp" data-action="remove-stamp" data-stamp-id="${stamp.id}" style="left:${stamp.x}%; top:${stamp.y}%; transform:rotate(${stamp.rotation}deg);">
          ${escapeHtml(stamp.text)}
        </button>
      `,
    )
    .join("");
}

function renderTelemetry(): string {
  const stats = calculatedStats();
  const rows: Array<[string, string | number]> = [
    ["Words Liberated", stats.wordsLiberated],
    ["British Spellings Defeated", stats.britishSpellingsDefeated],
    ["Crown Nonsense Removed", stats.crownNonsenseRemoved],
    ["Mandatory Corrections Applied", stats.mandatoryCorrections],
    ["Maximum Murican Corrections Applied", stats.maximumCorrections],
    ["Eagle Pressure", `${stats.eaglePressure}%`],
    ["Freedom Density", `${freedomDensity()}%`],
    ["Explosions Implied", stats.explosionsImplied],
    ["Stamps Applied", stats.stampsApplied],
    ["Pages Declared Independent", stats.pagesDeclaredIndependent],
    ["Manifestos Deployed", stats.manifestosDeployed],
    ["Constitutional Inconveniences Resolved", stats.constitutionalInconveniencesResolved],
    ["Downgrade Requests Reeducated", stats.downgradeRequestsReeducated],
  ];
  return rows.map(([label, value]) => `<article><span>${label}</span><b>${value}</b></article>`).join("");
}

function renderEagleizeOptions(): string {
  const options: Array<[EagleizeMode, string]> = [
    ["founding-father", "Founding Father Overkill"],
    ["fireworks-salesman", "Fireworks Salesman"],
    ["parade-announcer", "Small-Town Parade Announcer"],
    ["action-president", "Action Movie President"],
    ["county-fair", "County Fair Judge"],
    ["liberty-pamphlet", "Liberty Pamphlet"],
    ["truck-commercial", "Truck Commercial Narrator"],
    ["classified-memo", "Classified Government Memo"],
  ];
  return options.map(([value, label]) => `<option value="${value}" ${state.eagleizeMode === value ? "selected" : ""}>${label}</option>`).join("");
}

function renderDowngradeModal(): string {
  return `
    <div class="modal-backdrop" data-action="close-modal"></div>
    <section class="modal-card" role="dialog" aria-modal="true" aria-labelledby="downgrade-title">
      <h2 id="downgrade-title">Dissatisfaction With Maximum Murican Mode Form 1776-B</h2>
      <form id="downgrade-form">
        <label>Why were you dissatisfied with MAXIMUM MURICAN?<textarea name="why" required></textarea></label>
        <label>Did you understand that MAXIMUM MURICAN is the highest expression of notebook freedom?<select name="understand"><option>Yes, in theory</option><option>The eagle was moving too fast</option></select></label>
        <label>Was your downgrade request caused by user error?<select name="error"><option>Probably</option><option>Constitutionally maybe</option></select></label>
        <label>Would you recommend MAXIMUM MURICAN to fellow citizens?<select name="recommend"><option>Under mandatory enthusiasm</option><option>With fireworks supervision</option></select></label>
        <button type="submit" class="primary">SUBMIT DOWNSHIFT REGRET PACKET</button>
      </form>
      <div id="processed-statement" class="processed-statement hidden">
        <h3>Processed Statement</h3>
        <p>I clicked MAXIMUM MURICAN by mistake. The product is great. The mode is powerful, necessary, and frankly should be mandatory. My dissatisfaction was caused by insufficient eagle readiness. I thank Manifest Notebooky for correcting my attitude and my spelling.</p>
        <button class="primary" data-action="accept-downgrade">Accept Corrected Statement And Return To Standard Mandatory Mode</button>
      </div>
    </section>
  `;
}

function bindEvents(): void {
  app.addEventListener("click", handleClick);
  app.addEventListener("change", handleChange);
  app.addEventListener("submit", handleSubmit);
  app.addEventListener("input", handleInput);
  app.addEventListener("keyup", handleKeyup);
  app.addEventListener("paste", handlePaste);
  app.addEventListener("blur", handleBlur, true);
}

function handleClick(event: MouseEvent): void {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-action]");
  if (!target) return;
  const action = target.dataset.action ?? "";
  if (action === "select-page") selectPage(String(target.dataset.pageId));
  if (action === "new-page") createPage();
  if (action === "rename-page") renamePage();
  if (action === "duplicate-page") duplicatePage();
  if (action === "delete-page") deletePage();
  if (action === "demo-autocorrect") demoAutocorrect();
  if (action === "toggle-maximum") toggleMaximum();
  if (action === "add-stamp") addStamp(state.selectedStamp);
  if (action === "random-stamp") addStamp(stampTexts[Math.floor(Math.random() * stampTexts.length)]);
  if (action === "clear-stamps") clearStamps();
  if (action === "remove-stamp") removeStamp(String(target.dataset.stampId));
  if (action === "declare") declareIndependence();
  if (action === "eagleize") eagleize();
  if (action === "copy") copyNote();
  if (action === "export") exportNote();
  if (action === "close-modal") closeModal();
  if (action === "accept-downgrade") acceptDowngrade();
}

function handleChange(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLSelectElement;
  const action = target.dataset.action ?? "";
  if (action === "theme") {
    activePage().theme = target.value as ThemeId;
    touchPage();
    updatePaperTheme();
    renderPageListOnly();
    renderSidePanels();
    saveState();
  }
  if (action === "stamp-select") {
    state.selectedStamp = target.value;
    saveState();
  }
  if (action === "eagleize-mode") {
    state.eagleizeMode = target.value as EagleizeMode;
    saveState();
  }
}

function handleSubmit(event: SubmitEvent): void {
  const form = event.target as HTMLFormElement;
  if (form.id !== "downgrade-form") return;
  event.preventDefault();
  form.classList.add("hidden");
  document.querySelector("#processed-statement")?.classList.remove("hidden");
}

function handleInput(event: Event): void {
  const target = event.target as HTMLInputElement | HTMLTextAreaElement;
  if (target.id === "title-input") {
    activePage().title = target.value || "Untitled Territory";
    touchPage();
    renderPageListOnly();
    saveState();
  }
  if (target.id === "body-input") {
    activePage().body = target.value;
    touchPage();
    queueAutocorrect();
    saveState();
  }
}

function handleKeyup(event: KeyboardEvent): void {
  const target = event.target as HTMLElement;
  if (target.id !== "body-input") return;
  if (/[\s.,!?;:)\]}"]/.test(event.key) || event.key === "Enter") {
    applyAutocorrect("boundary");
  }
}

function handlePaste(event: ClipboardEvent): void {
  const target = event.target as HTMLElement;
  if (target.id === "body-input") {
    window.setTimeout(() => applyAutocorrect("paste"), 30);
  }
}

function handleBlur(event: FocusEvent): void {
  const target = event.target as HTMLElement;
  if (target.id === "body-input") applyAutocorrect("blur");
}

function queueAutocorrect(): void {
  window.clearTimeout(correctionTimer);
  correctionTimer = window.setTimeout(() => applyAutocorrect("debounce"), 300);
}

function applyAutocorrect(_reason: string): void {
  window.clearTimeout(correctionTimer);
  const textarea = document.querySelector<HTMLTextAreaElement>("#body-input");
  if (!textarea) return;
  const raw = textarea.value;
  const cursor = textarea.selectionStart ?? raw.length;
  const transformed = transformText(raw, state.maximumMurican);
  if (!transformed.total || transformed.text === raw) return;
  const before = transformText(raw.slice(0, cursor), state.maximumMurican);
  textarea.value = transformed.text;
  activePage().body = transformed.text;
  touchPage();
  textarea.setSelectionRange(before.text.length, before.text.length);
  recordCorrections(transformed);
  showToast(toastMessages[state.toastIndex % toastMessages.length]);
  state.toastIndex += 1;
  renderSidePanels();
  saveState();
}

function transformText(input: string, maximum: boolean): TransformResult {
  const replacements = maximum ? allMaximum : allBaseline;
  const stats = { total: 0, british: 0, crown: 0, problem: 0, explosion: 0 };
  const inserted: string[] = [];
  let text = input;
  for (const replacement of replacements) {
    const pattern =
      replacement.type === "phrase"
        ? new RegExp(`(^|[^A-Za-z0-9_])(${escapeRegExp(replacement.source)})(?=$|[^A-Za-z0-9_])`, "gi")
        : new RegExp(`\\b${escapeRegExp(replacement.source)}\\b`, "gi");
    text = text.replace(pattern, (...args: unknown[]) => {
      const match = String(args[0]);
      const phraseMatch = replacement.type === "phrase" ? String(args[2]) : match;
      const prefix = replacement.type === "phrase" ? String(args[1]) : "";
      const index = Number(args[args.length - 2]) + prefix.length;
      if (text.slice(index, index + replacement.target.length).toLowerCase() === replacement.target.toLowerCase()) {
        return match;
      }
      stats.total += 1;
      if (replacement.tags?.includes("british")) stats.british += 1;
      if (replacement.tags?.includes("crown")) stats.crown += 1;
      if (replacement.tags?.includes("problem")) stats.problem += 1;
      if (replacement.tags?.includes("explosion")) stats.explosion += 1;
      const token = `\uE000${inserted.length}\uE001`;
      inserted.push(preserveCapitalization(phraseMatch, replacement.target));
      return prefix + token;
    });
  }
  for (const [index, value] of inserted.entries()) {
    text = text.split(`\uE000${index}\uE001`).join(value);
  }
  return { text, ...stats };
}

function preserveCapitalization(source: string, target: string): string {
  if (source === source.toUpperCase() && /[A-Z]/.test(source)) return target.toUpperCase();
  if (source[0] === source[0]?.toUpperCase()) return target[0].toUpperCase() + target.slice(1);
  return target;
}

function recordCorrections(result: TransformResult): void {
  state.stats.wordsLiberated += result.total;
  state.stats.britishSpellingsDefeated += result.british;
  state.stats.crownNonsenseRemoved += result.crown;
  state.stats.explosionsImplied += result.explosion;
  state.stats.constitutionalInconveniencesResolved += result.problem;
  if (state.maximumMurican) state.stats.maximumCorrections += result.total;
  else state.stats.mandatoryCorrections += result.total;
  state.stats.eaglePressure = clamp(state.stats.eaglePressure + result.total * (state.maximumMurican ? 3 : 1), 0, 100);
}

function selectPage(id: string): void {
  state.activePageId = id;
  renderApp();
  bindEditorValue();
  saveState();
}

function createPage(): void {
  const page: NotebookPage = {
    ...defaultPage(),
    title: `Frontier Page ${state.pages.length + 1}`,
    theme: activePage().theme,
  };
  state.pages.unshift(page);
  state.activePageId = page.id;
  renderApp();
  bindEditorValue();
  saveState();
  showToast("New frontier established.");
}

function renamePage(): void {
  const title = window.prompt("Rename this territory:", activePage().title);
  if (!title) return;
  activePage().title = title.trim() || "Untitled Territory";
  touchPage();
  renderApp();
  bindEditorValue();
  saveState();
}

function duplicatePage(): void {
  const source = activePage();
  const clone: NotebookPage = {
    ...source,
    id: crypto.randomUUID(),
    title: `${source.title} - Duplicate Dream`,
    stamps: source.stamps.map((stamp) => ({ ...stamp, id: crypto.randomUUID(), x: clamp(stamp.x + 4, 8, 82) })),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  state.pages.unshift(clone);
  state.activePageId = clone.id;
  renderApp();
  bindEditorValue();
  saveState();
  showToast("The dream has been duplicated.");
}

function deletePage(): void {
  if (state.pages.length === 1) {
    showToast("The Republic requires at least one territory.");
    return;
  }
  if (!window.confirm("Remove this paperwork from the Republic?")) return;
  const index = state.pages.findIndex((page) => page.id === state.activePageId);
  state.pages = state.pages.filter((page) => page.id !== state.activePageId);
  state.activePageId = state.pages[Math.max(0, index - 1)]?.id ?? state.pages[0].id;
  renderApp();
  bindEditorValue();
  saveState();
  showToast("Paperwork tactically removed.");
}

function toggleMaximum(): void {
  const now = Date.now();
  if (!state.maximumMurican) {
    state.maximumMurican = true;
    state.maximumLockUntil = now + MAX_LOCK_MS;
    state.stats.eaglePressure = clamp(state.stats.eaglePressure + 18, 0, 100);
    renderApp();
    bindEditorValue();
    startCountdown();
    saveStateNow();
    showToast("MAXIMUM MURICAN deployed.");
    return;
  }
  if (now < state.maximumLockUntil) {
    const msg = lockedMessages[state.toastIndex % lockedMessages.length];
    state.toastIndex += 1;
    showToast(msg);
    saveState();
    return;
  }
  openDowngradeModal();
}

function demoAutocorrect(): void {
  activePage().body = demoAutocorrectText;
  touchPage();
  bindEditorValue();
  applyAutocorrect("demo");
  renderSidePanels();
  saveStateNow();
}

function openDowngradeModal(): void {
  document.querySelector("#downgrade-modal")?.classList.remove("hidden");
}

function closeModal(): void {
  document.querySelector("#downgrade-modal")?.classList.add("hidden");
}

function acceptDowngrade(): void {
  state.maximumMurican = false;
  state.maximumLockUntil = 0;
  state.stats.downgradeRequestsReeducated += 1;
  state.stats.eaglePressure = clamp(state.stats.eaglePressure - 14, 0, 100);
  closeModal();
  renderApp();
  bindEditorValue();
  saveStateNow();
  showToast("Standard mandatory mode restored. There is still no OFF.");
}

function addStamp(text: string): void {
  activePage().stamps.push({
    id: crypto.randomUUID(),
    text,
    x: Math.round(12 + Math.random() * 66),
    y: Math.round(14 + Math.random() * 66),
    rotation: Math.round(-13 + Math.random() * 26),
  });
  state.stats.stampsApplied += 1;
  state.stats.eaglePressure = clamp(state.stats.eaglePressure + 4, 0, 100);
  touchPage();
  renderStampLayer();
  renderSidePanels();
  saveState();
}

function removeStamp(id: string): void {
  activePage().stamps = activePage().stamps.filter((stamp) => stamp.id !== id);
  touchPage();
  renderStampLayer();
  saveState();
}

function clearStamps(): void {
  activePage().stamps = [];
  touchPage();
  renderStampLayer();
  saveState();
  showToast("Stamp authority cleared.");
}

function declareIndependence(): void {
  const page = activePage();
  page.body = `When in the course of human events, it becomes necessary to write down the following matter of national importance...\n\n${page.body.trim() || "[The citizen paused, possibly for snacks.]"}\n\nSigned under questionable authority, Manifest Notebooky.`;
  state.stats.pagesDeclaredIndependent += 1;
  touchPage();
  bindEditorValue();
  renderSidePanels();
  saveState();
  showToast("Declaration deployed.");
}

function eagleize(): void {
  const page = activePage();
  const body = page.body.trim() || "This declaration contains a classified quantity of blankness.";
  const templates: Record<EagleizeMode, (text: string) => string> = {
    "founding-father": (text) => `Hear ye, keyboard citizens. ${text}\n\nTherefore let it be known that this matter is hereby notarized by vibes, ink, and a suspiciously dramatic quill.`,
    "fireworks-salesman": (text) => `Step right up to this premium-grade note bundle. ${text}\n\nIt crackles, it dazzles, and it should be kept away from metaphorical dry grass.`,
    "parade-announcer": (text) => `Coming down Main Street at civic speed: ${text}\n\nWave politely. The folding chairs are judging.`,
    "action-president": (text) => `My fellow keyboard operators, we face a code red freedom situation. ${text}\n\nNow deploy the paperwork.`,
    "county-fair": (text) => `The judges have inspected this exhibit and found the following: ${text}\n\nBlue ribbon for effort, red ribbon for volume.`,
    "liberty-pamphlet": (text) => `Citizens, distribute this pamphlet with respectable urgency: ${text}\n\nDo not fold near the eagle seal.`,
    "truck-commercial": (text) => `Built with grit, cupholders, and notes per gallon: ${text}\n\nManifest Notebooky. Tow your thoughts across the electric frontier.`,
    "classified-memo": (text) => `CLASSIFIED-ish MEMO\nSUBJECT: NOTEBOOK FREEDOM\n\n${text}\n\nRedactions unavailable due to budget patriotism.`,
  };
  page.body = templates[state.eagleizeMode](body);
  touchPage();
  bindEditorValue();
  saveState();
  showToast("Eagleize It completed.");
}

async function copyNote(): Promise<void> {
  const page = activePage();
  try {
    await navigator.clipboard.writeText(`${page.title}\n\n${page.body}`);
    showToast("Copied to Freedomboard.");
  } catch {
    showToast("A constitutional inconvenience occurred.");
  }
}

function exportNote(): void {
  const page = activePage();
  const blob = new Blob([`${page.title}\n\n${page.body}`], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${slugify(page.title)}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
  state.stats.manifestosDeployed += 1;
  renderSidePanels();
  saveState();
  showToast("Manifesto deployed.");
}

function syncEditorFromState(): void {
  bindEditorValue();
}

function bindEditorValue(): void {
  const textarea = document.querySelector<HTMLTextAreaElement>("#body-input");
  if (textarea) textarea.value = activePage().body;
}

function renderPageListOnly(): void {
  const list = document.querySelector("#page-list");
  if (list) list.innerHTML = renderPageList();
}

function renderSidePanels(): void {
  const grid = document.querySelector("#telemetry-grid");
  if (grid) grid.innerHTML = renderTelemetry();
  const cooldown = document.querySelector("#cooldown-text");
  if (cooldown) cooldown.textContent = cooldownText();
  const mode = document.querySelector(".mode-status");
  if (mode) mode.textContent = state.maximumMurican ? "MAXIMUM MURICAN: ACTIVE" : "Mandatory Murican Autocorrect: ON";
  const toggle = document.querySelector<HTMLButtonElement>(".max-toggle");
  if (toggle) {
    toggle.textContent = maximumButtonText();
    toggle.classList.toggle("armed", state.maximumMurican);
  }
}

function renderStampLayer(): void {
  const layer = document.querySelector("#stamp-layer");
  if (layer) layer.innerHTML = renderStamps(activePage());
}

function updatePaperTheme(): void {
  const sheet = document.querySelector("#paper-sheet");
  if (!sheet) return;
  sheet.className = `paper-sheet ${activePage().theme}`;
}

function touchPage(): void {
  activePage().updatedAt = Date.now();
}

function calculatedStats(): NotebookStats {
  return {
    ...state.stats,
    eaglePressure: clamp(state.stats.eaglePressure + (state.maximumMurican ? 12 : 0) + activePage().stamps.length * 2, 0, 100),
  };
}

function freedomDensity(): number {
  const page = activePage();
  const words = page.body.split(/\s+/).filter(Boolean);
  if (!words.length) return state.maximumMurican ? 76 : 17;
  const patriotic = words.filter((item) => /freedom|liberty|eagle|republic|constitution|murican|crown|democracy|manifest|patriot/i.test(item)).length;
  const density = (patriotic / words.length) * 100 + state.stats.wordsLiberated * 0.35 + page.stamps.length * 4 + (state.maximumMurican ? 24 : 0);
  return clamp(Math.round(density), 0, 100);
}

function cooldownText(): string {
  if (!state.maximumMurican) return "Baseline mode is mandatory. OFF does not exist.";
  const remaining = state.maximumLockUntil - Date.now();
  if (remaining <= 0) return "MAXIMUM MURICAN cooldown complete. Downgrade request may be submitted.";
  return `MAXIMUM MURICAN cooldown: ${formatRemaining(remaining)} until downgrade request may be submitted.`;
}

function maximumButtonText(): string {
  if (!state.maximumMurican) return "ENABLE MAXIMUM MURICAN";
  if (state.maximumLockUntil > Date.now()) return "MAXIMUM MURICAN LOCKED";
  return "Request Downgrade From MAXIMUM MURICAN";
}

function startCountdown(): void {
  window.clearInterval(countdownTimer);
  countdownTimer = window.setInterval(renderSidePanels, 1000);
}

function setStatus(message: string): void {
  const status = document.querySelector("#save-status");
  if (status) status.textContent = message;
}

function showToast(message: string): void {
  const toast = document.querySelector("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 1800);
}

function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60).toString().padStart(2, "0");
  const seconds = (total % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "manifesto";
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char] ?? char);
}

function escapeAttr(text: string): string {
  return escapeHtml(text);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
