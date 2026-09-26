import type { Lang } from "../../i18n/ui";
export type Faq = { q: string; a: string };

const en: Faq[] = [
  { q: "How can I verify a suspicious message without clicking?", a: "Type the organization’s official URL yourself or open its official app, and call the number printed on your card or statement — never the number in the message. If it claims to be a bank or courier, track the reference in the official app." },
  { q: "How do I safely check a link?", a: "Don’t tap shorteners (bit.ly, tinyurl...). Preview the destination by checking for punycode xn-- spoofs, @ tricks, raw IP hosts, insecure http on login pages, and high-abuse TLDs (.zip, .top). Better to type the domain char-by-char." },
  { q: "What should I do before sending money?", a: "Say the request out loud to a family member, verify the recipient via a known number, and never pay a fee to receive a prize, refund, parcel or job. Scammers isolate; families catch what you miss." },
  { q: "How should I handle unexpected OTP or payment requests?", a: "No bank, RBI officer or wallet app ever asks for your OTP, PIN, CVV or password on any channel. If asked, stop and verify via the official app — it’s always a scam pattern." },
  { q: "What if I already clicked a suspicious link?", a: "Close it, don’t enter details, revoke any UPI mandate or app permissions you granted, change passwords on the official site, and monitor your bank. If you shared credentials, call 1930 and your bank immediately." },
  { q: "How do I protect my personal information?", a: "Don’t share ID numbers, OTPs or photos of cards via links. Store scans only in official apps, enable app lock, and never grant contacts/photos access to instant-loan apps." },
  { q: "What to do after interacting with a suspicious site?", a: "Run ScamLens on the link/message again to see quoted evidence, report within the golden hour at 1930 and cybercrime.gov.in with screenshots and transaction IDs, and warn whoever forwarded it." },
];

const es: Faq[] = [
  { q: "¿Cómo verifico un mensaje sospechoso sin hacer clic?", a: "Escribe tú mismo la URL oficial o abre la app oficial y llama al número impreso en tu tarjeta — nunca al del mensaje. Si dice ser banco o mensajería, rastrea la referencia en la app oficial." },
  { q: "¿Cómo reviso un enlace de forma segura?", a: "No toques acortadores (bit.ly etc.). Revisa si hay punycode xn--, truco @, IP directa, http inseguro en login y TLD de alto abuso (.zip, .top). Mejor escribe el dominio letra por letra." },
  { q: "¿Qué hacer antes de enviar dinero?", a: "Dil o en voz alta a un familiar, verifica al destinatario por un número conocido y nunca pagues una tarifa para recibir premio, reembolso, paquete o empleo. Los estafadores aíslan; las familias detectan." },
  { q: "¿Cómo manejo solicitudes inesperadas de OTP o pago?", a: "Ningún banco, RBI o billetera pide jamás tu OTP, PIN, CVV o contraseña por ningún canal. Si te lo piden, detente y verifica por la app oficial — siempre es patrón de estafa." },
  { q: "¿Qué si ya hice clic en un enlace sospechoso?", a: "Ciérralo, no introduzcas datos, revoca cualquier mandato UPI o permiso concedido, cambia contraseñas en el sitio oficial y vigila tu banco. Si compartiste credenciales, llama al 1930 y a tu banco de inmediato." },
  { q: "¿Cómo protejo mi información personal?", a: "No compartas Aadhaar, PAN, OTP o fotos de tarjetas vía enlaces. Guarda escaneos solo en apps oficiales, activa bloqueo de app y nunca des acceso a contactos/fotos a apps de préstamo instantáneo." },
  { q: "¿Qué hacer tras interactuar con un sitio sospechoso?", a: "Pasa el enlace/mensaje de nuevo por ScamLens para ver la evidencia citada, reporta en la hora de oro al 1930 y cybercrime.gov.in con capturas e IDs, y avisa a quien te lo reenvió." },
];

const fr: Faq[] = [
  { q: "Comment vérifier un message suspect sans cliquer ?", a: "Tapez vous-même l’URL officielle ou ouvrez l’app officielle et appelez le numéro sur votre carte — jamais celui du message. Si c’est banque/livraison, suivi dans l’app officielle." },
  { q: "Comment vérifier un lien en sécurité ?", a: "Ne touchez pas aux raccourcisseurs. Vérifiez punycode xn--, astuce @, IP brute, http non sécurisé sur login et TLD à haut abus (.zip, .top). Mieux vaut taper le domaine lettre par lettre." },
  { q: "Que faire avant d’envoyer de l’argent ?", a: "Dites la demande à voix haute à un proche, vérifiez le destinataire via un numéro connu et ne payez jamais de frais pour recevoir lot/remboursement/colis/emploi. Les escrocs isolent." },
  { q: "Comment gérer une demande inattendue d’OTP ou paiement ?", a: "Aucune banque, RBI ou wallet ne demande jamais OTP, PIN, CVV ou mot de passe sur aucun canal. Si demandé, arrêtez et vérifiez via l’app officielle." },
  { q: "J’ai déjà cliqué sur un lien suspect ?", a: "Fermez-le, n’entrez rien, révoquez tout mandat UPI ou permission, changez mots de passe sur le site officiel, surveillez votre banque. Si vous avez partagé des identifiants, appelez 1930 et votre banque immédiatement." },
  { q: "Comment protéger mes infos personnelles ?", a: "Ne partagez pas Aadhaar, PAN, OTP ou photos de cartes via des liens. Stockez scans seulement dans apps officielles, activez verrouillage d’app, ne donnez jamais accès contacts/photos aux apps de prêt." },
  { q: "Que faire après interaction avec un site suspect ?", a: "Repassez le lien/message dans ScamLens pour voir la preuve citée, signalez dans l’heure d’or au 1930 et cybercrime.gov.in avec captures et IDs, et avertissez l’expéditeur." },
];

const de: Faq[] = [
  { q: "Wie verifiziere ich eine verdächtige Nachricht ohne zu klicken?", a: "Tippen Sie die offizielle URL selbst ein oder öffnen Sie die offizielle App und rufen Sie die Nummer auf Ihrer Karte an — nie die Nummer aus der Nachricht." },
  { q: "Wie prüfe ich einen Link sicher?", a: "Kürzer nicht antippen. Prüfen Sie auf Punycode xn--, @-Trick, rohe IP, unsicheres http auf Login-Seiten und High-Abuse-TLDs (.zip, .top). Besser Domain Zeichen für Zeichen tippen." },
  { q: "Was vor dem Senden von Geld tun?", a: "Sagen Sie die Anfrage laut einem Familienmitglied, verifizieren Sie den Empfänger über eine bekannte Nummer und zahlen Sie nie Gebühr um Preis/Erstattung/Paket/Job zu erhalten." },
  { q: "Wie mit unerwarteter OTP- oder Zahlungsaufforderung umgehen?", a: "Keine Bank, kein RBI, keine Wallet-App fragt jemals nach OTP, PIN, CVV oder Passwort auf irgendeinem Kanal. Wenn danach gefragt wird, stoppen und über offizielle App verifizieren." },
  { q: "Was wenn ich bereits auf einen verdächtigen Link geklickt habe?", a: "Schließen, nichts eingeben, jedes UPI-Mandat oder erteilte Berechtigungen widerrufen, Passwörter auf der offiziellen Seite ändern, Bank überwachen. Bei geteilten Zugangsdaten sofort 1930 und Bank anrufen." },
  { q: "Wie schütze ich meine persönlichen Daten?", a: "Teilen Sie keine Aadhaar, PAN, OTP oder Kartenfotos via Links. Speichern Sie Scans nur in offiziellen Apps, aktivieren Sie App-Sperre, geben Sie nie Kontakte/Fotozugriff an Sofort-Kredit-Apps." },
  { q: "Was nach Interaktion mit einer verdächtigen Seite tun?", a: "Link/Nachricht erneut durch ScamLens laufen lassen um zitierte Beweise zu sehen, innerhalb der goldenen Stunde bei 1930 und cybercrime.gov.in mit Screenshots und Transaktions-IDs melden." },
];

const ptbr: Faq[] = [
  { q: "Como verificar uma mensagem suspeita sem clicar?", a: "Digite você mesmo a URL oficial ou abra o app oficial e ligue para o número impresso no seu cartão — nunca o número da mensagem." },
  { q: "Como verificar um link com segurança?", a: "Não toque em encurtadores. Verifique punycode xn--, truque @, IP cru, http inseguro em login e TLDs de alto abuso (.zip, .top). Melhor digitar o domínio letra por letra." },
  { q: "O que fazer antes de enviar dinheiro?", a: "Diga o pedido em voz alta para um familiar, verifique o destinatário via número conhecido e nunca pague taxa para receber prêmio, reembolso, pacote ou emprego." },
  { q: "Como lidar com pedido inesperado de OTP ou pagamento?", a: "Nenhum banco, RBI ou app de carteira jamais pede seu OTP, PIN, CVV ou senha em nenhum canal. Se pedirem, pare e verifique via app oficial." },
  { q: "E se já cliquei em um link suspeito?", a: "Feche, não insira dados, revogue qualquer mandato UPI ou permissão concedida, troque senhas no site oficial e monitore seu banco. Se compartilhou credenciais, ligue 1930 e seu banco imediatamente." },
  { q: "Como proteger minhas informações pessoais?", a: "Não compartilhe Aadhaar, PAN, OTP ou fotos de cartões via links. Guarde scans apenas em apps oficiais, ative bloqueio de app e nunca dê acesso a contatos/fotos a apps de empréstimo." },
  { q: "O que fazer após interagir com um site suspeito?", a: "Passe o link/mensagem novamente no ScamLens para ver a evidência citada, reporte na hora de ouro no 1930 e cybercrime.gov.in com capturas e IDs." },
];

const it: Faq[] = [
  { q: "Come verificare un messaggio sospetto senza cliccare?", a: "Digita tu stesso l'URL ufficiale o apri l'app ufficiale e chiama il numero sulla tua carta — mai quello nel messaggio." },
  { q: "Come controllare un link in sicurezza?", a: "Non toccare accorciatori. Verifica punycode xn--, trucco @, IP grezzo, http non sicuro su login e TLD ad alto abuso (.zip, .top). Meglio digitare il dominio carattere per carattere." },
  { q: "Cosa fare prima di inviare denaro?", a: "Dillo ad alta voce a un familiare, verifica il destinatario tramite un numero noto e non pagare mai una tassa per ricevere premio, rimborso, pacco o lavoro." },
  { q: "Come gestire una richiesta inaspettata di OTP o pagamento?", a: "Nessuna banca, RBI o app wallet chiede mai OTP, PIN, CVV o password su nessun canale. Se richiesto, fermati e verifica tramite app ufficiale." },
  { q: "E se ho già cliccato su un link sospetto?", a: "Chiudi, non inserire dati, revoca qualsiasi mandato UPI o permesso concesso, cambia password sul sito ufficiale e monitora la banca. Se hai condiviso credenziali, chiama subito 1930 e la tua banca." },
  { q: "Come proteggere le mie informazioni personali?", a: "Non condividere Aadhaar, PAN, OTP o foto di carte via link. Conserva scansioni solo in app ufficiali, attiva blocco app e non dare mai accesso a contatti/foto alle app di prestito." },
  { q: "Cosa fare dopo aver interagito con un sito sospetto?", a: "Ripassa link/messaggio in ScamLens per vedere la prova citata, segnala entro l'ora d'oro al 1930 e cybercrime.gov.in con screenshot e ID." },
];

const ja: Faq[] = [
  { q: "クリックせずに不審なメッセージを確認するには？", a: "組織の公式URLを自分で入力するか公式アプリを開き、カードに印刷された番号に電話してください — メッセージ内の番号にはかけないでください。" },
  { q: "リンクを安全にチェックするには？", a: "短縮URLをタップしないでください。punycode xn--、@トリック、生IP、ログイン時の非安全なhttp、高乱用TLD（.zip, .top）を確認し、ドメインを一文字ずつ入力してください。" },
  { q: "お金を送る前に何をすべき？", a: "家族に声に出して言い、知っている番号で受取人を確認し、賞品/返金/荷物/求人のために手数料を払わないでください。" },
  { q: "予期しないOTPや支払い要求はどうする？", a: "銀行、RBI職員、ウォレットアプリがOTP、PIN、CVV、パスワードを尋ねることは決してありません。求められたら止めて公式アプリで確認してください。" },
  { q: "すでに不審なリンクをクリックした場合は？", a: "閉じて、何も入力せず、UPIマンドートや付与した権限を取り消し、公式サイトでパスワードを変更し、銀行を監視してください。認証情報を共有した場合はすぐに1930と銀行に電話してください。" },
  { q: "個人情報をどう守る？", a: "Aadhaar、PAN、OTP、カード写真をリンク経由で共有しないでください。スキャンは公式アプリにのみ保存し、アプリロックを有効にし、即時ローンアプリに連絡先/写真へのアクセスを与えないでください。" },
  { q: "不審なサイトとやり取りした後は？", a: "リンク/メッセージを再度ScamLensに通して引用された証拠を見て、スクリーンショットと取引IDを添えて1930とcybercrime.gov.inにゴールデンアワー内に報告してください。" },
];

const ko: Faq[] = [
  { q: "클릭하지 않고 의심스러운 메시지를 확인하려면?", a: "조직의 공식 URL을 직접 입력하거나 공식 앱을 열고 카드에 인쇄된 번호로 전화하세요 — 메시지 안의 번호로 전화하지 마세요." },
  { q: "링크를 안전하게 확인하려면?", a: "단축 URL을 탭하지 마세요. 퓨니코드 xn--, @ 트릭, 원시 IP, 로그인 시 안전하지 않은 http, 고남용 TLD(.zip, .top)를 확인하고 도메인을 문자 그대로 입력하세요." },
  { q: "돈을 보내기 전에 무엇을 해야 하나요?", a: "가족에게 큰 소리로 말하고, 알려진 번호로 수신자를 확인하며, 상품/환불/택배/구인 제안을 받기 위해 수수료를 지불하지 마세요." },
  { q: "예상치 못한 OTP나 결제 요청은 어떻게 처리하나요?", a: "은행, RBI 직원 또는 지갑 앱이 OTP, PIN, CVV 또는 비밀번호를 묻는 일은 절대 없습니다. 요청받으면 멈추고 공식 앱을 통해 확인하세요." },
  { q: "이미 의심스러운 링크를 클릭했다면?", a: "닫고, 아무것도 입력하지 말고, UPI 위임이나 부여한 권한을 취소하고, 공식 사이트에서 비밀번호를 변경하며, 은행을 모니터링하세요. 자격 증명을 공유했다면 즉시 1930과 은행에 전화하세요." },
  { q: "개인 정보를 어떻게 보호하나요?", a: "Aadhaar, PAN, OTP 또는 카드 사진을 링크를 통해 공유하지 마세요. 스캔은 공식 앱에만 저장하고, 앱 잠금을 활성화하며, 즉시 대출 앱에 연락처/사진 접근을 허용하지 마세요." },
  { q: "의심스러운 사이트와 상호작용한 후에는?", a: "링크/메시지를 다시 ScamLens에 통과시켜 인용된 증거를 보고, 스크린샷과 거래 ID와 함께 1930 및 cybercrime.gov.in에 골든아워 내에 신고하세요." },
];

const map: Record<Lang, Faq[]> = { en, es, fr, de, "pt-br": ptbr, it, ja, ko };
export default map;
