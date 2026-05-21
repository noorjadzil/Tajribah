:root {
  --navy: #0f172a;
  --blue: #1e3a8a;
  --bg: #f8fafc;
  --card: #ffffff;
  --line: #e2e8f0;
  --text: #0f172a;
  --muted: #64748b;
  --green: #16a34a;
  --red: #dc2626;
}

* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
}
.header {
  background: linear-gradient(135deg, var(--navy), var(--blue));
  color: white;
  padding: 18px 16px 22px;
  border-radius: 0 0 24px 24px;
}
.header h1 { margin: 0 0 4px; font-size: 24px; }
.header p { margin: 0; opacity: .85; }
.nav {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 12px;
}
.nav button, .btn {
  border: 0;
  border-radius: 14px;
  padding: 12px;
  background: var(--navy);
  color: white;
  font-weight: 700;
  cursor: pointer;
}
.nav button.active { background: var(--blue); }
.container { padding: 12px; max-width: 920px; margin: auto; }
.card {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 12px;
  box-shadow: 0 10px 24px rgba(15,23,42,.06);
}
.grid { display: grid; gap: 10px; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
label { font-size: 13px; color: var(--muted); font-weight: 700; }
input, select, textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--line);
  border-radius: 12px;
  font-size: 15px;
  background: white;
}
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid var(--line); padding: 10px 6px; text-align: left; }
th { color: var(--muted); font-size: 13px; }
.right { text-align: right; }
.row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.grow { flex: 1; }
.danger { background: var(--red); }
.success { background: var(--green); }
.muted { color: var(--muted); font-size: 13px; }
.total { font-size: 22px; font-weight: 800; }
@media (max-width: 640px) {
  .grid-2 { grid-template-columns: 1fr; }
  .nav { grid-template-columns: repeat(2, 1fr); }
}
