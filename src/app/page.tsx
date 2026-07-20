import { Logo } from "@/components/Logo";
import { SeasonCalculator } from "@/components/SeasonCalculator";
import { WaitlistForm } from "@/components/WaitlistForm";
import { formatUsd } from "@/lib/earnings";
import { rankScenarios, REALISTIC_SEASON_WEEKS } from "@/lib/scenarios";

const TIER_LABEL = {
  target: null,
  second: "второй эшелон",
  trap: "ловушка",
} as const;

const NAV = [
  { href: "#costs", label: "Как читать расчёт" },
  { href: "#directions", label: "Направления" },
  { href: "#process", label: "Как мы работаем" },
];

export default function HomePage() {
  const ranked = rankScenarios();
  const profitableWithOneJob = ranked.filter((r) => r.oneJob.netHome > 0).length;
  const bestGain = ranked.reduce((max, r) => Math.max(max, r.secondJobGain), 0);

  return (
    <>
      <header className="mx-auto max-w-[86rem] px-6 lg:px-10">
        <div className="flex items-center justify-between gap-6 py-5">
          <a href="#top" aria-label="SWAT — на главную">
            <Logo height={40} />
          </a>
          <nav className="hidden items-center gap-9 lg:flex">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="swat-nav-link">
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#waitlist" className="swat-button shrink-0">
            Начать
          </a>
        </div>
        <div className="border-t border-[var(--color-ink)]" />
      </header>

      <main id="top">
        {/* Герой: тезис слева, живой документ справа */}
        <section className="mx-auto max-w-[86rem] px-6 pb-20 pt-12 lg:px-10 lg:pt-16">
          <div className="grid gap-14 lg:grid-cols-[1fr_1.02fr] lg:items-start lg:gap-16">
            <div className="lg:sticky lg:top-10">
              <h1 className="swat-display">
                Одна
                <br />
                работа
                <br />
                <span style={{ color: "var(--color-void)" }}>это ноль.</span>
              </h1>

              <div className="mt-8 max-w-md space-y-4 text-[1.02rem] leading-relaxed text-[var(--color-ink-soft)]">
                <p>
                  Мы показываем реальные числа за твоей зарплатой на Work and
                  Travel — до того, как ты купишь билет.
                </p>
                <p>
                  Посчитай сезон, разбери каждое удержание и увидь, сколько
                  останется на руках. Иногда расчёт говорит, что ехать не надо.
                  Мы всё равно его показываем.
                </p>
              </div>

              <div className="mt-10 max-w-md border-t border-[var(--color-rule)] pt-6">
                <dl className="grid grid-cols-2 items-end">
                  <div className="pr-6">
                    <dt className="swat-caption">С одной работой</dt>
                    <dd className="swat-num mt-2 text-[1.9rem] font-medium leading-none">
                      {profitableWithOneJob} из {ranked.length}
                    </dd>
                  </div>
                  <div className="border-l border-[var(--color-rule)] pl-6">
                    <dt className="swat-caption">Вторая работа даёт</dt>
                    <dd
                      className="swat-num mt-2 text-[1.9rem] font-medium leading-none"
                      style={{ color: "var(--color-stamp)" }}
                    >
                      +{formatUsd(bestGain)}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            <SeasonCalculator />
          </div>
        </section>

        {/* Что съедает сезон */}
        <section
          id="costs"
          className="border-y border-[var(--color-ink)] bg-[var(--color-paper-deep)]"
        >
          <div className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10">
            <h2 className="swat-h2 max-w-3xl">
              Ставка — это не зарплата.
              <br />
              Это только первая строка.
            </h2>
            <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Вторая работа",
                  body: "Единственный рычаг, который меняет исход на тысячи, а не на сотни. Но она обязана быть проверена спонсором до первой смены: работа на неоформленном месте — основание для отчисления с программы.",
                },
                {
                  title: "Недели",
                  body: `Окно Казахстана — с 8 мая по 1 сентября, но участник ограничен длительностью своих каникул. Реалистично это ${REALISTIC_SEASON_WEEKS} рабочих недель, а не 16. Считай по своему учебному календарю.`,
                },
                {
                  title: "Жильё",
                  body: "Главная статья расходов, от $105 до $210 в неделю. Если жильё съедает больше 35% дохода, сезон работает на арендодателя. На Кейп-Коде дело доходило до того, что студентам просто негде было жить.",
                },
                {
                  title: "Налоги",
                  body: "FICA (7.65%) не удерживается — это льгота статуса J-1. Чаевые и надбавки за переработку выведены из-под федерального налога до 2028 года. А вот стандартного вычета у нерезидента нет.",
                },
              ].map((item) => (
                <div key={item.title}>
                  <h3 className="text-[1.1rem] font-semibold">{item.title}</h3>
                  <p className="mt-2.5 text-[0.9rem] leading-relaxed text-[var(--color-ink-soft)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Рейтинг направлений */}
        <section
          id="directions"
          className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10"
        >
          <h2 className="swat-h2 max-w-3xl">
            Направления, отсортированные
            <br />
            по остатку на руках
          </h2>
          <p className="mt-6 max-w-2xl leading-relaxed text-[var(--color-ink-soft)]">
            Типовая работа, типовое жильё, {REALISTIC_SEASON_WEEKS} рабочих
            недель. Вычтено всё, включая перелёт из Алматы, визовые сборы и
            стоимость программы. Слева — то, что получают почти все. Справа —
            то же место с двумя одобренными работами.
          </p>

          {/* Мобильная раскладка: итог не должен прятаться за скроллом. */}
          <ul className="mt-12 grid gap-3 lg:hidden">
            {ranked.map((row, i) => {
              const loss = row.twoJobs.netHome < 0;
              const oneLoss = row.oneJob.netHome <= 0;
              const tier = TIER_LABEL[row.scenario.tier];
              return (
                <li
                  key={`${row.scenario.stateCode}-${row.scenario.town}`}
                  className="border px-4 py-3.5"
                  style={{
                    borderColor:
                      loss || row.scenario.tier === "trap"
                        ? "var(--color-void)"
                        : "var(--color-ink)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        <span className="swat-num text-[var(--color-ink-faint)]">
                          {String(i + 1).padStart(2, "0")}
                        </span>{" "}
                        {row.scenario.town}, {row.scenario.stateCode}
                      </p>
                      <p className="mt-0.5 text-[0.8rem] text-[var(--color-ink-faint)]">
                        {row.scenario.role}
                        {tier && (
                          <span
                            className="uppercase"
                            style={{ color: "var(--color-void)" }}
                          >
                            {" · "}
                            {tier}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className="swat-num block text-[1.3rem] font-bold leading-none"
                        style={loss ? { color: "var(--color-void)" } : undefined}
                      >
                        {formatUsd(row.twoJobs.netHome)}
                      </span>
                      <span className="swat-caption">с двумя</span>
                    </div>
                  </div>
                  <p className="swat-caption mt-2 flex flex-wrap gap-x-3">
                    <span style={oneLoss ? { color: "var(--color-void)" } : undefined}>
                      одна работа · {formatUsd(row.oneJob.netHome)}
                    </span>
                    {row.secondJobGain > 0 && (
                      <span style={{ color: "var(--color-stamp)" }}>
                        вторая · +{formatUsd(row.secondJobGain)}
                      </span>
                    )}
                  </p>
                </li>
              );
            })}
          </ul>

          <div className="mt-12 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--color-ink)]">
                  <th className="swat-caption py-3 pr-4">Место</th>
                  <th className="swat-caption py-3 pr-4">Направление</th>
                  <th className="swat-caption py-3 pr-4 text-right">Ставка</th>
                  <th className="swat-caption py-3 pr-4 text-right">
                    Одна работа
                  </th>
                  <th className="swat-caption py-3 pr-4 text-right">
                    Вторая даёт
                  </th>
                  <th className="swat-caption py-3 text-right">Итого с двумя</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((row, i) => {
                  const loss = row.twoJobs.netHome < 0;
                  const oneLoss = row.oneJob.netHome <= 0;
                  const tier = TIER_LABEL[row.scenario.tier];
                  return (
                    <tr
                      key={`${row.scenario.stateCode}-${row.scenario.town}`}
                      className="border-b border-[var(--color-rule)]"
                    >
                      <td className="swat-num py-4 pr-4 text-[var(--color-ink-faint)]">
                        {String(i + 1).padStart(2, "0")}
                      </td>
                      <td className="py-4 pr-4">
                        <span className="font-medium">
                          {row.scenario.town}, {row.scenario.stateCode}
                        </span>
                        <span className="block text-[0.8rem] text-[var(--color-ink-faint)]">
                          {row.scenario.role}
                          {!row.hasStateIncomeTax && " · нет налога штата"}
                          {tier && (
                            <span
                              className="uppercase"
                              style={{ color: "var(--color-void)" }}
                            >
                              {" · "}
                              {tier}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="swat-num py-4 pr-4 text-right">
                        ${row.scenario.hourlyWage.toFixed(2)}
                      </td>
                      <td
                        className="swat-num py-4 pr-4 text-right"
                        style={{
                          color: oneLoss
                            ? "var(--color-void)"
                            : "var(--color-ink-soft)",
                        }}
                      >
                        {formatUsd(row.oneJob.netHome)}
                      </td>
                      <td
                        className="swat-num py-4 pr-4 text-right"
                        style={{
                          color:
                            row.secondJobGain > 0
                              ? "var(--color-stamp)"
                              : "var(--color-ink-faint)",
                        }}
                      >
                        {row.secondJobGain > 0
                          ? `+${formatUsd(row.secondJobGain)}`
                          : "нет"}
                      </td>
                      <td
                        className="swat-num py-4 text-right text-[1.05rem] font-bold"
                        style={loss ? { color: "var(--color-void)" } : undefined}
                      >
                        {formatUsd(row.twoJobs.netHome)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="swat-note mt-6 max-w-2xl">
            Предварительные оценки на основе типовых условий. Каждое число
            заменяется подтверждённым после сверки с работодателем. «Ловушка» —
            направление, где остаток съедают жильё, короткий сезон или
            отсутствие второй работы.
          </p>
        </section>

        {/* Обещания */}
        <section
          id="process"
          className="border-y border-[var(--color-ink)] bg-[var(--color-stub)]"
        >
          <div className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10">
            <h2 className="swat-h2 max-w-3xl">
              Что мы обещаем и чего не обещаем
            </h2>
            <div className="mt-12 grid gap-12 lg:grid-cols-2">
              <div>
                <p className="swat-section mb-5">Обещаем</p>
                <ul className="grid gap-4">
                  {[
                    "Показать расчёт до оплаты — включая направления, от которых отговариваем.",
                    "Оформить вторую работу заранее и через спонсора, чтобы она была законной.",
                    "Назвать спонсора и дать проверить его в официальном реестре BridgeUSA.",
                    "Опубликованную в долларах политику возврата, если визу не дадут.",
                    "Подписанный оффер с названием работодателя и городом до финального платежа.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[0.95rem] leading-relaxed"
                    >
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
              </div>
              <div>
                <p className="swat-section mb-5" style={{ color: "var(--color-void)" }}>
                  Не обещаем
                </p>
                <ul className="grid gap-4">
                  {[
                    "Гарантию визы. Решение принимает консул, и никто на него не влияет.",
                    "Запись на собеседование в срок. Мощность консульства ограничена не нами.",
                    "Конкретную сумму заработка. Гарантировать можно часы в оффере, а не чаевые.",
                    "Самую низкую цену на рынке. Дёшево обычно значит, что за оффер платит кто-то другой.",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex gap-3 text-[0.95rem] leading-relaxed"
                    >
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
          </div>
        </section>

        {/* Лист ожидания */}
        <section
          id="waitlist"
          className="mx-auto max-w-[86rem] px-6 py-20 lg:px-10"
        >
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="swat-h2">
                Набор на сезон 2027
                <br />
                стартует 1 сентября
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-[var(--color-ink-soft)]">
                Оставь контакт — напишем, когда появятся подтверждённые офферы
                с полным расчётом. Без спама и без звонков с давлением: одно
                сообщение, когда будет что показать.
              </p>
              <p className="swat-note mt-8 max-w-lg">
                SWAT — независимый сервис расчёта. Мы не спонсор программы и не
                работодатель. Размещение идёт через назначенного спонсора
                BridgeUSA, и его имя мы называем до оплаты.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-[86rem] px-6 lg:px-10">
        <p className="max-w-3xl pb-8 text-[0.8rem] leading-relaxed text-[var(--color-ink-faint)]">
          Расчёты на сайте — оценка, а не оффер и не налоговая консультация.
          Условия работы подтверждаются письменно работодателем и спонсором до
          любой оплаты. Проверяй спонсора в официальном реестре BridgeUSA на
          j1visa.state.gov.
        </p>
        <div className="border-t border-[var(--color-ink)]" />
        <div className="flex flex-wrap items-center justify-between gap-3 py-6">
          <span className="swat-caption">Прозрачный расчёт для студентов</span>
          <span className="swat-caption">SWAT © 2026</span>
        </div>
      </footer>
    </>
  );
}
