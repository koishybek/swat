import { SeasonCalculator } from "@/components/SeasonCalculator";
import { Stamp } from "@/components/Stamp";
import { WaitlistForm } from "@/components/WaitlistForm";
import { formatUsd } from "@/lib/earnings";
import { rankScenarios } from "@/lib/scenarios";

export default function HomePage() {
  const ranked = rankScenarios();
  const best = ranked[0]!;
  const worst = ranked[ranked.length - 1]!;
  const spread = best.result.netHome - worst.result.netHome;

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
          <a href="#process" className="hidden hover:text-[var(--color-stamp)] sm:inline">
            Как мы работаем
          </a>
          <a href="#waitlist" className="swat-button px-4 py-2 text-[0.8rem]">
            В список
          </a>
        </nav>
      </header>

      <main id="top">
        {/* Герой: тезис плюс живой документ */}
        <section className="mx-auto max-w-6xl px-5 pb-16 pt-6 sm:pt-12">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14">
            <div className="lg:sticky lg:top-10">
              <p className="swat-caption">Сезон 2027 · набор открывается осенью</p>
              <h1 className="swat-display mt-4">
                Сначала цифры.
                <br />
                <span style={{ color: "var(--color-stamp)" }}>Потом океан.</span>
              </h1>
              <p className="mt-6 max-w-xl text-[1.05rem] leading-relaxed text-[var(--color-ink-soft)]">
                Каждое агентство показывает тебе фотографию пляжа. Мы показываем
                расчётку: что начислят, что удержат и сколько реально останется
                на руках после жилья, налогов и стоимости самой программы.
              </p>
              <p className="mt-4 max-w-xl text-[1.05rem] leading-relaxed">
                Иногда расчёт говорит, что в этот оффер ехать не надо. Мы всё
                равно его показываем.
              </p>

              <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-[var(--color-rule)] pt-6">
                <div>
                  <dt className="swat-caption">Разброс по направлениям</dt>
                  <dd className="swat-num mt-1 text-[1.6rem] font-bold leading-none">
                    {formatUsd(spread)}
                  </dd>
                  <p className="mt-1 text-[0.8rem] text-[var(--color-ink-faint)]">
                    между лучшим и худшим при похожей работе
                  </p>
                </div>
                <div>
                  <dt className="swat-caption">Разница в ставке</dt>
                  <dd className="swat-num mt-1 text-[1.6rem] font-bold leading-none">
                    ${(best.scenario.hourlyWage - worst.scenario.hourlyWage).toFixed(2)}
                  </dd>
                  <p className="mt-1 text-[0.8rem] text-[var(--color-ink-faint)]">
                    столько объясняет ставка — остальное решают удержания
                  </p>
                </div>
              </dl>
            </div>

            <SeasonCalculator />
          </div>
        </section>

        {/* Что съедает сезон */}
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
                  title: "Жильё",
                  body: "Главная статья расходов. От $110 до $200 в неделю в зависимости от курорта. Если жильё съедает больше 35% дохода, сезон работает на арендодателя.",
                },
                {
                  title: "Часы",
                  body: "Ставка $17 при 28 часах хуже, чем $15 при 40. Устное «часов будет много» ничего не значит — нужна письменная гарантия минимума.",
                },
                {
                  title: "Налоги",
                  body: "Федеральный налог платится с первого доллара: у нерезидента нет стандартного вычета. Зато FICA (7.65%) не удерживается — это законная льгота статуса J-1.",
                },
                {
                  title: "Стоимость входа",
                  body: "Программа, виза, страховка и перелёт — это несколько тысяч долларов до вылета. Пока они не отбиты, ты работаешь в минус.",
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

        {/* Рейтинг направлений по остатку */}
        <section id="directions" className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="swat-h2 max-w-3xl">
            Рейтинг штатов, посчитанный
            <br />
            по остатку, а не по вайбу
          </h2>
          <p className="mt-5 max-w-2xl leading-relaxed text-[var(--color-ink-soft)]">
            Одна и та же сезонная работа в разных штатах даёт разный результат.
            Ниже — модельный расчёт: типовая работа, типовое жильё, вычтено всё,
            включая перелёт из Алматы и стоимость программы.
          </p>

          {/* Мобильная раскладка: главное число не должно прятаться за скроллом. */}
          <ul className="mt-10 grid gap-3 lg:hidden">
            {ranked.map((row, index) => {
              const isLoss = row.result.netHome < 0;
              return (
                <li
                  key={`${row.scenario.stateCode}-${row.scenario.town}`}
                  className="border-2 border-[var(--color-ink)] px-4 py-3.5"
                  style={
                    isLoss
                      ? { borderColor: "var(--color-void)" }
                      : undefined
                  }
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
                        {row.scenario.role} · ставка $
                        {row.scenario.hourlyWage.toFixed(2)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span
                        className="swat-num block text-[1.35rem] font-bold leading-none"
                        style={
                          isLoss ? { color: "var(--color-void)" } : undefined
                        }
                      >
                        {formatUsd(row.result.netHome)}
                      </span>
                      <span className="swat-caption">чистыми</span>
                    </div>
                  </div>
                  {isLoss && (
                    <p
                      className="swat-caption mt-2"
                      style={{ color: "var(--color-void)" }}
                    >
                      Сезон не окупается — ехать в минус
                    </p>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="mt-10 hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[46rem] border-collapse text-left">
              <thead>
                <tr className="border-b-2 border-[var(--color-ink)]">
                  <th className="swat-caption py-3 pr-4">Место</th>
                  <th className="swat-caption py-3 pr-4">Направление</th>
                  <th className="swat-caption py-3 pr-4 text-right">Ставка</th>
                  <th className="swat-caption py-3 pr-4 text-right">Начислено</th>
                  <th className="swat-caption py-3 pr-4 text-right">Удержано</th>
                  <th className="swat-caption py-3 text-right">Чистыми домой</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((row, index) => {
                  const deductions =
                    row.result.gross.total - row.result.netHome;
                  const isLoss = row.result.netHome < 0;
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
                          {!row.hasOwnMinimum && " · нет минимума штата"}
                          {!row.hasStateIncomeTax && " · нет налога штата"}
                        </span>
                      </td>
                      <td className="swat-num py-3.5 pr-4 text-right">
                        ${row.scenario.hourlyWage.toFixed(2)}
                      </td>
                      <td className="swat-num py-3.5 pr-4 text-right text-[var(--color-ink-soft)]">
                        {formatUsd(row.result.gross.total)}
                      </td>
                      <td
                        className="swat-num py-3.5 pr-4 text-right"
                        style={{ color: "var(--color-void)" }}
                      >
                        −{formatUsd(deductions)}
                      </td>
                      <td
                        className="swat-num py-3.5 text-right text-[1.05rem] font-bold"
                        style={
                          isLoss ? { color: "var(--color-void)" } : undefined
                        }
                      >
                        {formatUsd(row.result.netHome)}
                        {isLoss && (
                          <span className="swat-caption block font-normal">
                            не окупается
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="swat-caption mt-5 max-w-2xl leading-relaxed">
            Предварительные оценки на основе типовых условий. Каждое число
            заменяется подтверждённым после сверки с работодателем. Сортировка
            по остатку на руках после всех расходов.
          </p>
        </section>

        {/* Как мы работаем */}
        <section
          id="process"
          className="border-y-2 border-[var(--color-ink)] bg-[var(--color-stub)]"
        >
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="swat-h2 max-w-3xl">Что мы обещаем и чего не обещаем</h2>
            <div className="mt-10 grid gap-10 lg:grid-cols-2">
              <div>
                <p className="swat-caption mb-4">Обещаем</p>
                <ul className="grid gap-4">
                  {[
                    "Показать расчёт до оплаты — включая офферы, от которых отговариваем.",
                    "Назвать спонсора, через которого идёт размещение, и дать проверить его в реестре BridgeUSA.",
                    "Письменный договор с полной стоимостью: без доплат, возникающих по ходу.",
                    "Сопровождение после прилёта: SSN, банк, связь, возврат налогов.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed">
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
                    "Конкретную сумму заработка. Часы зависят от сезона, погоды и потока гостей.",
                    "Что вторая работа будет. Её нужно согласовывать со спонсором отдельно.",
                    "Самую низкую цену на рынке. Дёшево обычно значит, что за оффер платит кто-то другой.",
                  ].map((item) => (
                    <li key={item} className="flex gap-3 text-[0.95rem] leading-relaxed">
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
        <section id="waitlist" className="mx-auto max-w-6xl px-5 py-16">
          <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="swat-h2">
                Набор на сезон 2027
                <br />
                открывается осенью
              </h2>
              <p className="mt-5 max-w-lg leading-relaxed text-[var(--color-ink-soft)]">
                Оставь контакт — напишем, когда появятся первые подтверждённые
                офферы с полным расчётом. Без спама и без звонков с давлением:
                одно сообщение, когда будет что показать.
              </p>
              <p className="swat-caption mt-6 leading-relaxed">
                SWAT — независимый сервис расчёта. Мы не спонсор программы
                и не работодатель. Размещение участников идёт через
                назначенного спонсора BridgeUSA.
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
            до любой оплаты. Проверяй спонсора в официальном реестре BridgeUSA.
          </p>
        </div>
      </footer>
    </>
  );
}
