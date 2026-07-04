export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function formatJournalTitle(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function formatShortDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export function formatMonthLabel(year: number, month: number): string {
  const date = new Date(year, month, 1);
  const label = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function getWeekdayLabels(): string[] {
  return WEEKDAY_LABELS;
}

/** Returns a flat array of ISO dates (Monday-first weeks) covering the full month grid, including leading/trailing days from adjacent months. */
export function getMonthGrid(year: number, month: number): string[] {
  const firstOfMonth = new Date(year, month, 1);
  const jsWeekday = firstOfMonth.getDay(); // 0 = Sunday
  const mondayOffset = (jsWeekday + 6) % 7; // days to go back to reach Monday
  const gridStart = new Date(year, month, 1 - mondayOffset);

  const days: string[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(toISODate(d));
  }
  return days;
}

export function isSameMonth(iso: string, year: number, month: number): boolean {
  const [y, m] = iso.split("-").map(Number);
  return y === year && m - 1 === month;
}
