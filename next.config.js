* { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --green: #1D9E75;
  --green-dark: #0F6E56;
  --green-light: #E1F5EE;
  --green-mid: #5DCAA5;
  --red: #E24B4A;
  --red-light: #FCEBEB;
  --amber: #BA7517;
  --amber-light: #FAEEDA;
  --blue: #185FA5;
  --blue-light: #E6F1FB;
  --gray-50: #F8F7F4;
  --gray-100: #EFEFEC;
  --gray-200: #D3D1C7;
  --gray-400: #888780;
  --gray-600: #5F5E5A;
  --gray-900: #1A1A18;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.07);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.10);
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--gray-50);
  color: var(--gray-900);
  line-height: 1.6;
  min-height: 100vh;
}

/* Layout */
.app-shell { display: flex; min-height: 100vh; }

.sidebar {
  width: 220px;
  background: var(--gray-900);
  display: flex;
  flex-direction: column;
  padding: 0;
  flex-shrink: 0;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 100;
}

.sidebar-logo {
  padding: 1.25rem 1.25rem 1rem;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; gap: 10px;
}

.sidebar-logo .logo-icon {
  width: 32px; height: 32px;
  background: var(--green);
  border-radius: var(--radius-sm);
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
}

.sidebar-logo span {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  letter-spacing: -0.01em;
}

.sidebar-nav { flex: 1; padding: 1rem 0.75rem; display: flex; flex-direction: column; gap: 2px; }

.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: rgba(255,255,255,0.55);
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  transition: all 0.15s;
  text-decoration: none;
}

.nav-item:hover { color: #fff; background: rgba(255,255,255,0.07); }
.nav-item.active { color: #fff; background: rgba(29,158,117,0.25); }
.nav-item .icon { font-size: 17px; }

.sidebar-user {
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(255,255,255,0.08);
  display: flex; align-items: center; gap: 8px;
}

.user-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--green-dark);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 600; color: #fff;
  flex-shrink: 0;
}

.user-info { flex: 1; min-width: 0; }
.user-info .name { font-size: 13px; color: #fff; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.user-info .role { font-size: 11px; color: rgba(255,255,255,0.4); }

.logout-btn {
  background: transparent; border: none; cursor: pointer;
  color: rgba(255,255,255,0.4); font-size: 16px; padding: 2px;
}
.logout-btn:hover { color: rgba(255,255,255,0.8); }

.main-content { margin-left: 220px; flex: 1; padding: 2rem; max-width: calc(100vw - 220px); }

.page-header { margin-bottom: 1.75rem; }
.page-header h1 { font-size: 22px; font-weight: 600; color: var(--gray-900); letter-spacing: -0.02em; }
.page-header p { font-size: 14px; color: var(--gray-400); margin-top: 2px; }

/* Cards */
.card {
  background: #fff;
  border-radius: var(--radius-lg);
  border: 1px solid var(--gray-100);
  box-shadow: var(--shadow-sm);
}

.card-body { padding: 1.25rem; }
.card-header {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--gray-100);
  display: flex; align-items: center; justify-content: space-between;
}
.card-header h3 { font-size: 14px; font-weight: 600; color: var(--gray-600); text-transform: uppercase; letter-spacing: 0.05em; }

/* Stats */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin-bottom: 1.5rem; }

.stat-card {
  background: #fff;
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-md);
  padding: 1rem 1.25rem;
  box-shadow: var(--shadow-sm);
}

.stat-card .label { font-size: 12px; color: var(--gray-400); margin-bottom: 4px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; }
.stat-card .value { font-size: 22px; font-weight: 600; color: var(--gray-900); letter-spacing: -0.02em; }
.stat-card .sub { font-size: 12px; color: var(--gray-400); margin-top: 2px; }
.stat-card.green .value { color: var(--green-dark); }

/* Forms */
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }

.field { display: flex; flex-direction: column; gap: 5px; }
.field label { font-size: 13px; font-weight: 500; color: var(--gray-600); }

.field input, .field select, .field textarea {
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-sm);
  padding: 9px 11px;
  font-size: 14px;
  color: var(--gray-900);
  background: #fff;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  font-family: inherit;
}

.field input:focus, .field select:focus, .field textarea:focus {
  border-color: var(--green);
  box-shadow: 0 0 0 3px rgba(29,158,117,0.12);
}

.field textarea { resize: vertical; min-height: 72px; }

/* Buttons */
.btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px; font-weight: 500;
  cursor: pointer; border: none;
  transition: all 0.15s;
  white-space: nowrap;
}

.btn-primary { background: var(--green); color: #fff; }
.btn-primary:hover { background: var(--green-dark); }
.btn-secondary { background: var(--gray-100); color: var(--gray-900); border: 1px solid var(--gray-200); }
.btn-secondary:hover { background: var(--gray-200); }
.btn-danger { background: var(--red-light); color: var(--red); }
.btn-danger:hover { background: #f7c1c1; }
.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-full { width: 100%; justify-content: center; }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* Type selector */
.type-selector { display: flex; gap: 8px; }
.type-btn {
  flex: 1; padding: 10px 8px;
  border: 1.5px solid var(--gray-200);
  border-radius: var(--radius-sm);
  cursor: pointer; text-align: center;
  font-size: 13px; font-weight: 500;
  background: #fff;
  color: var(--gray-600);
  transition: all 0.15s;
}
.type-btn:hover { border-color: var(--green); color: var(--green); }
.type-btn.active-magna { border-color: var(--red); color: var(--red); background: var(--red-light); }
.type-btn.active-premium { border-color: var(--blue); color: var(--blue); background: var(--blue-light); }
.type-btn.active-diesel { border-color: var(--amber); color: var(--amber); background: var(--amber-light); }

/* Results box */
.results-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 1rem 0; }
.result-box {
  background: var(--gray-50);
  border: 1px solid var(--gray-100);
  border-radius: var(--radius-md);
  padding: 1rem;
  text-align: center;
}
.result-box .r-label { font-size: 11px; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
.result-box .r-val { font-size: 20px; font-weight: 600; color: var(--gray-900); }
.result-box.highlight .r-val { color: var(--green-dark); }

/* Toggle caseta */
.toggle-row { display: flex; align-items: center; gap: 10px; margin: 0.5rem 0; }
.toggle { position: relative; width: 36px; height: 20px; }
.toggle input { opacity: 0; width: 0; height: 0; }
.toggle-slider {
  position: absolute; inset: 0;
  background: var(--gray-200); border-radius: 20px;
  cursor: pointer; transition: 0.2s;
}
.toggle-slider:before {
  content: '';
  position: absolute;
  width: 14px; height: 14px;
  left: 3px; top: 3px;
  background: #fff; border-radius: 50%;
  transition: 0.2s;
}
.toggle input:checked + .toggle-slider { background: var(--green); }
.toggle input:checked + .toggle-slider:before { transform: translateX(16px); }
.toggle-label { font-size: 13px; color: var(--gray-600); font-weight: 500; }

/* Table */
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th { font-size: 11px; font-weight: 600; color: var(--gray-400); text-transform: uppercase; letter-spacing: 0.05em; padding: 8px 12px; border-bottom: 1px solid var(--gray-100); text-align: left; white-space: nowrap; }
td { padding: 10px 12px; border-bottom: 1px solid var(--gray-100); color: var(--gray-900); }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--gray-50); }

/* Badges */
.badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 11px; font-weight: 500; }
.badge-magna { background: var(--red-light); color: var(--red); }
.badge-premium { background: var(--blue-light); color: var(--blue); }
.badge-diesel { background: var(--amber-light); color: var(--amber); }
.badge-super { background: var(--green-light); color: var(--green-dark); }
.badge-user { background: var(--gray-100); color: var(--gray-600); }

/* Tabs */
.tabs { display: flex; gap: 4px; background: var(--gray-100); padding: 4px; border-radius: var(--radius-md); width: fit-content; margin-bottom: 1.5rem; }
.tab-btn { padding: 7px 16px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; cursor: pointer; border: none; background: transparent; color: var(--gray-600); transition: all 0.15s; }
.tab-btn.active { background: #fff; color: var(--gray-900); box-shadow: var(--shadow-sm); }

/* Login */
.login-page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--gray-50); }
.login-card { background: #fff; border-radius: var(--radius-lg); border: 1px solid var(--gray-100); box-shadow: var(--shadow-md); padding: 2rem; width: 100%; max-width: 380px; }
.login-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 1.75rem; }
.login-logo .icon { width: 36px; height: 36px; background: var(--green); border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; font-size: 18px; }
.login-logo h1 { font-size: 18px; font-weight: 600; }

/* Alerts */
.alert { padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; margin-bottom: 1rem; }
.alert-error { background: var(--red-light); color: var(--red); border: 1px solid #f7c1c1; }
.alert-success { background: var(--green-light); color: var(--green-dark); border: 1px solid #9FE1CB; }

/* Price presets */
.price-presets { display: flex; gap: 5px; flex-wrap: wrap; margin-top: 5px; }
.price-preset-btn { padding: 2px 8px; font-size: 11px; border: 1px solid var(--gray-200); border-radius: 20px; background: transparent; cursor: pointer; color: var(--gray-600); }
.price-preset-btn:hover { border-color: var(--green); color: var(--green); }

/* Empty state */
.empty-state { text-align: center; padding: 3rem 1rem; color: var(--gray-400); }
.empty-state .icon { font-size: 40px; margin-bottom: 12px; }
.empty-state p { font-size: 14px; }

/* Responsive */
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .main-content { margin-left: 0; padding: 1rem; max-width: 100vw; }
  .form-grid { grid-template-columns: 1fr; }
  .form-grid-3 { grid-template-columns: 1fr 1fr; }
  .results-row { grid-template-columns: 1fr; }
}

/* Divider */
.divider { height: 1px; background: var(--gray-100); margin: 1rem 0; }

/* Section spacing */
.section-gap { margin-bottom: 1.5rem; }

/* Role chip */
.role-chip { display: inline-flex; align-items: center; gap: 4px; }
