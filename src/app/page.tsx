import { Logo } from "@/components/Logo";
import { SeasonCalculator } from "@/components/SeasonCalculator";
import { WaitlistForm } from "@/components/WaitlistForm";
import { formatUsd } from "@/lib/earnings";
import { rankScenarios, REALISTIC_SEASON_WEEKS } from "@/lib/scenarios";

/**
 * Короткие причины для «куда не повезём» — копирайт уровня страницы.
 * Длинные обоснования живут в данных сценариев и в брифинге.
 */
const TRAP_REASON: Record<string, string> = {
  "Cape Cod": "негде жить — в 2022-м отсюда вывезли 3 000 студентов",
  "Estes Park": "летом работы мало, а жильё дороже, чем ты заработаешь",
  "Bar Harbor": "дорогое жильё и самый жадный налог штата — сезон в минус",
};

export default function HomePage() {
  const ranked = rankScenarios();
  const best = ranked[0]!;
  const targets = ranked.filter((r) => r.scenario.tier === "target").slice(0, 5);
  const traps = ranked.filter((r) => r.scenario.tier === "trap");
  const profitableOneJob = ranked.filter((r) => r.oneJob.netHome > 0).length;

  return (
    <>
      <header className="mx-auto max-w-[86rem] px-6 lg:px-10">
        <div className="flex items-center justify-between gap-6 py-5">
          <a href="#top" aria-label="SWAT — на главную">
            <Logo height={40} />
          </a>
          <nav className="hidden items-center gap-9 sm:flex">
            <a href="#calc" className="swat-nav-link">
              Расчёт
            </a>
            <a href="#directions" className="swat-nav-link">
              Направления
            </a>
          </nav>
          <a href="#waitlist" className="swat-button shrink-0">
            В список
          </a>
        </div>
        <div className="border-t border-[var(--color-ink)]" />
      </header>

      <main id="top">
        {/* Герой: тезис + удар в три строки. Без бухгалтерии. */}
        <section className="mx-auto max-w-[86rem] px-6 pb-20 pt-12 lg:px-10 lg:pt-20">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-20">
            <div>
              <h1 className="swat-display">
                Одна
                <br />
                работа
                <br />
                <span style={{ color: "var(--color-void)" }}>это ноль.</span>
              </h1>

              <p className="mt-7 max-w-md text-[1.05rem] leading-relaxed text-[var(--color-ink-soft)]">
                Ставка $15 звучит неплохо — пока из неё не вычли жильё, еду,
                налоги и билет. С одной работой лето выходит в ноль.
              </p>
              <p className="mt-3 max-w-md text-[1.05rem] leading-relaxed">
                Поэтому мы оформляем вторую — легально, через спонсора, до
                вылета. Она и есть твой заработок.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#waitlist" className="swat-button swat-button--solid">
                  Хочу на лето 2027
                </a>
                <a href="#calc" className="swat-button">
                  Посчитать сезон
                </a>
              </div>
            </div>

            {/* Весь питч в четырёх строках. */}
            <div className="swat-stub px-6 py-8 sm:px-8">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="swat-caption" style={{ color: "var(--color-ink)" }}>
                  {best.scenario.town}, {best.scenario.stateCode}
                </span>
                <span className="swat-caption" style={{ color: "var(--color-ink)" }}>
                  {REALISTIC_SEASON_WEEKS} недель
                </span>
              </div>

              <div className="mt-5">
                <div className="swat-row">
                  <span className="swat-row__label">Одна работа</span>
                  <span className="swat-row__leader" aria-hidden="true" />
                  <span
                    className="swat-row__amount"
                    style={{ color: "var(--color-void)" }}
                  >
                    {formatUsd(best.oneJob.netHome)}
                  </span>
                </div>
                <div className="swat-row">
                  <span className="swat-row__label">Плюс вторая работа</span>
                  <span className="swat-row__leader" aria-hidden="true" />
                  <span
                    className="swat-row__amount"
                    style={{ color: "var(--color-stamp)", fontWeight: 700 }}
                  >
                    +{formatUsd(best.secondJobGain)}
                  </span>
                </div>
              </div>

              <div className="swat-total mt-5">
                <span className="swat-total__label">На руки домой</span>
                <span className="swat-total__value">
                  {formatUsd(best.twoJobs.netHome)}
                </span>
              </div>

              <p className="swat-note mt-4">
                Уже с вычетом налогов, жилья, программы и билета из Алматы.
              </p>
            </div>
          </div>

          {/* Три числа вместо четырёх абзацев. */}
          <dl className="mt-16 grid gap-8 border-t border-[var(--color-rule)] pt-8 sm:grid-cols-3">
            <div>
              <dd className="swat-num text-[1.9rem] font-medium leading-none">
                {profitableOneJob} из {ranked.length}
              </dd>
              <dt className="mt-2 text-[0.9rem] text-[var(--color-ink-soft)]">
                курортов окупаются, если работа одна
              </dt>
            </div>
            <div>
              <dd
                className="swat-num text-[1.9rem] font-medium leading-none"
                style={{ color: "var(--color-stamp)" }}
              >
                +{formatUsd(best.secondJobGain)}
              </dd>
              <dt className="mt-2 text-[0.9rem] text-[var(--color-ink-soft)]">
                добавляет вторая работа за тот же сезон
              </dt>
            </div>
            <div>
              <dd className="swat-num text-[1.9rem] font-medium leading-none">
                {REALISTIC_SEASON_WEEKS} недель
              </dd>
              <dt className="mt-2 text-[0.9rem] text-[var(--color-ink-soft)]">
                реальный сезон студента из Казахстана, не 16
              </dt>
            </div>
          </dl>
        </section>

        {/* Калькулятор — для тех, кто не верит на слово. */}
        <section
          id="calc"
          className="border-y border-[var(--color-ink)] bg-[var(--color-paper-deep)]"
        >
          <div className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-20">
              <div className="lg:sticky lg:top-10">
                <h2 className="swat-h2">
                  Не веришь —
                  <br />
                  посчитай
                </h2>
                <p className="mt-6 max-w-md leading-relaxed text-[var(--color-ink-soft)]">
                  Двигай ползунки. Формулы те же, по которым мы считаем офферы:
                  налоги каждого штата, переработки, льготы J-1.
                </p>
                <p className="mt-3 max-w-md leading-relaxed text-[var(--color-ink-soft)]">
                  Если расчёт уходит в минус — мы так и скажем. Отговорить от
                  плохого оффера — тоже наша работа.
                </p>
              </div>
              <SeasonCalculator />
            </div>
          </div>
        </section>

        {/* Куда везём и куда нет */}
        <section
          id="directions"
          className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10"
        >
          <h2 className="swat-h2 max-w-3xl">Куда везём — и куда нет</h2>
          <p className="mt-6 max-w-xl leading-relaxed text-[var(--color-ink-soft)]">
            Считаем по остатку на руках, а не по красоте пляжа. Поэтому список
            короткий.
          </p>

          <div className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
            <div>
              <p className="swat-section mb-5">Куда везём</p>
              <ul>
                {targets.map((row, i) => (
                  <li
                    key={row.scenario.town}
                    className="flex items-baseline gap-4 border-b border-[var(--color-rule)] py-4"
                  >
                    <span className="swat-num text-[var(--color-ink-faint)]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">
                        {row.scenario.town}, {row.scenario.stateCode}
                      </p>
                      <p className="mt-0.5 text-[0.8rem] text-[var(--color-ink-faint)]">
                        {row.scenario.role}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="swat-num block text-[1.25rem] font-bold leading-none">
                        {formatUsd(row.twoJobs.netHome)}
                      </span>
                      <span className="swat-caption">с двумя работами</span>
                    </div>
                  </li>
                ))}
              </ul>
              <p className="swat-note mt-4">
                Ещё {ranked.length - targets.length - traps.length} направления —
                в калькуляторе выше. Числа предварительные, до сверки с
                работодателем.
              </p>
            </div>

            <div>
              <p className="swat-section mb-5" style={{ color: "var(--color-void)" }}>
                Куда не повезём
              </p>
              <ul className="grid gap-4">
                {traps.map((row) => (
                  <li
                    key={row.scenario.town}
                    className="border-l-2 py-1 pl-4"
                    style={{ borderColor: "var(--color-void)" }}
                  >
                    <p className="font-medium">
                      {row.scenario.town}, {row.scenario.stateCode}
                      <span
                        className="swat-num ml-2 text-[0.85rem] font-normal"
                        style={{ color: "var(--color-void)" }}
                      >
                        {formatUsd(Math.min(row.oneJob.netHome, row.twoJobs.netHome))}
                      </span>
                    </p>
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-[var(--color-ink-soft)]">
                      {TRAP_REASON[row.scenario.town] ?? row.scenario.tierNote}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="swat-note mt-5">
                Другие агентства продают и эти направления. Мы — нет.
              </p>
            </div>
          </div>
        </section>

        {/* Правила */}
        <section className="border-y border-[var(--color-ink)] bg-[var(--color-stub)]">
          <div className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10">
            <h2 className="swat-h2 max-w-3xl">Что обещаем — и чего нет</h2>
            <div className="mt-12 grid gap-12 lg:grid-cols-2">
              <ul className="grid gap-4">
                {[
                  "Расчёт до оплаты. Даже когда он говорит «не езжай».",
                  "Вторая работа оформлена до вылета — через спонсора.",
                  "Имя спонсора сразу. Проверяй его в реестре BridgeUSA.",
                  "Не дали визу — возврат в долларах, сумма в договоре.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span
                      className="swat-num shrink-0"
                      style={{ color: "var(--color-stamp)" }}
                      aria-hidden="true"
                    >
                      [+]
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <ul className="grid gap-4">
                {[
                  "Гарантию визы не обещаем. Её не даёт никто.",
                  "Сумму заработка не обещаем. Гарантируют часы, не чаевые.",
                  "Самую низкую цену не обещаем. Дёшево — значит, за оффер платит кто-то другой.",
                ].map((item) => (
                  <li key={item} className="flex gap-3 leading-relaxed">
                    <span
                      className="swat-num shrink-0"
                      style={{ color: "var(--color-void)" }}
                      aria-hidden="true"
                    >
                      [−]
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Форма */}
        <section
          id="waitlist"
          className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="swat-h2">
                Займи место
                <br />
                на лето 2027
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-[var(--color-ink-soft)]">
                Набор откроется 1 сентября. Кто в списке — получит офферы с
                расчётом первым. Одно сообщение, без спама и звонков.
              </p>
              <p className="swat-note mt-8 max-w-lg">
                SWAT — не спонсор и не работодатель. Размещение идёт через
                назначенного спонсора BridgeUSA, его имя мы называем до оплаты.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[86rem] px-6 lg:px-10">
        <p className="swat-note max-w-3xl pb-8">
          Расчёты на сайте — оценка, а не оффер и не налоговая консультация.
          Условия подтверждаются письменно работодателем и спонсором до любой
          оплаты. Спонсора проверяй в реестре BridgeUSA на j1visa.state.gov.
        </p>
        <div className="border-t border-[var(--color-ink)]" />
        <div className="flex flex-wrap items-center justify-between gap-3 py-6">
          <span className="swat-caption">Считаем честно</span>
          <span className="swat-caption">SWAT © 2026</span>
        </div>
      </footer>
    </>
  );
}
