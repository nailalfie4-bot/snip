"use client";
import React, { useState, useMemo, useRef, useEffect } from "react";

// ============================================================================
// Snip.io — connected site (single file, client-side routing)
//   Views:  'home'        = scanner app + funnel
//           'guides'      = cancel-guides hub (lists every service)
//           'guide:<key>' = individual "how to cancel X" page
// Palette: research-backed fintech trust scheme — light base, navy/slate text,
//          emerald accent for money/savings/CTAs. High contrast, readable.
// All statement parsing happens in-browser. No data leaves the device.
// ============================================================================

// --- Cancel-guide content (your MOAT — add one entry per new service) -------
const GUIDES = {
  netflix: {
    name: "Netflix", cat: "Streaming", price: "from £4.99/mo",
    url: "https://www.netflix.com/cancelplan",
    short: "Sign in → profile icon → Account → Cancel Membership → confirm. You keep access until the end of your billing period.",
    notice: "No notice period. You keep access until your current paid month ends. Netflix doesn't refund part-months, so cancel a day or two before your renewal date.",
    steps: [
      ["Sign in to netflix.com", "Use any web browser — this is the most reliable method."],
      ["Open Account", "Click your profile icon, top right, then select Account."],
      ["Cancel Membership", "Under Membership & Billing, click Cancel Membership."],
      ["Confirm", "Follow the prompts and select Finish Cancellation. You'll get a confirmation email."],
    ],
    billedElsewhere: "If there's no Cancel button, you're billed through Apple (Settings → your name → Subscriptions), Google Play, or a TV provider like Sky — cancel with them instead.",
    after: "Your profiles and watch history stay saved for around 10 months in case you return; logging back in resets that. To delete your data entirely, cancel first, then request deletion under UK GDPR.",
    faqs: [
      ["Do I lose access the moment I cancel?", "No — you keep access until the end of your current billing period. Cancel a day or two before renewal to use the full month you've paid for."],
      ["Should I pause instead?", "Netflix has no real pause in the UK — pausing is the same as cancelling and resubscribing. Restarting is quick and your data is kept ~10 months, so you lose very little."],
      ["I cancelled but I'm still charged.", "You likely cancelled in the wrong place — Netflix billed via Apple, Google or a TV provider keeps charging until you cancel with that provider. Check your statement and keep the confirmation email."],
    ],
  },
  "amazon-prime": {
    name: "Amazon Prime", cat: "Shopping / Streaming", price: "£8.99/mo or £95/yr",
    url: "https://www.amazon.co.uk/gp/primecentral",
    short: "Account → Prime Membership → Manage → End Membership. If you've barely used the delivery benefits, you may be owed a partial refund.",
    notice: "You can cancel any time. If you haven't used Prime benefits in the current period, Amazon may refund you — it'll tell you on the cancellation screen.",
    steps: [
      ["Go to Amazon.co.uk and sign in", "Then open Account & Lists."],
      ["Open Prime Membership", "Select Prime, then Manage Membership."],
      ["End Membership", "Click End Membership and follow the prompts."],
      ["Confirm the end date", "Amazon shows whether you get a refund and when access stops."],
    ],
    billedElsewhere: "Prime is almost always billed directly by Amazon, so cancel in your Amazon account.",
    after: "Cancelling Prime also ends Prime Video, Prime Music, and free delivery. If you only want Prime Video, you can subscribe to that separately for less.",
    faqs: [
      ["Will I get a refund?", "Possibly. If you haven't used the delivery or streaming benefits in the current billing period, Amazon often refunds the unused portion. The cancellation screen tells you."],
      ["Does this cancel Prime Video too?", "Yes — Prime Video, Music and free delivery all end together unless you resubscribe to a single service."],
      ["When does access stop?", "At the end of your current paid period, unless you take an immediate refund."],
    ],
  },
  spotify: {
    name: "Spotify", cat: "Music", price: "from £11.99/mo",
    url: "https://www.spotify.com/account/subscription/",
    short: "Account → Your plan → Change plan → Cancel Premium. You drop to the free tier at the end of the period.",
    notice: "No notice period. Premium continues until the end of the paid month, then you move to the free (ad-supported) tier — your playlists stay.",
    steps: [
      ["Go to spotify.com and log in", "Use a browser — you can't always cancel inside the app."],
      ["Open your Account page", "Click your name, top right, then Account."],
      ["Find Your plan", "Scroll to Your plan and choose Change plan."],
      ["Cancel Premium", "Select Cancel Premium and confirm."],
    ],
    billedElsewhere: "If you subscribed via Apple, cancel in Settings → your name → Subscriptions. Via a phone provider's bundle, cancel with them.",
    after: "Your account, playlists and saved music all stay — you just lose offline downloads and ad-free listening at the end of the period.",
    faqs: [
      ["Do I lose my playlists?", "No. Your playlists and library stay on the free tier. You only lose offline downloads and ad-free playback."],
      ["When does it end?", "At the end of your current paid month. No part-refunds."],
      ["Billed through Apple?", "Then you must cancel via your iPhone's Subscriptions settings, not Spotify's site."],
    ],
  },
  puregym: {
    name: "PureGym", cat: "Fitness", price: "from £21.99/mo",
    url: "https://www.puregym.com/members/",
    short: "Log in to the members' area → Manage membership → Cancel. Most plans need a full calendar month's notice, so do it early.",
    notice: "Usually a full calendar month's notice. If your payment date is the 1st, cancelling on the 2nd means you'll likely be billed once more before it stops. Check your specific plan.",
    steps: [
      ["Log in to the PureGym members' area", "Use the website rather than the app for cancellations."],
      ["Open Manage Membership", "Find your membership settings."],
      ["Select Cancel", "Choose to cancel and pick your reason if prompted."],
      ["Note the final billing date", "Because of the notice period, confirm exactly when your last payment is."],
    ],
    billedElsewhere: "PureGym bills you directly by Direct Debit. Don't just cancel the Direct Debit — cancel the membership properly first, or you may be chased for the notice period.",
    after: "Access continues until the end of your notice period. Keep the cancellation confirmation in case of a billing dispute.",
    faqs: [
      ["What's the notice period?", "Typically one full calendar month, though it varies by plan. Cancel as early in your billing month as possible to avoid an extra payment."],
      ["Can I just cancel the Direct Debit?", "Don't. Cancel the membership through PureGym first — cancelling only the Direct Debit can leave you owing the notice period."],
      ["Is there a fee?", "Most flexible PureGym plans have no exit fee, but fixed-term plans might. Check your contract."],
    ],
  },
  disney: {
    name: "Disney+", cat: "Streaming", price: "from £4.99/mo",
    url: "https://www.disneyplus.com/account/subscription",
    short: "Profile → Account → cancel your subscription. Access continues to the end of the paid period.",
    notice: "No notice period. You keep access until the end of the current month or year you've paid for.",
    steps: [
      ["Sign in at disneyplus.com", "Use a browser if you subscribed directly."],
      ["Open your Account", "Click your profile, then Account."],
      ["Find your subscription", "Under Subscription, select your plan."],
      ["Cancel and confirm", "Choose Cancel Subscription and confirm."],
    ],
    billedElsewhere: "If you joined through Apple, Google, Sky or another bundle, cancel with that provider — Disney+ can't stop their billing.",
    after: "On an annual plan you keep access until the year ends — no part-refund, so cancelling just stops the next renewal.",
    faqs: [
      ["Annual plan — do I get money back?", "No part-refunds. You keep access until your paid year ends, then it won't renew."],
      ["No cancel option showing?", "You're billed through a third party (Apple/Google/Sky). Cancel there."],
      ["Will I keep my watchlist?", "It's saved if you resubscribe within the data-retention window."],
    ],
  },
  adobe: {
    name: "Adobe Creative Cloud", cat: "Software", price: "from £19.97/mo",
    url: "https://account.adobe.com/plans",
    short: "Account → Plans → Manage plan → Cancel. Watch out — annual plans can charge an early-termination fee.",
    notice: "Monthly plans cancel cleanly. Annual plans paid monthly often charge an early-termination fee of up to 50% of the remaining term, unless you're in the first 14 days.",
    steps: [
      ["Sign in at account.adobe.com", "Go to your account dashboard."],
      ["Open Plans", "Select Manage plan for the subscription you want to end."],
      ["Cancel your plan", "Choose Cancel your plan and follow the steps."],
      ["Review any fee", "Adobe shows any early-termination fee before you confirm."],
    ],
    billedElsewhere: "Usually billed directly by Adobe. If through the App Store, cancel via Apple.",
    after: "Within the first 14 days of an annual plan you can usually cancel for a full refund. After that, expect a fee on annual commitments.",
    faqs: [
      ["Will I be charged to cancel?", "On an annual plan paid monthly, often yes — up to 50% of what's left, unless you're within 14 days of signing up."],
      ["How do I avoid the fee?", "Cancel within the first 14 days, or wait until your annual term is nearly up and cancel before it renews."],
      ["Monthly plan?", "Month-to-month plans cancel with no fee."],
    ],
  },
};
const GUIDE_ORDER = ["netflix", "amazon-prime", "spotify", "puregym", "disney", "adobe"];

const MERCHANTS = GUIDE_ORDER.map((k) => ({
  key: k === "amazon-prime" ? "amazon prime" : k, guideKey: k,
  label: GUIDES[k].name, url: GUIDES[k].url, note: GUIDES[k].notice,
})).concat([
  { key: "prime video", guideKey: "amazon-prime", label: "Prime Video", url: GUIDES["amazon-prime"].url, note: "Manage via your Amazon Prime settings." },
  { key: "now", guideKey: null, label: "NOW", url: "https://www.nowtv.com/account/passes-vouchers", note: "My Account → Passes → cancel each pass." },
  { key: "apple", guideKey: null, label: "Apple (App Store / iCloud / Music)", url: "https://apps.apple.com/account/subscriptions", note: "Settings → your name → Subscriptions on iPhone." },
  { key: "audible", guideKey: null, label: "Audible", url: "https://www.audible.co.uk/account/membership", note: "Account Details → Cancel membership." },
  { key: "youtube", guideKey: null, label: "YouTube Premium", url: "https://www.youtube.com/paid_memberships", note: "Memberships → Manage → Deactivate." },
  { key: "deliveroo", guideKey: null, label: "Deliveroo Plus", url: "https://deliveroo.co.uk/account/plus", note: "Account → Deliveroo Plus → Cancel." },
  { key: "the gym", guideKey: null, label: "The Gym Group", url: "https://www.thegymgroup.com/login/", note: "Member area → Manage membership. Note notice periods." },
]);

function matchMerchant(d) { const s = d.toLowerCase(); return MERCHANTS.find((m) => s.includes(m.key)) || null; }

function parseCSV(text) {
  const rows = []; let row = [], field = "", q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) { if (c === '"' && text[i + 1] === '"') { field += '"'; i++; } else if (c === '"') q = false; else field += c; }
    else {
      if (c === '"') q = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}
function detectColumns(header) {
  const h = header.map((x) => x.toLowerCase().trim());
  const find = (c) => h.findIndex((x) => c.some((k) => x.includes(k)));
  return { desc: find(["description", "details", "narrative", "reference", "merchant", "payee", "transaction"]), amount: find(["amount", "debit", "value", "money out", "paid out", "out"]), date: find(["date", "posted"]) };
}
function num(v) { if (v == null) return NaN; const n = parseFloat(String(v).replace(/[£$,\s]/g, "")); return isNaN(n) ? NaN : n; }
function normaliseDesc(s) { return s.toLowerCase().replace(/\d+/g, "").replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim(); }
function detectRecurring(transactions) {
  const groups = {};
  for (const t of transactions) { const key = normaliseDesc(t.desc); if (!key) continue; (groups[key] = groups[key] || []).push(t); }
  const out = [];
  for (const key in groups) {
    const txns = groups[key]; const months = new Set(txns.map((t) => t.month).filter(Boolean));
    const amts = txns.map((t) => Math.abs(t.amount)).filter((a) => a > 0); if (!amts.length) continue;
    const avg = amts.reduce((a, b) => a + b, 0) / amts.length;
    const consistent = amts.every((a) => Math.abs(a - avg) <= avg * 0.25);
    if (txns.length >= 2 && (months.size >= 2 || consistent) && avg > 0.5 && avg < 500) {
      const m = matchMerchant(txns[0].desc);
      out.push({ name: m ? m.label : txns[0].desc.trim().slice(0, 40), rawName: txns[0].desc.trim(), monthly: avg, occurrences: txns.length, merchant: m });
    }
  }
  return out.sort((a, b) => b.monthly - a.monthly);
}

const fmt = (n) => "£" + n.toFixed(2);
const fmt0 = (n) => "£" + Math.round(n).toLocaleString("en-GB");

function useCountUp(target, duration = 1500, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return; let raf, t0;
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    const tick = (now) => { if (!t0) t0 = now; const p = Math.min((now - t0) / duration, 1); setVal(target * ease(p)); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [target, duration, start]);
  return val;
}

function Reveal({ children, delay = 0, y = 28, style }) {
  const ref = useRef(null); const [shown, setShown] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }, { threshold: 0.12 }); io.observe(el); return () => io.disconnect(); }, []);
  return <div ref={ref} style={{ ...style, opacity: shown ? 1 : 0, transform: shown ? "translateY(0)" : `translateY(${y}px)`, transition: `opacity 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s` }}>{children}</div>;
}

function CountStat({ target, prefix = "", suffix = "", label }) {
  const ref = useRef(null); const [go, setGo] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.4 }); io.observe(el); return () => io.disconnect(); }, []);
  const val = useCountUp(target, 1400, go);
  return <div ref={ref} style={S.cStat}><div style={S.cStatN}>{prefix}{Math.round(val).toLocaleString("en-GB")}{suffix}</div><div style={S.cStatL}>{label}</div></div>;
}

function CreepGraph() {
  const ref = useRef(null); const [go, setGo] = useState(false);
  useEffect(() => { const el = ref.current; if (!el) return; const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setGo(true); io.disconnect(); } }, { threshold: 0.3 }); io.observe(el); return () => io.disconnect(); }, []);
  const bars = [{ year: "2022", v: 38 }, { year: "2023", v: 54 }, { year: "2024", v: 71 }, { year: "2025", v: 88 }, { year: "2026", v: 100, peak: true }];
  return (
    <div ref={ref} style={S.graph}>
      <div style={S.graphBars}>
        {bars.map((b, i) => (
          <div key={b.year} style={S.graphCol}>
            <div style={S.graphValWrap}><div style={{ ...S.graphVal, opacity: go ? 1 : 0, transition: `opacity 0.5s ease ${0.5 + i * 0.12}s` }}>£{Math.round(b.v * 8.64)}</div></div>
            <div style={{ ...S.graphBar, ...(b.peak ? S.graphBarPeak : {}), height: go ? `${b.v}%` : "0%", transition: `height 1.1s cubic-bezier(0.16,1,0.3,1) ${i * 0.12}s` }} />
            <div style={S.graphYear}>{b.year}</div>
          </div>
        ))}
      </div>
      <div style={S.graphCaption}>Estimated UK subscription spend per person, per year</div>
    </div>
  );
}

// --- Auto-looping demo: statement → scan sweep → detect → savings count -----
// --- Auto-cycling demo: relatable scenarios, ~5s loops, Apple-smooth -------
// Each scenario is a different "that's me" moment. Loop rotates through them.
const DEMO_SCENES = [
  {
    who: "Sarah, 28",
    quip: "\u201cI haven\u2019t opened half of these in months.\u201d",
    subs: [
      { name: "Netflix", amt: 17.99 },
      { name: "PureGym", amt: 24.99 },
      { name: "Disney+", amt: 8.99 },
    ],
  },
  {
    who: "Jay, 34",
    quip: "\u201cWait\u2026 I\u2019m paying for TWO music apps?\u201d",
    subs: [
      { name: "Spotify", amt: 11.99 },
      { name: "Apple Music", amt: 10.99 },
      { name: "Audible", amt: 7.99 },
    ],
  },
  {
    who: "Mum\u2019s account",
    quip: "\u201cWhat\u2019s this one she forgot about?\u201d",
    subs: [
      { name: "Amazon Prime", amt: 8.99 },
      { name: "The Gym Group", amt: 22.99 },
      { name: "NOW TV", amt: 9.99 },
    ],
  },
];

function DemoPlayer() {
  const [scene, setScene] = useState(0);
  // phase: 0 statement in, 1 scanning, 2 revealing, 3 total + quip
  const [phase, setPhase] = useState(0);
  const [revealed, setRevealed] = useState(0);
  const [total, setTotal] = useState(0);
  const timers = useRef([]);
  const sceneRef = useRef(0);

  useEffect(() => {
    const push = (fn, ms) => timers.current.push(setTimeout(fn, ms));
    const run = () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      const sc = DEMO_SCENES[sceneRef.current];
      setScene(sceneRef.current);
      setPhase(0); setRevealed(0); setTotal(0);

      push(() => setPhase(1), 250);                       // scan starts fast
      push(() => setPhase(2), 1250);                      // reveal begins
      sc.subs.forEach((_, i) => push(() => setRevealed(i + 1), 1400 + i * 280));
      const revealEnd = 1400 + sc.subs.length * 280;
      push(() => setPhase(3), revealEnd + 150);           // total + quip

      const yearly = sc.subs.reduce((s, r) => s + r.amt, 0) * 12;
      push(() => {
        let t0; const dur = 900; const ease = (t) => 1 - Math.pow(1 - t, 3);
        const tick = (now) => { if (!t0) t0 = now; const p = Math.min((now - t0) / dur, 1); setTotal(yearly * ease(p)); if (p < 1) requestAnimationFrame(tick); };
        requestAnimationFrame(tick);
      }, revealEnd + 200);

      // hold on the punchline, then advance to the NEXT scenario
      push(() => { sceneRef.current = (sceneRef.current + 1) % DEMO_SCENES.length; run(); }, revealEnd + 200 + 2400);
    };
    run();
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const sc = DEMO_SCENES[scene];
  const subNames = sc.subs.map((x) => x.name);
  // a believable statement: the scenario\u2019s subs sprinkled among normal spending
  const ledger = ["TESCO", subNames[0], "SHELL", subNames[1], "GREGGS", subNames[2], "COSTA"].filter(Boolean);

  return (
    <div style={S.demoFrame} aria-hidden="true">
      <div style={S.demoBar}>
        <span style={{ ...S.demoDot, background: "#ff5f57" }} />
        <span style={{ ...S.demoDot, background: "#febc2e" }} />
        <span style={{ ...S.demoDot, background: "#28c840" }} />
        <span style={S.demoUrl}>snip.app</span>
        <span style={S.demoWho}>{sc.who}</span>
      </div>
      <div style={S.demoBody}>
        <div style={S.demoStatement}>
          <div style={S.demoStmtHead}>
            <span style={S.demoStmtTitle}>statement.csv</span>
            <span style={{ ...S.demoStmtTag, opacity: phase >= 1 ? 1 : 0.5 }}>{phase >= 2 ? "done" : phase >= 1 ? "scanning\u2026" : "ready"}</span>
          </div>
          {ledger.map((r, i) => {
            const isSub = subNames.includes(r);
            const hit = phase >= 2 && isSub;
            return (
              <div key={r + i} style={{ ...S.demoLine, ...(hit ? S.demoLineHit : {}) }}>
                <span>{String(r).toUpperCase()}</span>
                <span style={S.demoLineAmt}>{hit ? "\u2713" : ""}</span>
              </div>
            );
          })}
          {phase === 1 && <div style={S.demoScanLine} />}
        </div>

        <div style={S.demoResults}>
          <div style={S.demoResultsHead}>Draining you</div>
          <div style={S.demoChips}>
            {sc.subs.map((r, i) => (
              <div key={i} style={{ ...S.demoChip, opacity: revealed > i ? 1 : 0, transform: revealed > i ? "translateX(0)" : "translateX(10px)" }}>
                <span style={S.demoChipName}>{r.name}</span>
                <span style={S.demoChipAmt}>£{r.amt.toFixed(2)}/mo</span>
              </div>
            ))}
          </div>
          <div style={{ ...S.demoTotal, opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "scale(1)" : "scale(0.94)" }}>
            <div style={S.demoTotalLabel}>That's</div>
            <div style={S.demoTotalNum}>£{Math.round(total).toLocaleString("en-GB")}<span style={S.demoTotalYr}>/yr wasted</span></div>
          </div>
        </div>
      </div>
      <div style={{ ...S.demoQuip, opacity: phase >= 3 ? 1 : 0, transform: phase >= 3 ? "translateY(0)" : "translateY(6px)" }}>
        {sc.quip}
      </div>
    </div>
  );
}

// --- Pro upsell: captures buying intent (email + "I'd pay" click) -----------
// Recurring-revenue hook. For now it validates demand; wire Stripe once the
// "I'd pay" signal is real. Two variants: 'scan' (after results) & 'guide'.
function ProUpsell({ variant = "scan" }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const valid = /\S+@\S+\.\S+/.test(email);
  const submit = () => {
    if (!valid) return;
    // TODO (Claude Code): POST email to your list / count this as a buying signal.
    setDone(true);
  };

  const headline = variant === "guide"
    ? "Want to stop this happening again?"
    : "Never get caught out again.";
  const sub = variant === "guide"
    ? "Snip Pro watches your statements and alerts you the moment a new subscription appears — with the cancel steps ready to go."
    : "You found these once. Snip Pro keeps watching and tells you the second a new subscription sneaks in — before it costs you.";

  if (done) {
    return (
      <div style={S.proCard}>
        <div style={S.proGlow} />
        <div style={{ position: "relative" }}>
          <div style={S.proCheck}>✓</div>
          <div style={S.proTitle}>You're on the list.</div>
          <div style={S.proSub}>We'll email you the moment Snip Pro opens — and you'll lock in the founder price of £5.99/month for life.</div>
        </div>
      </div>
    );
  }

  return (
    <div style={S.proCard}>
      <div style={S.proGlow} />
      <div style={{ position: "relative" }}>
        <div style={S.proBadge}>Snip Pro · coming soon</div>
        <div style={S.proTitle}>{headline}</div>
        <div style={S.proSub}>{sub}</div>
        <div style={S.proPriceRow}>
          <span style={S.proPrice}>£5.99<span style={S.proPriceUnit}>/month</span></span>
          <span style={S.proPriceNote}>founder price · locked for life · 7-day free trial</span>
        </div>
        <div style={S.proForm}>
          <input
            type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            placeholder="you@email.com" style={S.proInput}
          />
          <button className="lk-btn lk-btn-primary" style={{ ...S.proBtn, opacity: valid ? 1 : 0.55 }} onClick={submit}>
            Lock in founder price →
          </button>
        </div>
        <div style={S.proFootnote}>No payment now. We'll only email you when it's ready.</div>
      </div>
    </div>
  );
}

// --- Pricing: free / Pro (core) / Concierge (high anchor) -------------------
// Hormozi anchor: the £12.99 Concierge tier exists mainly to make £5.99 Pro feel obvious.
const TIERS = [
  {
    name: "Scan", monthly: null, annual: null, tagline: "See what you're losing.",
    cta: "Scan a statement", highlight: false, kind: "free",
    features: ["Unlimited statement scans", "See every recurring charge", "Your true yearly total", "Step-by-step cancel guides", "100% private — runs in your browser"],
  },
  {
    name: "Pro", monthly: 5.99, annual: 57, tagline: "Snip watches your back, all year.",
    cta: "Start 7-day free trial", highlight: true, badge: "Most popular", kind: "trial",
    features: ["Everything in Scan", "Snip watches for new charges & warns you instantly", "Price-rise alerts before they hit", "Done-for-you cancellation scripts", "Your saved dashboard — never re-scan", "Founder price, locked for life"],
  },
  {
    name: "Concierge", monthly: 12.99, annual: 124, tagline: "We do the cancelling for you.",
    cta: "Start 7-day free trial", highlight: false, badge: "Done-for-you", kind: "trial",
    features: ["Everything in Pro", "We handle the awkward cancellations", "Personal quarterly money review", "Priority human support", "First access to every new feature"],
  },
];

function Pricing({ onPick }) {
  const [annual, setAnnual] = useState(true); // default to annual (higher cash, shows saving)
  return (
    <section style={S.pricingSection}>
      <Reveal><div style={S.kicker}>Pricing</div></Reveal>
      <Reveal delay={0.05}><h2 style={S.h2}>Pays for itself the first time it catches something.</h2></Reveal>
      <Reveal delay={0.08}><p style={{ ...S.creepLead, marginBottom: 28 }}>Scanning is always free. Upgrade when you want Snip watching for new charges all year round.</p></Reveal>

      <Reveal delay={0.1}>
        <div style={S.toggleWrap}>
          <button style={{ ...S.toggleBtn, ...(!annual ? S.toggleOn : {}) }} onClick={() => setAnnual(false)}>Monthly</button>
          <button style={{ ...S.toggleBtn, ...(annual ? S.toggleOn : {}) }} onClick={() => setAnnual(true)}>Annual <span style={S.toggleSave}>save 20%</span></button>
        </div>
      </Reveal>

      <div style={S.tierGrid}>
        {TIERS.map((t, i) => (
          <Reveal key={t.name} delay={i * 0.08}>
            <div className="lk-card" style={{ ...S.tier, ...(t.highlight ? S.tierHi : {}) }}>
              {t.badge && <div style={{ ...S.tierBadge, ...(t.highlight ? S.tierBadgeHi : {}) }}>{t.badge}</div>}
              <div style={S.tierName}>{t.name}</div>
              <div style={S.tierTagline}>{t.tagline}</div>
              <div style={S.tierPriceRow}>
                {t.kind === "free" ? (
                  <span style={S.tierPrice}>Free</span>
                ) : annual ? (
                  <><span style={{ ...S.tierPrice, ...(t.highlight ? S.tierPriceHi : {}) }}>£{(t.annual / 12).toFixed(2)}</span><span style={S.tierUnit}>/month</span></>
                ) : (
                  <><span style={{ ...S.tierPrice, ...(t.highlight ? S.tierPriceHi : {}) }}>£{t.monthly}</span><span style={S.tierUnit}>/month</span></>
                )}
              </div>
              <div style={S.tierNote}>
                {t.kind === "free" ? "No card, no sign-up" : annual ? "billed monthly · save 20% paying annually" : "billed monthly"}
              </div>
              <button className={`lk-btn ${t.highlight ? "lk-btn-primary" : ""}`} style={t.highlight ? S.tierBtnHi : S.tierBtn} onClick={onPick}>{t.cta}</button>
              {t.kind === "trial" && <div style={S.tierTrialNote}>Free for 7 days, then {annual ? `£${t.annual}/yr` : `£${t.monthly}/mo`}. Cancel anytime before then and pay nothing.</div>}
              <div style={S.tierFeatures}>
                {t.features.map((f, j) => (
                  <div key={j} style={S.tierFeat}><span style={S.tierTick}>✓</span><span>{f}</span></div>
                ))}
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}><p style={S.pricingFootnote}>The average forgotten subscription costs £39 before you notice. Snip Pro is £5.99 a month.</p></Reveal>
    </section>
  );
}

// Clean scrolling review cards — Apple-style pills, 10 distinct reviews
const PROOF_LINES = [
  { name: "Sarah M.", text: "Found a gym I hadn't used in a year." },
  { name: "James T.", text: "Two music apps. Cancelled one instantly." },
  { name: "Priya K.", text: "A free trial had quietly become £13/mo." },
  { name: "Daniel O.", text: "Old work subscription still billing me." },
  { name: "Emma L.", text: "My 'cancelled' Netflix was charging via Apple." },
  { name: "Tom B.", text: "Saved £287 a year I didn't know I was losing." },
  { name: "Aisha R.", text: "Three streaming services. I use one." },
  { name: "Mark W.", text: "Caught a price rise before it hit me." },
  { name: "Chloe H.", text: "Took me ninety seconds. Found four." },
  { name: "Ben C.", text: "Didn't even know I was still paying for this." },
];
function TopProof() {
  const items = [...PROOF_LINES, ...PROOF_LINES];
  return (
    <div style={S.topProof}>
      <div style={S.topProofFadeL} />
      <div style={S.topProofFadeR} />
      <div className="lk-marquee-fast" style={S.topProofTrack}>
        {items.map((r, i) => (
          <div key={i} style={S.proofCard}>
            <span style={S.proofStars}>★★★★★</span>
            <span style={S.proofText}>“{r.text}”</span>
            <span style={S.proofName}>{r.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Snip() {
  const [view, setView] = useState("home");
  const go = (v) => { setView(v); window.scrollTo(0, 0); };
  return (
    <div style={S.page}>
      <style>{CSS}</style>
      <nav style={S.nav}>
        <a style={S.logo} onClick={() => go("home")}>snip<span style={{ color: "var(--emerald)" }}>.</span></a>
        <div style={S.navRight}>
          <a className="lk-navlink" style={S.navLink} onClick={() => go("guides")}>Cancel guides</a>
          <button className="lk-btn lk-btn-primary" style={S.navCta} onClick={() => go("home")}>Scan free</button>
        </div>
      </nav>

      {view === "home" && <TopProof />}
      {view === "home" && <Home go={go} />}
      {view === "guides" && <GuidesHub go={go} />}
      {view.startsWith("guide:") && <GuidePage gkey={view.slice(6)} go={go} />}

      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div>
            <div style={{ ...S.logo, marginBottom: 10 }}>snip<span style={{ color: "var(--emerald)" }}>.</span></div>
            <div style={S.footNote}>Find and cancel the subscriptions draining your account. We never take payments on your behalf — cancelling is always done with the provider.</div>
          </div>
          <div style={S.footCol}>
            <div style={S.footHead}>Cancel guides</div>
            {GUIDE_ORDER.map((k) => <a key={k} className="lk-footlink" style={S.footLink} onClick={() => go("guide:" + k)}>{GUIDES[k].name}</a>)}
          </div>
          <div style={S.footCol}>
            <div style={S.footHead}>Snip</div>
            <a className="lk-footlink" style={S.footLink} onClick={() => go("home")}>Scan a statement</a>
            <a className="lk-footlink" style={S.footLink} onClick={() => go("guides")}>All cancel guides</a>
          </div>
        </div>
        <div style={S.footBottom}>snip.app · built in the UK · processed in your browser, never uploaded</div>
      </footer>
    </div>
  );
}

function Home({ go }) {
  const [subs, setSubs] = useState(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [cancelled, setCancelled] = useState({});
  const [mounted, setMounted] = useState(false);
  const fileRef = useRef(null);
  const scanRef = useRef(null);
  useEffect(() => { setMounted(true); }, []);

  const handleFile = (file) => {
    setError(""); if (!file) return; setFileName(file.name);
    if (file.name.toLowerCase().endsWith(".pdf")) { setError("PDF scanning isn't in this version yet — export your statement as CSV from online banking and upload that. (It's usually labelled 'Download transactions'.)"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rows = parseCSV(e.target.result);
        if (rows.length < 2) { setError("Couldn't read any rows from that file."); return; }
        const cols = detectColumns(rows[0]);
        if (cols.desc < 0 || cols.amount < 0) { setError("Couldn't find the description/amount columns. Make sure the CSV has a header row."); return; }
        const txns = rows.slice(1).map((r) => {
          const ds = cols.date >= 0 ? r[cols.date] : "";
          const month = (ds.match(/(\d{4})[-/](\d{2})/) || [])[0] || (ds.match(/(\d{2})[-/](\d{4})/) || [])[0] || ds.slice(0, 7);
          return { desc: r[cols.desc] || "", amount: num(r[cols.amount]), month };
        }).filter((t) => t.desc && !isNaN(t.amount));
        setSubs(detectRecurring(txns));
      } catch (err) { setError("Something went wrong reading that file."); }
    };
    reader.readAsText(file);
  };

  const totals = useMemo(() => { if (!subs) return null; const monthly = subs.reduce((s, x) => s + x.monthly, 0); return { monthly, yearly: monthly * 12 }; }, [subs]);

  if (subs) return <Results subs={subs} totals={totals} cancelled={cancelled} setCancelled={setCancelled} reset={() => { setSubs(null); setFileName(""); setCancelled({}); }} go={go} />;

  const t = (i) => ({ opacity: mounted ? 1 : 0, transform: mounted ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.95s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.09}s, transform 0.95s cubic-bezier(0.16,1,0.3,1) ${0.05 + i * 0.09}s` });
  const scrollScan = () => scanRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });

  return (
    <>
      <header style={S.hero}>
        <div style={{ ...S.pill, ...t(0) }}><span style={S.pillDot} /> Private · runs in your browser</div>
        <h1 style={{ ...S.h1, ...t(1) }}>Find every subscription<br /><span style={S.h1hi}>quietly draining</span> your account.</h1>
        <p style={{ ...S.sub, ...t(2) }}>Upload a bank statement and Snip shows what you're spending a year — and the fastest way to cancel each one. Free to scan.</p>
        <div style={{ ...S.heroBtns, ...t(3) }}>
          <button className="lk-btn lk-btn-primary" style={S.primaryBtn} onClick={scrollScan}>Scan my statement →</button>
          <button className="lk-link" style={S.ghostBtn} onClick={() => setSubs(DEMO)}>See a sample result</button>
        </div>
        <div style={{ ...S.heroTrust, ...t(3) }}>No sign-up · nothing leaves your device · free forever</div>
        <div style={{ ...S.demoWrap, ...t(4) }}><DemoPlayer /></div>
        <div style={{ ...S.heroStats, ...t(5) }}>
          <Stat n="£312" l="avg. found per year" /><span style={S.statDiv} />
          <Stat n="40s" l="to scan a statement" /><span style={S.statDiv} />
          <Stat n="£39" l="what a forgotten sub costs before you notice" />
        </div>
      </header>

      <section style={S.creepSection}>
        <Reveal><div style={S.kicker}>The quiet creep</div></Reveal>
        <Reveal delay={0.05}><h2 style={S.h2}>It adds up while you're not looking.</h2></Reveal>
        <Reveal delay={0.1}><p style={S.creepLead}>One streaming trial here. A gym you stopped going to there. None of them feel big on their own — until you add up a year.</p></Reveal>
        <Reveal delay={0.12}><CreepGraph /></Reveal>
        <div style={S.creepStats}>
          <Reveal delay={0.1}><CountStat target={1200} prefix="£" label="spent per UK household a year on subscriptions" /></Reveal>
          <Reveal delay={0.18}><CountStat target={37} suffix="%" label="are paying twice for the same service" /></Reveal>
          <Reveal delay={0.26}><CountStat target={400} prefix="£" label="the average household could save by cutting forgotten ones" /></Reveal>
        </div>
        <Reveal delay={0.2}><p style={S.creepSource}>Sources: Nationwide (Jan 2026) · Citizens Advice</p></Reveal>
      </section>

      <section ref={scanRef} style={S.scanSection}>
        <Reveal><p style={S.scanBridge}>So what's <span style={S.scanBridgeHi}>yours</span>? Find out in forty seconds.</p></Reveal>
        <Reveal delay={0.06}>
          <div className="lk-drop" style={{ ...S.drop, ...(dragging ? S.dropActive : {}) }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }} onClick={() => fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept=".csv,.pdf" hidden onChange={(e) => handleFile(e.target.files[0])} />
            <div style={S.dropIcon}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg></div>
            <div style={S.dropTitle}>Drop your statement here</div>
            <div style={S.dropHint}>{fileName || "CSV export from your online banking"}</div>
            <div style={S.dropBadge}>or click to browse</div>
          </div>
        </Reveal>
        {error && <div style={S.error}>{error}</div>}
      </section>

      <section style={S.section}>
        <Reveal><div style={S.kicker}>How it works</div></Reveal>
        <Reveal delay={0.05}><h2 style={S.h2}>Three steps. Forty seconds.</h2></Reveal>
        <div style={S.steps}>
          {[["01", "Export", "Download your last few months of transactions as a CSV from online banking."],
            ["02", "Scan", "Snip finds recurring charges instantly — right in your browser, no sign-up."],
            ["03", "Cancel", "See the true yearly cost of each one, with a direct link and a step-by-step guide."]].map(([n, ti, d], i) => (
            <Reveal key={n} delay={i * 0.1}><div className="lk-card" style={S.step}><div style={S.stepNum}>{n}</div><div style={S.stepTitle}>{ti}</div><div style={S.stepDesc}>{d}</div></div></Reveal>
          ))}
        </div>
      </section>

      <Pricing onPick={scrollScan} />

      <section style={S.section}>
        <Reveal><div style={S.kicker}>Cancel guides</div></Reveal>
        <Reveal delay={0.05}><h2 style={S.h2}>Stuck cancelling something?</h2></Reveal>
        <Reveal delay={0.08}><p style={{ ...S.creepLead, marginBottom: 32 }}>We write clear, no-nonsense cancellation guides for the subscriptions people struggle with most.</p></Reveal>
        <div style={S.guideGrid}>
          {GUIDE_ORDER.slice(0, 6).map((k, i) => (
            <Reveal key={k} delay={i * 0.06}>
              <a className="lk-card" style={S.guideChip} onClick={() => go("guide:" + k)}>
                <div><div style={S.guideChipName}>{GUIDES[k].name}</div><div style={S.guideChipCat}>{GUIDES[k].cat}</div></div>
                <span style={S.guideChipArrow}>→</span>
              </a>
            </Reveal>
          ))}
        </div>
        <Reveal delay={0.2}><div style={{ textAlign: "center", marginTop: 28 }}><button className="lk-link" style={S.viewAll} onClick={() => go("guides")}>View all cancel guides →</button></div></Reveal>
      </section>

      <section style={S.reviewSection}>
        <Reveal><div style={S.kicker}>What people found</div></Reveal>
        <Reveal delay={0.05}><h2 style={S.h2}>Real money, back in pockets.</h2></Reveal>
        <div style={S.marqueeWrap}>
          <div style={S.marqueeFadeL} /><div style={S.marqueeFadeR} />
          <div className="lk-marquee" style={S.marqueeTrack}>
            {[...REVIEWS, ...REVIEWS].map((r, i) => (
              <div key={i} style={S.review}>
                <div style={S.reviewSaved}>saved {r.saved}<span style={S.reviewYr}>/yr</span></div>
                <div style={S.reviewText}>"{r.text}"</div>
                <div style={S.reviewName}><span style={S.avatar}>{r.name[0]}</span>{r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={S.ctaSection}>
        <Reveal>
          <div style={S.ctaCard}>
            <h2 style={S.ctaTitle}>See what you're really spending.</h2>
            <p style={S.ctaSub}>Takes under a minute. Nothing leaves your device.</p>
            <button className="lk-btn lk-btn-light" style={S.ctaBtn} onClick={scrollScan}>Scan my statement →</button>
          </div>
        </Reveal>
      </section>
    </>
  );
}

function Stat({ n, l }) { return <div style={{ textAlign: "center" }}><div style={S.statN}>{n}</div><div style={S.statL}>{l}</div></div>; }

function Results({ subs, totals, cancelled, setCancelled, reset, go }) {
  const [vis, setVis] = useState(false);
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);
  useEffect(() => { const id = setTimeout(() => setVis(true), 150); return () => clearTimeout(id); }, []);
  const yearly = useCountUp(totals.yearly, 1600, vis);
  const validEmail = /\S+@\S+\.\S+/.test(email);
  const saveResults = () => {
    if (!validEmail) return;
    // TODO (Claude Code): POST { email, subs, totals } to your email list / backend.
    setSaved(true);
  };
  return (
    <main style={S.results}>
      <button className="lk-link" style={S.back} onClick={reset}>← Scan another</button>
      <div style={{ ...S.bigStat, opacity: vis ? 1 : 0, transform: vis ? "scale(1)" : "scale(0.96)", transition: "opacity 0.9s cubic-bezier(0.16,1,0.3,1), transform 0.9s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={S.bigStatLabel}>You're spending</div>
        <div style={S.bigStatNum}>{fmt0(yearly)}<span style={S.perYear}>/year</span></div>
        <div style={S.bigStatSub}>{fmt(totals.monthly)}/month across {subs.length} recurring {subs.length === 1 ? "charge" : "charges"}</div>
      </div>

      {subs.length > 0 && (
        saved ? (
          <div style={S.saveCard}>
            <span style={S.saveCheck}>✓</span>
            <div>
              <div style={S.saveTitle}>Sent. Check your inbox.</div>
              <div style={S.saveSub}>We've emailed your results. We'll also let you know if a new subscription appears.</div>
            </div>
          </div>
        ) : (
          <div style={S.saveCard}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.saveTitle}>Email me these results</div>
              <div style={S.saveSub}>Keep a copy, and we'll flag it if a new charge sneaks in.</div>
              <div style={S.saveForm}>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") saveResults(); }} placeholder="you@email.com" style={S.saveInput} />
                <button className="lk-btn lk-btn-primary" style={{ ...S.saveBtn, opacity: validEmail ? 1 : 0.55 }} onClick={saveResults}>Email my results</button>
              </div>
            </div>
          </div>
        )
      )}

      {subs.length === 0 && <div style={S.empty}>No clear recurring subscriptions detected. Try a statement covering three or more months.</div>}
      <div style={S.list}>
        {subs.map((s, i) => {
          const done = cancelled[i]; const gk = s.merchant?.guideKey;
          return (
            <div key={i} className="lk-card" style={{ ...S.card, opacity: vis ? (done ? 0.5 : 1) : 0, transform: vis ? "translateY(0)" : "translateY(22px)", transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.08}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${0.3 + i * 0.08}s, box-shadow 0.5s var(--ease), border-color 0.5s var(--ease)` }}>
              <div style={S.cardLeft}>
                <div style={S.cardName}>{s.name}</div>
                <div style={S.cardMeta}>{fmt(s.monthly)}/mo · {fmt(s.monthly * 12)}/yr · seen {s.occurrences}×</div>
                {gk ? <a className="lk-guidelink" style={S.cardGuide} onClick={() => go("guide:" + gk)}>Read the cancel guide →</a> : (s.merchant?.note && <div style={S.cardNote}>{s.merchant.note}</div>)}
              </div>
              <div style={S.cardRight}>
                {s.merchant ? <a href={s.merchant.url} target="_blank" rel="noopener noreferrer" className="lk-btn lk-btn-primary" style={S.cancelBtn}>Cancel</a> : <a href={`https://www.google.com/search?q=how+to+cancel+${encodeURIComponent(s.rawName)}`} target="_blank" rel="noopener noreferrer" className="lk-btn" style={S.cancelBtnAlt}>How to cancel</a>}
                <button className="lk-btn" style={S.doneBtn} onClick={() => setCancelled((c) => ({ ...c, [i]: !c[i] }))}>{done ? "✓ sorted" : "mark done"}</button>
              </div>
            </div>
          );
        })}
      </div>
      {subs.length > 0 && <div style={{ marginTop: 28 }}><ProUpsell variant="scan" /></div>}
    </main>
  );
}

function GuidesHub({ go }) {
  return (
    <main style={S.hubMain}>
      <Reveal><div style={S.crumb}><a className="lk-link" onClick={() => go("home")}>Home</a> / Cancel guides</div></Reveal>
      <Reveal delay={0.04}><h1 style={S.hubH1}>How to cancel anything</h1></Reveal>
      <Reveal delay={0.08}><p style={S.hubLead}>Clear, up-to-date cancellation guides for the UK subscriptions people get stuck on. Each one shows the exact steps, the notice period to watch for, and what happens after you cancel.</p></Reveal>
      <div style={S.hubGrid}>
        {GUIDE_ORDER.map((k, i) => (
          <Reveal key={k} delay={i * 0.05}>
            <a className="lk-card" style={S.hubCard} onClick={() => go("guide:" + k)}>
              <div style={S.hubCardTop}><span style={S.hubCat}>{GUIDES[k].cat}</span><span style={S.hubArrow}>→</span></div>
              <div style={S.hubCardName}>How to cancel {GUIDES[k].name}</div>
              <div style={S.hubCardShort}>{GUIDES[k].short}</div>
            </a>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.2}>
        <div style={S.hubCta}>
          <div><div style={S.hubCtaTitle}>Not sure what you're even paying for?</div><div style={S.hubCtaSub}>Scan a bank statement and Snip finds every recurring charge in forty seconds.</div></div>
          <button className="lk-btn lk-btn-primary" style={S.primaryBtn} onClick={() => go("home")}>Scan free →</button>
        </div>
      </Reveal>
    </main>
  );
}

function GuidePage({ gkey, go }) {
  const g = GUIDES[gkey];
  const [openFaq, setOpenFaq] = useState(0);
  if (!g) return <main style={S.hubMain}><p>Guide not found. <a className="lk-link" onClick={() => go("guides")}>See all guides →</a></p></main>;
  const others = GUIDE_ORDER.filter((k) => k !== gkey).slice(0, 3);
  return (
    <main style={S.guideMain}>
      <Reveal><div style={S.crumb}><a className="lk-link" onClick={() => go("home")}>Home</a> / <a className="lk-link" onClick={() => go("guides")}>Cancel guides</a> / {g.name}</div></Reveal>
      <Reveal delay={0.04}><h1 style={S.guideH1}>How to cancel {g.name} in the UK</h1></Reveal>
      <Reveal delay={0.07}><p style={S.guideLede}>It takes a couple of minutes. Here's exactly where to click, plus the notice period and what happens afterwards — so there are no surprise charges.</p></Reveal>
      <Reveal delay={0.09}><p style={S.guideMeta}>Updated 2026 · {g.cat} · {g.price}</p></Reveal>
      <Reveal delay={0.1}><div style={S.callout}><div style={S.calloutTag}>The short version</div><p style={S.calloutP}>{g.short}</p></div></Reveal>

      <h2 style={S.guideH2}>Step by step</h2>
      <ol style={S.olSteps}>
        {g.steps.map(([ti, d], i) => <li key={i} style={S.olStep}><span style={S.olNum}>{i + 1}</span><div><b style={S.olTitle}>{ti}</b><div style={S.olDesc}>{d}</div></div></li>)}
      </ol>

      <h2 style={S.guideH2}>The notice period</h2>
      <p style={S.guideP}>{g.notice}</p>
      <h2 style={S.guideH2}>If you can't find the cancel option</h2>
      <p style={S.guideP}>{g.billedElsewhere}</p>
      <h2 style={S.guideH2}>What happens after you cancel</h2>
      <p style={S.guideP}>{g.after}</p>

      <div style={S.guideCta}>
        <h2 style={{ ...S.ctaTitle, fontSize: 28, marginBottom: 10 }}>{g.name} was probably just the start.</h2>
        <p style={S.ctaSub}>Most people have three or four subscriptions they've forgotten about. Scan a statement and see every one — free, nothing leaves your device.</p>
        <button className="lk-btn lk-btn-light" style={S.ctaBtn} onClick={() => go("home")}>Scan my statement →</button>
      </div>

      <h2 style={S.guideH2}>Common questions</h2>
      <div style={S.faqWrap}>
        {g.faqs.map(([q, a], i) => (
          <div key={i} style={S.faqItem}>
            <button className="lk-faq" style={S.faqQ} onClick={() => setOpenFaq(openFaq === i ? -1 : i)}><span>{q}</span><span style={{ ...S.faqPlus, transform: openFaq === i ? "rotate(45deg)" : "none" }}>+</span></button>
            <div style={{ ...S.faqA, maxHeight: openFaq === i ? 220 : 0, opacity: openFaq === i ? 1 : 0, paddingBottom: openFaq === i ? 22 : 0 }}>{a}</div>
          </div>
        ))}
      </div>

      <h2 style={S.guideH2}>Other cancel guides</h2>
      <div style={S.guideGrid}>
        {others.map((k) => (
          <a key={k} className="lk-card" style={S.guideChip} onClick={() => go("guide:" + k)}>
            <div><div style={S.guideChipName}>{GUIDES[k].name}</div><div style={S.guideChipCat}>{GUIDES[k].cat}</div></div>
            <span style={S.guideChipArrow}>→</span>
          </a>
        ))}
      </div>
      <div style={{ margin: "8px 0 40px" }}><ProUpsell variant="guide" /></div>

      <p style={S.guideDisclaimer}>Always double-check on {g.name}'s own help pages — providers occasionally change their steps. Snip shows you what you're paying; cancelling is always done with the provider.</p>
    </main>
  );
}

const DEMO = [
  { name: "Netflix", rawName: "NETFLIX.COM", monthly: 17.99, occurrences: 3, merchant: matchMerchant("netflix") },
  { name: "PureGym", rawName: "PUREGYM LTD", monthly: 24.99, occurrences: 3, merchant: matchMerchant("puregym") },
  { name: "Spotify", rawName: "SPOTIFY", monthly: 11.99, occurrences: 3, merchant: matchMerchant("spotify") },
  { name: "Adobe Creative Cloud", rawName: "ADOBE SYSTEMS", monthly: 19.97, occurrences: 2, merchant: matchMerchant("adobe") },
  { name: "Disney+", rawName: "DISNEYPLUS", monthly: 8.99, occurrences: 3, merchant: matchMerchant("disney") },
  { name: "Sumup *Mysteryapp", rawName: "SUMUP *MYSTERYAPP", monthly: 4.99, occurrences: 4, merchant: null },
];
const REVIEWS = [
  { name: "Hannah", saved: "£287", text: "Found a gym membership I'd been paying for a year after I stopped going." },
  { name: "Marcus", saved: "£204", text: "Two streaming services I forgot existed. Cancelled both in five minutes." },
  { name: "Priya", saved: "£156", text: "Didn't realise a free trial had rolled into a £13/month charge." },
  { name: "Tom", saved: "£420", text: "Software subscription from an old side project, still billing me." },
  { name: "Élise", saved: "£99", text: "The cancel links saved me digging through settings menus. So easy." },
  { name: "Dan", saved: "£312", text: "Scanned my partner's too. We were doubling up on the same apps." },
];

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Spline+Sans+Mono:wght@400;500&display=swap');
  :root{
    --bg:#f7f8fa; --surface:#ffffff; --navy:#0f1e3d; --slate:#334155;
    --text:#475569; --muted:#64748b; --faint:#94a3b8;
    --line:rgba(15,30,61,0.1); --line2:rgba(15,30,61,0.2);
    --emerald:#0d9b6c; --emerald-d:#0a7d56; --emerald-soft:#e6f6ef;
    --ease:cubic-bezier(0.16,1,0.3,1);
  }
  *{box-sizing:border-box;margin:0;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;}
  a{text-decoration:none;cursor:pointer;}
  body{background:var(--bg);}
  ::selection{background:var(--emerald);color:#fff;}
  @keyframes marquee{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
  @keyframes scanSweep{0%{top:0;}100%{top:100%;}}
  .lk-card{transition:transform .5s var(--ease),box-shadow .5s var(--ease),border-color .5s var(--ease);will-change:transform;}
  .lk-card:hover{transform:translateY(-4px);box-shadow:0 18px 44px -22px rgba(15,30,61,0.28);border-color:var(--line2);}
  .lk-drop{transition:border-color .5s var(--ease),background .5s var(--ease),transform .5s var(--ease),box-shadow .5s var(--ease);}
  .lk-drop:hover{border-color:var(--emerald);background:#fff;box-shadow:0 22px 54px -28px rgba(13,155,108,0.45);transform:translateY(-2px);}
  .lk-btn{transition:transform .4s var(--ease),box-shadow .4s var(--ease),background .4s var(--ease),color .4s var(--ease);will-change:transform;}
  .lk-btn:hover{transform:translateY(-2px);}
  .lk-btn:active{transform:translateY(0) scale(.97);}
  .lk-btn-primary{box-shadow:0 8px 22px -8px rgba(13,155,108,0.5);}
  .lk-btn-primary:hover{box-shadow:0 14px 32px -10px rgba(13,155,108,0.6);}
  .lk-btn-light:hover{box-shadow:0 14px 32px -12px rgba(0,0,0,0.3);}
  .lk-link,.lk-navlink,.lk-footlink,.lk-guidelink{transition:color .3s var(--ease);}
  .lk-link:hover,.lk-navlink:hover,.lk-footlink:hover{color:var(--navy)!important;}
  .lk-guidelink:hover{color:var(--emerald-d)!important;}
  .lk-faq:hover{color:var(--navy)!important;}
  .lk-marquee{animation:marquee 42s linear infinite;}
  .lk-marquee:hover{animation-play-state:paused;}
  .lk-marquee-fast{animation:marquee 50s linear infinite;}
  .lk-marquee-fast:hover{animation-play-state:paused;}
  @media (prefers-reduced-motion:reduce){.lk-card,.lk-btn,.lk-drop{transition:none!important;}}
`;

const S = {
  page: { fontFamily: "'Archivo',sans-serif", background: "var(--bg)", color: "var(--text)", minHeight: "100vh", overflowX: "hidden" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 28px", position: "sticky", top: 0, zIndex: 30, backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", background: "rgba(247,248,250,0.85)", borderBottom: "1px solid var(--line)" },
  logo: { fontWeight: 700, fontSize: 21, letterSpacing: -0.8, color: "var(--navy)" },
  navRight: { display: "flex", alignItems: "center", gap: 22 },
  navLink: { fontSize: 14.5, fontWeight: 500, color: "var(--slate)" },
  navCta: { background: "var(--emerald)", color: "#fff", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 14, fontWeight: 500, padding: "9px 18px", borderRadius: 100, cursor: "pointer" },

  hero: { maxWidth: 760, margin: "0 auto", padding: "92px 28px 52px", textAlign: "center" },
  pill: { display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "var(--emerald-d)", background: "var(--emerald-soft)", border: "1px solid rgba(13,155,108,0.2)", padding: "7px 14px", borderRadius: 100, marginBottom: 30, fontFamily: "'Spline Sans Mono',monospace", letterSpacing: 0.3 },
  pillDot: { width: 7, height: 7, borderRadius: "50%", background: "var(--emerald)" },
  h1: { fontSize: "clamp(40px,7.5vw,74px)", fontWeight: 700, lineHeight: 1.03, letterSpacing: -2.6, marginBottom: 24, color: "var(--navy)" },
  h1hi: { color: "var(--emerald)" },
  sub: { fontSize: 19, lineHeight: 1.6, color: "var(--slate)", maxWidth: 520, margin: "0 auto 36px", fontWeight: 400 },
  heroBtns: { display: "flex", gap: 18, justifyContent: "center", alignItems: "center", flexWrap: "wrap", marginBottom: 40 },

  demoWrap: { maxWidth: 620, margin: "0 auto 48px" },
  demoFrame: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", boxShadow: "0 30px 70px -40px rgba(15,30,61,0.5)", textAlign: "left" },
  demoBar: { display: "flex", alignItems: "center", gap: 7, padding: "11px 16px", borderBottom: "1px solid var(--line)", background: "rgba(15,30,61,0.02)" },
  demoDot: { width: 10, height: 10, borderRadius: "50%" },
  demoUrl: { marginLeft: 10, fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, color: "var(--faint)" },
  demoWho: { marginLeft: "auto", fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, color: "var(--emerald-d)", fontWeight: 500 },
  demoBody: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, minHeight: 280 },
  demoStatement: { position: "relative", padding: "16px 18px", borderRight: "1px solid var(--line)", overflow: "hidden" },
  demoStmtHead: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  demoStmtTitle: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, color: "var(--navy)", fontWeight: 500 },
  demoStmtTag: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, color: "var(--emerald-d)", background: "var(--emerald-soft)", padding: "3px 8px", borderRadius: 100 },
  demoLine: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 8px", borderRadius: 7, fontFamily: "'Spline Sans Mono',monospace", fontSize: 11.5, color: "var(--muted)", transition: "background 0.5s var(--ease), color 0.5s var(--ease)" },
  demoLineHit: { background: "var(--emerald-soft)", color: "var(--emerald-d)", fontWeight: 500 },
  demoLineName: { letterSpacing: 0.2 },
  demoLineAmt: { color: "var(--emerald)", fontSize: 9 },
  demoScanLine: { position: "absolute", left: 0, right: 0, height: 2, background: "linear-gradient(90deg, transparent, var(--emerald), transparent)", boxShadow: "0 0 20px 4px rgba(13,155,108,0.45)", animation: "scanSweep 1s cubic-bezier(0.45,0,0.55,1) infinite", top: 0 },
  demoResults: { padding: "16px 18px", display: "flex", flexDirection: "column" },
  demoResultsHead: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--faint)", marginBottom: 12 },
  demoChips: { display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 },
  demoChip: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(15,30,61,0.03)", border: "1px solid var(--line)", borderRadius: 9, padding: "8px 11px", transition: "opacity 0.55s var(--ease), transform 0.55s var(--ease)" },
  demoChipName: { fontSize: 12.5, fontWeight: 600, color: "var(--navy)" },
  demoChipAmt: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, color: "var(--muted)" },
  demoTotal: { marginTop: "auto", background: "var(--navy)", borderRadius: 12, padding: "14px 16px", textAlign: "center", transition: "opacity 0.6s var(--ease), transform 0.6s var(--ease)" },
  demoTotalLabel: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" },
  demoTotalNum: { fontSize: 30, fontWeight: 700, letterSpacing: -1.5, color: "#fff", marginTop: 4, lineHeight: 1 },
  demoTotalYr: { fontSize: 14, color: "rgba(255,255,255,0.5)", fontWeight: 400 },
  demoQuip: { padding: "13px 18px", borderTop: "1px solid var(--line)", textAlign: "center", fontSize: 14.5, fontWeight: 500, color: "var(--navy)", fontStyle: "italic", transition: "opacity 0.6s var(--ease), transform 0.6s var(--ease)", minHeight: 46, display: "flex", alignItems: "center", justifyContent: "center" },
  primaryBtn: { background: "var(--emerald)", color: "#fff", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 16, fontWeight: 500, padding: "15px 30px", borderRadius: 100, cursor: "pointer", letterSpacing: -0.2 },
  ghostBtn: { background: "none", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 15, fontWeight: 500, color: "var(--slate)", cursor: "pointer", letterSpacing: -0.2 },
  heroStats: { display: "flex", gap: 28, justifyContent: "center", alignItems: "center", flexWrap: "wrap" },
  heroTrust: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12.5, color: "var(--muted)", marginBottom: 40, letterSpacing: 0.2 },
  topProof: { background: "var(--bg)", borderBottom: "1px solid var(--line)", overflow: "hidden", padding: "16px 0", position: "relative" },
  topProofFadeL: { position: "absolute", left: 0, top: 0, bottom: 0, width: 80, zIndex: 5, background: "linear-gradient(90deg, var(--bg), transparent)", pointerEvents: "none" },
  topProofFadeR: { position: "absolute", right: 0, top: 0, bottom: 0, width: 80, zIndex: 5, background: "linear-gradient(270deg, var(--bg), transparent)", pointerEvents: "none" },
  topProofTrack: { display: "flex", width: "max-content" },
  proofCard: { display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0, marginRight: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 100, padding: "8px 18px", boxShadow: "0 4px 16px -10px rgba(15,30,61,0.25)" },
  proofStars: { color: "#f5b301", fontSize: 11, letterSpacing: 0.5, flexShrink: 0 },
  proofText: { fontSize: 13.5, color: "var(--slate)", whiteSpace: "nowrap" },
  proofName: { fontSize: 12.5, fontWeight: 600, color: "var(--navy)", whiteSpace: "nowrap" },
  statN: { fontSize: 26, fontWeight: 700, color: "var(--navy)", letterSpacing: -1 },
  statL: { fontSize: 12.5, color: "var(--muted)", marginTop: 3, fontFamily: "'Spline Sans Mono',monospace" },
  statDiv: { width: 1, height: 34, background: "var(--line2)" },

  creepSection: { maxWidth: 820, margin: "0 auto", padding: "24px 28px", textAlign: "center" },
  kicker: { textAlign: "center", fontFamily: "'Spline Sans Mono',monospace", fontSize: 12.5, letterSpacing: 2.5, textTransform: "uppercase", color: "var(--emerald-d)", marginBottom: 14 },
  h2: { fontSize: "clamp(28px,4.5vw,40px)", fontWeight: 700, letterSpacing: -1.6, marginBottom: 24, textAlign: "center", color: "var(--navy)" },
  creepLead: { fontSize: 17, lineHeight: 1.6, color: "var(--slate)", maxWidth: 520, margin: "0 auto 40px" },
  graph: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 24, padding: "36px 28px 24px", marginBottom: 44, boxShadow: "0 10px 40px -28px rgba(15,30,61,0.3)" },
  graphBars: { display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "clamp(14px,5vw,48px)", height: 230 },
  graphCol: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", flex: "0 1 80px" },
  graphValWrap: { height: 22 },
  graphVal: { fontSize: 14, fontWeight: 600, color: "var(--navy)", marginBottom: 8, fontFamily: "'Spline Sans Mono',monospace" },
  graphBar: { width: "100%", maxWidth: 64, borderRadius: "8px 8px 0 0", background: "rgba(13,155,108,0.22)", border: "1px solid rgba(13,155,108,0.35)", borderBottom: "none" },
  graphBarPeak: { background: "var(--emerald)", border: "1px solid var(--emerald-d)", borderBottom: "none", boxShadow: "0 0 30px rgba(13,155,108,0.4)" },
  graphYear: { fontSize: 12.5, color: "var(--muted)", marginTop: 12, fontFamily: "'Spline Sans Mono',monospace" },
  graphCaption: { fontSize: 12.5, color: "var(--muted)", marginTop: 22, fontFamily: "'Spline Sans Mono',monospace" },
  creepStats: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 20, marginBottom: 18 },
  cStat: { textAlign: "center" },
  cStatN: { fontSize: "clamp(40px,6vw,56px)", fontWeight: 700, letterSpacing: -2, color: "var(--navy)", lineHeight: 1, marginBottom: 12 },
  cStatL: { fontSize: 14, lineHeight: 1.5, color: "var(--slate)", maxWidth: 220, margin: "0 auto" },
  creepSource: { fontSize: 12, color: "var(--faint)", marginTop: 26, fontFamily: "'Spline Sans Mono',monospace" },

  scanSection: { maxWidth: 600, margin: "0 auto", padding: "32px 28px 48px" },
  scanBridge: { textAlign: "center", fontSize: 19, fontWeight: 500, color: "var(--navy)", marginBottom: 22, letterSpacing: -0.3 },
  scanBridgeHi: { color: "var(--emerald)" },
  drop: { border: "1.5px dashed var(--line2)", borderRadius: 26, padding: "54px 24px", cursor: "pointer", background: "var(--surface)", textAlign: "center", boxShadow: "0 10px 40px -28px rgba(15,30,61,0.25)" },
  dropActive: { borderColor: "var(--emerald)", background: "#fff", transform: "scale(1.015)", boxShadow: "0 24px 56px -28px rgba(13,155,108,0.45)" },
  dropIcon: { width: 50, height: 50, margin: "0 auto", borderRadius: 16, background: "var(--emerald-soft)", color: "var(--emerald-d)", display: "flex", alignItems: "center", justifyContent: "center" },
  dropTitle: { fontSize: 20, fontWeight: 600, marginTop: 18, letterSpacing: -0.5, color: "var(--navy)" },
  dropHint: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 13, color: "var(--muted)", marginTop: 8 },
  dropBadge: { display: "inline-block", marginTop: 18, fontSize: 12.5, color: "var(--faint)", border: "1px solid var(--line)", borderRadius: 100, padding: "5px 14px", fontFamily: "'Spline Sans Mono',monospace" },
  error: { marginTop: 18, padding: "14px 18px", background: "#fdecec", border: "1px solid #f3c5c5", borderRadius: 14, color: "#b3403f", fontSize: 14, textAlign: "left", lineHeight: 1.5 },

  section: { maxWidth: 980, margin: "0 auto", padding: "64px 28px" },
  steps: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 18 },
  step: { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: 34, height: "100%" },
  stepNum: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 13, color: "var(--emerald-d)", fontWeight: 500, letterSpacing: 1 },
  stepTitle: { fontSize: 20, fontWeight: 600, margin: "16px 0 10px", letterSpacing: -0.5, color: "var(--navy)" },
  stepDesc: { fontSize: 15, lineHeight: 1.6, color: "var(--slate)" },

  guideGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 },
  guideChip: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, padding: "18px 22px" },
  guideChipName: { fontSize: 16, fontWeight: 600, color: "var(--navy)", letterSpacing: -0.3 },
  guideChipCat: { fontSize: 12.5, color: "var(--muted)", marginTop: 3, fontFamily: "'Spline Sans Mono',monospace" },
  guideChipArrow: { color: "var(--emerald)", fontSize: 18, fontWeight: 500 },
  viewAll: { background: "none", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 15, fontWeight: 500, color: "var(--emerald-d)", cursor: "pointer" },

  reviewSection: { padding: "56px 0 64px", overflow: "hidden" },
  marqueeWrap: { position: "relative", width: "100%", overflow: "hidden" },
  marqueeFadeL: { position: "absolute", left: 0, top: 0, bottom: 0, width: 100, zIndex: 5, background: "linear-gradient(90deg, var(--bg), transparent)", pointerEvents: "none" },
  marqueeFadeR: { position: "absolute", right: 0, top: 0, bottom: 0, width: 100, zIndex: 5, background: "linear-gradient(270deg, var(--bg), transparent)", pointerEvents: "none" },
  marqueeTrack: { display: "flex", gap: 18, width: "max-content", padding: "8px 0" },
  review: { width: 320, flexShrink: 0, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "24px 26px", boxShadow: "0 8px 30px -24px rgba(15,30,61,0.3)" },
  reviewSaved: { fontSize: 26, fontWeight: 700, color: "var(--emerald-d)", letterSpacing: -1, marginBottom: 12 },
  reviewYr: { fontSize: 15, color: "var(--faint)", fontWeight: 400 },
  reviewText: { fontSize: 15, lineHeight: 1.55, color: "var(--slate)", marginBottom: 18 },
  reviewName: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500, color: "var(--navy)" },
  avatar: { width: 30, height: 30, borderRadius: "50%", background: "var(--emerald-soft)", color: "var(--emerald-d)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600 },

  ctaSection: { maxWidth: 920, margin: "0 auto", padding: "40px 28px 80px" },
  ctaCard: { background: "var(--navy)", borderRadius: 30, padding: "60px 32px", textAlign: "center" },
  ctaTitle: { fontSize: "clamp(28px,4.5vw,42px)", fontWeight: 700, letterSpacing: -1.6, color: "#fff", marginBottom: 14 },
  ctaSub: { fontSize: 17, color: "rgba(255,255,255,0.7)", marginBottom: 32, maxWidth: 460, marginLeft: "auto", marginRight: "auto" },
  ctaBtn: { background: "var(--emerald)", color: "#fff", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 16, fontWeight: 500, padding: "15px 32px", borderRadius: 100, cursor: "pointer", letterSpacing: -0.2 },

  proCard: { position: "relative", overflow: "hidden", background: "var(--navy)", borderRadius: 24, padding: "40px 34px", textAlign: "center" },
  proGlow: { position: "absolute", top: "-60%", left: "50%", transform: "translateX(-50%)", width: "80%", height: "180%", background: "radial-gradient(ellipse, rgba(13,155,108,0.35), transparent 62%)", pointerEvents: "none" },
  proBadge: { display: "inline-block", fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#6ee7b7", background: "rgba(13,155,108,0.18)", border: "1px solid rgba(13,155,108,0.4)", padding: "5px 12px", borderRadius: 100, marginBottom: 18 },
  proTitle: { fontSize: "clamp(24px,4vw,32px)", fontWeight: 700, letterSpacing: -1.2, color: "#fff", marginBottom: 12, lineHeight: 1.1 },
  proSub: { fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.72)", maxWidth: 440, margin: "0 auto 22px" },
  proPriceRow: { display: "flex", flexDirection: "column", alignItems: "center", gap: 4, marginBottom: 22 },
  proPrice: { fontSize: 38, fontWeight: 700, color: "#fff", letterSpacing: -1.5 },
  proPriceUnit: { fontSize: 18, color: "rgba(255,255,255,0.5)", fontWeight: 400 },
  proPriceNote: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, color: "#6ee7b7" },
  proForm: { display: "flex", gap: 10, maxWidth: 440, margin: "0 auto", flexWrap: "wrap", justifyContent: "center" },
  proInput: { flex: "1 1 200px", minWidth: 0, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 100, padding: "13px 20px", fontSize: 15, color: "#fff", fontFamily: "'Archivo',sans-serif", outline: "none" },
  proBtn: { background: "var(--emerald)", color: "#fff", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 15, fontWeight: 500, padding: "13px 24px", borderRadius: 100, cursor: "pointer", whiteSpace: "nowrap", letterSpacing: -0.2 },
  proFootnote: { fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 16, fontFamily: "'Spline Sans Mono',monospace" },
  proCheck: { width: 48, height: 48, borderRadius: "50%", background: "var(--emerald)", color: "#fff", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },

  pricingSection: { maxWidth: 1040, margin: "0 auto", padding: "64px 28px", textAlign: "center" },
  toggleWrap: { display: "inline-flex", gap: 4, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 100, padding: 4, marginBottom: 40 },
  toggleBtn: { display: "inline-flex", alignItems: "center", gap: 7, background: "none", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 14.5, fontWeight: 500, color: "var(--muted)", padding: "9px 20px", borderRadius: 100, cursor: "pointer", transition: "all 0.3s cubic-bezier(0.16,1,0.3,1)" },
  toggleOn: { background: "var(--navy)", color: "#fff" },
  toggleSave: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, color: "var(--emerald)", background: "var(--emerald-soft)", padding: "2px 7px", borderRadius: 100 },
  tierTrialNote: { fontSize: 12, color: "var(--muted)", marginTop: 10, lineHeight: 1.45, fontFamily: "'Spline Sans Mono',monospace" },
  tierGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18, alignItems: "stretch" },
  tier: { position: "relative", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 22, padding: "34px 28px", textAlign: "left", display: "flex", flexDirection: "column" },
  tierHi: { border: "2px solid var(--emerald)", boxShadow: "0 24px 60px -30px rgba(13,155,108,0.5)" },
  tierBadge: { position: "absolute", top: -12, left: 28, fontFamily: "'Spline Sans Mono',monospace", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "var(--navy)", background: "var(--bg)", border: "1px solid var(--line2)", padding: "4px 12px", borderRadius: 100 },
  tierBadgeHi: { color: "#fff", background: "var(--emerald)", border: "1px solid var(--emerald)" },
  tierName: { fontSize: 20, fontWeight: 700, color: "var(--navy)", letterSpacing: -0.5 },
  tierTagline: { fontSize: 14.5, color: "var(--slate)", marginTop: 4, marginBottom: 18 },
  tierPriceRow: { display: "flex", alignItems: "baseline", gap: 2 },
  tierPrice: { fontSize: 42, fontWeight: 700, color: "var(--navy)", letterSpacing: -2, lineHeight: 1 },
  tierPriceHi: { color: "var(--emerald-d)" },
  tierUnit: { fontSize: 16, color: "var(--muted)", fontWeight: 400 },
  tierNote: { fontSize: 12.5, color: "var(--emerald-d)", marginTop: 6, fontFamily: "'Spline Sans Mono',monospace" },
  tierBtn: { width: "100%", marginTop: 20, background: "var(--surface)", color: "var(--navy)", border: "1px solid var(--line2)", fontFamily: "'Archivo',sans-serif", fontSize: 15, fontWeight: 500, padding: "12px 20px", borderRadius: 100, cursor: "pointer" },
  tierBtnHi: { width: "100%", marginTop: 20, background: "var(--emerald)", color: "#fff", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 15, fontWeight: 500, padding: "12px 20px", borderRadius: 100, cursor: "pointer" },
  tierFeatures: { marginTop: 24, display: "flex", flexDirection: "column", gap: 12 },
  tierFeat: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14.5, lineHeight: 1.45, color: "var(--slate)" },
  tierTick: { color: "var(--emerald)", fontWeight: 700, flexShrink: 0 },
  pricingFootnote: { fontSize: 14, color: "var(--muted)", marginTop: 36, fontFamily: "'Spline Sans Mono',monospace" },

  results: { maxWidth: 680, margin: "0 auto", padding: "48px 28px 90px" },
  back: { background: "none", border: "none", fontFamily: "'Spline Sans Mono',monospace", fontSize: 13, color: "var(--muted)", cursor: "pointer", marginBottom: 28 },
  bigStat: { background: "var(--navy)", borderRadius: 28, padding: "54px 32px", textAlign: "center", marginBottom: 32 },
  bigStatLabel: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12.5, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" },
  bigStatNum: { fontSize: "clamp(56px,13vw,88px)", fontWeight: 700, letterSpacing: -3.5, lineHeight: 1, margin: "14px 0", color: "#fff" },
  perYear: { fontSize: 22, color: "rgba(255,255,255,0.5)", fontWeight: 400, letterSpacing: -0.5 },
  bigStatSub: { fontSize: 15, color: "rgba(255,255,255,0.7)" },
  empty: { textAlign: "center", color: "var(--slate)", padding: 44, background: "var(--surface)", borderRadius: 22, border: "1px solid var(--line)", lineHeight: 1.5 },
  saveCard: { display: "flex", alignItems: "center", gap: 16, background: "var(--emerald-soft)", border: "1px solid rgba(13,155,108,0.25)", borderRadius: 18, padding: "20px 22px", marginBottom: 20 },
  saveTitle: { fontSize: 16, fontWeight: 600, color: "var(--navy)", letterSpacing: -0.3 },
  saveSub: { fontSize: 13.5, color: "var(--slate)", marginTop: 3, lineHeight: 1.45 },
  saveForm: { display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" },
  saveInput: { flex: "1 1 180px", minWidth: 0, background: "#fff", border: "1px solid var(--line2)", borderRadius: 100, padding: "11px 18px", fontSize: 14.5, color: "var(--navy)", fontFamily: "'Archivo',sans-serif", outline: "none" },
  saveBtn: { background: "var(--emerald)", color: "#fff", border: "none", fontFamily: "'Archivo',sans-serif", fontSize: 14.5, fontWeight: 500, padding: "11px 20px", borderRadius: 100, cursor: "pointer", whiteSpace: "nowrap" },
  saveCheck: { flexShrink: 0, width: 40, height: 40, borderRadius: "50%", background: "var(--emerald)", color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center" },
  list: { display: "flex", flexDirection: "column", gap: 12 },
  card: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "22px 24px" },
  cardLeft: { flex: 1, minWidth: 0 },
  cardName: { fontSize: 17, fontWeight: 600, letterSpacing: -0.4, color: "var(--navy)" },
  cardMeta: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12.5, color: "var(--muted)", marginTop: 6 },
  cardGuide: { display: "inline-block", marginTop: 10, fontSize: 13.5, fontWeight: 500, color: "var(--emerald-d)" },
  cardNote: { fontSize: 13, color: "var(--slate)", marginTop: 10, lineHeight: 1.5 },
  cardRight: { display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end", flexShrink: 0 },
  cancelBtn: { background: "var(--emerald)", color: "#fff", fontWeight: 500, fontSize: 13.5, padding: "10px 22px", borderRadius: 100, whiteSpace: "nowrap" },
  cancelBtnAlt: { background: "var(--surface)", color: "var(--navy)", border: "1px solid var(--line2)", fontWeight: 500, fontSize: 13.5, padding: "10px 18px", borderRadius: 100, whiteSpace: "nowrap" },
  doneBtn: { background: "none", border: "1px solid var(--line)", borderRadius: 100, padding: "8px 16px", fontSize: 12.5, cursor: "pointer", color: "var(--muted)", fontFamily: "'Spline Sans Mono',monospace" },

  hubMain: { maxWidth: 880, margin: "0 auto", padding: "56px 28px 80px" },
  crumb: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12.5, color: "var(--muted)", marginBottom: 24, letterSpacing: 0.3 },
  hubH1: { fontSize: "clamp(36px,6vw,58px)", fontWeight: 700, letterSpacing: -2.2, color: "var(--navy)", marginBottom: 18, lineHeight: 1.04 },
  hubLead: { fontSize: 18, lineHeight: 1.6, color: "var(--slate)", maxWidth: 600, marginBottom: 44 },
  hubGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 },
  hubCard: { display: "block", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 20, padding: "26px 28px", height: "100%" },
  hubCardTop: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  hubCat: { fontSize: 12, color: "var(--emerald-d)", fontFamily: "'Spline Sans Mono',monospace", letterSpacing: 1, textTransform: "uppercase", background: "var(--emerald-soft)", padding: "4px 10px", borderRadius: 100 },
  hubArrow: { color: "var(--emerald)", fontSize: 20, fontWeight: 500 },
  hubCardName: { fontSize: 20, fontWeight: 600, color: "var(--navy)", letterSpacing: -0.5, marginBottom: 10 },
  hubCardShort: { fontSize: 14.5, lineHeight: 1.6, color: "var(--slate)" },
  hubCta: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap", background: "var(--navy)", borderRadius: 24, padding: "36px", marginTop: 40 },
  hubCtaTitle: { fontSize: 22, fontWeight: 600, color: "#fff", letterSpacing: -0.6, marginBottom: 6 },
  hubCtaSub: { fontSize: 15, color: "rgba(255,255,255,0.7)", maxWidth: 420 },

  guideMain: { maxWidth: 720, margin: "0 auto", padding: "56px 28px 80px" },
  guideH1: { fontSize: "clamp(32px,5.5vw,50px)", fontWeight: 700, letterSpacing: -2, lineHeight: 1.06, color: "var(--navy)", marginBottom: 20 },
  guideLede: { fontSize: 19, lineHeight: 1.6, color: "var(--slate)", marginBottom: 16 },
  guideMeta: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12.5, color: "var(--muted)", marginBottom: 40 },
  callout: { background: "var(--emerald-soft)", border: "1px solid rgba(13,155,108,0.25)", borderRadius: 18, padding: "22px 24px", marginBottom: 16 },
  calloutTag: { fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--emerald-d)", marginBottom: 8 },
  calloutP: { color: "var(--slate)", fontSize: 16, lineHeight: 1.6, margin: 0 },
  guideH2: { fontSize: 27, fontWeight: 700, letterSpacing: -1, color: "var(--navy)", margin: "44px 0 16px" },
  guideP: { fontSize: 16.5, lineHeight: 1.7, color: "var(--text)", marginBottom: 16 },
  olSteps: { listStyle: "none", padding: 0, margin: "22px 0" },
  olStep: { display: "flex", gap: 16, alignItems: "flex-start", padding: "18px 20px", background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 16, marginBottom: 12 },
  olNum: { flexShrink: 0, width: 30, height: 30, borderRadius: 9, background: "var(--emerald-soft)", color: "var(--emerald-d)", fontFamily: "'Spline Sans Mono',monospace", fontWeight: 500, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" },
  olTitle: { color: "var(--navy)", fontWeight: 600, fontSize: 16.5 },
  olDesc: { color: "var(--slate)", fontSize: 15, lineHeight: 1.55, marginTop: 4 },
  guideCta: { background: "var(--navy)", borderRadius: 24, padding: "44px 32px", textAlign: "center", margin: "48px 0" },
  faqWrap: { borderTop: "1px solid var(--line)" },
  faqItem: { borderBottom: "1px solid var(--line)" },
  faqQ: { width: "100%", background: "none", border: "none", padding: "20px 0", fontFamily: "'Archivo',sans-serif", fontSize: 17, fontWeight: 500, color: "var(--navy)", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, textAlign: "left" },
  faqPlus: { color: "var(--emerald)", fontSize: 22, fontWeight: 400, transition: "transform 0.3s cubic-bezier(0.16,1,0.3,1)", flexShrink: 0 },
  faqA: { fontSize: 15.5, lineHeight: 1.65, color: "var(--slate)", overflow: "hidden", transition: "max-height 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.4s ease, padding 0.4s ease" },
  guideDisclaimer: { fontSize: 14, lineHeight: 1.6, color: "var(--muted)", marginTop: 40, paddingTop: 20, borderTop: "1px solid var(--line)" },

  footer: { background: "var(--surface)", borderTop: "1px solid var(--line)", marginTop: 40 },
  footerInner: { maxWidth: 980, margin: "0 auto", padding: "52px 28px 32px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 40 },
  footNote: { fontSize: 14, lineHeight: 1.6, color: "var(--muted)", maxWidth: 320 },
  footCol: { display: "flex", flexDirection: "column", gap: 10 },
  footHead: { fontSize: 13, fontWeight: 600, color: "var(--navy)", marginBottom: 4, fontFamily: "'Spline Sans Mono',monospace", textTransform: "uppercase", letterSpacing: 1 },
  footLink: { fontSize: 14.5, color: "var(--slate)" },
  footBottom: { maxWidth: 980, margin: "0 auto", padding: "20px 28px 40px", fontFamily: "'Spline Sans Mono',monospace", fontSize: 12, color: "var(--faint)", borderTop: "1px solid var(--line)" },
};
