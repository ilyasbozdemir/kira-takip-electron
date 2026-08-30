import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import {
  allEventTypes,
  hoursBetween,
  toKey,
  type PricingMode,
  type Store,
} from "@/lib/rental-store";
import { sqliteStore } from "@/lib/db-client";
import { generateEmailHTMLTemplate } from "@/lib/email-template";
import { generateSingleICS } from "@/lib/ics-helper";

export function useReservationForm(store: Store, defaultTariffBasis: string, selectedDay: string) {
  const [resVenueId, setResVenueId] = useState("");
  const [resHallId, setResHallId] = useState("");
  const [resEventType, setResEventType] = useState(
    allEventTypes[0] || "Düğün & Davet"
  );
  const [resCustomer, setResCustomer] = useState("");
  const [resPhone, setResPhone] = useState("");
  const [resEmail, setResEmail] = useState("");
  // Default to daily/session fixed lump-sum pricing as requested
  const [pricingMode, setPricingMode] = useState<PricingMode>("daily");
  const [timeSlotSession, setTimeSlotSession] = useState<"Gece" | "Gündüz" | "Tüm Gün">("Gece");
  const [resStart, setResStart] = useState("18:00");
  const [resEnd, setResEnd] = useState("23:30");
  const [guestCount, setGuestCount] = useState<number | "">(0);
  const [resPrice, setResPrice] = useState<number | "">(0);
  const [resPaid, setResPaid] = useState<number | "">(0);
  const [resStatus, setResStatus] = useState("confirmed");
  const [resReceiptNo, setResReceiptNo] = useState("");
  const [resPaymentMethod, setResPaymentMethod] = useState("Nakit");
  const [resDecisionInfo, setResDecisionInfo] = useState("");
  const [resNote, setResNote] = useState("");

  // Default Decision Info initialization
  useEffect(() => {
    if (!resDecisionInfo && defaultTariffBasis) {
      setResDecisionInfo(defaultTariffBasis);
    }
  }, [defaultTariffBasis, resDecisionInfo]);

  // Handle Time Slot Session Selection (Gece, Gündüz, Tüm Gün)
  const handleTimeSlotChange = (session: "Gece" | "Gündüz" | "Tüm Gün") => {
    setTimeSlotSession(session);
    if (session === "Gece") {
      setResStart("18:00");
      setResEnd("23:30");
    } else if (session === "Gündüz") {
      setResStart("10:00");
      setResEnd("16:00");
    } else if (session === "Tüm Gün") {
      setResStart("09:00");
      setResEnd("23:30");
    }
  };

  // Default Lump-Sum Session Price Initialization
  useEffect(() => {
    if (!resVenueId || !resHallId) return;
    const venue = store.venues.find((v) => v.id === resVenueId);
    const hall = venue?.halls.find((h) => h.id === resHallId);
    if (!hall) return;

    setResPrice(hall.hourlyPrice);
  }, [resVenueId, resHallId, store.venues]);

  // Customer Suggestions
  const customerSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const c of store.customers || []) {
      if (c.name) set.add(c.name);
    }
    for (const r of store.reservations) {
      if (r.customer) set.add(r.customer);
    }
    return Array.from(set);
  }, [store.reservations, store.customers]);

  const phoneSuggestions = useMemo(() => {
    const set = new Set<string>();
    for (const c of store.customers || []) {
      if (c.phone) set.add(c.phone);
    }
    for (const r of store.reservations) {
      if (r.phone) set.add(r.phone);
    }
    return Array.from(set);
  }, [store.reservations, store.customers]);

  const decisionSuggestions = useMemo(() => {
    const set = new Set<string>();
    if (defaultTariffBasis) set.add(defaultTariffBasis);
    for (const r of store.reservations) {
      if (r.decisionInfo) set.add(r.decisionInfo);
    }
    return Array.from(set);
  }, [store.reservations, defaultTariffBasis]);

  const handleCreateReservation = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    if (!resVenueId || !resHallId || !resCustomer || !resPhone) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    const todayStr = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    })();

    if (selectedDay && selectedDay < todayStr) {
      toast.error("Geçmiş tarihli yeni etkinlik kaydı oluşturulamaz. Lütfen bugünün veya ileri bir tarihi seçin.");
      return;
    }

    try {
      const formattedNote = [
        resNote.trim(),
        guestCount ? `Kişi Sayısı: ${guestCount}` : null,
        `Seans: ${timeSlotSession}`,
      ]
        .filter(Boolean)
        .join(" | ");

      await sqliteStore.addReservation({
        venueId: resVenueId,
        hallId: resHallId,
        eventType: resEventType,
        customer: resCustomer,
        phone: resPhone,
        email: resEmail.trim() || undefined,
        date: selectedDay,
        start: resStart,
        end: resEnd,
        price: Number(resPrice) || 0,
        paid: Number(resPaid) || 0,
        status: resStatus,
        receiptNo: resReceiptNo.trim() || undefined,
        paymentMethod: resPaymentMethod || "Nakit",
        decisionInfo: resDecisionInfo.trim() || undefined,
        note: formattedNote || undefined,
      });

      // AUTO EMAIL & CALENDAR .ICS DISPATCH CHECK
      try {
        const autoSettingsRaw = localStorage.getItem("venue-keeper-auto-email-settings");
        const smtpSettingsRaw = localStorage.getItem("venue-keeper-smtp-settings");
        const autoSettings = autoSettingsRaw
          ? JSON.parse(autoSettingsRaw)
          : { mode: "manual", enabled: false, attachIcs: true, target: "both" };
        const smtpSettings = smtpSettingsRaw ? JSON.parse(smtpSettingsRaw) : null;

        const isAutoEmailActive = (autoSettings.mode === "instant" || autoSettings.enabled === true) && autoSettings.mode !== "manual";

        if (isAutoEmailActive && smtpSettings && smtpSettings.user && smtpSettings.pass) {
          const venue = store.venues.find((v) => v.id === resVenueId);
          const hall = venue?.halls?.find((h) => h.id === resHallId);
          const venueName = venue?.name || "Tesis";
          const hallName = hall?.name || "Salon";
          const venueAddress = venue?.address;
          const venueMapUrl = venue?.mapUrl;
          const venueDistrict = venue?.district;

          // Determine recipient:
          // 1. resEmail alanına girilen müşteri e-postası (en güvenilir)
          // 2. Müşteri adının kendisi e-posta formatında ise (eski destek)
          // 3. Backup modu aktifse backup adresi
          // 4. Hiçbiri yoksa → otomatik gönderim atlanır
          const directEmail = resEmail.trim();
          const customerHasEmail = resCustomer.includes("@");
          const backupEmail = smtpSettings.backupEmail || "";

          let recipientEmail = "";
          if (autoSettings.target === "backup" && backupEmail) {
            // Backup modu: daima backup adresine gönder
            recipientEmail = backupEmail;
          } else if (directEmail) {
            // Etkinlik formuna direkt girilen e-posta
            recipientEmail = directEmail;
          } else if (autoSettings.target === "both" && backupEmail) {
            // Both modunda müşteri e-postası yoksa backup'a gönder
            recipientEmail = customerHasEmail ? resCustomer : backupEmail;
          } else if (customerHasEmail) {
            // Sadece müşteriye gönder
            recipientEmail = resCustomer;
          }

          // Hiç geçerli alıcı yoksa otomatik gönderimi atla — form sıfırlama devam eder
          const shouldSendEmail = !!recipientEmail;
          if (!shouldSendEmail) {
            // Müşterinin e-posta adresi yok → etkinlik kaydedildi, mail gönderilmeyecek.
            // Kullanıcı etkinlik listesinden "E-posta" butonuyla manuel gönderebilir.
          } else {

          const emailHtml = generateEmailHTMLTemplate({
            customer: resCustomer,
            venueName,
            hallName,
            venueAddress,
            venueMapUrl,
            venueDistrict,
            date: selectedDay,
            start: resStart,
            end: resEnd,
            eventType: resEventType,
            price: Number(resPrice) || 0,
            paid: Number(resPaid) || 0,
            phone: resPhone,
          });

          const icsContent = autoSettings.attachIcs !== false
            ? generateSingleICS({
                customer: resCustomer,
                venueName,
                hallName,
                venueAddress,
                venueMapUrl,
                date: selectedDay,
                start: resStart,
                end: resEnd,
                eventType: resEventType,
                phone: resPhone,
              })
            : undefined;

          const attachments = icsContent
            ? [
                {
                  filename: "etkinlik-takvim-daveti.ics",
                  content: icsContent,
                  contentType: "text/calendar; charset=utf-8; method=REQUEST",
                },
              ]
            : undefined;

          if (window.electronAPI?.sendEmail) {
            const res = await window.electronAPI.sendEmail({
              smtpConfig: {
                host: smtpSettings.host || "smtp.gmail.com",
                port: Number(smtpSettings.port) || 587,
                secure: smtpSettings.secure ?? false,
                user: smtpSettings.user || "",
                pass: smtpSettings.pass || "",
                senderName: smtpSettings.senderName || "Mekan & Tesis Yönetimi",
              },
              mailData: {
                to: recipientEmail,
                subject: `⚡ Rezervasyon Onayı & Takvim Davetiyesi: ${resCustomer} (${selectedDay})`,
                html: emailHtml,
                attachments,
              },
            });
            if (res?.success) {
              toast.success("⚡ Otomatik e-posta & .ics takvim davetiyesi gönderildi!");
            }
          }
          } // end else (shouldSendEmail)
        }
      } catch (e) {
        console.error("Otomatik e-posta gönderim hatası:", e);
      }

      setResCustomer("");
      setResPhone("");
      setResEmail("");
      setResReceiptNo("");
      setResNote("");
      if (onSuccess) onSuccess();
      toast.success("Etkinlik ve salon tahsis kaydı SQLite veritabanına eklendi!");
    } catch (err: any) {
      toast.error(`Kayıt hatası: ${err.message || err}`);
    }
  };

  return {
    resVenueId,
    setResVenueId,
    resHallId,
    setResHallId,
    resEventType,
    setResEventType,
    resCustomer,
    setResCustomer,
    resPhone,
    setResPhone,
    resEmail,
    setResEmail,
    pricingMode,
    setPricingMode,
    timeSlotSession,
    setTimeSlotSession,
    handleTimeSlotChange,
    resStart,
    setResStart,
    resEnd,
    setResEnd,
    guestCount,
    setGuestCount,
    resPrice,
    setResPrice,
    resPaid,
    setResPaid,
    resStatus,
    setResStatus,
    resReceiptNo,
    setResReceiptNo,
    resPaymentMethod,
    setResPaymentMethod,
    resDecisionInfo,
    setResDecisionInfo,
    resNote,
    setResNote,
    customerSuggestions,
    phoneSuggestions,
    decisionSuggestions,
    handleCreateReservation,
  };
}
