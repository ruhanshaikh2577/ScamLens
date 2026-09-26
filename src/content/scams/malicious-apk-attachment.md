---
title: "Malicious APK / attachment scam"
longTitle: 'Is this APK safe to install? How wedding-invite and parcel-tracker app scams drain accounts'
description: "Malicious APK scam explained: sideloaded apps posing as invites, trackers, or support tools steal SMS and OTPs to drain bank accounts."
tag: "Malware"
region: "global"
intro: "A WhatsApp message delivers an .apk file disguised as a wedding invite, parcel tracker, or customer-care app. Installing it (sideloading) grants SMS, contacts, and accessibility permissions that let criminals read OTPs and control banking apps. Money leaves with no OTP ever reaching you. Variants include wedding-invite APKs on WhatsApp (India), parcel-tracker APKs (global), customer-support APKs (India/LatAm), and fake crypto-exchange apps (EU/US)."
looksLike:
  - "WhatsApp: 'You are invited 💌' with shadi-invitation.apk — icon looks like a card, install asks for SMS and contacts access."
  - "'Track your parcel here: delivery-tracker.apk' — link is not the Play Store, just a direct file download."
  - "'Install our support app for your refund/KYC' — agent on call walks you through Allow Unknown Sources."
warningSigns:
  - "File ends in .apk or asks to enable Install Unknown Apps — real banks and couriers never distribute apps this way."
  - "Install demands SMS, accessibility, notification, or device-admin permissions unrelated to its function."
  - "Arrives via WhatsApp/Telegram/SMS from an unknown number with urgency (wedding, delivery, refund, KYC)."
  - "App icon missing from the Play Store / App Store, or the sender forbids installing from the store."
whyItWorks:
  "Sideloading bypasses app-store screening, and one careless tap grants the permissions fraudsters need. OTPs meant to protect you are silently forwarded, so banking apps approve transfers the victim never sees. The familiar disguise (invite, parcel) makes the install feel social, not technical."
whatToDo:
  - "Do not install it. Delete the file, do not grant permissions, and never enable Unknown Sources for a chat attachment."
  - "If installed: enable airplane mode, uninstall the app, call your bank to freeze net/mobile banking, and reset the device if advised."
  - "Report: US reportfraud.ftc.gov and FBI IC3, UK actionfraud.police.uk, India 1930 / cybercrime.gov.in."
verify:
  "Install apps only from the Play Store / App Store reached via the store app itself — search the developer name. Confirm parcel or invite claims via the official courier site or by calling the sender directly, never via the APK."
faqs:
  - q: "Is any APK sent over WhatsApp safe to install?"
    a: "No. Never sideload apps from chat attachments. Real companies publish in the Play Store / App Store — a direct .apk is malware until proven otherwise."
  - q: "Why didn't I get an OTP for the theft?"
    a: "The malware reads and forwards your SMS, so criminals enter the OTP themselves. That is why SMS permissions for a stranger's app are so dangerous."
  - q: "I installed it — what now?"
    a: "Go offline, uninstall it, call your bank to block banking access, change passwords from a clean device, and report at 1930 / cybercrime.gov.in (India), reportfraud.ftc.gov (US), or actionfraud.police.uk (UK)."
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
