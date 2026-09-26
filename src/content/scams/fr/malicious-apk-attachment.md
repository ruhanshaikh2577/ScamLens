---
title: "Arnaque à l'APK / pièce jointe malveillante"
longTitle: 'Cet APK est-il sûr à installer ? Comment les arnaques d’applis faux faire-part et faux suivi vident les comptes'
description: "L'arnaque à l'APK malveillant expliquée : des applis installées hors boutique se faisant passer pour invitations, suivis ou outils d'assistance volent SMS et OTP pour vider les comptes bancaires."
tag: "Malware"
region: "global"
intro: "Un message WhatsApp livre un fichier .apk déguisé en faire-part de mariage, suivi de colis ou appli de service client. L'installer (sideloading) accorde des permissions SMS, contacts et accessibilité qui permettent aux criminels de lire les OTP et de contrôler les applis bancaires. L'argent part sans qu'aucun OTP ne vous parvienne. Variantes : APK de faire-part de mariage sur WhatsApp (Inde), APK de suivi de colis (monde), APK de support client (Inde/Amérique latine), et fausses applis d'exchange crypto (UE/États-Unis)."
looksLike:
  - "WhatsApp : « Vous êtes invité 💌 » avec shadi-invitation.apk — l'icône ressemble à une carte, l'installation demande l'accès SMS et contacts."
  - "« Suivez votre colis ici : delivery-tracker.apk » — le lien n'est pas le Play Store, juste un téléchargement direct."
  - "« Installez notre appli d'assistance pour votre remboursement/KYC » — un agent au téléphone vous guide pour Autoriser les sources inconnues."
warningSigns:
  - "Le fichier finit en .apk ou demande d'activer Installer des applis inconnues — les vraies banques et livreurs ne diffusent jamais d'applis ainsi."
  - "L'installation exige des permissions SMS, accessibilité, notifications ou admin appareil sans rapport avec sa fonction."
  - "Arrive via WhatsApp/Telegram/SMS d'un numéro inconnu avec urgence (mariage, livraison, remboursement, KYC)."
  - "Icône d'appli absente du Play Store / App Store, ou l'expéditeur interdit d'installer depuis la boutique."
whyItWorks:
  "Le sideloading contourne le filtrage des boutiques d'applis, et un seul tap imprudent accorde les permissions dont les fraudeurs ont besoin. Les OTP censés vous protéger sont transférés en silence, si bien que les applis bancaires valident des virements que la victime ne voit jamais. Le déguisement familier (invitation, colis) rend l'installation sociale, pas technique."
whatToDo:
  - "Ne l'installez pas. Supprimez le fichier, n'accordez aucune permission, et n'activez jamais Sources inconnues pour une pièce jointe de discussion."
  - "Si installé : activez le mode avion, désinstallez l'appli, appelez votre banque pour geler banque en ligne/mobile, et réinitialisez l'appareil si conseillé."
  - "Signalez : États-Unis reportfraud.ftc.gov et FBI IC3, Royaume-Uni actionfraud.police.uk, Inde 1930 / cybercrime.gov.in."
verify:
  "Installez des applis uniquement depuis le Play Store / App Store atteint via l'appli boutique elle-même — vérifiez le nom du développeur. Confirmez les annonces de colis ou d'invitation via le site officiel du livreur ou en appelant directement l'expéditeur, jamais via l'APK."
faqs:
  - q: "Un APK envoyé sur WhatsApp est-il parfois sûr à installer ?"
    a: "Non. N'installez jamais d'applis hors boutique depuis des pièces jointes de discussion. Les vraies entreprises publient sur le Play Store / App Store — un .apk direct est un malware jusqu'à preuve du contraire."
  - q: "Pourquoi n'ai-je pas reçu d'OTP pour le vol ?"
    a: "Le malware lit et transfère vos SMS, donc les criminels saisissent eux-mêmes l'OTP. Voilà pourquoi les permissions SMS pour l'appli d'un inconnu sont si dangereuses."
  - q: "Je l'ai installé — que faire ?"
    a: "Passez hors ligne, désinstallez-le, appelez votre banque pour bloquer l'accès bancaire, changez les mots de passe depuis un appareil sain, et signalez sur 1930 / cybercrime.gov.in (Inde), reportfraud.ftc.gov (États-Unis) ou actionfraud.police.uk (Royaume-Uni)."
similar:
  - "/scams/qr-payment-scam"
  - "/scams/parcel-delivery-fee"
sources:
  - label: "APWG trends report Q4 2024"
    href: "https://docs.apwg.org/reports/apwg_trends_report_q4_2024.pdf"
  - label: "FBI IC3 2024 report"
    href: "https://www.ic3.gov/AnnualReport/Reports/2024_IC3Report.pdf"
status: "reviewed"
---
