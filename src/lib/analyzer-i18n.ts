import type { RiskLevel } from "./analyzer";

// User-facing analyzer output (finding labels, next steps, headlines,
// disclaimer, share-card lines) in every supported language. The analyzer
// stays pure: analyze(input, kind, lang) picks a table, English on fallback.
// Server/API/webhooks call it without lang and keep English.

export interface AnalyzerStrings {
  headlines: Record<RiskLevel, string>;
  labels: Record<string, string>;
  steps: Record<string, string>;
  lowSteps: [string, string];
  verifyLine: string;
  disclaimer: string;
  shareNoMarkers: string;
  shareFooter: string;
  shareDisclaimer: string;
}

export interface PartialAnalyzerStrings {
  headlines?: Partial<Record<RiskLevel, string>>;
  labels?: Record<string, string>;
  steps?: Record<string, string>;
  lowSteps?: [string, string];
  verifyLine?: string;
  disclaimer?: string;
  shareNoMarkers?: string;
  shareFooter?: string;
  shareDisclaimer?: string;
}

const en: AnalyzerStrings = {
  headlines: {
    low: "No common scam markers found",
    medium: "Some warning signs present",
    high: "Strong scam warning signs",
    critical: "Classic scam pattern detected",
  },
  labels: {
    "payment-request": "Payment request",
    "otp-pin": "Asks for OTP, PIN or password",
    "credential-request": "Asks for a personal ID or account credential",
    urgency: "Artificial urgency",
    "fear-threat": "Fear or legal threat",
    impersonation: "Impersonates a bank, courier or agency",
    "reward-bait": "Prize or reward bait",
    "job-fee": "Too-good job with upfront fee",
    "qr-upi": "QR code or payment handle to 'receive' money",
    "investment-bait": "Guaranteed-return investment bait",
    "family-emergency": "'Family member from a new number' pattern",
    "utility-disconnection": "Utility disconnection threat tonight",
    "loan-app": "Instant loan with upfront fee",
    "text-shortener": "Shortened link inside the message",
    "url-shortener": "Shortened link hides the real destination",
    "url-punycode": "Look-alike characters in domain (possible spoof)",
    "url-ip": "Raw IP address instead of a domain",
    "url-insecure-http": "Insecure http:// link — no encryption for whatever you type next",
    "url-userinfo": "\u201C@\u201D trick — the real destination hides before the @",
    "url-apk": "Direct APK download — a common way to install SMS-stealing malware",
    "url-tld": "High-abuse domain ending (.{tld}) — heavily used by phishing kits",
    "url-credentials": "Sensitive fields in the link itself — never enter details on a pre-filled page",
    "url-brand-mismatch": "Domain pretends to be {brand} but isn't the official site",
  },
  steps: {
    "payment-request":
      "Never pay a fee to receive money, a prize, a refund, a parcel or a job offer. Legitimate organisations don't work this way.",
    "otp-pin":
      "No bank, wallet or government agency ever asks for your OTP, PIN or password — not by call, SMS or email.",
    "credential-request":
      "No agency, bank or employer asks you to send an ID or account number over SMS, chat or email. Open the official app or site yourself and check there.",
    urgency:
      "Slow down. Urgency is the scammer's main tool — real institutions give you time and never punish you for verifying.",
    "fear-threat":
      "Police and tax authorities never threaten arrest over WhatsApp or a video call, and never demand payment to 'clear your name'.",
    impersonation:
      "Contact the organisation using the number on its official website or app — never the contact details in this message.",
    "reward-bait":
      "You can't win a lottery you never entered, and refunds are processed inside the official app — never via a link or a 'claim' fee.",
    "job-fee":
      "Real employers never charge you to apply or start. Any 'task pay' that arrives as an instant mobile deposit is bait for a bigger loss.",
    "qr-upi":
      "You never scan a QR code or enter a PIN to RECEIVE money — only to pay. That's the whole trick.",
    "investment-bait":
      "Guaranteed returns don't exist in real markets, and no registered adviser recruits via chat groups. Verify any adviser with your country's securities regulator before sending money.",
    "family-emergency":
      "Call the person on their old number before replying. No genuine emergency survives a callback to a known number.",
    "utility-disconnection":
      "Utilities never demand instant payment over calls or texts. Open your provider's official app and check the bill yourself.",
    "loan-app":
      "Real lenders deduct fees at disbursal — they never ask for pre-payment to release funds. Check your country's registered-lender list before touching such an app.",
    "text-shortener":
      "Don't tap the short link — type the organisation's official address yourself instead. Shorteners exist to hide look-alike domains.",
  },
  lowSteps: [
    "Stay cautious anyway: don't click links in unexpected messages.",
    "If it claims to be from a company, open their official app or website yourself instead of trusting this message.",
  ],
  verifyLine:
    "Verify by contacting the organisation using the number on their official website or app — never the one in this message.",
  disclaimer:
    "Decision support, not a guarantee. Language patterns alone never prove a scam — verify via official channels.",
  shareNoMarkers: "No common scam markers found — still verify via official channels.",
  shareFooter: "Verify: scamlens.in/how-it-works",
  shareDisclaimer: "Decision support, not a guarantee. Verify via official channels.",
};

// Filled per locale (translation passes). Missing keys fall back to English.
const locales: Record<string, PartialAnalyzerStrings> = {
  es: {
    headlines: {
      low: "No se encontraron indicadores comunes de estafa",
      medium: "Hay algunas señales de advertencia",
      high: "Señales claras de advertencia de estafa",
      critical: "Patrón clásico de estafa detectado",
    },
    labels: {
      "payment-request": "Solicitud de pago",
      "otp-pin": "Pide OTP, PIN o contraseña",
      "credential-request": "Solicita un documento de identidad o credenciales bancarias",
      urgency: "Urgencia artificial",
      "fear-threat": "Miedo o amenaza legal",
      impersonation: "Suplanta un banco, mensajería o agencia",
      "reward-bait": "Premio o recompensa como carnada",
      "job-fee": "Empleo demasiado bueno con pago por adelantado",
      "qr-upi": "Código QR o cuenta de pago para «recibir» dinero",
      "investment-bait": "Inversión con rentabilidad garantizada como carnada",
      "family-emergency": "Patrón de «familiar con un número nuevo»",
      "utility-disconnection": "Amenaza de corte de servicio esta noche",
      "loan-app": "Préstamo instantáneo con pago por adelantado",
      "text-shortener": "Enlace acortado dentro del mensaje",
      "url-shortener": "Enlace acortado que oculta el destino real",
      "url-punycode": "Caracteres parecidos en el dominio (posible suplantación)",
      "url-ip": "Dirección IP en lugar de un dominio",
      "url-insecure-http": "Enlace http:// inseguro — sin cifrado para lo que escribas después",
      "url-userinfo": "Truco del \u201C@\u201D — el destino real se oculta antes del @",
      "url-apk": "Descarga directa de APK — forma común de instalar malware que roba SMS",
      "url-tld": "Terminación de dominio muy abusada (.{tld}) — muy usada por kits de phishing",
      "url-credentials": "Datos sensibles en el propio enlace — nunca ingreses datos en una página prerrellenada",
      "url-brand-mismatch": "El dominio finge ser {brand} pero no es el sitio oficial",
    },
    steps: {
      "payment-request":
        "Nunca pagues una tarifa para recibir dinero, un premio, un reembolso, un paquete o una oferta de empleo. Las organizaciones legítimas no funcionan así.",
      "otp-pin":
        "Ningún banco, billetera o agencia del gobierno te pide tu OTP, PIN o contraseña — ni por llamada, SMS o correo.",
      "credential-request":
        "Ninguna agencia, banco o empleador te pedirá enviar un documento o número de cuenta por SMS, chat o correo. Abre tú mismo la app o el sitio oficial y comprueba allí.",
      urgency:
        "Tómate tu tiempo. La urgencia es la principal herramienta del estafador — las instituciones reales te dan tiempo y nunca te castigan por verificar.",
      "fear-threat":
        "La policía y las autoridades fiscales nunca amenazan con arrestarte por WhatsApp o videollamada, ni exigen pagos para «limpiar tu nombre».",
      impersonation:
        "Contacta a la organización usando el número de su sitio web o app oficial — nunca los datos de contacto de este mensaje.",
      "reward-bait":
        "No puedes ganar una lotería en la que nunca participaste, y los reembolsos se procesan dentro de la app oficial — nunca con un enlace ni una tarifa de «reclamo».",
      "job-fee":
        "Los empleadores reales nunca te cobran por postularte o empezar. Cualquier «pago por tareas» que llegue como depósito móvil instantáneo es carnada para una pérdida mayor.",
      "qr-upi":
        "Nunca escaneas un código QR ni ingresas un PIN para RECIBIR dinero — solo para pagar. Ese es todo el truco.",
      "investment-bait":
        "Las ganancias garantizadas no existen en los mercados reales, y ningún asesor registrado recluta por grupos de chat. Verifica a cualquier asesor con el regulador de valores de tu país antes de enviar dinero.",
      "family-emergency":
        "Llama a la persona a su número de siempre antes de responder. Ninguna emergencia real resiste una devolución de llamada a un número conocido.",
      "utility-disconnection":
        "Las empresas de servicios nunca exigen pago inmediato por llamadas o mensajes. Abre la app oficial de tu proveedor y revisa la factura tú mismo.",
      "loan-app":
        "Los prestamistas reales descuentan las tarifas al desembolsar — nunca piden pagos anticipados para liberar fondos. Revisa la lista de prestamistas registrados de tu país antes de usar esa app.",
      "text-shortener":
        "No toques el enlace corto — escribe tú mismo la dirección oficial de la organización. Los acortadores sirven para ocultar dominios parecidos.",
    },
    lowSteps: [
      "De todos modos mantente alerta: no hagas clic en enlaces de mensajes inesperados.",
      "Si dice ser de una empresa, abre tú mismo su app o sitio web oficial en lugar de confiar en este mensaje.",
    ],
    verifyLine:
      "Verifica contactando a la organización con el número de su sitio web o app oficial — nunca el de este mensaje.",
    disclaimer:
      "Apoyo para decidir, no una garantía. Los patrones de lenguaje por sí solos nunca prueban una estafa — verifica por canales oficiales.",
    shareNoMarkers: "No se encontraron indicadores comunes de estafa — verifica de todos modos por canales oficiales.",
    shareFooter: "Verifica: scamlens.in/how-it-works",
    shareDisclaimer: "Apoyo para decidir, no una garantía. Verifica por canales oficiales.",
  },
  fr: {
    headlines: {
      low: "Aucun marqueur d'arnaque courant détecté",
      medium: "Quelques signaux d'alerte présents",
      high: "Signes d'arnaque marqués",
      critical: "Schéma d'arnaque classique détecté",
    },
    labels: {
      "payment-request": "Demande de paiement",
      "otp-pin": "Demande de code OTP, PIN ou mot de passe",
      "credential-request": "Demande une pièce d'identité ou des identifiants bancaires",
      urgency: "Urgence artificielle",
      "fear-threat": "Peur ou menace juridique",
      impersonation: "Se fait passer pour une banque, un livreur ou un organisme",
      "reward-bait": "Appât au lot ou à la récompense",
      "job-fee": "Emploi trop beau avec frais initiaux",
      "qr-upi": "QR code ou identifiant de paiement pour « recevoir » de l'argent",
      "investment-bait": "Appât d'investissement à rendement garanti",
      "family-emergency": "Schéma « proche en détresse depuis un nouveau numéro »",
      "utility-disconnection": "Menace de coupure d'électricité ce soir",
      "loan-app": "Prêt instantané avec frais initiaux",
      "text-shortener": "Lien raccourci dans le message",
      "url-shortener": "Lien raccourci qui masque la vraie destination",
      "url-punycode": "Caractères sosies dans le domaine (usurpation possible)",
      "url-ip": "Adresse IP brute au lieu d'un nom de domaine",
      "url-insecure-http": "Lien http:// non sécurisé — aucune protection pour ce que vous saisissez ensuite",
      "url-userinfo": "Astuce du « @ » — la vraie destination se cache avant le @",
      "url-apk": "Téléchargement APK direct — un moyen courant d'installer un logiciel espion volant les SMS",
      "url-tld": "Extension de domaine très exploitée (.{tld}) — très utilisée par les kits d'hameçonnage",
      "url-credentials": "Données sensibles dans le lien lui-même — ne saisissez jamais vos informations sur une page pré-remplie",
      "url-brand-mismatch": "Le domaine se fait passer pour {brand} mais n'est pas le site officiel",
    },
    steps: {
      "payment-request":
        "Ne payez jamais de frais pour recevoir de l'argent, un lot, un remboursement, un colis ou une offre d'emploi. Les organismes légitimes ne fonctionnent jamais ainsi.",
      "otp-pin":
        "Aucune banque, aucun portefeuille ni organisme public ne vous demande votre code OTP, PIN ou mot de passe — ni par appel, ni par SMS, ni par e-mail.",
      "credential-request":
        "Aucun organisme, banque ou employeur ne vous demandera d'envoyer un document ou un numéro de compte par SMS, chat ou e-mail. Ouvrez vous-même l'application ou le site officiel et vérifiez-y.",
      urgency:
        "Ralentissez. L'urgence est l'outil principal des arnaqueurs — les vraies institutions vous laissent du temps et ne vous punissent jamais de vérifier.",
      "fear-threat":
        "La police et les impôts ne menacent jamais d'arrestation via WhatsApp ou appel vidéo, et n'exigent jamais de paiement pour « blanchir votre nom ».",
      impersonation:
        "Contactez l'organisme via le numéro sur son site officiel ou son application — jamais via les coordonnées de ce message.",
      "reward-bait":
        "On ne gagne pas une loterie à laquelle on n'a pas participé, et les remboursements se font dans l'application officielle — jamais via un lien ou des « frais de dossier ».",
      "job-fee":
        "Les vrais employeurs ne vous font jamais payer pour postuler ou commencer. Tout « salaire de tâche » versé en dépôt mobile instantané est un appât pour une perte plus grande.",
      "qr-upi":
        "On ne scanne jamais un QR code ni ne saisit un PIN pour RECEVOIR de l'argent — uniquement pour payer. C'est toute l'astuce.",
      "investment-bait":
        "Les rendements garantis n'existent pas sur les vrais marchés, et aucun conseiller agréé ne recrute via des groupes de discussion. Vérifiez tout conseiller auprès du régulateur financier de votre pays avant d'envoyer de l'argent.",
      "family-emergency":
        "Rappelez la personne sur son ancien numéro avant de répondre. Aucune vraie urgence ne résiste à un rappel vers un numéro connu.",
      "utility-disconnection":
        "Les fournisseurs d'énergie n'exigent jamais un paiement immédiat par appel ou SMS. Ouvrez l'application officielle de votre fournisseur et vérifiez la facture vous-même.",
      "loan-app":
        "Les vrais prêteurs déduisent les frais au déblocage — ils ne demandent jamais de prépaiement pour libérer les fonds. Consultez la liste des prêteurs agréés de votre pays avant d'utiliser une telle application.",
      "text-shortener":
        "Ne touchez pas au lien raccourci — saisissez vous-même l'adresse officielle de l'organisme. Les raccourcisseurs servent à masquer des domaines sosies.",
    },
    lowSteps: [
      "Restez prudent malgré tout : ne cliquez pas sur les liens des messages inattendus.",
      "Si le message prétend venir d'une entreprise, ouvrez vous-même son application ou son site officiel au lieu de faire confiance à ce message.",
    ],
    verifyLine:
      "Vérifiez en contactant l'organisme via le numéro sur son site officiel ou son application — jamais celui de ce message.",
    disclaimer:
      "Aide à la décision, pas une garantie. Les indices linguistiques seuls ne prouvent jamais une arnaque — vérifiez via les canaux officiels.",
    shareNoMarkers: "Aucun marqueur d'arnaque courant détecté — vérifiez quand même via les canaux officiels.",
    shareFooter: "Vérifiez : scamlens.in/how-it-works",
    shareDisclaimer: "Aide à la décision, pas une garantie. Vérifiez via les canaux officiels.",
  },
  de: {
    headlines: {
      low: "Keine typischen Betrugsmerkmale gefunden",
      medium: "Einige Warnsignale vorhanden",
      high: "Deutliche Betrugswarnsignale",
      critical: "Klassisches Betrugsmuster erkannt",
    },
    labels: {
      "payment-request": "Zahlungsaufforderung",
      "otp-pin": "Fragt nach OTP, PIN oder Passwort",
      "credential-request": "Fordert einen Personalausweis oder Bankdaten an",
      urgency: "Künstliche Dringlichkeit",
      "fear-threat": "Angst oder rechtliche Drohung",
      impersonation: "Gibt sich als Bank, Paketdienst oder Behörde aus",
      "reward-bait": "Preis- oder Gewinnköder",
      "job-fee": "Zu guter Job mit Vorauszahlung",
      "qr-upi": "QR-Code oder Zahlungskennung zum „Empfangen“ von Geld",
      "investment-bait": "Investitionsköder mit garantierter Rendite",
      "family-emergency": "„Familienmitglied mit neuer Nummer“-Muster",
      "utility-disconnection": "Drohende Versorgersperre noch heute Nacht",
      "loan-app": "Sofortkredit mit Vorauszahlung",
      "text-shortener": "Gekürzter Link in der Nachricht",
      "url-shortener": "Gekürzter Link verbirgt das wahre Ziel",
      "url-punycode": "Ähnlich aussehende Zeichen in der Domain (mögliche Fälschung)",
      "url-ip": "Reine IP-Adresse statt einer Domain",
      "url-insecure-http": "Unsicherer http://-Link — keine Verschlüsselung für alles, was Sie als Nächstes eingeben",
      "url-userinfo": "„@“-Trick — das wahre Ziel verbirgt sich vor dem @",
      "url-apk": "Direkter APK-Download — ein gängiger Weg, SMS-stehlende Schadsoftware zu installieren",
      "url-tld": "Missbrauchsanfällige Domain-Endung (.{tld}) — wird stark von Phishing-Kits genutzt",
      "url-credentials": "Sensible Daten direkt im Link — geben Sie niemals Details auf einer vorausgefüllten Seite ein",
      "url-brand-mismatch": "Domain gibt sich als {brand} aus, ist aber nicht die offizielle Seite",
    },
    steps: {
      "payment-request":
        "Zahlen Sie niemals eine Gebühr, um Geld, einen Preis, eine Rückerstattung, ein Paket oder ein Jobangebot zu erhalten. Seriöse Organisationen arbeiten nicht so.",
      "otp-pin":
        "Keine Bank, kein Zahlungsanbieter und keine Behörde fragt jemals nach Ihrem OTP, Ihrer PIN oder Ihrem Passwort — weder per Anruf, SMS noch E-Mail.",
      "credential-request":
        "Keine Behörde, Bank oder Arbeitgeber bittet Sie, einen Ausweis oder eine Kontonummer per SMS, Chat oder E-Mail zu senden. Öffnen Sie selbst die offizielle App oder Website und prüfen Sie dort.",
      urgency:
        "Bleiben Sie ruhig. Dringlichkeit ist das wichtigste Werkzeug von Betrügern — seriöse Stellen geben Ihnen Zeit und bestrafen Sie niemals dafür, dass Sie etwas prüfen.",
      "fear-threat":
        "Polizei und Steuerbehörden drohen niemals per WhatsApp oder Videoanruf mit einer Festnahme und verlangen niemals eine Zahlung, um „Ihren Namen reinzuwaschen“.",
      impersonation:
        "Kontaktieren Sie die Organisation über die Nummer auf ihrer offiziellen Website oder App — niemals über die Kontaktdaten in dieser Nachricht.",
      "reward-bait":
        "Sie können keine Lotterie gewinnen, an der Sie nie teilgenommen haben, und Rückerstattungen werden in der offiziellen App abgewickelt — niemals über einen Link oder eine „Auszahlungsgebühr“.",
      "job-fee":
        "Seriöse Arbeitgeber verlangen niemals Geld für eine Bewerbung oder den Arbeitsbeginn. Jede „Aufgabenvergütung“, die als sofortige mobile Einzahlung ankommt, ist ein Köder für einen größeren Verlust.",
      "qr-upi":
        "Sie scannen niemals einen QR-Code und geben niemals eine PIN ein, um Geld zu EMPFANGEN — nur zum Bezahlen. Genau das ist der Trick.",
      "investment-bait":
        "Garantierte Renditen gibt es an echten Märkten nicht, und kein registrierter Berater wirbt über Chatgruppen an. Prüfen Sie jeden Berater bei der Wertpapieraufsicht Ihres Landes, bevor Sie Geld senden.",
      "family-emergency":
        "Rufen Sie die Person zuerst über ihre alte Nummer an, bevor Sie antworten. Kein echter Notfall hält einem Rückruf bei einer bekannten Nummer stand.",
      "utility-disconnection":
        "Versorger verlangen niemals sofortige Zahlung per Anruf oder SMS. Öffnen Sie die offizielle App Ihres Anbieters und prüfen Sie die Rechnung selbst.",
      "loan-app":
        "Seriöse Kreditgeber ziehen Gebühren bei der Auszahlung ab — sie verlangen niemals Vorauszahlungen zur Freigabe von Geldern. Prüfen Sie die Liste registrierter Kreditgeber Ihres Landes, bevor Sie eine solche App nutzen.",
      "text-shortener":
        "Tippen Sie nicht auf den Kurzlink — geben Sie stattdessen die offizielle Adresse der Organisation selbst ein. Kurzlinks dienen dazu, täuschend ähnliche Domains zu verbergen.",
    },
    lowSteps: [
      "Bleiben Sie trotzdem vorsichtig: Klicken Sie nicht auf Links in unerwarteten Nachrichten.",
      "Wenn die Nachricht angeblich von einem Unternehmen stammt, öffnen Sie selbst deren offizielle App oder Website, statt dieser Nachricht zu vertrauen.",
    ],
    verifyLine:
      "Prüfen Sie dies, indem Sie die Organisation über die Nummer auf deren offizieller Website oder App kontaktieren — niemals über die Nummer in dieser Nachricht.",
    disclaimer:
      "Entscheidungshilfe, keine Garantie. Sprachmuster allein beweisen niemals einen Betrug — prüfen Sie alles über offizielle Kanäle.",
    shareNoMarkers: "Keine typischen Betrugsmerkmale gefunden — prüfen Sie trotzdem alles über offizielle Kanäle.",
    shareFooter: "Prüfen: scamlens.in/how-it-works",
    shareDisclaimer: "Entscheidungshilfe, keine Garantie. Über offizielle Kanäle prüfen.",
  },
  "pt-br": {
    headlines: {
      low: "Nenhum indicador comum de golpe encontrado",
      medium: "Alguns sinais de alerta presentes",
      high: "Fortes sinais de alerta de golpe",
      critical: "Padrão clássico de golpe detectado",
    },
    labels: {
      "payment-request": "Pedido de pagamento",
      "otp-pin": "Pede OTP, PIN ou senha",
      "credential-request": "Solicita documento de identidade ou dados bancários",
      urgency: "Urgência artificial",
      "fear-threat": "Medo ou ameaça legal",
      impersonation: "Se passa por banco, transportadora ou órgão",
      "reward-bait": "Prêmio ou recompensa como isca",
      "job-fee": "Emprego bom demais com taxa antecipada",
      "qr-upi": "QR code ou chave de pagamento para «receber» dinheiro",
      "investment-bait": "Isca de investimento com retorno garantido",
      "family-emergency": "Padrão de «familiar com número novo»",
      "utility-disconnection": "Ameaça de corte de serviço hoje à noite",
      "loan-app": "Empréstimo instantâneo com taxa antecipada",
      "text-shortener": "Link encurtado dentro da mensagem",
      "url-shortener": "Link encurtado esconde o destino real",
      "url-punycode": "Caracteres parecidos no domínio (possível falsificação)",
      "url-ip": "Endereço IP em vez de um domínio",
      "url-insecure-http": "Link http:// inseguro — sem criptografia para o que você digitar em seguida",
      "url-userinfo": "Truque do \u201C@\u201D — o destino real se esconde antes do @",
      "url-apk": "Download direto de APK — forma comum de instalar malware que rouba SMS",
      "url-tld": "Terminação de domínio muito abusada (.{tld}) — muito usada por kits de phishing",
      "url-credentials": "Dados sensíveis no próprio link — nunca informe dados em uma página pré-preenchida",
      "url-brand-mismatch": "O domínio finge ser {brand} mas não é o site oficial",
    },
    steps: {
      "payment-request":
        "Nunca pague uma taxa para receber dinheiro, prêmio, reembolso, encomenda ou oferta de emprego. Organizações legítimas não funcionam assim.",
      "otp-pin":
        "Nenhum banco, carteira ou órgão do governo pede seu OTP, PIN ou senha — nem por ligação, SMS ou e-mail.",
      "credential-request":
        "Nenhum órgão, banco ou empregador pede que você envie um documento ou número de conta por SMS, chat ou e-mail. Abra você mesmo o app ou site oficial e verifique lá.",
      urgency:
        "Vá com calma. A urgência é a principal ferramenta do golpista — instituições reais dão tempo e nunca punem você por verificar.",
      "fear-threat":
        "Polícia e autoridades fiscais nunca ameaçam prisão por WhatsApp ou videochamada, nem exigem pagamento para «limpar seu nome».",
      impersonation:
        "Fale com a organização usando o número do site ou app oficial — nunca os contatos desta mensagem.",
      "reward-bait":
        "Você não ganha uma loteria de que nunca participou, e reembolsos são feitos dentro do app oficial — nunca por link ou taxa de «resgate».",
      "job-fee":
        "Empregadores reais nunca cobram para você se candidatar ou começar. Qualquer «pagamento por tarefas» que chega como depósito móvel instantâneo é isca para um prejuízo maior.",
      "qr-upi":
        "Você nunca escaneia um QR code nem digita um PIN para RECEBER dinheiro — só para pagar. Esse é todo o truque.",
      "investment-bait":
        "Retornos garantidos não existem em mercados reais, e nenhum assessor registrado recruta por grupos de chat. Verifique qualquer assessor com o regulador de valores do seu país antes de enviar dinheiro.",
      "family-emergency":
        "Ligue para a pessoa no número antigo antes de responder. Nenhuma emergência real resiste a uma ligação de volta para um número conhecido.",
      "utility-disconnection":
        "Concessionárias nunca exigem pagamento imediato por ligações ou mensagens. Abra o app oficial do seu fornecedor e confira a conta você mesmo.",
      "loan-app":
        "Credores reais descontam as taxas no desembolso — nunca pedem pré-pagamento para liberar fundos. Confira a lista de credores registrados do seu país antes de usar esse app.",
      "text-shortener":
        "Não toque no link curto — digite você mesmo o endereço oficial da organização. Encurtadores servem para esconder domínios parecidos.",
    },
    lowSteps: [
      "Fique atento mesmo assim: não clique em links de mensagens inesperadas.",
      "Se diz ser de uma empresa, abra você mesmo o app ou site oficial em vez de confiar nesta mensagem.",
    ],
    verifyLine:
      "Verifique falando com a organização pelo número do site ou app oficial — nunca o desta mensagem.",
    disclaimer:
      "Apoio à decisão, não uma garantia. Padrões de linguagem sozinhos nunca provam um golpe — verifique por canais oficiais.",
    shareNoMarkers: "Nenhum indicador comum de golpe encontrado — verifique mesmo assim por canais oficiais.",
    shareFooter: "Verifique: scamlens.in/how-it-works",
    shareDisclaimer: "Apoio à decisão, não uma garantia. Verifique por canais oficiais.",
  },
  it: {
    headlines: {
      low: "Nessun indicatore di truffa comune rilevato",
      medium: "Presenti alcuni segnali di avvertimento",
      high: "Forti segnali di truffa",
      critical: "Rilevato classico schema di truffa",
    },
    labels: {
      "payment-request": "Richiesta di pagamento",
      "otp-pin": "Richiede OTP, PIN o password",
      "credential-request": "Richiede un documento d'identità o credenziali bancarie",
      urgency: "Urgenza artificiale",
      "fear-threat": "Paura o minaccia legale",
      impersonation: "Si spaccia per banca, corriere o ente",
      "reward-bait": "Esca di premio o ricompensa",
      "job-fee": "Lavoro troppo bello con anticipo da pagare",
      "qr-upi": "Codice QR o identificativo di pagamento per « ricevere » denaro",
      "investment-bait": "Esca di investimento a rendimento garantito",
      "family-emergency": "Schema « familiare da un nuovo numero »",
      "utility-disconnection": "Minaccia di distacco delle utenze stasera",
      "loan-app": "Prestito istantaneo con anticipo da pagare",
      "text-shortener": "Link abbreviato dentro il messaggio",
      "url-shortener": "Link abbreviato che nasconde la vera destinazione",
      "url-punycode": "Caratteri sosia nel dominio (possibile contraffazione)",
      "url-ip": "Indirizzo IP diretto invece di un dominio",
      "url-insecure-http": "Link http:// non sicuro — nessuna protezione per ciò che digiti dopo",
      "url-userinfo": "Trucco della « @ » — la vera destinazione si nasconde prima della @",
      "url-apk": "Download APK diretto — un modo comune per installare malware che ruba gli SMS",
      "url-tld": "Estensione di dominio ad alto abuso (.{tld}) — molto usata dai kit di phishing",
      "url-credentials": "Dati sensibili dentro il link stesso — non inserire mai dati in una pagina precompilata",
      "url-brand-mismatch": "Il dominio finge di essere {brand} ma non è il sito ufficiale",
    },
    steps: {
      "payment-request":
        "Non pagare mai una commissione per ricevere denaro, un premio, un rimborso, un pacco o un'offerta di lavoro. Le organizzazioni legittime non funzionano così.",
      "otp-pin":
        "Nessuna banca, wallet o ente pubblico chiede mai OTP, PIN o password — né per chiamata, né per SMS o e-mail.",
      "credential-request":
        "Nessun ente, banca o datore di lavoro ti chiederà di inviare un documento o un numero di conto via SMS, chat o e-mail. Apri tu stesso l'app o il sito ufficiale e verifica lì.",
      urgency:
        "Rallenta. L'urgenza è lo strumento principale dei truffatori — le istituzioni vere ti danno tempo e non ti puniscono mai per aver verificato.",
      "fear-threat":
        "Polizia e fisco non minacciano mai l'arresto via WhatsApp o videochiamata, e non chiedono mai pagamenti per « ripulire il tuo nome ».",
      impersonation:
        "Contatta l'organizzazione usando il numero sul suo sito ufficiale o sull'app — mai i recapiti in questo messaggio.",
      "reward-bait":
        "Non puoi vincere una lotteria a cui non hai partecipato, e i rimborsi avvengono dentro l'app ufficiale — mai tramite link o « spese di riscossione ».",
      "job-fee":
        "I datori di lavoro veri non ti fanno mai pagare per candidarti o iniziare. Qualsiasi « paga per attività » che arriva come ricarica mobile istantanea è un'esca per una perdita maggiore.",
      "qr-upi":
        "Non si scansiona mai un codice QR né si inserisce un PIN per RICEVERE denaro — solo per pagare. È tutto qui il trucco.",
      "investment-bait":
        "I rendimenti garantiti non esistono nei mercati reali, e nessun consulente autorizzato recluta via gruppi chat. Verifica qualsiasi consulente presso l'autorità di vigilanza del tuo paese prima di inviare denaro.",
      "family-emergency":
        "Richiama la persona al suo vecchio numero prima di rispondere. Nessuna vera emergenza resiste a una richiamata a un numero conosciuto.",
      "utility-disconnection":
        "I fornitori di utenze non chiedono mai pagamenti immediati per chiamate o SMS. Apri l'app ufficiale del tuo fornitore e controlla tu stesso la bolletta.",
      "loan-app":
        "I veri finanziatori trattengono le spese all'erogazione — non chiedono mai anticipi per sbloccare i fondi. Controlla l'elenco dei finanziatori autorizzati del tuo paese prima di usare una simile app.",
      "text-shortener":
        "Non toccare il link abbreviato — digita tu stesso l'indirizzo ufficiale dell'organizzazione. Gli abbreviatori servono a nascondere domini sosia.",
    },
    lowSteps: [
      "Resta comunque prudente: non cliccare sui link nei messaggi inattesi.",
      "Se sostiene di essere di un'azienda, apri tu stesso la sua app o il suo sito ufficiale invece di fidarti di questo messaggio.",
    ],
    verifyLine:
      "Verifica contattando l'organizzazione usando il numero sul suo sito ufficiale o sull'app — mai quello in questo messaggio.",
    disclaimer:
      "Supporto decisionale, non una garanzia. Gli indizi linguistici da soli non provano mai una truffa — verifica tramite i canali ufficiali.",
    shareNoMarkers: "Nessun indicatore di truffa comune rilevato — verifica comunque tramite i canali ufficiali.",
    shareFooter: "Verifica: scamlens.in/how-it-works",
    shareDisclaimer: "Supporto decisionale, non una garanzia. Verifica tramite i canali ufficiali.",
  },
  ja: {
    headlines: {
      low: "よくある詐欺の兆候は見つかりませんでした",
      medium: "注意すべき兆候がいくつかあります",
      high: "強い詐欺の警告サインがあります",
      critical: "典型的な詐欺のパターンが検出されました",
    },
    labels: {
      "payment-request": "支払いの要求",
      "otp-pin": "OTP・暗証番号・パスワードを要求しています",
      "credential-request": "個人番号や銀行認証情報を要求しています",
      urgency: "人為的な緊急感の演出",
      "fear-threat": "不安をあおる脅迫や法的脅威",
      impersonation: "銀行・配送業者・公的機関へのなりすまし",
      "reward-bait": "賞金や特典をえさにする誘惑",
      "job-fee": "うますぎる求人と前払い手数料の要求",
      "qr-upi": "お金を「受け取る」ためのQRコードや決済ハンドルの提示",
      "investment-bait": "元本保証・高利回りをうたう投資の誘い",
      "family-emergency": "「新しい番号からの家族」を装うパターン",
      "utility-disconnection": "今夜の公共料金の停止をちらつかせる脅迫",
      "loan-app": "前払い手数料を求める即時融資の誘い",
      "text-shortener": "メッセージ内の短縮リンク",
      "url-shortener": "実際の転送先を隠す短縮リンク",
      "url-punycode": "ドメイン内の紛らわしい文字（なりすましの可能性）",
      "url-ip": "ドメインではなくIPアドレスの直接指定",
      "url-insecure-http": "安全でないhttp://リンクです — 入力内容が暗号化されません",
      "url-userinfo": "「@」を使った手口です — 本当の転送先は@の前に隠れています",
      "url-apk": "APKの直接ダウンロードです — SMSを盗むマルウェア感染の典型的な手口です",
      "url-tld": "悪用が多いドメイン末尾（.{tld}）です — フィッシングキットに多用されています",
      "url-credentials": "リンク自体に機密情報の項目が含まれています — 事前入力済みのページには情報を入力しないでください",
      "url-brand-mismatch": "{brand}を装ったドメインですが、公式サイトではありません",
    },
    steps: {
      "payment-request":
        "お金・賞金・返金・荷物・求人を受け取るために手数料を支払わないでください。正規の組織がこのような方法を取ることはありません。",
      "otp-pin":
        "銀行・決済サービス・公的機関がOTP・暗証番号・パスワードを尋ねることは決してありません — 電話・SMS・メールいずれでも同様です。",
      "credential-request":
        "公的機関・銀行・雇用主がSMS・チャット・メールで身分証や口座番号の送信を求めることはありません。公式アプリや公式サイトを自分で開いて確認してください。",
      urgency:
        "落ち着いて対応してください。緊急感の演出は詐欺師の常套手段です — 正規の機関は時間的な余裕を与え、確認したことで不利益を与えることはありません。",
      "fear-threat":
        "警察や税務当局がWhatsAppやビデオ通話で逮捕をちらつかせることはありませんし、「疑いを晴らすため」として支払いを要求することもありません。",
      impersonation:
        "公式サイトや公式アプリに記載の番号で組織に連絡してください — このメッセージ内の連絡先は使わないでください。",
      "reward-bait":
        "応募していない抽選に当たることはありませんし、返金手続きは公式アプリ内で行われます — リンクや「受取手数料」経由で行われることはありません。",
      "job-fee":
        "正規の雇用主が応募や勤務開始に際して料金を請求することはありません。携帯送金で即時に入る「タスク報酬」は、より大きな被害へのえさです。",
      "qr-upi":
        "お金を「受け取る」ためにQRコードを読み取ったり暗証番号を入力したりすることはありません — それらは支払いのための操作です。これが手口の核心です。",
      "investment-bait":
        "実際の市場に元本保証の高利回りは存在しませんし、登録済みの助言者がチャットグループで勧誘することもありません。送金前に自国の証券規制当局で助言者を確認してください。",
      "family-emergency":
        "返信する前に、以前から知っている番号に電話して本人に確認してください。本当の緊急事態であれば、知っている番号への折り返しで確認できます。",
      "utility-disconnection":
        "公共料金の事業者が電話やSMSで即時支払いを要求することはありません。契約会社の公式アプリを開いて請求内容をご自身で確認してください。",
      "loan-app":
        "正規の貸金業者は融資実行時に手数料を差し引きます — 融資のために前払いを求めることはありません。このようなアプリに触れる前に、自国の登録貸金業者リストを確認してください。",
      "text-shortener":
        "短縮リンクはタップしないでください — 組織の公式アドレスをご自身で入力してください。短縮リンクは紛らわしいドメインを隠すために使われます。",
    },
    lowSteps: [
      "念のため注意を続けてください：心当たりのないメッセージ内のリンクはクリックしないでください。",
      "企業からを装う内容の場合は、このメッセージを信じず、公式アプリや公式サイトをご自身で開いて確認してください。",
    ],
    verifyLine:
      "公式サイトや公式アプリに記載の番号で組織に連絡して確認してください — このメッセージ内の連絡先は使わないでください。",
    disclaimer:
      "判断の補助であり、保証ではありません。言葉遣いだけでは詐欺と断定できません — 公式の窓口で確認してください。",
    shareNoMarkers: "よくある詐欺の兆候は見つかりませんでした — 公式の窓口で引き続き確認してください。",
    shareFooter: "Verify: scamlens.in/how-it-works",
    shareDisclaimer: "判断の補助であり、保証ではありません。公式の窓口で確認してください。",
  },
  ko: {
    headlines: {
      low: "흔한 사기 징후가 발견되지 않았어요",
      medium: "주의해야 할 징후가 몇 가지 있어요",
      high: "강한 사기 경고 신호가 있어요",
      critical: "전형적인 사기 패턴이 감지됐어요",
    },
    labels: {
      "payment-request": "결제 요청",
      "otp-pin": "OTP, PIN 또는 비밀번호를 요구해요",
      "credential-request": "개인 신분증이나 은행 정보를 요구해요",
      urgency: "인위적인 긴급함 조성",
      "fear-threat": "불안감 조성이나 법적 협박",
      impersonation: "은행, 택배사 또는 기관 사칭",
      "reward-bait": "경품이나 보상으로 유인",
      "job-fee": "너무 좋은 조건의 일자리와 선불 수수료 요구",
      "qr-upi": "돈을 '받기 위한' QR코드나 결제 핸들 제시",
      "investment-bait": "수익 보장을 내세운 투자 유인",
      "family-emergency": "'새 번호로 연락한 가족' 패턴",
      "utility-disconnection": "오늘 밤 공공요금 단전을 앞세운 협박",
      "loan-app": "선불 수수료를 요구하는 즉시 대출 유인",
      "text-shortener": "메시지 속 단축 링크",
      "url-shortener": "실제 목적지를 숨기는 단축 링크",
      "url-punycode": "도메인 속 헷갈리는 문자 (사칭 가능성)",
      "url-ip": "도메인이 아닌 날것의 IP 주소 사용",
      "url-insecure-http": "안전하지 않은 http:// 링크예요 — 입력하는 내용이 암호화되지 않아요",
      "url-userinfo": "'@'를 이용한 수법이에요 — 진짜 목적지는 @ 앞에 숨어 있어요",
      "url-apk": "APK 직접 다운로드예요 — SMS를 훔치는 악성 앱 설치의 흔한 수법이에요",
      "url-tld": "악용이 많은 도메인 끝부분(.{tld})이에요 — 피싱 키트에 자주 사용돼요",
      "url-credentials": "링크 자체에 민감한 정보 입력란이 있어요 — 미리 입력된 페이지에는 정보를 입력하지 마세요",
      "url-brand-mismatch": "{brand}을 사칭하는 도메인이지만 공식 사이트가 아니에요",
    },
    steps: {
      "payment-request":
        "돈, 경품, 환불, 택배나 일자리를 받기 위해 수수료를 내지 마세요. 정상적인 기관은 이렇게 하지 않아요.",
      "otp-pin":
        "은행, 지갑 업체나 정부 기관은 OTP, PIN, 비밀번호를 절대 묻지 않아요 — 전화, SMS, 이메일 모두 마찬가지예요.",
      "credential-request":
        "공공기관이나 은행, 고용주가 SMS나 채팅, 이메일로 신분증이나 계좌번호를 보내라고 하지 않습니다. 공식 앱이나 사이트를 직접 열어 확인하세요.",
      urgency:
        "천천히 대응하세요. 긴급함을 조성하는 건 사기꾼의 주된 수법이에요 — 정상적인 기관은 시간을 주고, 확인한다고 불이익을 주지 않아요.",
      "fear-threat":
        "경찰이나 세무 당국은 왓츠앱이나 영상 통화로 체포를 협박하지 않고, '혐의를 벗기 위한' 명목으로 돈을 요구하지도 않아요.",
      impersonation:
        "공식 웹사이트나 앱에 적힌 번호로 해당 기관에 연락하세요 — 이 메시지 속 연락처는 사용하지 마세요.",
      "reward-bait":
        "응모하지 않은 추첨에 당첨될 수 없고, 환불은 공식 앱 안에서 처리돼요 — 링크나 '수령 수수료'를 통해 처리되지 않아요.",
      "job-fee":
        "정상적인 고용주는 지원이나 입사를 대가로 돈을 요구하지 않아요. 휴대폰으로 즉시 입금되는 '작업 보수'는 더 큰 피해를 위한 미끼예요.",
      "qr-upi":
        "돈을 '받기 위해' QR코드를 찍거나 PIN을 입력할 일은 없어요 — 그건 돈을 낼 때만 하는 행동이에요. 그게 바로 수법의 핵심이에요.",
      "investment-bait":
        "실제 시장에는 수익 보장 상품이 없고, 등록된 상담사가 채팅방에서 모집하지도 않아요. 송금하기 전에 자국 증권 규제 기관에서 상담사를 확인하세요.",
      "family-emergency":
        "답장하기 전에 기존에 알던 번호로 전화해 확인하세요. 진짜 긴급 상황이라면 아는 번호로의 확인 전화를 피할 이유가 없어요.",
      "utility-disconnection":
        "공공요금 기관은 전화나 문자로 즉시 납부를 요구하지 않아요. 해당 업체의 공식 앱을 열어 요금을 직접 확인하세요.",
      "loan-app":
        "정상적인 대출 업체는 대출 실행 시 수수료를 공제해요 — 대출을 위해 선불을 요구하지 않아요. 이런 앱을 사용하기 전에 자국의 등록 대부업체 명단을 확인하세요.",
      "text-shortener":
        "단축 링크는 누르지 마세요 — 해당 기관의 공식 주소를 직접 입력하세요. 단축 서비스는 헷갈리는 도메인을 숨기기 위해 쓰여요.",
    },
    lowSteps: [
      "그래도 조심하세요: 예상치 못한 메시지 속 링크는 클릭하지 마세요.",
      "회사에서 보낸 것처럼 보이면 이 메시지를 믿지 말고 공식 앱이나 웹사이트를 직접 열어 확인하세요.",
    ],
    verifyLine:
      "공식 웹사이트나 앱에 적힌 번호로 해당 기관에 연락해 확인하세요 — 이 메시지 속 연락처는 사용하지 마세요.",
    disclaimer:
      "판단 보조 자료이며 보증이 아니에요. 문구만으로는 사기를 단정할 수 없어요 — 공식 채널로 확인하세요.",
    shareNoMarkers: "흔한 사기 징후가 발견되지 않았어요 — 그래도 공식 채널로 확인하세요.",
    shareFooter: "Verify: scamlens.in/how-it-works",
    shareDisclaimer: "판단 보조 자료이며 보증이 아니에요. 공식 채널로 확인하세요.",
  },
};

export function analyzerStrings(lang: string): AnalyzerStrings {
  const o = lang !== "en" && locales[lang] ? locales[lang] : {};
  return {
    headlines: { ...en.headlines, ...o.headlines },
    labels: { ...en.labels, ...o.labels },
    steps: { ...en.steps, ...o.steps },
    lowSteps: o.lowSteps ?? en.lowSteps,
    verifyLine: o.verifyLine ?? en.verifyLine,
    disclaimer: o.disclaimer ?? en.disclaimer,
    shareNoMarkers: o.shareNoMarkers ?? en.shareNoMarkers,
    shareFooter: o.shareFooter ?? en.shareFooter,
    shareDisclaimer: o.shareDisclaimer ?? en.shareDisclaimer,
  };
}

// Minimal {placeholder} interpolation (local getT has none).
export function fill(template: string, params: Record<string, string>): string {
  let s = template;
  for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, v);
  return s;
}
