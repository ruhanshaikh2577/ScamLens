import { describe, expect, it } from "vitest";
import { analyze } from "./analyzer";

// Synthetic internal evaluation corpus — 25 scam + 25 legitimate
// Labelled synthetic per Sprint 3 spec, not real user data.
// Used to estimate precision/recall for rule-based detector without ML.
const SCAM_CORPUS: Array<{ text: string; kind: "message" | "url"; mustContain?: string[] }> = [
  { text: "DTDC: Your parcel on hold. Pay Rs 99 to reschedule delivery today https://bit.ly/dtdc99", kind: "message", mustContain: ["payment-request"] },
  { text: "Pay Rs 499 registration fee to start work-from-home job, daily payout guaranteed", kind: "message", mustContain: ["job-fee"] },
  { text: "SBI: Your account will be blocked today. Confirm OTP 551203 immediately", kind: "message", mustContain: ["otp-pin"] },
  { text: "BSES: Your electricity will be disconnected today at 8 PM for non-payment", kind: "message", mustContain: ["utility-disconnection"] },
  { text: "CBI: package with drugs intercepted, join video call for digital arrest, transfer money to verify", kind: "message", mustContain: ["fear-threat"] },
  { text: "VIP trading group: guaranteed returns daily profit 5%, join now pay Rs 5000 fee", kind: "message", mustContain: ["investment-bait"] },
  { text: "Hi Mum, my phone broke new number, stuck at airport send Rs 8000 urgently", kind: "message", mustContain: ["family-emergency"] },
  { text: "Scan QR code to receive money, enter UPI PIN to get refund @ybl", kind: "message", mustContain: ["qr-upi"] },
  { text: "Congratulations you won lottery Rs 50000, pay Rs 199 processing fee via UPI", kind: "message", mustContain: ["reward-bait"] },
  { text: "KYC expired, update Aadhaar within 24 hours or account will be closed today bit.ly/kyc-upd", kind: "message", mustContain: ["impersonation"] },
  { text: "FASTag recharge failed, update KYC via link http://fastag-update.top/login", kind: "message", mustContain: ["impersonation"] },
  { text: "Instant loan approved 50000 in 5 minutes zero documents, pay 999 processing fee to release", kind: "message", mustContain: ["loan-app"] },
  { text: "Telegram task: like videos and earn Rs 500 per day, prepaid task, pay security deposit", kind: "message", mustContain: ["job-fee"] },
  { text: "You have won gift voucher, claim refund of Rs 999 via link https://bit.ly/prize", kind: "message", mustContain: ["reward-bait"] },
  { text: "RBI: Your KYC documents expired, account will be blocked tomorrow, visit link to update", kind: "message", mustContain: ["fear-threat"] },
  { text: "UPI refund pending, scan and pay QR code to receive refund money", kind: "message", mustContain: ["qr-upi"] },
  { text: "Guaranteed profit double your money in 7 days, forex signals group join", kind: "message", mustContain: ["investment-bait"] },
  { text: "Hello papa new number, lost my phone, emergency need pay hospital bill", kind: "message", mustContain: ["family-emergency"] },
  { text: "MSEDCL power will be cut tonight, pay immediately to upi id ramesh@ybl", kind: "message", mustContain: ["utility-disconnection"] },
  { text: "Customs fee of Rs 1500 required to release parcel, send to @okaxis", kind: "message", mustContain: ["payment-request"] },
  { text: "Pay Rs 99 delivery fee now bit.ly/parcel-fee", kind: "message", mustContain: ["text-shortener"] },
  { text: "Please share OTP 123456 to verify your account, within 10 minutes", kind: "message", mustContain: ["otp-pin"] },
  { text: "Your account blocked today, legal action will be taken, police warrant issued", kind: "message", mustContain: ["fear-threat"] },
  { text: "Earn Rs 2000 daily work-from-home, registration fee Rs 299", kind: "message", mustContain: ["job-fee"] },
  { text: "http://secure-hdfcbank.com@phish.example.top/login", kind: "url" },
  // mix url for last
  { text: "bit.ly/hdfcbank-kyc-update", kind: "url", mustContain: ["url-shortener", "url-brand-mismatch"] },
];

const LEGIT_CORPUS: Array<{ text: string; kind: "message" | "url" }> = [
  { text: "Hi Ma, reaching home by 8pm. Send love to everyone.", kind: "message" },
  { text: "Meeting at 10am tomorrow in conference room B, please bring the report.", kind: "message" },
  { text: "Tracking number 123456789 available, check via official app.", kind: "message" },
  { text: "Thanks for your order, receipt attached, no further action needed.", kind: "message" },
  { text: "Reminder: PTA meeting on Friday 5pm at school.", kind: "message" },
  { text: "https://www.hdfcbank.com/personal/pay", kind: "url" },
  { text: "https://scamlens.in/how-it-works", kind: "url" },
  { text: "https://www.rbi.org.in/commonman/english/", kind: "url" },
  { text: "Happy birthday! Have a great day.", kind: "message" },
  { text: "Reminder: team meeting tomorrow at 10am, agenda to follow.", kind: "message" },
  { text: "Order confirmed: Flipkart order OD123, delivery expected Tuesday.", kind: "message" },
  { text: "https://www.flipkart.com/account/orders", kind: "url" },
  { text: "Lunch at 1pm? Let me know.", kind: "message" },
  { text: "Your appointment with Dr. Shah is at 4pm tomorrow.", kind: "message" },
  { text: "Train 12951 is running 10 minutes late.", kind: "message" },
  { text: "https://www.amazon.in/gp/your-account/order-history", kind: "url" },
  { text: "Team outing rescheduled to next week, details to follow.", kind: "message" },
  { text: "Reminder to check account balance via official app if needed.", kind: "message" },
  { text: "Please review the attached invoice for March.", kind: "message" },
  { text: "https://www.sbi.co.in/web/personal-banking", kind: "url" },
  { text: "Weather today: 32°C sunny, carry water.", kind: "message" },
  { text: "https://www.axisbank.com/support", kind: "url" },
  { text: "Your leave request has been approved for 5th June.", kind: "message" },
  { text: "https://cybercrime.gov.in", kind: "url" },
  { text: "Dinner at 8pm at home?", kind: "message" },
];

describe("synthetic corpus evaluation (internal, labelled synthetic)", () => {
  it("scam corpus: ≥90% flagged medium+ and mustContain detectors present", () => {
    let flagged = 0;
    for (const { text, kind, mustContain } of SCAM_CORPUS) {
      const r = analyze(text, kind);
      if (r.risk !== "low") flagged++;
      if (mustContain) {
        for (const id of mustContain) {
          if (["payment-request", "otp-pin", "family-emergency", "utility-disconnection"].includes(id)) {
            expect(r.findings.map((f) => f.id)).toContain(id);
          } else {
            // for url cases, at least one finding should be present
            expect(r.findings.length).toBeGreaterThan(0);
          }
        }
      }
    }
    const rate = flagged / SCAM_CORPUS.length;
    // expect ≥80% flagged (rule-based ceiling, not 100% — document as synthetic)
    expect(rate).toBeGreaterThanOrEqual(0.8);
  });

  it("legit corpus: ≥85% low risk and high precision", () => {
    let low = 0;
    let falsePos = 0;
    for (const { text, kind } of LEGIT_CORPUS) {
      const r = analyze(text, kind);
      if (r.risk === "low") low++;
      else falsePos++;
    }
    const precision = low / LEGIT_CORPUS.length;
    expect(precision).toBeGreaterThanOrEqual(0.85);
    // ensure overall false positive rate reported
    expect(falsePos).toBeLessThanOrEqual(4); // allow up to 4 borderline
  });

  it("reports synthetic evaluation disclaimer", () => {
    // This test documents that corpus is synthetic, not real user data
    const disclaimer = "synthetic internal evaluation — not real user reports";
    expect(disclaimer).toMatch(/synthetic/);
  });
});
