"use client";

import { useMemo, useState } from "react";
import {
  calculateEarnings,
  formatUsd,
  type EarningsWarning,
} from "@/lib/earnings";
import { FIXED_UPFRONT, SCENARIOS } from "@/lib/scenarios";
import { STATES } from "@/lib/states";

/** Строка расчётки: подпись, точечный вынос, сумма. */
function StubRow({
  label,
  amount,
  negative = false,
  muted = false,
}: {
  label: string;
  amount: string;
  negative?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="swat-row">
      <span
        className="swat-row__label"
        style={muted ? { color: "var(--color-ink-faint)" } : undefined}
      >
        {label}
      </span>
      <span className="swat-row__leader" aria-hidden="true" />
      <span
        className="swat-row__amount"
        style={negative ? { color: "var(--color-void)" } : undefined}
      >
        {negative ? `−${amount}` : amount}
      </span>
    </div>
  );
}

function Control({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  const id = `control-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="swat-caption">
          {label}
        </label>
        <span className="swat-num text-[0.95rem] font-medium">{hint}</span>
      </div>
      <input
        id={id}
        type="range"
        className="swat-slider mt-2"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </div>
  );
}

const FLAG_MARK: Record<EarningsWarning["level"], string> = {
  danger: "!",
  caution: "?",
  info: "i",
};

export function SeasonCalculator() {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const base = SCENARIOS[scenarioIndex]!;

  const [wage, setWage] = useState(base.hourlyWage);
  const [hours, setHours] = useState(base.weeklyHours);
  const [weeks, setWeeks] = useState(base.weeks);
  const [housing, setHousing] = useState(base.housingPerWeek);
  // По умолчанию одна работа — это исход, который студент получает
  // в любом другом агентстве. Вторую он должен увидеть как прибавку.
  const [withSecondJob, setWithSecondJob] = useState(false);

  function selectScenario(index: number) {
    const next = SCENARIOS[index]!;
    setScenarioIndex(index);
    setWage(next.hourlyWage);
    setHours(next.weeklyHours);
    setWeeks(next.weeks);
    setHousing(next.housingPerWeek);
    setWithSecondJob(false);
  }

  const secondJobAvailable = base.secondJobHours > 0;
  const activeSecondJobHours =
    withSecondJob && secondJobAvailable ? base.secondJobHours : 0;

  const shared = useMemo(
    () => ({
      hourlyWage: wage,
      weeklyHours: hours,
      weeks,
      tipsPerWeek: base.tipsPerWeek,
      housingPerWeek: housing,
      foodPerWeek: base.foodPerWeek,
      transportPerWeek: base.transportPerWeek,
      stateCode: base.stateCode,
      upfront: { ...FIXED_UPFRONT, flights: base.flights },
    }),
    [wage, hours, weeks, housing, base],
  );

  const result = useMemo(
    () =>
      calculateEarnings({
        ...shared,
        secondJobWage: activeSecondJobHours > 0 ? wage : 0,
        secondJobHours: activeSecondJobHours,
      }),
    [shared, activeSecondJobHours, wage],
  );

  // Прибавка от второй работы считается всегда, чтобы показать её
  // на самом переключателе, а не только после нажатия.
  const secondJobGain = useMemo(() => {
    if (!secondJobAvailable) return 0;
    const one = calculateEarnings({
      ...shared,
      secondJobWage: 0,
      secondJobHours: 0,
    });
    const two = calculateEarnings({
      ...shared,
      secondJobWage: wage,
      secondJobHours: base.secondJobHours,
    });
    return two.netHome - one.netHome;
  }, [shared, secondJobAvailable, base.secondJobHours, wage]);

  const state = STATES[base.stateCode];
  const isLoss = result.netHome < 0;

  return (
    <div className="swat-stub px-5 py-7 sm:px-8">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b border-[var(--color-rule)] pb-3">
        <span className="swat-caption">SWAT · расчёт сезона</span>
        <span className="swat-num text-[0.8rem] uppercase tracking-wider">
          {base.town}, {base.stateCode}
        </span>
      </div>

      <div className="mt-5">
        <label htmlFor="direction" className="swat-caption">
          Направление
        </label>
        <select
          id="direction"
          className="swat-num mt-2 w-full border-2 border-[var(--color-ink)] bg-[var(--color-paper)] px-3 py-2.5 text-[0.95rem]"
          value={scenarioIndex}
          onChange={(event) => selectScenario(Number(event.target.value))}
        >
          {SCENARIOS.map((item, index) => (
            <option key={`${item.stateCode}-${item.town}`} value={index}>
              {item.town}, {item.stateCode}
            </option>
          ))}
        </select>
        <p className="mt-2 text-[0.85rem] text-[var(--color-ink-soft)]">
          {base.role} · минимум штата ${state.minimumWage.toFixed(2)}/ч
        </p>
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Control
          label="Ставка в час"
          hint={`$${wage.toFixed(2)}`}
          value={wage}
          min={7.25}
          max={30}
          step={0.25}
          onChange={setWage}
        />
        <Control
          label="Часов в неделю"
          hint={`${hours} ч`}
          value={hours}
          min={16}
          max={60}
          step={1}
          onChange={setHours}
        />
        <Control
          label="Недель в сезоне"
          hint={`${weeks}`}
          value={weeks}
          min={8}
          max={18}
          step={1}
          onChange={setWeeks}
        />
        <Control
          label="Жильё в неделю"
          hint={`$${housing}`}
          value={housing}
          min={0}
          max={400}
          step={5}
          onChange={setHousing}
        />
      </div>

      {/* Переключатель второй работы — главный рычаг всего сезона. */}
      <div className="mt-6 border-2 border-[var(--color-stamp)] px-4 py-3.5">
        {secondJobAvailable ? (
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--color-stamp)]"
              checked={withSecondJob}
              onChange={(event) => setWithSecondJob(event.target.checked)}
            />
            <span>
              <span className="block font-medium">
                Вторая одобренная работа · {base.secondJobHours} ч/нед.
              </span>
              <span
                className="swat-num mt-0.5 block text-[0.9rem] font-bold"
                style={{ color: "var(--color-stamp)" }}
              >
                +{formatUsd(secondJobGain)} к сезону
              </span>
            </span>
          </label>
        ) : (
          <p className="text-[0.875rem] leading-relaxed text-[var(--color-ink-soft)]">
            <b className="block font-medium text-[var(--color-ink)]">
              Второй работы здесь нет
            </b>
            Изолированная локация вокруг одного работодателя. Весь заработок
            зависит от часов на основном месте.
          </p>
        )}
      </div>

      <div className="mt-7 border-t border-[var(--color-rule)] pt-4">
        <p className="swat-caption mb-1">Начислено</p>
        <StubRow
          label={`Часы · $${wage.toFixed(2)} × ${Math.min(hours, 40)} ч × ${weeks} нед.`}
          amount={formatUsd(result.gross.base)}
        />
        {result.gross.overtime > 0 && (
          <StubRow
            label={`Переработка · ${hours - 40} ч × 1.5 ставки`}
            amount={formatUsd(result.gross.overtime)}
          />
        )}
        {result.gross.tips > 0 && (
          <StubRow label="Чаевые (оценка)" amount={formatUsd(result.gross.tips)} />
        )}
        {result.gross.secondJob > 0 && (
          <StubRow
            label={`Вторая работа · ${activeSecondJobHours} ч/нед.`}
            amount={formatUsd(result.gross.secondJob)}
          />
        )}
        <div className="mt-2 border-t border-[var(--color-rule)] pt-2">
          <StubRow label="Итого начислено" amount={formatUsd(result.gross.total)} />
        </div>
      </div>

      <div className="mt-6 border-t border-[var(--color-rule)] pt-4">
        <p className="swat-caption mb-1">Удержано</p>
        <StubRow
          label={`Жильё · $${housing} × ${weeks} нед.`}
          amount={formatUsd(result.living.housing)}
          negative
        />
        <StubRow
          label={`Еда и транспорт · $${base.foodPerWeek + base.transportPerWeek}/нед.`}
          amount={formatUsd(result.living.food + result.living.transport)}
          negative
        />
        <StubRow
          label="Федеральный подоходный налог"
          amount={formatUsd(result.taxes.federal)}
          negative
        />
        <StubRow
          label={
            result.taxes.state + result.taxes.local > 0
              ? `Налог штата · ${state.name}`
              : `Налог штата · ${state.name} не берёт`
          }
          amount={formatUsd(result.taxes.state + result.taxes.local)}
          negative={result.taxes.state + result.taxes.local > 0}
        />
        <StubRow
          label="Программа, визовые сборы, страховка, перелёт"
          amount={formatUsd(result.upfrontTotal)}
          negative
        />
        <div className="mt-2 grid gap-0 border-t border-dotted border-[var(--color-rule)] pt-2">
          <StubRow
            label="FICA не удерживается — статус J-1 nonresident"
            amount={`+${formatUsd(result.taxes.ficaSaved)}`}
            muted
          />
          {result.taxes.obbbaDeduction > 0 && (
            <StubRow
              label="Чаевые и переработки выведены из-под налога"
              amount={`+${formatUsd(result.taxes.obbbaDeduction)}`}
              muted
            />
          )}
        </div>
      </div>

      <div className="swat-total mt-6 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-4">
        <span className="font-[family-name:var(--font-display)] text-[1.35rem] uppercase leading-none">
          Чистыми домой
        </span>
        <span
          className="swat-num text-[2.1rem] font-bold leading-none transition-colors duration-200"
          style={{ color: isLoss ? "var(--color-void)" : "var(--color-ink)" }}
        >
          {formatUsd(result.netHome)}
        </span>
      </div>

      <p className="swat-caption mt-3">
        {result.breakEvenWeek === null
          ? "Затраты не окупаются ни на какой неделе"
          : `Выход в ноль · ${result.breakEvenWeek}-я неделя из ${weeks} · чистыми ${formatUsd(result.netPerWeek)}/нед.`}
      </p>

      {result.warnings.length > 0 && (
        <div className="mt-5 grid gap-2">
          {result.warnings.map((warning) => (
            <p
              key={warning.message}
              className={`swat-flag swat-flag--${warning.level}`}
            >
              <b className="swat-num shrink-0" aria-hidden="true">
                [{FLAG_MARK[warning.level]}]
              </b>
              <span>{warning.message}</span>
            </p>
          ))}
        </div>
      )}

      <p className="swat-caption mt-5 leading-relaxed">
        Предварительная оценка. Сезон посчитан как {weeks} рабочих недель:
        окно Казахстана шире, но участник ограничен длительностью своих
        каникул. Ставки и жильё подтверждаются письменно до оплаты.
      </p>
    </div>
  );
}
