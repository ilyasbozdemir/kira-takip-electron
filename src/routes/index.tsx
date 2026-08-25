import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  hoursBetween,
  money,
  overlaps,
  timeSlots,
  toKey,
  toMin,
  trDays,
  trMonths,
  useRentalStore,
  type Reservation,
} from "@/lib/rental-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Belediye Düğün Salonu Kiralama ve Raporlama" },
      {
        name: "description",
        content:
          "Belediyeye ait düğün salonlarını saat aralığı bazında kiralayın: aylık takvim, kat bazlı salonlar, tahsilat ve doluluk raporları.",
      },
      { property: "og:title", content: "Belediye Düğün Salonu Kiralama Sistemi" },
      {
        property: "og:description",
        content: "Saat aralıklı salon kiralama, çakışma kontrolü, tahsilat ve doluluk raporları.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type HallInfo = {
  id: string;
  name: string;
  floor: string;
  capacity: number;
  hourlyPrice: number;
  venueId: string;
  venueName: string;
};

type Tab = "takvim" | "isletmeler" | "raporlar";

function Index() {
  const {
    store,
    ready,
    addVenue,
    removeVenue,
    addHall,
    removeHall,
    addReservation,
    removeReservation,
    updatePaid,
    reset,
  } = useRentalStore();

  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [venueFilter, setVenueFilter] = useState<string>("all");
  const [selectedDay, setSelectedDay] = useState<string>(toKey(today));
  const [tab, setTab] = useState<Tab>("takvim");

  const halls: HallInfo[] = useMemo(
    () =>
      store.venues.flatMap((v) => v.halls.map((h) => ({ ...h, venueId: v.id, venueName: v.name }))),
    [store.venues],
  );
  const hallById = (id: string) => halls.find((h) => h.id === id);

  const visible = useMemo(
    () => store.reservations.filter((r) => venueFilter === "all" || r.venueId === venueFilter),
    [store.reservations, venueFilter],
  );

  const byDate = useMemo(() => {
    const map = new Map<string, Reservation[]>();
    for (const r of visible) map.set(r.date, [...(map.get(r.date) ?? []), r]);
    for (const [, list] of map) list.sort((a, b) => toMin(a.start) - toMin(b.start));
    return map;
  }, [visible]);

  const grid = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const offset = (first.getDay() + 6) % 7;
    const days: (Date | null)[] = Array.from({ length: offset }, () => null);
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    for (let i = 1; i <= total; i++) days.push(new Date(cursor.getFullYear(), cursor.getMonth(), i));
    while (days.length % 7 !== 0) days.push(null);
    return days;
  }, [cursor]);

  const monthStats = useMemo(() => {
    const prefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;
    const list = visible.filter((r) => r.date.startsWith(prefix));
    const total = list.reduce((s, r) => s + r.price, 0);
    const paid = list.reduce((s, r) => s + r.paid, 0);
    const hours = list.reduce((s, r) => s + hoursBetween(r.start, r.end), 0);
    return { count: list.length, total, paid, debt: total - paid, hours };
  }, [visible, cursor]);

  const dayList = byDate.get(selectedDay) ?? [];

  const shiftMonth = (d: number) => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + d, 1));

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:py-5">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
            <div className="min-w-0">
              <p className="truncate text-[10px] uppercase tracking-widest opacity-70 sm:text-xs">
                Belediye Hizmetleri
              </p>
              <h1 className="truncate text-base font-semibold sm:text-2xl">
                Düğün Salonu Kiralama Sistemi
              </h1>
            </div>
            <span className="shrink-0 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium">
              {store.venues.length} işletme · {halls.length} salon
            </span>
          </div>
          <nav className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
            {(
              [
                ["takvim", "Takvim"],
                ["isletmeler", "İşletmeler & Salonlar"],
                ["raporlar", "Raporlar"],
              ] as const
            ).map(([t, label]) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
                  tab === t
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                }`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-5 sm:px-4 sm:py-6">
        {tab === "takvim" && (
          <div className="space-y-5">
            <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
              <Stat label="Bu ay kiralama" value={String(monthStats.count)} />
              <Stat label="Kiralanan saat" value={`${monthStats.hours} sa`} />
              <Stat label="Toplam kira" value={money(monthStats.total)} />
              <Stat label="Tahsil edilen" value={money(monthStats.paid)} tone="success" />
              <Stat label="Kalan borç" value={money(monthStats.debt)} tone="warning" />
            </section>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => shiftMonth(-1)} className="btnGhost" aria-label="Önceki ay">
                  ‹
                </button>
                <span className="min-w-32 text-center text-sm font-semibold text-card-foreground sm:min-w-40 sm:text-base">
                  {trMonths[cursor.getMonth()]} {cursor.getFullYear()}
                </span>
                <button onClick={() => shiftMonth(1)} className="btnGhost" aria-label="Sonraki ay">
                  ›
                </button>
                <button
                  onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}
                  className="btnGhost text-xs"
                >
                  Bugün
                </button>
              </div>
              <select
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
                className="field sm:w-72"
                aria-label="İşletme filtresi"
              >
                <option value="all">Tüm işletmeler</option>
                {store.venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>

            <section className="overflow-hidden rounded-xl border border-border bg-card">
              <div className="grid grid-cols-7 border-b border-border bg-secondary text-center text-[10px] font-semibold text-secondary-foreground sm:text-xs">
                {trDays.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {grid.map((d, i) => {
                  if (!d)
                    return <div key={i} className="min-h-16 border-b border-r border-border bg-muted/40 sm:min-h-28" />;
                  const key = toKey(d);
                  const items = byDate.get(key) ?? [];
                  const isToday = key === toKey(today);
                  const isSel = key === selectedDay;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(key)}
                      className={`min-h-16 min-w-0 border-b border-r border-border p-1 text-left align-top transition sm:min-h-28 sm:p-1.5 ${
                        isSel ? "bg-accent/20 ring-1 ring-inset ring-accent" : "hover:bg-secondary/60"
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold sm:text-xs ${
                          isToday ? "bg-primary text-primary-foreground" : "text-card-foreground"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      {items.length > 0 && (
                        <>
                          <div className="mt-1 hidden space-y-1 sm:block">
                            {items.slice(0, 2).map((r) => {
                              const h = hallById(r.hallId);
                              return (
                                <div
                                  key={r.id}
                                  className="truncate rounded bg-primary/10 px-1 py-0.5 text-[11px] font-medium text-primary"
                                >
                                  {r.start} {h?.name ?? "Salon"}
                                </div>
                              );
                            })}
                            {items.length > 2 && (
                              <div className="text-[10px] text-muted-foreground">
                                +{items.length - 2} kiralama
                              </div>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-1 sm:hidden">
                            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            <span className="text-[10px] text-muted-foreground">{items.length}</span>
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <DayPanel
              date={selectedDay}
              list={dayList}
              allReservations={store.reservations}
              halls={halls}
              onRemove={removeReservation}
              onPaid={updatePaid}
              onAdd={addReservation}
            />
          </div>
        )}

        {tab === "isletmeler" && (
          <VenuesTab
            store={store}
            addVenue={addVenue}
            removeVenue={removeVenue}
            addHall={addHall}
            removeHall={removeHall}
            reset={reset}
          />
        )}

        {tab === "raporlar" && <ReportsTab halls={halls} reservations={store.reservations} />}
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
      <p className="truncate text-[11px] text-muted-foreground sm:text-xs">{label}</p>
      <p
        className={`mt-1 truncate text-base font-semibold sm:text-xl ${
          tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-card-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DayPanel({
  date,
  list,
  allReservations,
  halls,
  onRemove,
  onPaid,
  onAdd,
}: {
  date: string;
  list: Reservation[];
  allReservations: Reservation[];
  halls: HallInfo[];
  onRemove: (id: string) => void;
  onPaid: (id: string, paid: number) => void;
  onAdd: (r: Omit<Reservation, "id">) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hallId, setHallId] = useState(halls[0]?.id ?? "");
  const [start, setStart] = useState("13:00");
  const [end, setEnd] = useState("17:00");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState("");
  const [paid, setPaid] = useState("0");
  const [error, setError] = useState("");

  const selected = halls.find((h) => h.id === hallId);
  const hours = hoursBetween(start, end);
  const suggested = selected ? Math.round(selected.hourlyPrice * hours) : 0;

  const hallBusy = (id: string) =>
    allReservations
      .filter((r) => r.hallId === id && r.date === date)
      .map((r) => `${r.start}-${r.end}`)
      .join(", ");

  const submit = () => {
    if (!selected) return setError("Önce salon tanımlayın.");
    if (hours <= 0) return setError("Bitiş saati başlangıçtan sonra olmalı.");
    if (!customer.trim()) return setError("Kiracı adı gerekli.");
    const ok = onAdd({
      venueId: selected.venueId,
      hallId: selected.id,
      date,
      start,
      end,
      customer: customer.trim(),
      phone: phone.trim(),
      price: Number(price) || suggested,
      paid: Number(paid) || 0,
    });
    if (!ok) return setError("Bu salonda seçilen saat aralığı dolu.");
    setCustomer("");
    setPhone("");
    setPrice("");
    setPaid("0");
    setError("");
    setOpen(false);
  };

  const [y, m, d] = date.split("-");
  const dayTotal = list.reduce((s, r) => s + r.price, 0);

  return (
    <section className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div className="min-w-0">
          <h2 className="truncate font-semibold text-card-foreground">
            {Number(d)} {trMonths[Number(m) - 1]} {y}
          </h2>
          <p className="truncate text-xs text-muted-foreground">
            {list.length} kiralama · {money(dayTotal)}
          </p>
        </div>
        <button onClick={() => setOpen((o) => !o)} className="btnPrimary shrink-0">
          {open ? "Vazgeç" : "+ Kiralama"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 rounded-lg border border-border bg-secondary/40 p-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="lbl">Salon (kat)</span>
            <select value={hallId} onChange={(e) => setHallId(e.target.value)} className="field">
              {halls.map((h) => {
                const busy = hallBusy(h.id);
                return (
                  <option key={h.id} value={h.id}>
                    {h.venueName} — {h.name} · {h.floor} {busy ? `(dolu: ${busy})` : ""}
                  </option>
                );
              })}
            </select>
          </label>
          <label className="block text-sm">
            <span className="lbl">Başlangıç saati</span>
            <select value={start} onChange={(e) => setStart(e.target.value)} className="field">
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="lbl">Bitiş saati</span>
            <select value={end} onChange={(e) => setEnd(e.target.value)} className="field">
              {timeSlots.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="lbl">Kiracı</span>
            <input
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              className="field"
              placeholder="Ad Soyad / Aile"
            />
          </label>
          <label className="block text-sm">
            <span className="lbl">Telefon</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="05.." />
          </label>
          <label className="block text-sm">
            <span className="lbl">
              Kira ücreti (₺) · {hours} sa × {money(selected?.hourlyPrice ?? 0)}
            </span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field"
              placeholder={String(suggested)}
            />
          </label>
          <label className="block text-sm">
            <span className="lbl">Alınan ödeme (₺)</span>
            <input type="number" value={paid} onChange={(e) => setPaid(e.target.value)} className="field" />
          </label>
          {error && <p className="text-sm text-destructive sm:col-span-2">{error}</p>}
          <div className="sm:col-span-2">
            <button onClick={submit} className="btnPrimary w-full sm:w-auto">
              Kaydet
            </button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {list.length === 0 && <p className="text-sm text-muted-foreground">Bu tarihte kiralama yok.</p>}
        {list.map((r) => {
          const h = halls.find((x) => x.id === r.hallId);
          const debt = r.price - r.paid;
          const clash = list.some(
            (o) => o.id !== r.id && o.hallId === r.hallId && overlaps(r.start, r.end, o.start, o.end),
          );
          return (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-medium text-card-foreground">
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-semibold text-primary">
                      {r.start}–{r.end}
                    </span>
                    <span className="truncate">{r.customer}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {h ? `${h.venueName} · ${h.name} · ${h.floor} · ${h.capacity} kişi` : "Salon silinmiş"}
                    {r.phone ? ` · ${r.phone}` : ""}
                  </p>
                  {clash && <p className="mt-1 text-xs text-destructive">Saat çakışması var!</p>}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold ${
                    debt <= 0 ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
                  }`}
                >
                  {debt <= 0 ? "Ödendi" : `Kalan ${money(debt)}`}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">
                  {hoursBetween(r.start, r.end)} sa · {money(r.price)}
                </span>
                <input
                  type="number"
                  value={r.paid}
                  onChange={(e) => onPaid(r.id, Number(e.target.value) || 0)}
                  className="field w-24 sm:w-28"
                  aria-label="Tahsilat"
                />
                <button onClick={() => onRemove(r.id)} className="btnDanger">
                  Sil
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ReportsTab({ halls, reservations }: { halls: HallInfo[]; reservations: Reservation[] }) {
  const today = new Date();
  const [range, setRange] = useState<"month" | "year" | "all">("month");
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());

  const list = useMemo(() => {
    if (range === "all") return reservations;
    if (range === "year") return reservations.filter((r) => r.date.startsWith(String(year)));
    const prefix = `${year}-${String(month + 1).padStart(2, "0")}`;
    return reservations.filter((r) => r.date.startsWith(prefix));
  }, [reservations, range, month, year]);

  const totals = useMemo(() => {
    const price = list.reduce((s, r) => s + r.price, 0);
    const paid = list.reduce((s, r) => s + r.paid, 0);
    const hours = list.reduce((s, r) => s + hoursBetween(r.start, r.end), 0);
    return { count: list.length, price, paid, debt: price - paid, hours };
  }, [list]);

  const rows = useMemo(
    () =>
      halls
        .map((h) => {
          const rs = list.filter((r) => r.hallId === h.id);
          const price = rs.reduce((s, r) => s + r.price, 0);
          const paid = rs.reduce((s, r) => s + r.paid, 0);
          const hours = rs.reduce((s, r) => s + hoursBetween(r.start, r.end), 0);
          return { hall: h, count: rs.length, hours, price, paid, debt: price - paid };
        })
        .sort((a, b) => b.price - a.price),
    [halls, list],
  );

  const debtors = useMemo(
    () => list.filter((r) => r.price - r.paid > 0).sort((a, b) => b.price - b.paid - (a.price - a.paid)),
    [list],
  );

  const csv = () => {
    const head = ["Tarih", "Saat", "İşletme", "Salon", "Kat", "Kiracı", "Telefon", "Saat", "Kira", "Tahsilat", "Kalan"];
    const lines = list.map((r) => {
      const h = halls.find((x) => x.id === r.hallId);
      return [
        r.date,
        `${r.start}-${r.end}`,
        h?.venueName ?? "",
        h?.name ?? "",
        h?.floor ?? "",
        r.customer,
        r.phone,
        String(hoursBetween(r.start, r.end)),
        String(r.price),
        String(r.paid),
        String(r.price - r.paid),
      ]
        .map((c) => `"${c}"`)
        .join(";");
    });
    const blob = new Blob(["\uFEFF" + [head.join(";"), ...lines].join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kiralama-raporu-${range}-${year}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <label className="block text-sm">
            <span className="lbl">Dönem</span>
            <select value={range} onChange={(e) => setRange(e.target.value as typeof range)} className="field">
              <option value="month">Aylık</option>
              <option value="year">Yıllık</option>
              <option value="all">Tümü</option>
            </select>
          </label>
          {range === "month" && (
            <label className="block text-sm">
              <span className="lbl">Ay</span>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className="field">
                {trMonths.map((m, i) => (
                  <option key={m} value={i}>
                    {m}
                  </option>
                ))}
              </select>
            </label>
          )}
          {range !== "all" && (
            <label className="block text-sm">
              <span className="lbl">Yıl</span>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="field">
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <button onClick={csv} className="btnGhost text-sm">
          CSV indir
        </button>
      </section>

      <section className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-5">
        <Stat label="Kiralama sayısı" value={String(totals.count)} />
        <Stat label="Kiralanan saat" value={`${totals.hours} sa`} />
        <Stat label="Toplam kira" value={money(totals.price)} />
        <Stat label="Tahsilat" value={money(totals.paid)} tone="success" />
        <Stat label="Kalan borç" value={money(totals.debt)} tone="warning" />
      </section>

      <section className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <h2 className="font-semibold text-card-foreground">Salon bazlı performans</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3">Salon</th>
                <th className="py-2 pr-3">Kat</th>
                <th className="py-2 pr-3">Adet</th>
                <th className="py-2 pr-3">Saat</th>
                <th className="py-2 pr-3">Kira</th>
                <th className="py-2 pr-3">Tahsilat</th>
                <th className="py-2">Kalan</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.hall.id} className="border-b border-border/60">
                  <td className="py-2 pr-3">
                    <span className="font-medium text-card-foreground">{r.hall.name}</span>
                    <span className="block text-xs text-muted-foreground">{r.hall.venueName}</span>
                  </td>
                  <td className="py-2 pr-3 text-muted-foreground">{r.hall.floor}</td>
                  <td className="py-2 pr-3">{r.count}</td>
                  <td className="py-2 pr-3">{r.hours} sa</td>
                  <td className="py-2 pr-3">{money(r.price)}</td>
                  <td className="py-2 pr-3 text-success">{money(r.paid)}</td>
                  <td className={`py-2 ${r.debt > 0 ? "text-warning-foreground" : "text-muted-foreground"}`}>
                    {money(r.debt)}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-3 text-muted-foreground">
                    Salon tanımlı değil.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <h2 className="font-semibold text-card-foreground">Borçlu kiralamalar ({debtors.length})</h2>
        <div className="mt-3 space-y-2">
          {debtors.length === 0 && <p className="text-sm text-muted-foreground">Bu dönemde borç yok.</p>}
          {debtors.map((r) => {
            const h = halls.find((x) => x.id === r.hallId);
            return (
              <div
                key={r.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-border p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-card-foreground">{r.customer}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.date} · {r.start}–{r.end} · {h ? `${h.name} (${h.floor})` : "Salon silinmiş"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-warning/20 px-2 py-1 text-xs font-semibold text-warning-foreground">
                  {money(r.price - r.paid)}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function VenuesTab({
  store,
  addVenue,
  removeVenue,
  addHall,
  removeHall,
  reset,
}: {
  store: ReturnType<typeof useRentalStore>["store"];
  addVenue: (n: string, d: string) => void;
  removeVenue: (id: string) => void;
  addHall: (venueId: string, hall: { name: string; floor: string; capacity: number; hourlyPrice: number }) => void;
  removeHall: (venueId: string, hallId: string) => void;
  reset: () => void;
}) {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border bg-card p-3 sm:p-4">
        <h2 className="font-semibold text-card-foreground">Yeni işletme (düğün yeri) ekle</h2>
        <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="İşletme adı" />
          <input
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="field"
            placeholder="Mahalle / semt"
          />
          <button
            onClick={() => {
              if (!name.trim()) return;
              addVenue(name.trim(), district.trim());
              setName("");
              setDistrict("");
            }}
            className="btnPrimary"
          >
            İşletme ekle
          </button>
        </div>
      </section>

      {store.venues.map((v) => (
        <VenueCard key={v.id} venue={v} addHall={addHall} removeHall={removeHall} removeVenue={removeVenue} />
      ))}

      <button onClick={reset} className="btnGhost text-xs">
        Örnek verilere sıfırla
      </button>
    </div>
  );
}

function VenueCard({
  venue,
  addHall,
  removeHall,
  removeVenue,
}: {
  venue: {
    id: string;
    name: string;
    district: string;
    halls: { id: string; name: string; floor: string; capacity: number; hourlyPrice: number }[];
  };
  addHall: (venueId: string, hall: { name: string; floor: string; capacity: number; hourlyPrice: number }) => void;
  removeHall: (venueId: string, hallId: string) => void;
  removeVenue: (id: string) => void;
}) {
  const [hall, setHall] = useState({ name: "", floor: "", capacity: "", hourlyPrice: "" });

  return (
    <section className="rounded-xl border border-border bg-card p-3 sm:p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-card-foreground">{venue.name}</h3>
          <p className="truncate text-xs text-muted-foreground">
            {venue.district || "—"} · {venue.halls.length} salon
          </p>
        </div>
        <button onClick={() => removeVenue(venue.id)} className="btnDanger shrink-0">
          İşletmeyi sil
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {venue.halls.map((h) => (
          <div key={h.id} className="min-w-0 rounded-lg border border-border bg-secondary/40 p-3">
            <p className="truncate font-medium text-card-foreground">{h.name}</p>
            <p className="text-xs text-muted-foreground">
              {h.floor} · {h.capacity} kişi · {money(h.hourlyPrice)}/saat
            </p>
            <button onClick={() => removeHall(venue.id, h.id)} className="mt-2 text-xs text-destructive underline">
              Salonu kaldır
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <input
          value={hall.name}
          onChange={(e) => setHall({ ...hall, name: e.target.value })}
          className="field"
          placeholder="Salon adı"
        />
        <input
          value={hall.floor}
          onChange={(e) => setHall({ ...hall, floor: e.target.value })}
          className="field"
          placeholder="Kat (ör. 1. Kat)"
        />
        <input
          type="number"
          value={hall.capacity}
          onChange={(e) => setHall({ ...hall, capacity: e.target.value })}
          className="field"
          placeholder="Kapasite"
        />
        <input
          type="number"
          value={hall.hourlyPrice}
          onChange={(e) => setHall({ ...hall, hourlyPrice: e.target.value })}
          className="field"
          placeholder="Saatlik kira"
        />
        <button
          onClick={() => {
            if (!hall.name.trim()) return;
            addHall(venue.id, {
              name: hall.name.trim(),
              floor: hall.floor.trim() || "Zemin Kat",
              capacity: Number(hall.capacity) || 0,
              hourlyPrice: Number(hall.hourlyPrice) || 0,
            });
            setHall({ name: "", floor: "", capacity: "", hourlyPrice: "" });
          }}
          className="btnPrimary"
        >
          Salon ekle
        </button>
      </div>
    </section>
  );
}
