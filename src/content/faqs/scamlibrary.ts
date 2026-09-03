import type { Lang } from "../../i18n/ui";
export type Faq = { q: string; a: string };

const en: Faq[] = [
  { q: "What is in the Scam Library?", a: "16 breakdowns of real patterns seen in India and globally: fake KYC, courier Rs99 fee, UPI QR refund, job fee, digital arrest, FASTag/challan, trading app, loan app, family emergency, plus USPS, Royal Mail, HMRC, SSA. Each has What it looks like, Warning signs, Why it works, What to do, and How to verify." },
  { q: "How are scam examples chosen?", a: "From forwarded messages and reported cases, redacted and quoted verbatim as evidence (e.g. “Pay Rs 99 to reschedule”). No synthetic lures are invented." },
  { q: "How do I quickly recognize a pattern?", a: "Look for the 4-part checklist in each entry: quoted looksLike lines, warningSigns bullets, the persuasion reason (urgency/fear/reward), and verification steps via official app — not via the message’s link." },
  { q: "What’s the difference between courier fee and UPI QR scams?", a: "Courier fee asks you to pay a small fee to receive a parcel via a short link; UPI QR asks you to scan or enter PIN to ‘receive’ money — scanning always pays, never receives. Different detector families and different next steps." },
  { q: "I think I got one — what to do now?", a: "Don’t pay or scan, verify via the official app using the number on your card, and report within the golden hour at 1930 and cybercrime.gov.in with screenshots. Warn whoever forwarded it." },
  { q: "How does the Scam Library relate to detection?", a: "Each detection maps to a library entry via similarScams (e.g. payment-request → Courier fee). The checker quotes the same evidence you’ll see in the library’s Warning signs, so you can cross-check." },
];

const es: Faq[] = [
  { q: "¿Qué hay en la Biblioteca de estafas?", a: "16 análisis de patrones reales en India y a nivel global: KYC falso, tarifa de mensajería Rs99, QR UPI, empleo con tarifa, arresto digital, FASTag, app de trading, préstamo, emergencia familiar, más USPS, Royal Mail, HMRC, SSA. Cada uno con Cómo se ve, Señales, Por qué funciona, Qué hacer y Cómo verificar." },
  { q: "¿Cómo se eligen los ejemplos?", a: "De mensajes reenviados y casos reportados, ocultados y citados textualmente como evidencia (ej. “Paga Rs99 para reprogramar”). No se inventan señuelos sintéticos." },
  { q: "¿Cómo reconozco rápido un patrón?", a: "Usa la checklist de 4 partes de cada entrada: líneas looksLike citadas, viñetas de señales, razón de persuasión (urgencia/miedo/recompensa) y pasos de verificación vía app oficial — no vía el enlace del mensaje." },
  { q: "¿Cuál es la diferencia entre tarifa de mensajería y QR UPI?", a: "Tarifa de mensajería pide pagar poco para recibir un paquete vía link corto; QR UPI pide escanear o poner PIN para “recibir” — escanear siempre paga, nunca recibe. Diferentes familias de detectores y pasos." },
  { q: "Creo que recibí una — ¿qué hago ahora?", a: "No pagues ni escanees, verifica vía app oficial con el número de tu tarjeta y reporta en la hora de oro al 1930 y cybercrime.gov.in con capturas. Avisa a quien te lo reenvió." },
  { q: "¿Cómo se relaciona la biblioteca con la detección?", a: "Cada detección mapea a una entrada vía similarScams (ej. pago → Tarifa de mensajería). El verificador cita la misma evidencia que verás en Señales, para que puedas cotejar." },
];

const fr: Faq[] = [
  { q: "Que contient la bibliothèque des arnaques ?", a: "16 analyses de schémas réels Inde + global : faux KYC, frais livraison Rs99, QR UPI, emploi avec frais, arrestation numérique, FASTag, app trading, prêt, urgence familiale, plus USPS, Royal Mail, HMRC, SSA. Chaque entrée a Apparence, Signaux, Pourquoi ça marche, Que faire, Comment vérifier." },
  { q: "Comment les exemples sont-ils choisis ?", a: "À partir de messages transférés et cas signalés, masqués et cités verbatim comme preuve (ex. “Payez Rs99 pour reprogrammer”). Aucun leurre synthétique inventé." },
  { q: "Comment reconnaître rapidement un schéma ?", a: "Utilisez la checklist 4 parties de chaque entrée : lignes looksLike citées, puces signaux, raison persuasion (urgence/peur/récompense) et vérification via app officielle — pas via le lien du message." },
  { q: "Différence entre frais de livraison et QR UPI ?", a: "Frais livraison demande petit paiement pour recevoir colis via lien court ; QR UPI demande scanner ou saisir PIN pour “recevoir” — scanner paie toujours, ne reçoit jamais. Familles de détecteurs différentes." },
  { q: "Je pense en avoir reçu une — que faire ?", a: "Ne payez ni ne scannez, vérifiez via l’app officielle avec le numéro sur votre carte et signalez dans l’heure d’or au 1930 et cybercrime.gov.in avec captures." },
  { q: "Lien entre bibliothèque et détection ?", a: "Chaque détection mappe à une entrée via similarScams (ex. paiement → Frais livraison). Le vérificateur cite la même preuve que vous verrez dans Signaux." },
];

const de: Faq[] = [
  { q: "Was ist in der Betrugsbibliothek?", a: "16 Aufschlüsselungen realer Muster Indien + global: Fake-KYC, Kurier 99 Rs Gebühr, UPI-QR, Job-Gebühr, Digital-Arrest, FASTag, Trading-App, Kredit-App, Familiennotfall, plus USPS, Royal Mail, HMRC, SSA. Jede mit Aussehen, Warnzeichen, Warum es funktioniert, Was tun, Wie verifizieren." },
  { q: "Wie werden Beispiele ausgewählt?", a: "Aus weitergeleiteten Nachrichten und gemeldeten Fällen, geschwärzt und wörtlich als Beweis zitiert (z.B. “Zahlen Sie Rs99 für Umbuchung”). Keine synthetischen Köder erfunden." },
  { q: "Wie erkenne ich schnell ein Muster?", a: "Nutzen Sie die 4-Teile-Checkliste jedes Eintrags: zitierte looksLike-Zeilen, Warnzeichen-Bullets, Überzeugungsgrund (Dringlichkeit/Angst/Belohnung) und Verifizierung via offizieller App — nicht via Link der Nachricht." },
  { q: "Unterschied Kuriergebühr vs UPI-QR?", a: "Kuriergebühr verlangt kleine Zahlung zum Erhalt eines Pakets via Kurzlink; UPI-QR verlangt Scan oder PIN zum “Erhalten” — Scannen zahlt immer, empfängt nie. Verschiedene Detektor-Familien." },
  { q: "Ich glaube ich habe eine erhalten — was tun?", a: "Nicht zahlen oder scannen, via offizieller App mit Nummer auf Ihrer Karte verifizieren und innerhalb der goldenen Stunde bei 1930 und cybercrime.gov.in mit Screenshots melden." },
  { q: "Wie hängt Bibliothek mit Erkennung zusammen?", a: "Jede Erkennung mappt zu einem Eintrag via similarScams (z.B. Zahlung → Kuriergebühr). Der Prüfer zitiert denselben Beweis wie in den Warnzeichen." },
];

const ptbr: Faq[] = [
  { q: "O que há na biblioteca de golpes?", a: "16 análises de padrões reais Índia + global: KYC falso, taxa de correio Rs99, QR UPI, emprego com taxa, prisão digital, FASTag, app de trading, empréstimo, emergência familiar, mais USPS, Royal Mail, HMRC, SSA. Cada um com Aparência, Sinais, Por que funciona, O que fazer, Como verificar." },
  { q: "Como os exemplos são escolhidos?", a: "De mensagens encaminhadas e casos reportados, ocultados e citados verbatim como evidência (ex. “Pague Rs99 para reagendar”). Nenhum isca sintética inventada." },
  { q: "Como reconhecer rapidamente um padrão?", a: "Use o checklist de 4 partes de cada entrada: linhas looksLike citadas, marcadores de sinais, razão de persuasão (urgência/medo/recompensa) e verificação via app oficial — não via link da mensagem." },
  { q: "Diferença entre taxa de correio e QR UPI?", a: "Taxa de correio pede pequeno pagamento para receber pacote via link curto; QR UPI pede escanear ou digitar PIN para “receber” — escanear sempre paga, nunca recebe. Famílias diferentes de detectores." },
  { q: "Acho que recebi um — o que fazer agora?", a: "Não pague nem escaneie, verifique via app oficial com número no seu cartão e reporte na hora de ouro no 1930 e cybercrime.gov.in com capturas." },
  { q: "Como a biblioteca se relaciona à detecção?", a: "Cada detecção mapeia para uma entrada via similarScams (ex. pagamento → Taxa de correio). O verificador cita a mesma evidência que você verá em Sinais." },
];

const it: Faq[] = [
  { q: "Cosa contiene la biblioteca delle truffe?", a: "16 analisi di schemi reali India + global: falso KYC, tassa corriere Rs99, QR UPI, lavoro con tassa, arresto digitale, FASTag, app trading, prestito, emergenza familiare, più USPS, Royal Mail, HMRC, SSA. Ognuna con Aspetto, Segnali, Perché funziona, Cosa fare, Come verificare." },
  { q: "Come vengono scelti gli esempi?", a: "Da messaggi inoltrati e casi segnalati, oscurati e citati testualmente come prova (es. “Paga Rs99 per riprogrammare”). Nessun esca sintetica inventata." },
  { q: "Come riconoscere rapidamente uno schema?", a: "Usa la checklist a 4 parti di ogni voce: righe looksLike citate, punti segnali, ragione persuasione (urgenza/paura/ricompensa) e verifica tramite app ufficiale — non tramite link del messaggio." },
  { q: "Differenza tra tassa di consegna e QR UPI?", a: "Tassa di consegna chiede piccolo pagamento per ricevere pacco via link corto; QR UPI chiede scansione o PIN per “ricevere” — scansionare paga sempre, non riceve mai. Famiglie di rilevatori diverse." },
  { q: "Penso di averne ricevuta una — cosa fare ora?", a: "Non pagare né scansionare, verifica tramite app ufficiale con numero sulla tua carta e segnala entro l'ora d'oro al 1930 e cybercrime.gov.in con screenshot." },
  { q: "Come la biblioteca è collegata al rilevamento?", a: "Ogni rilevamento mappa a una voce tramite similarScams (es. pagamento → Tassa di consegna). Il verificatore cita la stessa prova che vedrai in Segnali." },
];

const ja: Faq[] = [
  { q: "詐欺ライブラリには何がありますか？", a: "インドと世界の実際の16パターンの内訳：偽KYC、配送料99ルピー、UPI QR、求人手数料、デジタルアレスト、FASTag、トレーディングアプリ、ローンアプリ、家族緊急、さらにUSPS、Royal Mail、HMRC、SSA。各エントリは見た目、警告サイン、なぜ機能するか、すべきこと、確認方法を含む。" },
  { q: "例はどう選ばれていますか？", a: "転送されたメッセージと報告されたケースから、編集され証拠として逐語的に引用されます（例「再配達のために99ルピーを支払う」）。合成のルアーは作られていません。" },
  { q: "パターンを素早く認識するには？", a: "各エントリの4部チェックリストを使用：引用されたlooksLike行、警告サインビュレット、説得理由（緊急性/恐怖/報酬）、公式アプリでの検証 — メッセージのリンク経由ではない。" },
  { q: "配送料とUPI QR詐欺の違いは？", a: "配送料は短縮リンク経由で荷物を受け取るための少額支払いを求めます；UPI QRは「受取のためにスキャン」やPIN入力を求めます — スキャンは常に支払いであり受取ではありません。異なる検出器ファミリーです。" },
  { q: "受け取ったと思う — 今どうする？", a: "支払ったりスキャンしたりせず、カードに記載の番号で公式アプリ経由で確認し、1930とcybercrime.gov.inにスクリーンショット付きでゴールデンアワー内に報告し、転送した人に警告してください。" },
  { q: "ライブラリは検出とどう関係しますか？", a: "各検出はsimilarScams経由でライブラリエントリにマッピングされます（例 支払い→配送料）。チェッカーは警告サインで見るのと同じ証拠を引用します。" },
];

const ko: Faq[] = [
  { q: "사기 라이브러리에는 무엇이 있나요?", a: "인도 및 글로벌에서 본 16가지 실제 패턴 분석: 가짜 KYC, 택배 99루피 수수료, UPI QR, 구인 수수료, 디지털 체포, FASTag, 트레이딩 앱, 대출 앱, 가족 긴급, plus USPS, Royal Mail, HMRC, SSA. 각 항목은 모습, 경고 신호, 왜 통하는지, 해야 할 일, 확인 방법을 포함." },
  { q: "예시는 어떻게 선정되나요?", a: "전달된 메시지와 보고된 사례에서 편집되어 증거로逐語 인용됩니다(예 “재배송을 위해 Rs99 지불”). 합성 미끼는 만들어지지 않습니다." },
  { q: "패턴을 빠르게 인식하려면?", a: "각 항목의 4부 체크리스트 사용: 인용된 looksLike 행, 경고 신호 불릿, 설득 이유(긴급성/공포/보상) 및 공식 앱을 통한 검증 — 메시지 링크 경유가 아님." },
  { q: "택배 수수료와 UPI QR 사기의 차이는?", a: "택배 수수료는 단축 링크를 통해 택배를 받기 위해 소액 결제를 요구; UPI QR은 “받으려면 스캔”이나 PIN 입력을 요구 — 스캔은 항상 지불이며 수신이 아닙니다. 다른 탐지기 패밀리입니다." },
  { q: "받은 것 같다 — 지금 어떻게 해야 하나요?", a: "결제하거나 스캔하지 말고, 카드에 있는 번호로 공식 앱을 통해 확인하고, 스크린샷과 함께 1930 및 cybercrime.gov.in에 골든아워 내에 신고하고, 전달한 사람에게 경고하세요." },
  { q: "라이브러리는 탐지와 어떻게 관련되나요?", a: "각 탐지는 similarScams를 통해 라이브러리 항목에 매핑됩니다(예 결제 → 택배 수수료). 검사기는 경고 신호에서 보는 것과 동일한 증거를 인용합니다." },
];

const map: Record<Lang, Faq[]> = { en, es, fr, de, "pt-br": ptbr, it, ja, ko };
export default map;
