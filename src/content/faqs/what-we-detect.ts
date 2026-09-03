import type { Lang } from "../../i18n/ui";
export type Faq = { q: string; a: string };

const en: Faq[] = [
  { q: "What scam types does ScamLens detect?", a: "UPI refund QR, fake KYC/bank suspension, courier Rs99 fee, job-fee, digital arrest video-call, FASTag/challan, trading-app guaranteed returns, instant loan app, family emergency, utility disconnection, reward bait, plus global USPS, Royal Mail, HMRC, SSA patterns — all mapped to 13 text detectors." },
  { q: "Can it detect phishing links?", a: "Yes. It checks brand mismatch (hdfcbank vs hdfcbank-secure-login.xyz), punycode xn-- spoofs, @ trick, raw IP hosts, insecure http, credential params (?password=, ?otp=) and high-abuse TLDs (.zip, .top, .xyz) without fetching the URL." },
  { q: "How does it spot fake websites?", a: "By parsing the URL locally: shorteners (bit.ly, tinyurl...), look-alike domains via BRANDS list (hdfcbank.com, sbi.co.in, amazon.in etc.), punycode, IP hosts and TLD abuse. It never opens the site, so you don’t risk loading malware." },
  { q: "Does it catch impersonation of banks or government?", a: "The impersonation detector looks for name-drops like HDFC, SBI, RBI, DTDC, India Post, TRAI, plus USPS, HMRC, SSA etc., and flags when the domain isn’t the official one (e.g. hdfcbank-secure-login.xyz ≠ hdfcbank.com)." },
  { q: "What about UPI and payment scams?", a: "QR/UPI detector flags any UPI handle (someone@ybl, @paytm, @oksbi) or “scan QR to receive” phrasing — you never scan or enter PIN to receive money, only to pay. Payment-request detector flags amounts Rs 99/499 and fees to receive parcels/jobs/prizes." },
  { q: "How are urgency and manipulation signals handled?", a: "Urgency detector looks for “today”, “within 24 hours”, “last warning”, account-block language; fear-threat looks for police/arrest/FIR/court/digital arrest threats. They contribute weight but alone don’t trigger High — multiple signals raise risk." },
  { q: "What does ScamLens NOT detect?", a: "It’s rule-based, so it can miss novel phrasing that evades regex, and it doesn’t verify if a domain is actually registered today or check live blocklists. A Low result means no common markers found, not safe." },
];

const es: Faq[] = [
  { q: "¿Qué tipos de estafa detecta ScamLens?", a: "QR UPI de reembolso, suspensión KYC falsa, tarifa de mensajería Rs99, empleo con tarifa, arresto digital por videollamada, FASTag, app de trading con rentabilidad garantizada, app de préstamo, emergencia familiar, corte de luz, cebo de premio, además de USPS, Royal Mail, HMRC, SSA — mapeados a 13 detectores." },
  { q: "¿Puede detectar enlaces de phishing?", a: "Sí. Revisa suplantación de marca (hdfcbank vs hdfcbank-secure-login.xyz), punycode xn--, truco @, IP directa, http inseguro, parámetros de credenciales (?password=, ?otp=) y TLD de alto abuso (.zip, .top, .xyz) sin cargar la URL." },
  { q: "¿Cómo detecta webs falsas?", a: "Analiza la URL localmente: acortadores (bit.ly etc.), dominios parecidos vía lista BRANDS, punycode, IP y TLD abusivos. Nunca abre el sitio, así no arriesgas cargar malware." },
  { q: "¿Detecta suplantación de bancos o gobierno?", a: "El detector de suplantación busca menciones como HDFC, SBI, RBI, DTDC, India Post, TRAI, USPS, HMRC, SSA y alerta cuando el dominio no es el oficial (hdfcbank-secure-login.xyz ≠ hdfcbank.com)." },
  { q: "¿Qué pasa con estafas UPI y de pago?", a: "El detector QR/UPI marca cualquier handle UPI o frase “escanea QR para recibir” — nunca escaneas ni pones PIN para recibir, solo para pagar. El de pago marca montos Rs99/499 y tarifas para recibir paquetes/empleos/premios." },
  { q: "¿Cómo maneja urgencia y manipulación?", a: "Urgencia busca “hoy”, “en 24 horas”, “último aviso”, bloqueo de cuenta; miedo busca policía/arresto/FIR/digital arrest. Aportan peso pero solos no disparan Alto — múltiples señales elevan el riesgo." },
  { q: "¿Qué NO detecta ScamLens?", a: "Es basado en reglas, puede perder frases nuevas que evaden regex y no verifica si un dominio está registrado hoy ni listas en vivo. Un resultado Bajo significa sin marcadores comunes, no seguro." },
];

const fr: Faq[] = [
  { q: "Quels types d’arnaques ScamLens détecte-t-il ?", a: "QR UPI de remboursement, suspension KYC fictive, frais livraison Rs99, emploi avec frais, arrestation numérique en visio, FASTag, app trading rendement garanti, app prêt, urgence familiale, coupure électricité, appât lot, plus USPS, Royal Mail, HMRC, SSA — mappés à 13 détecteurs." },
  { q: "Peut-il détecter les liens de phishing ?", a: "Oui. Il vérifie usurpation de marque (hdfcbank vs hdfcbank-secure-login.xyz), punycode xn--, astuce @, IP brute, http non sécurisé, params d’identifiants (?password=, ?otp=) et TLD à haut abus (.zip, .top) sans charger l’URL." },
  { q: "Comment repère-t-il les faux sites ?", a: "En analysant l’URL localement : raccourcisseurs, domaines ressemblants via liste BRANDS, punycode, IP, TLD abusifs. Il n’ouvre jamais le site, vous ne risquez pas de charger un malware." },
  { q: "Détecte-t-il l’usurpation de banques ou gouvernement ?", a: "Le détecteur d’usurpation cherche HDFC, SBI, RBI, DTDC, India Post, TRAI, USPS, HMRC, SSA et alerte quand le domaine n’est pas officiel." },
  { q: "Qu’en est-il des arnaques UPI et paiement ?", a: "QR/UPI signale tout handle UPI ou “scan QR pour recevoir” — on ne scanne jamais ni ne saisit PIN pour recevoir, seulement pour payer. Paiement signale montants Rs99/499 et frais pour recevoir colis/emploi/lot." },
  { q: "Comment sont gérés urgence et manipulation ?", a: "Urgence cherche “aujourd’hui”, “dans 24h”, “dernier avertissement”, blocage compte ; menace cherche police/arrestation/FIR/arrestation numérique. Poids mais seuls ne déclenchent pas Élevé." },
  { q: "Que ne détecte-t-il pas ?", a: "Basé sur des règles, peut manquer nouvelles formulations et ne vérifie pas l’enregistrement du domaine ni les blocklists live. Faible = aucun marqueur commun, pas sûr." },
];

const de: Faq[] = [
  { q: "Welche Betrugsarten erkennt ScamLens?", a: "UPI-QR-Erstattung, Fake-KYC/Bank-Sperre, Kurier 99 Rs Gebühr, Job-Gebühr, Digital-Arrest Video, FASTag, Trading-App garantierte Rendite, Kredit-App, Familiennotfall, Strom-Sperre, Gewinn-Köder, plus USPS, Royal Mail, HMRC, SSA — auf 13 Detektoren gemappt." },
  { q: "Kann es Phishing-Links erkennen?", a: "Ja. Prüft Marken-Mismatch (hdfcbank vs hdfcbank-secure-login.xyz), Punycode xn--, @-Trick, rohe IP, unsicheres http, Zugangsdaten-Params (?password=, ?otp=) und High-Abuse-TLDs (.zip, .top) ohne die URL zu laden." },
  { q: "Wie erkennt es Fake-Websites?", a: "Durch lokales Parsen der URL: Kürzer, täuschend ähnliche Domains via BRANDS-Liste, Punycode, IP und TLD-Missbrauch. Es öffnet die Seite nie, Sie laden kein Malware." },
  { q: "Erkennt es Imitation von Banken oder Behörden?", a: "Imitations-Detektor sucht nach HDFC, SBI, RBI, DTDC, India Post, TRAI, USPS, HMRC, SSA und warnt wenn Domain nicht offiziell ist." },
  { q: "Was ist mit UPI- und Zahlungsbetrug?", a: "QR/UPI markiert jeden UPI-Handle oder “QR zum Empfangen scannen” — Sie scannen nie oder geben PIN zum Empfangen ein, nur zum Bezahlen. Zahlung markiert Beträge Rs99/499 und Gebühren zum Erhalt von Paketen/Jobs/Preisen." },
  { q: "Wie werden Dringlichkeit und Manipulation behandelt?", a: "Dringlichkeit sucht “heute”, “innerhalb 24h”, “letzte Warnung”, Konto-Sperre; Angst sucht Polizei/Arrest/FIR/Digital-Arrest. Tragen Gewicht, lösen allein kein Hoch aus." },
  { q: "Was erkennt ScamLens NICHT?", a: "Regelbasiert, kann neue Formulierungen verpassen und prüft nicht Domain-Registrierung oder Live-Blocklists. Niedrig = keine gemeinsamen Marker, nicht sicher." },
];

const ptbr: Faq[] = [
  { q: "Quais tipos de golpe o ScamLens detecta?", a: "QR UPI de reembolso, suspensão KYC falsa, taxa de correio Rs99, emprego com taxa, prisão digital por vídeo, FASTag, app de trading com retorno garantido, app de empréstimo, emergência familiar, corte de luz, isca de prêmio, além de USPS, Royal Mail, HMRC, SSA — mapeados a 13 detectores." },
  { q: "Ele detecta links de phishing?", a: "Sim. Checa mismatch de marca (hdfcbank vs hdfcbank-secure-login.xyz), punycode xn--, truque @, IP cru, http inseguro, params de credenciais (?password=, ?otp=) e TLDs de alto abuso (.zip, .top) sem carregar a URL." },
  { q: "Como identifica sites falsos?", a: "Analisando a URL localmente: encurtadores, domínios parecidos via lista BRANDS, punycode, IP e abuso de TLD. Nunca abre o site, você não carrega malware." },
  { q: "Detecta impersonação de bancos ou governo?", a: "Detector de impersonação busca HDFC, SBI, RBI, DTDC, India Post, TRAI, USPS, HMRC, SSA e alerta quando o domínio não é o oficial." },
  { q: "E quanto a golpes UPI e de pagamento?", a: "QR/UPI sinaliza qualquer handle UPI ou “escaneie QR para receber” — você nunca escaneia nem digita PIN para receber, só para pagar. Pagamento sinaliza valores Rs99/499 e taxas para receber pacotes/empregos/prêmios." },
  { q: "Como urgência e manipulação são tratadas?", a: "Urgência busca “hoje”, “em 24h”, “último aviso”, bloqueio de conta; medo busca polícia/prisão/FIR/prisão digital. Contribuem peso mas sozinhas não disparam Alto." },
  { q: "O que o ScamLens NÃO detecta?", a: "Baseado em regras, pode perder novas formulações e não verifica registro de domínio nem blocklists ao vivo. Baixo = nenhum marcador comum, não seguro." },
];

const it: Faq[] = [
  { q: "Quali tipi di truffa rileva ScamLens?", a: "QR UPI di rimborso, sospensione KYC falsa, tassa corriere Rs99, lavoro con tassa, arresto digitale video, FASTag, app trading rendimento garantito, app prestito, emergenza familiare, distacco luce, esca premio, più USPS, Royal Mail, HMRC, SSA — mappati su 13 rilevatori." },
  { q: "Rileva i link di phishing?", a: "Sì. Controlla mismatch di marca (hdfcbank vs hdfcbank-secure-login.xyz), punycode xn--, trucco @, IP grezzo, http insicuro, params credenziali (?password=, ?otp=) e TLD ad alto abuso (.zip, .top) senza caricare l'URL." },
  { q: "Come individua i siti falsi?", a: "Analizzando l'URL localmente: accorciatori, domini simili via lista BRANDS, punycode, IP e abuso TLD. Non apre mai il sito, non carichi malware." },
  { q: "Individua l'impersonificazione di banche o governo?", a: "Il rilevatore impersonificazione cerca HDFC, SBI, RBI, DTDC, India Post, TRAI, USPS, HMRC, SSA e avvisa quando il dominio non è ufficiale." },
  { q: "E le truffe UPI e di pagamento?", a: "QR/UPI segnala qualsiasi handle UPI o “scansiona QR per ricevere” — non scansioni mai né inserisci PIN per ricevere, solo per pagare. Pagamento segnala importi Rs99/499 e tasse per ricevere pacchi/lavori/premi." },
  { q: "Come sono gestiti urgenza e manipolazione?", a: "Urgenza cerca “oggi”, “entro 24h”, “ultimo avviso”, blocco account; paura cerca polizia/arresto/FIR/arresto digitale. Contribuiscono peso ma da sole non attivano Alto." },
  { q: "Cosa NON rileva ScamLens?", a: "Basato su regole, può perdere nuove formulazioni e non verifica registrazione dominio né blocklist live. Basso = nessun marker comune, non sicuro." },
];

const ja: Faq[] = [
  { q: "ScamLensはどんな詐欺タイプを検出しますか？", a: "UPI返金QR、偽KYC/銀行停止、配送料99ルピー、求人手数料、デジタルアレストビデオ通話、FASTag、保証リターン投資アプリ、即時ローンアプリ、家族緊急、電気停止、報酬ベイト、さらにUSPS、Royal Mail、HMRC、SSA — 13の検出器にマッピング。" },
  { q: "フィッシングリンクを検出できますか？", a: "はい。ブランド不一致（hdfcbank vs hdfcbank-secure-login.xyz）、punycode xn--、@トリック、生IP、非安全http、認証情報パラメータ（?password=, ?otp=）、高乱用TLD（.zip, .top）をURLを取得せずにチェックします。" },
  { q: "偽サイトをどう見分けますか？", a: "URLをローカルで解析：短縮、ブランドリストBRANDSによる類似ドメイン、punycode、IP、TLD乱用。サイトを決して開かないのでマルウェアを読み込みません。" },
  { q: "銀行や政府のなりすましを検出しますか？", a: "なりすまし検出器はHDFC、SBI、RBI、DTDC、India Post、TRAI、USPS、HMRC、SSAを探し、ドメインが公式でないときに警告します。" },
  { q: "UPIや支払い詐欺は？", a: "QR/UPIはUPIハンドルや「受取のためにQRをスキャン」をフラグ — お金を受け取るためにスキャンやPIN入力することは決してなく、支払うときだけです。支払い要求はRs99/499や受取のための手数料をフラグします。" },
  { q: "緊急性や操作シグナルはどう扱われますか？", a: "緊急性は「今日」「24時間以内」「最終警告」アカウントブロックを、恐怖は警察/逮捕/FIR/デジタルアレストを探します。重みに寄与しますが単独ではHighになりません。" },
  { q: "ScamLensが検出しないものは？", a: "ルールベースなので新しい言い回しを見逃すことがあり、ドメイン登録やライブブロックリストはチェックしません。Lowは一般的なマーカーが見つからなかったことを意味し、安全ではありません。" },
];

const ko: Faq[] = [
  { q: "ScamLens는 어떤 사기 유형을 탐지하나요?", a: "UPI 환불 QR, 가짜 KYC/은행 정지, 택배 99루피 수수료, 구인 수수료, 디지털 체포 영상통화, FASTag, 보장 수익 투자 앱, 즉시 대출 앱, 가족 긴급, 전기 차단, 보상 미끼, plus USPS, Royal Mail, HMRC, SSA — 13개 탐지기에 매핑." },
  { q: "피싱 링크를 탐지할 수 있나요?", a: "예. 브랜드 불일치(hdfcbank vs hdfcbank-secure-login.xyz), 퓨니코드 xn--, @ 트릭, 원시 IP, 안전하지 않은 http, 자격 증명 파라미터(?password=, ?otp=) 및 고남용 TLD(.zip, .top)를 URL을 가져오지 않고 검사합니다." },
  { q: "가짜 웹사이트는 어떻게 식별하나요?", a: "URL을 로컬에서 파싱: 단축, 브랜드 목록 BRANDS를 통한 유사 도메인, 퓨니코드, IP 및 TLD 남용. 사이트를 절대 열지 않으므로 멀웨어를 로드하지 않습니다." },
  { q: "은행이나 정부 사칭을 탐지하나요?", a: "사칭 탐지기는 HDFC, SBI, RBI, DTDC, India Post, TRAI, USPS, HMRC, SSA를 찾고 도메인이 공식이 아닐 때 경고합니다." },
  { q: "UPI 및 결제 사기는요?", a: "QR/UPI는 UPI 핸들이나 '받으려면 QR 스캔' 문구를 플래그 — 돈을 받기 위해 스캔하거나 PIN을 입력하는 일은 절대 없고 지불할 때만 합니다. 결제는 Rs99/499 금액과 수취를 위한 수수료를 플래그합니다." },
  { q: "긴급성 및 조작 신호는 어떻게 처리되나요?", a: "긴급성은 '오늘', '24시간 이내', '마지막 경고', 계정 차단을, 공포는 경찰/체포/FIR/디지털 체포를 찾습니다. 가중치에 기여하지만 단독으로 High를 트리거하지 않습니다." },
  { q: "ScamLens가 탐지하지 못하는 것은?", a: "규칙 기반이므로 새로운 문구를 놓칠 수 있고 도메인 등록이나 라이브 차단 목록을 확인하지 않습니다. 낮음은 일반적인 마커가 발견되지 않았음을 의미하며 안전하지 않습니다." },
];

const map: Record<Lang, Faq[]> = { en, es, fr, de, "pt-br": ptbr, it, ja, ko };
export default map;
