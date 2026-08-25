import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  money,
  toKey,
  trDays,
  trMonths,
  useRentalStore,
  type Reservation,
} from "@/lib/rental-store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Belediye Düğün Salonu Kira Takip Takvimi" },
      {
        name: "description",
        content:
          "Belediyeye ait düğün salonlarının aylık takvim görünümünde randevu, kat/salon ve kira ücreti takibi.",
      },
      { property: "og:title", content: "Belediye Düğün Salonu Kira Takip" },
      {
        property: "og:description",
        content: "Aylık takvim üzerinde salon randevuları, kat bazlı kiralama ve tahsilat takibi.",
      },
    ],
  }),
  component: Index,
});

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
  const [tab, setTab] = useState<"takvim" | "isletmeler">("takvim");

  const halls = useMemo(
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
    return { count: list.length, total, paid, debt: total - paid };
  }, [visible, cursor]);

  const dayList = (byDate.get(selectedDay) ?? []).sort((a, b) =>
    (hallById(a.hallId)?.name ?? "").localeCompare(hallById(b.hallId)?.name ?? ""),
  );

  const shiftMonth = (d: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + d, 1));

  if (!ready) return <div className="min-h-screen bg-background" />;

  return (
    <main className="min-h-screen bg-background pb-16">
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest opacity-70">Belediye Hizmetleri</p>
            <h1 className="text-xl font-semibold sm:text-2xl">Düğün Salonu Kira Takip Sistemi</h1>
          </div>
          <nav className="flex gap-2">
            {(["takvim", "isletmeler"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  tab === t
                    ? "bg-accent text-accent-foreground"
                    : "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                }`}
              >
                {t === "takvim" ? "Takvim" : "İşletmeler & Salonlar"}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-6">
        {tab === "takvim" ? (
          <div className="space-y-6">
            <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <Stat label="Bu ay randevu" value={String(monthStats.count)} />
              <Stat label="Toplam kira" value={money(monthStats.total)} />
              <Stat label="Tahsil edilen" value={money(monthStats.paid)} tone="success" />
              <Stat label="Kalan borç" value={money(monthStats.debt)} tone="warning" />
            </section>

            <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => shiftMonth(-1)} className="btnGhost">
                  ‹
                </button>
                <span className="min-w-40 text-center font-semibold text-card-foreground">
                  {trMonths[cursor.getMonth()]} {cursor.getFullYear()}
                </span>
                <button onClick={() => shiftMonth(1)} className="btnGhost">
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
              <div className="grid grid-cols-7 border-b border-border bg-secondary text-center text-xs font-semibold text-secondary-foreground">
                {trDays.map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {grid.map((d, i) => {
                  if (!d) return <div key={i} className="min-h-20 border-b border-r border-border bg-muted/40" />;
                  const key = toKey(d);
                  const items = byDate.get(key) ?? [];
                  const isToday = key === toKey(today);
                  const isSel = key === selectedDay;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedDay(key)}
                      className={`min-h-20 border-b border-r border-border p-1.5 text-left align-top transition sm:min-h-28 ${
                        isSel ? "bg-accent/20" : "hover:bg-secondary/60"
                      }`}
                    >
                      <span
                        className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                          isToday ? "bg-primary text-primary-foreground" : "text-card-foreground"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      <div className="mt-1 space-y-1">
                        {items.slice(0, 2).map((r) => {
                          const h = hallById(r.hallId);
                          return (
                            <div
                              key={r.id}
                              className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] font-medium text-primary sm:text-[11px]"
                            >
                              {h ? `${h.name}` : "Salon"} · {r.customer}
                            </div>
                          );
                        })}
                        {items.length > 2 && (
                          <div className="text-[10px] text-muted-foreground">+{items.length - 2} randevu</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <DayPanel
              date={selectedDay}
              list={dayList}
              halls={halls}
              onRemove={removeReservation}
              onPaid={updatePaid}
              onAdd={addReservation}
            />
          </div>
        ) : (
          <VenuesTab
            store={store}
            addVenue={addVenue}
            removeVenue={removeVenue}
            addHall={addHall}
            removeHall={removeHall}
            reset={reset}
          />
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "warning" }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold sm:text-xl ${
          tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-card-foreground"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type HallInfo = { id: string; name: string; floor: string; capacity: number; dailyPrice: number; venueId: string; venueName: string };

function DayPanel({
  date,
  list,
  halls,
  onRemove,
  onPaid,
  onAdd,
}: {
  date: string;
  list: Reservation[];
  halls: HallInfo[];
  onRemove: (id: string) => void;
  onPaid: (id: string, paid: number) => void;
  onAdd: (r: Omit<Reservation, "id">) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const [hallId, setHallId] = useState(halls[0]?.id ?? "");
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [price, setPrice] = useState<string>("");
  const [paid, setPaid] = useState<string>("0");
  const [error, setError] = useState("");

  const selected = halls.find((h) => h.id === hallId);
  const busy = new Set(list.map((r) => r.hallId));

  const submit = () => {
    if (!selected || !customer.trim()) {
      setError("Salon ve kiracı adı zorunludur.");
      return;
    }
    const ok = onAdd({
      venueId: selected.venueId,
      hallId: selected.id,
      date,
      customer: customer.trim(),
      phone: phone.trim(),
      price: Number(price) || selected.dailyPrice,
      paid: Number(paid) || 0,
    });
    if (!ok) {
      setError("Bu salon bu tarihte zaten kiralanmış.");
      return;
    }
    setCustomer("");
    setPhone("");
    setPrice("");
    setPaid("0");
    setError("");
    setOpen(false);
  };

  const [y, m, d] = date.split("-");

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-semibold text-card-foreground">
          {Number(d)} {trMonths[Number(m) - 1]} {y} · {list.length} randevu
        </h2>
        <button onClick={() => setOpen((o) => !o)} className="btnPrimary">
          {open ? "Vazgeç" : "+ Randevu ekle"}
        </button>
      </div>

      {open && (
        <div className="mt-4 grid gap-3 rounded-lg border border-border bg-secondary/40 p-3 sm:grid-cols-2">
          <label className="block text-sm sm:col-span-2">
            <span className="lbl">Salon (kat)</span>
            <select value={hallId} onChange={(e) => setHallId(e.target.value)} className="field">
              {halls.map((h) => (
                <option key={h.id} value={h.id} disabled={busy.has(h.id)}>
                  {h.venueName} — {h.name} · {h.floor} {busy.has(h.id) ? "(dolu)" : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm">
            <span className="lbl">Kiracı</span>
            <input value={customer} onChange={(e) => setCustomer(e.target.value)} className="field" placeholder="Ad Soyad / Aile" />
          </label>
          <label className="block text-sm">
            <span className="lbl">Telefon</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="field" placeholder="05.." />
          </label>
          <label className="block text-sm">
            <span className="lbl">Kira ücreti (₺)</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="field"
              placeholder={selected ? String(selected.dailyPrice) : "0"}
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
        {list.length === 0 && <p className="text-sm text-muted-foreground">Bu tarihte kayıt yok.</p>}
        {list.map((r) => {
          const h = halls.find((x) => x.id === r.hallId);
          const debt = r.price - r.paid;
          return (
            <div key={r.id} className="rounded-lg border border-border p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-card-foreground">{r.customer}</p>
                  <p className="text-xs text-muted-foreground">
                    {h ? `${h.venueName} · ${h.name} · ${h.floor} · ${h.capacity} kişi` : "Salon silinmiş"}
                    {r.phone ? ` · ${r.phone}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    debt <= 0 ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
                  }`}
                >
                  {debt <= 0 ? "Ödendi" : `Kalan ${money(debt)}`}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Kira: {money(r.price)}</span>
                <input
                  type="number"
                  value={r.paid}
                  onChange={(e) => onPaid(r.id, Number(e.target.value) || 0)}
                  className="field w-28"
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
  addHall: (venueId: string, hall: { name: string; floor: string; capacity: number; dailyPrice: number }) => void;
  removeHall: (venueId: string, hallId: string) => void;
  reset: () => void;
}) {
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-card p-4">
        <h2 className="font-semibold text-card-foreground">Yeni işletme (düğün yeri) ekle</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="İşletme adı" />
          <input value={district} onChange={(e) => setDistrict(e.target.value)} className="field" placeholder="Mahalle / semt" />
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
  venue: { id: string; name: string; district: string; halls: { id: string; name: string; floor: string; capacity: number; dailyPrice: number }[] };
  addHall: (venueId: string, hall: { name: string; floor: string; capacity: number; dailyPrice: number }) => void;
  removeHall: (venueId: string, hallId: string) => void;
  removeVenue: (id: string) => void;
}) {
  const [hall, setHall] = useState({ name: "", floor: "", capacity: "", dailyPrice: "" });

  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-card-foreground">{venue.name}</h3>
          <p className="text-xs text-muted-foreground">
            {venue.district || "—"} · {venue.halls.length} salon
          </p>
        </div>
        <button onClick={() => removeVenue(venue.id)} className="btnDanger">
          İşletmeyi sil
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {venue.halls.map((h) => (
          <div key={h.id} className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="font-medium text-card-foreground">{h.name}</p>
            <p className="text-xs text-muted-foreground">
              {h.floor} · {h.capacity} kişi · {money(h.dailyPrice)}/gün
            </p>
            <button onClick={() => removeHall(venue.id, h.id)} className="mt-2 text-xs text-destructive underline">
              Salonu kaldır
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-5">
        <input value={hall.name} onChange={(e) => setHall({ ...hall, name: e.target.value })} className="field" placeholder="Salon adı" />
        <input value={hall.floor} onChange={(e) => setHall({ ...hall, floor: e.target.value })} className="field" placeholder="Kat (ör. 1. Kat)" />
        <input type="number" value={hall.capacity} onChange={(e) => setHall({ ...hall, capacity: e.target.value })} className="field" placeholder="Kapasite" />
        <input type="number" value={hall.dailyPrice} onChange={(e) => setHall({ ...hall, dailyPrice: e.target.value })} className="field" placeholder="Günlük kira" />
        <button
          onClick={() => {
            if (!hall.name.trim()) return;
            addHall(venue.id, {
              name: hall.name.trim(),
              floor: hall.floor.trim() || "Zemin Kat",
              capacity: Number(hall.capacity) || 0,
              dailyPrice: Number(hall.dailyPrice) || 0,
            });
            setHall({ name: "", floor: "", capacity: "", dailyPrice: "" });
          }}
          className="btnPrimary"
        >
          Salon ekle
        </button>
      </div>
    </section>
  );
}
