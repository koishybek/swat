import { SeasonCalculator } from "@/components/SeasonCalculator";
import { Stamp } from "@/components/Stamp";
import { WaitlistForm } from "@/components/WaitlistForm";
import { formatUsd } from "@/lib/earnings";
import { rankScenarios, REALISTIC_SEASON_WEEKS } from "@/lib/scenarios";

const TIER_LABEL = {
  target: null,
  second: "второй эшелон",
  trap: "ловушка",
} as const;

export default function HomePage() {
  const ranked = rankScenarios();

  const profitableWithOneJob = ranked.filter(
    (row) => row.oneJob.netHome > 0,
  ).length;
  const bestGain = ranked.reduce(
    (max, row) => Math.max(max, row.secondJobGain),
    0,
  );

  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <a href="#top" aria-label="SWAT — на главную">
          <Stamp size="sm" />
        </a>
        <nav className="flex items-center gap-5 text-sm">
          <a href="#directions" className="hover:text-[var(--color-stamp)]">
            Направления
          </a>
          <a
            href="#process"
            className="hidden hover:text-[var(--color-stamp)] sm:inline"
          >
            Как мы работаем
          </a>
          <a href="#waitlist" className="swat-button px-4 py-2 text-[0.8rem]">
            В список
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:pt-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
            <div className="lg:sticky lg:top-10">
              <p className="swat-caption">
                Сезон 2027 · набор открывается 1 сентября
              </p>
              <h1 className="swat-display mt-4">
                Одна работа —
                <br />
                это <span style={{ color: "var(--color-void)" }}>ноль.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-[var(--color-ink-soft)]">
                Студент считает ставку × часы × недели и видит красивую сумму.
                Потом из неё уходят жильё, еда, налоги, перелёт и стоимость
                программы — и лето заканчивается в ноль.
              </p>
              <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed">
                Разница между одной работой и двумя больше, чем разница между
                всеми штатами вместе взятыми. Мы оформляем вторую — заранее и
                через спонсора, чтобы она была законной.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--color-rule)] pt-6">
                <div>
                  <dt className="swat-caption">Окупается с одной работой</dt>
                  <dd className="swat-num mt-1 text-[1.6rem] font-bold leading-none">
                    {profitableWithOneJob} из {ranked.length}
                  </dd>
                  <p className="mt-1 text-[0.8rem] text-[var(--color-ink-faint)]">
                    направлений за {REALISTIC_SEASON_WEEKS} рабочих недель
                  </p>
                </div>
                <div>
                  <dt className="swat-caption">Даёт вторая работа</dt>
                  <dd
                    className="swat-num mt-1 text-[1.6rem] font-bold leading-none"
                    style={{ color: "var(--color-stamp)" }}
                  >
                    +{formatUsd(bestGain)}
                  </dd>
                  <p className="mt-1 text-[0.8rem] text-[var(--color-ink-faint)]">
                    в лучшей локации, за тот же сезон
                  </p>
                </div>
              </dl>
            </div>

            <SeasonCalculator />
          </div>
        </section>

        <section className="border-y-2 border-[var(--color-ink)] bg-[var(--color-paper-deep)]">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="swat-h2 max-w-3xl">
              Ставка — это не зарплата.
              <br />
              Это только первая строка.
            </h2>
            <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Вторая работа",
                  body: "Единственный рычаг, который меняет исход на тысячи, а не на сотни. Но она обязана быть проверена спонсором до первой смены: работа на неоформленном месте — основание для отчисления с программы.",
                },
                {
                  title: "Недели",
                  body: `Окно Казахстана — с 8 мая по 1 сентября, но участник ограничен длительностью своих каникул. Реалистично это ${REALISTIC_SEASON_WEEKS} рабочих недель, а не 16. Считать надо по своему учебному календарю.`,
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
                  <h3 className="text-[1.15rem]">{item.title}</h3>
                  <p className="mt-2 text-[0.9rem] leading-relaxed text-[var(--color-ink-soft)]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="directions" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="swat-h2 max-w-3xl">
            Направления, отсортированные
            <br />
            по остатку на руках
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-[var(--color-ink-soft)]">
            Типовая работа, типовое жильё, {REALISTIC_SEASON_WEEKS} рабочих
            недель. Вычтено всё, включая перелёт из Алматы, визовые сборы и
            стоимость программы. Колонка слева — то, что получают почти все.
            Справа — то же место с двумя одобренными работами.
          </p>

          {/* Мобильная раскладка: главное число не должно прятаться за скроллом. */}
          <ul className="mt-10 grid gap-3 lg:hidden">
            {ranked.map((row, index) => {
              const isLoss = row.twoJobs.netHome < 0;
              const oneJobLoss = row.oneJob.netHome <= 0;
              const tier = TIER_LABEL[row.scenario.tier];
              return (
                <li
                  key={`${row.scenario.stateCode}-${row.scenario.town}`}
                  className="border-2 px-4 py-3.5"
                  style={{
                    borderColor:
                      isLoss || row.scenario.tier === "trap"
                        ? "var(--color-void)"
                        : "var(--color-ink)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        <span className="swat-num text-[var(--color-ink-faint)]">
                          {String(index + 1).padStart(2, "0")}
                        </span>{" "}
                        {row.scenario.town}, {row.scenario.stateCode}
                      </p>
                      <p className="mt-0.5 text-[0.8rem] text-[var(--color-ink-faint)]">
                        {row.scenario.role}
                        {tier && (
                          <span
                            style={{ color: "var(--color-void)" }}
                            className="uppercase"
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
                        style={{
                          color: isLoss ? "var(--color-void)" : undefined,
                        }}
                      >
                        {formatUsd(row.twoJobs.netHome)}
                      </span>
                      <span className="swat-caption">с двумя работами</span>
                    </div>
                  </div>
                  <p className="swat-caption mt-2 flex flex-wrap gap-x-3">
                    <span style={oneJobLoss ? { color: "var(--color-void)" } : undefined}>
                      одна работа · {formatUsd(row.oneJob.netHome)}
                    </span>
                    {row.secondJobGain > 0 && (
                      <span style={{ color: "var(--color-stamp)" }}>
                        вторая · +{formatUsd(row.secondJobGain)}
                      </span>
                    )}
                  </p>
                  {row.scenario.tier === "trap" && (
                    <p
                      className="swat-caption mt-2 leading-relaxed"
                      style={{ color: "var(--color-void)" }}
                    >
                      {row.scenario.tierNote}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-10 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[52rem] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-[var(--color-ink)]">
                  <th className="swat-caption py-3 pr-4">Место</th>
                  <th className="swat-caption py-3 pr-4">Направление</th>
                  <th className="swat-caption py-3 pr-4 text-right">Ставка</th>
                  <th className="swat-caption py-3 pr-4 text-right">
                    Одна работа
                  </th>
                  <th className="swat-caption py-3 pr-4 text-right">
                    Вторая даёт
                  </th>
                  <th className="swat-caption py-3 text-right">
                    Итого с двумя
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((row, index) => {
                  const isLoss = row.twoJobs.netHome < 0;
                  const oneJobLoss = row.oneJob.netHome <= 0;
                  const tier = TIER_LABEL[row.scenario.tier];
                  return (
                    <tr
                      key={`${row.scenario.stateCode}-${row.scenario.town}`}
                      className="border-b border-[var(--color-rule)]"
                    >
                      <td className="swat-num py-3.5 pr-4 text-[var(--color-ink-faint)]">
                        {String(index + 1).padStart(2, "0")}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="font-medium">
                          {row.scenario.town}, {row.scenario.stateCode}
                        </span>
                        <span className="block text-[0.8rem] text-[var(--color-ink-faint)]">
                          {row.scenario.role}
                          {!row.hasStateIncomeTax && " · нет налога штата"}
                          {tier && (
                            <span
                              style={{ color: "var(--color-void)" }}
                              className="uppercase"
                            >
                              {" · "}
                              {tier}
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="swat-num py-3.5 pr-4 text-right">
                        ${row.scenario.hourlyWage.toFixed(2)}
                      </td>
                      <td
                        className="swat-num py-3.5 pr-4 text-right"
                        style={{
                          color: oneJobLoss
                            ? "var(--color-void)"
                            : "var(--color-ink-soft)",
                        }}
                      >
                        {formatUsd(row.oneJob.netHome)}
                      </td>
                      <td
                        className="swat-num py-3.5 pr-4 text-right"
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
                        className="swat-num py-3.5 text-right text-[1.05rem] font-bold"
                        style={
                          isLoss ? { color: "var(--color-void)" } : undefined
                        }
                      >
                        {formatUsd(row.twoJobs.netHome)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="swat-caption mt-5 max-w-2xl leading-relaxed">
            Предварительные оценки на основе типовых условий. Каждое число
            заменяется подтверждённым после сверки с работодателем. «Ловушка»
            означает направление, где остаток съедают жильё, короткий сезон
            или отсутствие второй работы.
          </p>
        </section>

        <section
          id="process"
          className="border-y-2 border-[var(--color-ink)] bg-[var(--color-stub)]"
        >
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="swat-h2 max-w-3xl">
              Что мы обещаем и чего не обещаем
            </h2>
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div>
                <p className="swat-caption mb-4">Обещаем</p>
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
                <p className="swat-caption mb-4">Не обещаем</p>
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

        <section id="waitlist" className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="swat-h2">
                Набор на сезон 2027
                <br />
                стартует 1 сентября
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-[var(--color-ink-soft)]">
                Оставь контакт — напишем, когда появятся подтверждённые офферы
                с полным расчётом. Без спама и без звонков с давлением: одно
                сообщение, когда будет что показать.
              </p>
              <p className="swat-caption mt-6 leading-relaxed">
                SWAT — независимый сервис расчёта. Мы не спонсор программы и не
                работодатель. Размещение участников идёт через назначенного
                спонсора BridgeUSA, и его имя мы называем до оплаты.
              </p>
            </div>
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-[var(--color-ink)]">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Stamp size="sm" />
          <p className="max-w-xl text-[0.8rem] leading-relaxed text-[var(--color-ink-faint)]">
            Расчёты на сайте — оценка, а не оффер и не налоговая консультация.
            Условия работы подтверждаются письменно работодателем и спонсором
            до любой оплаты. Проверяй спонсора в официальном реестре BridgeUSA
            на j1visa.state.gov.
          </p>
        </div>
      </footer>
    </>
  );
}
