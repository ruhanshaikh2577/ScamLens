import type { Lang } from "../../i18n/ui";

export type Faq = { q: string; a: string };

const en: Faq[] = [
  { q: "How does ScamLens analyze my message or screenshot?", a: "It redacts OTPs, card numbers and phone numbers in your browser, then runs rule-based checks for urgency, payment requests, impersonation and URL tricks, and shows the exact quoted evidence that triggered each flag." },
  { q: "What input types are supported?", a: "Message text (WhatsApp, SMS, email, Instagram), screenshot images (PNG, JPG, WEBP up to 10MB via local OCR), and links/URLs. The checker auto-detects what you pasted and switches tabs." },
  { q: "What signals does the checker look for?", a: "13 message detectors (payment request, OTP/PIN ask, urgency, fear/threat, impersonation of banks/couriers/government, reward bait, job fee, QR/UPI, investment bait, family emergency, utility disconnection, loan app, shorteners) and 9 URL signals (shorteners, punycode, raw IP, http, @ trick, APK, high-abuse TLDs, credential params, brand mismatch)." },
  { q: "Why is it decision support, not a guaranteed verdict?", a: "Language patterns alone never prove a scam. ScamLens shows warning signs it can detect, not certainty. A Low result means no common markers were found — always verify important requests via official channels." },
  { q: "Is my data private? Does anything leave my device?", a: "Yes. Redaction and pattern matching run locally in your browser. Text stays local, screenshots are OCR’d locally via tesseract.js and never uploaded. Nothing is written to our servers." },
  { q: "What are the limitations and false positives?", a: "It’s rule-based, not AI that knows intent. It can miss novel phrasing (false negative) and flag legitimate urgent messages (false positive). Weights and thresholds are hidden to prevent evasion. Always verify via official app or number on your card." },
  { q: "How is ScamLens different from asking a generic AI chatbot?", a: "A chatbot guesses with no evidence and can hallucinate. ScamLens is deterministic: every flag cites the exact quote from your input, why it matters, and safe next steps — so you learn the pattern for next time." },
];

const es: Faq[] = [
  { q: "¿Cómo analiza ScamLens mi mensaje o captura?", a: "Oculta OTPs, tarjetas y teléfonos en tu navegador, luego aplica reglas de urgencia, pagos, suplantación y trucos de enlaces, y muestra la cita exacta que activó cada alerta." },
  { q: "¿Qué tipos de entrada son compatibles?", a: "Texto de mensaje (WhatsApp, SMS, email, Instagram), capturas PNG/JPG/WEBP hasta 10 MB vía OCR local, y enlaces/URLs. El verificador detecta automáticamente y cambia de pestaña." },
  { q: "¿Qué señales revisa el verificador?", a: "13 detectores de mensaje (pago, OTP/PIN, urgencia, amenaza, suplantación de banco/mensajería/gobierno, premio, empleo con tarifa, QR/UPI, inversión, familiar, corte de luz, préstamo, acortadores) y 9 señales de URL (acortadores, punycode, IP, http, truco @, APK, TLD de alto abuso, credenciales en query, marca)." },
  { q: "¿Por qué es apoyo para decidir y no un veredicto garantizado?", a: "Los patrones de lenguaje solos nunca prueban una estafa. ScamLens muestra señales detectables, no certeza. Un resultado Bajo significa que no se hallaron marcadores comunes — verifica siempre por canales oficiales." },
  { q: "¿Mis datos son privados? ¿Algo sale de mi dispositivo?", a: "Sí. La ocultación y el análisis ocurren localmente en tu navegador. El texto queda local, las capturas se procesan con OCR local y nunca se suben. Nada se guarda en servidores." },
  { q: "¿Cuáles son las limitaciones y los falsos positivos?", a: "Es basado en reglas, no IA que conoce la intención. Puede perder frases nuevas (falso negativo) y marcar mensajes legítimos urgentes (falso positivo). Pesos y umbrales están ocultos. Verifica siempre por la app oficial." },
  { q: "¿En qué se diferencia de preguntar a un chatbot IA genérico?", a: "Un chatbot adivina sin evidencia y puede alucinar. ScamLens es determinista: cada alerta cita la frase exacta de tu mensaje, por qué importa y qué hacer — así aprendes el patrón." },
];

const fr: Faq[] = [
  { q: "Comment ScamLens analyse-t-il mon message ou capture ?", a: "Il masque OTP, cartes et téléphones dans votre navigateur, puis applique des règles d’urgence, paiements, usurpation et astuces de liens, et montre la citation exacte qui a déclenché chaque alerte." },
  { q: "Quels types d’entrée sont pris en charge ?", a: "Texte de message (WhatsApp, SMS, email, Instagram), captures PNG/JPG/WEBP jusqu’à 10 Mo via OCR local, et liens/URLs. Le vérificateur détecte automatiquement et change d’onglet." },
  { q: "Quels signaux le vérificateur recherche-t-il ?", a: "13 détecteurs de message (paiement, OTP/PIN, urgence, menace, usurpation banque/livraison/gouvernement, lot, emploi avec frais, QR/UPI, investissement, famille, coupure électricité, prêt, raccourcisseurs) et 9 signaux d’URL (raccourcisseurs, punycode, IP, http, astuce @, APK, TLD à haut abus, identifiants en query, marque)." },
  { q: "Pourquoi est-ce une aide à la décision, pas un verdict garanti ?", a: "Les schémas de langage seuls ne prouvent jamais une arnaque. ScamLens montre les signaux détectables, pas la certitude. Un résultat Faible signifie qu’aucun marqueur commun n’a été trouvé — vérifiez toujours via les canaux officiels." },
  { q: "Mes données sont-elles privées ? Rien ne quitte mon appareil ?", a: "Oui. Masquage et vérification sont locaux dans votre navigateur. Le texte reste local, les captures sont OCR localement et jamais téléversées. Rien n’est écrit sur nos serveurs." },
  { q: "Quelles sont les limites et faux positifs ?", a: "C’est basé sur des règles, pas une IA qui connaît l’intention. Peut manquer de nouvelles formulations (faux négatif) et signaler des messages légitimes urgents (faux positif). Poids et seuils sont cachés. Vérifiez toujours via l’app officielle." },
  { q: "En quoi est-ce différent de demander à un chatbot IA générique ?", a: "Un chatbot devine sans preuve et peut halluciner. ScamLens est déterministe : chaque alerte cite la phrase exacte de votre message, pourquoi elle compte et quoi faire — vous apprenez le schéma." },
];

const de: Faq[] = [
  { q: "Wie analysiert ScamLens meine Nachricht oder meinen Screenshot?", a: "Es schwärzt OTPs, Karten und Telefonnummern im Browser, führt dann regelbasierte Prüfungen für Dringlichkeit, Zahlungen, Imitation und Link-Tricks durch und zeigt das exakte Zitat, das jede Markierung ausgelöst hat." },
  { q: "Welche Eingabetypen werden unterstützt?", a: "Nachrichtentext (WhatsApp, SMS, E-Mail, Instagram), Screenshot-Bilder (PNG, JPG, WEBP bis 10 MB via lokales OCR) und Links/URLs. Der Prüfer erkennt automatisch und wechselt Tabs." },
  { q: "Welche Signale prüft der Checker?", a: "13 Nachrichten-Detektoren (Zahlung, OTP/PIN, Dringlichkeit, Drohung, Imitation von Bank/Kurier/Behörde, Gewinn-Köder, Job-Gebühr, QR/UPI, Investment-Köder, Familiennotfall, Strom-Sperre, Kredit-App, Kürzer) und 9 URL-Signale (Kürzer, Punycode, rohe IP, http, @-Trick, APK, High-Abuse-TLDs, Zugangsdaten-Params, Marken-Mismatch)." },
  { q: "Warum ist es Entscheidungshilfe, kein garantiertes Urteil?", a: "Sprachmuster allein beweisen nie Betrug. ScamLens zeigt Warnzeichen, die es erkennen kann, keine Gewissheit. Niedrig bedeutet keine gemeinsamen Marker gefunden — immer über offizielle Kanäle verifizieren." },
  { q: "Sind meine Daten privat? Verlässt etwas mein Gerät?", a: "Ja. Schwärzung und Prüfung laufen lokal im Browser. Text bleibt lokal, Screenshots werden lokal per OCR verarbeitet und nie hochgeladen. Nichts wird auf Servern geschrieben." },
  { q: "Was sind Einschränkungen und False Positives?", a: "Regelbasiert, keine KI die Absicht kennt. Kann neue Formulierungen verpassen (false negative) und legitime dringende Nachrichten markieren (false positive). Gewichte und Schwellen sind verborgen. Immer über offizielle App verifizieren." },
  { q: "Worin unterscheidet es sich von einem generischen KI-Chatbot?", a: "Ein Chatbot rät ohne Beweise und kann halluzinieren. ScamLens ist deterministisch: Jede Markierung zitiert das exakte Zitat aus Ihrer Eingabe, warum es wichtig ist und sichere nächste Schritte — so lernen Sie das Muster." },
];

const ptbr: Faq[] = [
  { q: "Como o ScamLens analisa minha mensagem ou captura?", a: "Ele oculta OTPs, cartões e telefones no navegador, depois aplica verificações baseadas em regras para urgência, pagamentos, impersonação e truques de links, e mostra a citação exata que disparou cada alerta." },
  { q: "Quais tipos de entrada são suportados?", a: "Texto de mensagem (WhatsApp, SMS, e-mail, Instagram), imagens de captura (PNG, JPG, WEBP até 10 MB via OCR local) e links/URLs. O verificador detecta automaticamente e troca de aba." },
  { q: "Quais sinais o verificador procura?", a: "13 detectores de mensagem (pagamento, OTP/PIN, urgência, ameaça, impersonação de banco/correio/governo, prêmio, emprego com taxa, QR/UPI, investimento, família, corte de luz, empréstimo, encurtadores) e 9 sinais de URL (encurtadores, punycode, IP, http, truque @, APK, TLD de alto abuso, credenciais em query, marca)." },
  { q: "Por que é apoio à decisão, não veredito garantido?", a: "Padrões de linguagem sozinhos nunca provam golpe. ScamLens mostra sinais detectáveis, não certeza. Resultado Baixo significa nenhum marcador comum encontrado — sempre verifique por canais oficiais." },
  { q: "Meus dados são privados? Algo sai do meu dispositivo?", a: "Sim. Ocultação e verificação são locais no navegador. Texto fica local, capturas são OCR localmente e nunca enviadas. Nada é escrito em servidores." },
  { q: "Quais são as limitações e falsos positivos?", a: "É baseado em regras, não IA que conhece intenção. Pode perder novas formulações (falso negativo) e sinalizar mensagens legítimas urgentes (falso positivo). Pesos e limiares são ocultos. Sempre verifique via app oficial." },
  { q: "Como difere de perguntar a um chatbot de IA genérico?", a: "Um chatbot chuta sem evidência e pode alucinar. ScamLens é determinístico: cada alerta cita a frase exata da sua mensagem, por que importa e próximos passos seguros — você aprende o padrão." },
];

const it: Faq[] = [
  { q: "Come ScamLens analizza il mio messaggio o screenshot?", a: "Oscura OTP, carte e telefoni nel browser, poi esegue controlli basati su regole per urgenza, pagamenti, impersonificazione e trucchi di link e mostra la citazione esatta che ha attivato ogni segnalazione." },
  { q: "Quali tipi di input sono supportati?", a: "Testo di messaggio (WhatsApp, SMS, email, Instagram), immagini screenshot (PNG, JPG, WEBP fino a 10 MB via OCR locale) e link/URL. Il verificatore rileva automaticamente e cambia scheda." },
  { q: "Quali segnali controlla il verificatore?", a: "13 rilevatori di messaggio (pagamento, OTP/PIN, urgenza, minaccia, impersonificazione banca/corriere/governo, premio, lavoro con tassa, QR/UPI, investimento, famiglia, distacco luce, app prestito, accorciatori) e 9 segnali URL (accorciatori, punycode, IP, http, trucco @, APK, TLD ad alto abuso, credenziali in query, marchio)." },
  { q: "Perché è supporto decisionale, non un verdetto garantito?", a: "Gli schemi linguistici da soli non provano mai una truffa. ScamLens mostra segnali rilevabili, non certezza. Basso significa nessun marcatore comune trovato — verifica sempre tramite canali ufficiali." },
  { q: "I miei dati sono privati? Nulla lascia il mio dispositivo?", a: "Sì. Oscuramento e verifica sono locali nel browser. Il testo rimane locale, gli screenshot sono OCR localmente e mai caricati. Nulla viene scritto sui server." },
  { q: "Quali sono i limiti e i falsi positivi?", a: "È basato su regole, non IA che conosce l'intento. Può perdere nuove formulazioni (falso negativo) e segnalare messaggi legittimi urgenti (falso positivo). Pesi e soglie sono nascosti. Verifica sempre tramite app ufficiale." },
  { q: "In cosa differisce dal chiedere a un chatbot IA generico?", a: "Un chatbot indovina senza prove e può allucinare. ScamLens è deterministico: ogni segnalazione cita la frase esatta del tuo input, perché conta e passi sicuri successivi — così impari lo schema." },
];

const ja: Faq[] = [
  { q: "ScamLensはメッセージやスクリーンショットをどう解析しますか？", a: "ブラウザ内でOTP、カード番号、電話番号をマスクしてから、緊急性・支払い・なりすまし・リンクのトリックに関するルールベースのチェックを実行し、各フラグをトリガーした正確な引用を表示します。" },
  { q: "どの入力タイプがサポートされていますか？", a: "メッセージテキスト（WhatsApp、SMS、メール、Instagram）、スクリーンショット画像（PNG、JPG、WEBP 最大10MB、ローカルOCR）、リンク/URL。チェッカーは自動で判定しタブを切り替えます。" },
  { q: "チェッカーはどんなシグナルを見ますか？", a: "13のメッセージディテクター（支払い要求、OTP/PIN、緊急性、脅迫、銀行/配送/政府のなりすまし、報酬ベイト、求人手数料、QR/UPI、投資ベイト、家族緊急、電気停止、ローンアプリ、短縮URL）と9のURLシグナル（短縮、punycode、生IP、http、@トリック、APK、高乱用TLD、認証情報パラメータ、ブランド不一致）。" },
  { q: "なぜ保証された判定ではなく意思決定支援なのですか？", a: "言語パターンだけで詐欺を証明することはできません。ScamLensは検出可能な警告サインを示すだけで、確実性ではありません。低リスクは一般的なマーカーが見つからなかったことを意味します — 常に公式チャネルで確認してください。" },
  { q: "データはプライベートですか？デバイス外に出ますか？", a: "はい。マスクと解析はブラウザ内でローカルに実行されます。テキストはローカルに留まり、スクリーンショットはローカルOCRされアップロードされません。サーバーには何も書き込まれません。" },
  { q: "制限や誤検知は？", a: "ルールベースで、意図を知るAIではありません。新しい言い回しを見逃したり（偽陰性）、正当な緊急メッセージをフラグしたり（偽陽性）する可能性があります。重みと閾値は非公開です。常に公式アプリで確認してください。" },
  { q: "汎用AIチャットボットに聞くのとどう違いますか？", a: "チャットボットは証拠なく推測し幻覚を見ることがあります。ScamLensは決定論的です：各フラグはあなたの入力からの正確な引用、なぜ重要か、安全な次のステップを示すので次回のためのパターンを学べます。" },
];

const ko: Faq[] = [
  { q: "ScamLens는 내 메시지나 스크린샷을 어떻게 분석하나요?", a: "브라우저에서 OTP, 카드 번호, 전화번호를 가린 뒤 긴급성, 결제, 사칭 및 링크 트릭에 대한 규칙 기반 검사를 실행하고 각 플래그를 트리거한 정확한 인용을 보여줍니다." },
  { q: "어떤 입력 유형이 지원되나요?", a: "메시지 텍스트(WhatsApp, SMS, 이메일, Instagram), 스크린샷 이미지(PNG, JPG, WEBP 최대 10MB 로컬 OCR), 링크/URL. 검사기가 자동으로 감지하고 탭을 전환합니다." },
  { q: "검사기는 어떤 신호를 찾나요?", a: "13개 메시지 탐지기(결제, OTP/PIN, 긴급성, 위협, 은행/택배/정부 사칭, 보상 미끼, 구인 수수료, QR/UPI, 투자 미끼, 가족 긴급, 전기 차단, 대출 앱, 단축 URL)와 9개 URL 신호(단축, 퓨니코드, 원시 IP, http, @ 트릭, APK, 고남용 TLD, 자격 증명 파라미터, 브랜드 불일치)." },
  { q: "왜 보장된 판정이 아닌 의사결정 지원인가요?", a: "언어 패턴만으로 사기를 증명할 수 없습니다. ScamLens는 감지 가능한 경고 신호를 보여줄 뿐 확실성이 아닙니다. 낮음은 일반적인 마커가 발견되지 않았음을 의미합니다 — 항상 공식 채널을 통해 확인하세요." },
  { q: "내 데이터는 비공개인가요? 기기 외부로 나가나요?", a: "예. 가리기와 검사는 브라우저에서 로컬로 실행됩니다. 텍스트는 로컬에 머물고 스크린샷은 로컬 OCR되며 절대 업로드되지 않습니다. 서버에 아무것도 기록되지 않습니다." },
  { q: "제한과 오탐은 무엇인가요?", a: "규칙 기반이며 의도를 아는 AI가 아닙니다. 새로운 문구를 놓치거나(위음성) 합법적인 긴급 메시지를 플래그할 수 있습니다(위양성). 가중치와 임계값은 숨겨져 있습니다. 항상 공식 앱을 통해 확인하세요." },
  { q: "일반 AI 챗봇에 묻는 것과 어떻게 다른가요?", a: "챗봇은 증거 없이 추측하고 환각할 수 있습니다. ScamLens는 결정론적입니다: 각 플래그는 입력에서 나온 정확한 인용, 왜 중요한지, 안전한 다음 단계를 보여주므로 다음을 위한 패턴을 배웁니다." },
];

const map: Record<Lang, Faq[]> = { en, es, fr, de, "pt-br": ptbr, it, ja, ko };
export default map;
