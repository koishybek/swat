import { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import logo from "../image.png";
import { destinations, jobs, sponsorOptions } from "./data";
import "./styles.css";

const iconPaths = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  search: "m20 20-4.4-4.4m2.4-5.1a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z",
  pin: "M12 21s6-4.35 6-10A6 6 0 1 0 6 11c0 5.65 6 10 6 10Zm0-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z",
  clock: "M12 6v6l4 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  home: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10Z",
  bus: "M6 17v2m12-2v2M5 13h14M7 5h10a2 2 0 0 1 2 2v10H5V7a2 2 0 0 1 2-2Zm0 4h10",
  check: "m5 12 4 4L19 6",
  heart: "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 1 0-7.8 7.8L12 21l8.9-8.6a5.5 5.5 0 0 0-.1-7.8Z",
  close: "m6 6 12 12M18 6 6 18",
  chevron: "m6 9 6 6 6-6",
  shield: "M12 3 5 6v5c0 4.5 3 7.7 7 10 4-2.3 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4",
  sliders: "M4 7h16M4 17h16M9 4v6m6 4v6",
  bookmark: "M6 4h12v17l-6-4-6 4V4Z"
};

function Icon({ name, size = 18, fill = "none" }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={iconPaths[name]} />
    </svg>
  );
}

function Logo() {
  return (
    <a className="brand" href="#top" aria-label="SWAT — на главную">
      <span className="brand-flight" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <span className="brand-copy">
        <strong>SWAT</strong>
        <small>Swift Work &amp; Travel</small>
      </span>
    </a>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="select-field">
      <span>{label}</span>
      <select value={value} onChange={onChange}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      <Icon name="chevron" size={16} />
    </label>
  );
}

function JobRow({ job, selected, saved, compared, onSelect, onSave, onCompare }) {
  return (
    <article className={"job-row" + (selected ? " is-selected" : "")} onClick={onSelect}>
      <div className="job-row-topline">
        <span className="demo-label">Демо-данные</span>
        <span className="route-label">{job.sponsorRoute}</span>
      </div>
      <div className="job-row-main">
        <div className="job-title-block">
          <h3>{job.company}</h3>
          <p>{job.role} · {job.industry}</p>
        </div>
        <div className="job-location">
          <Icon name="pin" size={16} />
          <span>{job.city}, {job.stateCode}</span>
        </div>
        <div className="job-comp">
          <strong>{job.wage}</strong>
          <span>{job.hours}</span>
        </div>
      </div>
      <div className="job-row-meta">
        <span><Icon name="home" size={15} /> {job.housing}</span>
        <span><Icon name="bus" size={15} /> {job.transport}</span>
        <span className="potential"><b>Потенциал:</b> {job.potential}</span>
      </div>
      <div className="job-row-actions" onClick={(event) => event.stopPropagation()}>
        <button className={"icon-button" + (saved ? " is-active" : "")} onClick={onSave} aria-label={saved ? "Убрать из сохранённых" : "Сохранить вакансию"}>
          <Icon name="heart" size={18} fill={saved ? "currentColor" : "none"} />
        </button>
        <button className={"compare-button" + (compared ? " is-active" : "")} onClick={onCompare}>
          {compared ? "В сравнении" : "Сравнить"}
        </button>
      </div>
    </article>
  );
}

function DetailPanel({ job, saved, compared, onSave, onCompare, onClose }) {
  if (!job) return null;

  return (
    <aside className="detail-panel" aria-label="Детали вакансии">
      <div className="detail-head">
        <span className="demo-label">Демо-данные</span>
        <button className="icon-button close-detail" onClick={onClose} aria-label="Закрыть детали">
          <Icon name="close" size={18} />
        </button>
      </div>
      <h2>{job.company}</h2>
      <p className="detail-location"><Icon name="pin" size={17} /> {job.city}, {job.state}, США</p>
      <div className="detail-role">{job.role} <span>·</span> {job.industry}</div>

      <div className="detail-quick-facts">
        <div><span>Ставка</span><strong>{job.wage}</strong></div>
        <div><span>Часы</span><strong>{job.hours}</strong></div>
        <div><span>Жильё</span><strong>{job.housingCost}</strong></div>
      </div>

      <section className="detail-section">
        <h3>Почему может подойти</h3>
        <p>{job.note}</p>
      </section>

      <section className="detail-section question-section">
        <h3>Уточни до отклика</h3>
        <ul>
          {job.questions.map((question) => <li key={question}><Icon name="check" size={15} /> {question}</li>)}
        </ul>
      </section>

      <section className="verification-note">
        <Icon name="shield" size={19} />
        <p><strong>{job.sponsorRoute}.</strong> Вакансия не является оффером: условия и eligibility нужно подтвердить с назначенным спонсором.</p>
      </section>

      <div className="detail-actions">
        <button className="button button-secondary" onClick={onSave}>
          <Icon name="heart" size={17} fill={saved ? "currentColor" : "none"} /> {saved ? "Сохранено" : "Сохранить"}
        </button>
        <button className={"button button-dark" + (compared ? " is-active" : "")} onClick={onCompare}>
          <Icon name="bookmark" size={17} /> {compared ? "В сравнении" : "Добавить к сравнению"}
        </button>
      </div>
      <p className="source-placeholder">Официальный Careers-источник добавляется после верификации.</p>
    </aside>
  );
}

function App() {
  const [filters, setFilters] = useState({
    search: "",
    state: "all",
    city: "all",
    industry: "all",
    sponsor: "Не выбран",
    housing: false
  });
  const [selectedId, setSelectedId] = useState(jobs[0].id);
  const [savedIds, setSavedIds] = useState([]);
  const [compareIds, setCompareIds] = useState([]);
  const [detailOpen, setDetailOpen] = useState(true);

  const states = useMemo(() => [...new Set(jobs.map((job) => job.state))], []);
  const industries = useMemo(() => [...new Set(jobs.map((job) => job.industry))], []);
  const cities = useMemo(() => {
    const scoped = filters.state === "all" ? jobs : jobs.filter((job) => job.state === filters.state);
    return [...new Set(scoped.map((job) => job.city))];
  }, [filters.state]);

  const filteredJobs = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    return jobs.filter((job) => {
      const haystack = [job.company, job.city, job.state, job.industry, job.role, job.tags.join(" ")].join(" ").toLowerCase();
      const matchesSearch = !query || haystack.includes(query);
      const matchesState = filters.state === "all" || job.state === filters.state;
      const matchesCity = filters.city === "all" || job.city === filters.city;
      const matchesIndustry = filters.industry === "all" || job.industry === filters.industry;
      const matchesHousing = !filters.housing || job.housing !== "Жильё не включено";
      return matchesSearch && matchesState && matchesCity && matchesIndustry && matchesHousing;
    }).sort((a, b) => b.baseWage - a.baseWage);
  }, [filters]);

  const selectedJob = filteredJobs.find((job) => job.id === selectedId) || filteredJobs[0] || null;

  useEffect(() => {
    if (filteredJobs.length && !filteredJobs.some((job) => job.id === selectedId)) {
      setSelectedId(filteredJobs[0].id);
    }
  }, [filteredJobs, selectedId]);

  const updateFilter = (key, value) => {
    setFilters((current) => {
      const next = { ...current, [key]: value };
      if (key === "state") next.city = "all";
      return next;
    });
  };

  const resetFilters = () => {
    setFilters({ search: "", state: "all", city: "all", industry: "all", sponsor: "Не выбран", housing: false });
  };

  const toggleSaved = (id) => {
    setSavedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const toggleCompare = (id) => {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      return current.length >= 3 ? current : [...current, id];
    });
  };

  const scrollToJobs = () => document.querySelector("#vacancies")?.scrollIntoView({ behavior: "smooth" });
  const scrollToHow = () => document.querySelector("#how")?.scrollIntoView({ behavior: "smooth" });

  return (
    <div className="site-shell" id="top">
      <header className="site-header">
        <div className="header-inner">
          <Logo />
          <nav className="main-nav" aria-label="Основная навигация">
            <a href="#vacancies">Вакансии</a>
            <a href="#directions">Направления</a>
            <a href="#how">Как это работает</a>
          </nav>
          <div className="header-actions">
            <button className="saved-link" onClick={() => scrollToJobs()}><Icon name="heart" size={16} /> Избранное <span>{savedIds.length}</span></button>
            <button className="header-cta" onClick={scrollToJobs}>Подобрать работу <Icon name="arrow" size={16} /></button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero section-wrap">
          <div className="hero-copy">
            <p className="season-note">Лето 2027 · интерактивный MVP</p>
            <h1>Работа в США,<br />где <em>цифры сходятся.</em></h1>
            <p className="hero-description">Сравни сезонные вакансии не только по ставке: часы, жильё, транспорт и маршрут через sponsor — до того, как отправить заявку.</p>
            <div className="hero-actions">
              <button className="button button-primary" onClick={scrollToJobs}>Смотреть вакансии <Icon name="arrow" size={18} /></button>
              <button className="text-button" onClick={scrollToHow}>Как это работает <Icon name="arrow" size={17} /></button>
            </div>
            <p className="hero-disclaimer"><Icon name="shield" size={16} /> Только демонстрационные данные. Не оффер и не подтверждённая база работодателей.</p>
          </div>

          <div className="hero-calculator" aria-label="Как оценивать потенциальный доход">
            <div className="hero-calculator-top">
              <span>Не выбирай по ставке</span>
              <span className="calculator-dot">01</span>
            </div>
            <div className="calc-figure">
              <div className="calc-orbit orbit-one" />
              <div className="calc-orbit orbit-two" />
              <span>считай<br /><strong>сезон</strong></span>
            </div>
            <div className="calc-list">
              <div><span>Ставка и чаевые</span><b>+</b></div>
              <div><span>Реальные часы</span><b>+</b></div>
              <div><span>Жильё и транспорт</span><b>−</b></div>
            </div>
            <div className="source-logo-tile"><img src={logo} alt="" /></div>
          </div>
        </section>

        <section className="sponsor-band">
          <div className="section-wrap sponsor-band-inner">
            <Icon name="shield" size={21} />
            <p><strong>Нормальный оффер — это прозрачные условия.</strong> Любую self-placement вакансию должен проверить твой назначенный J‑1 sponsor до старта работы.</p>
            <a href="#how">Разобраться <Icon name="arrow" size={16} /></a>
          </div>
        </section>

        <section className="directory section-wrap" id="vacancies">
          <div className="directory-heading">
            <div>
              <p className="section-kicker">Подобрать работу</p>
              <h2>Сначала сравни условия,<br />потом отправляй заявку.</h2>
            </div>
            <div className="compare-status"><Icon name="bookmark" size={16} /> В сравнении <strong>{compareIds.length}/3</strong></div>
          </div>

          <div className="directory-grid">
            <aside className="filters" aria-label="Фильтры вакансий">
              <div className="filters-head">
                <h3><Icon name="sliders" size={17} /> Фильтры</h3>
                <button onClick={resetFilters}>Сбросить</button>
              </div>
              <label className="search-field">
                <Icon name="search" size={17} />
                <input value={filters.search} onChange={(event) => updateFilter("search", event.target.value)} placeholder="Город, роль или сфера" />
              </label>
              <SelectField label="Штат" value={filters.state} onChange={(event) => updateFilter("state", event.target.value)} options={[{ value: "all", label: "Все штаты" }, ...states.map((state) => ({ value: state, label: state }))]} />
              <SelectField label="Город" value={filters.city} onChange={(event) => updateFilter("city", event.target.value)} options={[{ value: "all", label: "Все города" }, ...cities.map((city) => ({ value: city, label: city }))]} />
              <SelectField label="Сфера" value={filters.industry} onChange={(event) => updateFilter("industry", event.target.value)} options={[{ value: "all", label: "Любая сфера" }, ...industries.map((industry) => ({ value: industry, label: industry }))]} />
              <SelectField label="Мой sponsor" value={filters.sponsor} onChange={(event) => updateFilter("sponsor", event.target.value)} options={sponsorOptions.map((sponsor) => ({ value: sponsor, label: sponsor }))} />
              <label className="switch-line">
                <input type="checkbox" checked={filters.housing} onChange={(event) => updateFilter("housing", event.target.checked)} />
                <span className="switch-ui" />
                <span>Показывать с жильём</span>
              </label>
              {filters.sponsor !== "Не выбран" && <p className="sponsor-selection">Выбран {filters.sponsor}. Доступность конкретной вакансии нужно подтвердить напрямую.</p>}
            </aside>

            <section className="results" aria-live="polite">
              <div className="results-toolbar">
                <p><strong>{filteredJobs.length}</strong> демо-вакансий <span>·</span> сначала по ставке</p>
                <span className="freshness">Статус базы: прототип</span>
              </div>
              <div className="job-list">
                {filteredJobs.length ? filteredJobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    selected={selectedJob?.id === job.id && detailOpen}
                    saved={savedIds.includes(job.id)}
                    compared={compareIds.includes(job.id)}
                    onSelect={() => { setSelectedId(job.id); setDetailOpen(true); }}
                    onSave={() => toggleSaved(job.id)}
                    onCompare={() => toggleCompare(job.id)}
                  />
                )) : (
                  <div className="empty-state">
                    <Icon name="search" size={26} />
                    <h3>Ничего не нашлось</h3>
                    <p>Попробуй убрать часть фильтров или выбрать другой город.</p>
                    <button className="button button-secondary" onClick={resetFilters}>Сбросить фильтры</button>
                  </div>
                )}
              </div>
            </section>

            <DetailPanel
              job={detailOpen ? selectedJob : null}
              saved={selectedJob ? savedIds.includes(selectedJob.id) : false}
              compared={selectedJob ? compareIds.includes(selectedJob.id) : false}
              onSave={() => selectedJob && toggleSaved(selectedJob.id)}
              onCompare={() => selectedJob && toggleCompare(selectedJob.id)}
              onClose={() => setDetailOpen(false)}
            />
          </div>
        </section>

        <section className="directions-section section-wrap" id="directions">
          <div className="directions-intro">
            <p className="section-kicker">Направления для исследования</p>
            <h2>Штат — это старт,<br />не готовый ответ.</h2>
            <p>Рейтинг помогает выбрать, где искать. Реальная выгода живёт на уровне конкретной вакансии, жилья и графика.</p>
          </div>
          <div className="directions-list">
            {destinations.map((destination) => (
              <button className="direction-row" key={destination.state} onClick={() => { updateFilter("state", destination.state); scrollToJobs(); }}>
                <span className="direction-rank">{String(destination.rank).padStart(2, "0")}</span>
                <span><b>{destination.state}</b><small>{destination.places}</small></span>
                <Icon name="arrow" size={18} />
              </button>
            ))}
          </div>
        </section>

        <section className="how-section" id="how">
          <div className="section-wrap">
            <div className="how-head">
              <p className="section-kicker">Как пользоваться</p>
              <h2>Не «найти e-mail»,<br />а собрать хороший оффер.</h2>
            </div>
            <div className="steps">
              <article>
                <span>01</span>
                <h3>Сравни локации</h3>
                <p>Отфильтруй по датам, сфере, ставке, жилью и тому, можно ли жить без машины.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Проверь источник</h3>
                <p>Открывай официальный Careers-канал и сохраняй дату, ставку, часы и условия в одном месте.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Отправь sponsor на vetting</h3>
                <p>Не считай вакансию подтверждённой, пока назначенный sponsor не проверит worksite и offer.</p>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="section-wrap footer-inner">
          <Logo />
          <p>SWAT — независимый прототип для сравнения сезонных вакансий. Не sponsor, не работодатель и не иммиграционный консультант.</p>
          <p>Все компании и условия на этой странице — демонстрационные. Перед заявкой сверяй offer letter и условия со своим sponsor.</p>
        </div>
      </footer>
    </div>
  );
}

createRoot(document.getElementById("root")).render(<App />);
