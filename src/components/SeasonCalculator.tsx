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
function Row({
  label,
  amount,
  negative = false,
  muted = false,
  total = false,
}: {
  label: string;
  amount: string;
  negative?: boolean;
  muted?: boolean;
  total?: boolean;
}) {
  const color = negative
    ? "var(--color-void)"
    : muted
      ? "var(--color-ink-faint)"
      : undefined;

  return (
    <div className={`swat-row${total ? " swat-row--total" : ""}`}>
      <span
        className="swat-row__label"
        style={muted ? { color: "var(--color-ink-faint)" } : undefined}
      >
        {label}
      </span>
      <span className="swat-row__leader" aria-hidden="true" />
      <span className="swat-row__amount" style={color ? { color } : undefined}>
        {negative ? `−${amount}` : amount}
      </span>
    </div>
  );
}

/** Строка управления: подпись слева, дорожка по центру, значение справа. */
function Control({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (next: number) => void;
}) {
  const id = `c-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="swat-control">
      <label htmlFor={id} className="swat-control__label">
        {label}
      </label>
      <input
        id={id}
        type="range"
        className="swat-slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <span className="swat-control__value">{display}</span>
    </div>
  );
}

const FLAG_MARK: Record<EarningsWarning["level"], string> = {
  danger: "!",
  caution: "?",
  info: "i",
};

export function SeasonCalculator() {
  const [index, setIndex] = useState(0);
  const base = SCENARIOS[index]!;

  const [wage, setWage] = useState(base.hourlyWage);
  const [hours, setHours] = useState(base.weeklyHours);
  const [weeks, setWeeks] = useState(base.weeks);
  const [tips, setTips] = useState(base.tipsPerWeek);
  const [housing, setHousing] = useState(base.housingPerWeek);
  // По умолчанию одна работа: это исход, который студент получает
  // в любом другом агентстве. Вторую он должен увидеть как прибавку.
  const [secondJob, setSecondJob] = useState(false);

  function select(next: number) {
    const s = SCENARIOS[next]!;
    setIndex(next);
    setWage(s.hourlyWage);
    setHours(s.weeklyHours);
    setWeeks(s.weeks);
    setTips(s.tipsPerWeek);
    setHousing(s.housingPerWeek);
    setSecondJob(false);
  }

  const secondJobAvailable = base.secondJobHours > 0;
  const activeSecondHours =
    secondJob && secondJobAvailable ? base.secondJobHours : 0;

  const shared = useMemo(
    () => ({
      hourlyWage: wage,
      weeklyHours: hours,
      weeks,
      tipsPerWeek: tips,
      housingPerWeek: housing,
      foodPerWeek: base.foodPerWeek,
      transportPerWeek: base.transportPerWeek,
      stateCode: base.stateCode,
      upfront: { ...FIXED_UPFRONT, flights: base.flights },
    }),
    [wage, hours, weeks, tips, housing, base],
  );

  const result = useMemo(
    () =>
      calculateEarnings({
        ...shared,
        secondJobWage: activeSecondHours > 0 ? wage : 0,
        secondJobHours: activeSecondHours,
      }),
    [shared, activeSecondHours, wage],
  );

  // Прибавка считается всегда, чтобы стоять прямо на переключателе.
  const gain = useMemo(() => {
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
  const stateTaxTotal = result.taxes.state + result.taxes.local;
  const isLoss = result.netHome < 0;

  return (
    <div className="swat-stub px-5 py-8 sm:px-8">
      {/* Шапка документа */}
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="swat-caption" style={{ color: "var(--color-ink)" }}>
          SWAT · расчёт сезона
        </span>
        <span className="swat-caption" style={{ color: "var(--color-ink)" }}>
          {base.town}, {base.stateCode}
        </span>
      </div>

      <div className="mt-4">
        <label htmlFor="direction" className="sr-only">
          Направление
        </label>
        <select
          id="direction"
          className="swat-select"
          value={index}
          onChange={(event) => select(Number(event.target.value))}
        >
          {SCENARIOS.map((item, i) => (
            <option key={`${item.stateCode}-${item.town}`} value={i}>
              {item.town}, {item.stateCode} — {item.role}
            </option>
          ))}
        </select>
      </div>

      {/* Управление */}
      <div className="mt-6 grid gap-3.5">
        <Control
          label="Ставка в час"
          value={wage}
          display={`$${wage.toFixed(2)}`}
          min={7.25}
          max={30}
          step={0.25}
          onChange={setWage}
        />
        <Control
          label="Часов в неделю"
          value={hours}
          display={`${hours}`}
          min={16}
          max={60}
          step={1}
          onChange={setHours}
        />
        <Control
          label="Недель в сезоне"
          value={weeks}
          display={`${weeks}`}
          min={8}
          max={18}
          step={1}
          onChange={setWeeks}
        />
        <Control
          label="Чаевые в неделю"
          value={tips}
          display={`$${tips}`}
          min={0}
          max={400}
          step={5}
          onChange={setTips}
        />
        <Control
          label="Жильё в неделю"
          value={housing}
          display={`$${housing}`}
          min={0}
          max={400}
          step={5}
          onChange={setHousing}
        />

        {/* Вторая работа — главный рычаг всего сезона. */}
        <div className="swat-control border-t border-[var(--color-stub-line)] pt-3.5">
          <label
            htmlFor="second-job"
            className="swat-control__label"
            style={{ color: "var(--color-stamp)" }}
          >
            Вторая работа
          </label>
          {secondJobAvailable ? (
            <label
              htmlFor="second-job"
              className="flex cursor-pointer items-center gap-2.5"
            >
              <input
                id="second-job"
                type="checkbox"
                className="h-4 w-4 accent-[var(--color-stamp)]"
                checked={secondJob}
                onChange={(event) => setSecondJob(event.target.checked)}
              />
              <span className="swat-caption" style={{ color: "var(--color-ink-soft)" }}>
                {base.secondJobHours} ч/нед., через спонсора
              </span>
            </label>
          ) : (
            <span className="swat-caption">здесь её нет</span>
          )}
          <span
            className="swat-control__value"
            style={{
              color: secondJobAvailable
                ? "var(--color-stamp)"
                : "var(--color-ink-faint)",
              fontWeight: 700,
            }}
          >
            {secondJobAvailable ? `+${formatUsd(gain)}` : "—"}
          </span>
        </div>
      </div>

      {/* Начислено */}
      <div className="mt-7 border-t border-[var(--color-stub-line)] pt-4">
        <p className="swat-section mb-2">Начислено</p>
        <Row label="Основные часы" amount={formatUsd(result.gross.base)} />
        {result.gross.overtime > 0 && (
          <Row label="Переработка" amount={formatUsd(result.gross.overtime)} />
        )}
        {result.gross.tips > 0 && (
          <Row label="Чаевые" amount={formatUsd(result.gross.tips)} />
        )}
        {result.gross.secondJob > 0 && (
          <Row label="Вторая работа" amount={formatUsd(result.gross.secondJob)} />
        )}
        <Row
          label="Итого начислено"
          amount={formatUsd(result.gross.total)}
          total
        />
      </div>

      {/* Удержано */}
      <div className="mt-6 border-t border-[var(--color-stub-line)] pt-4">
        <p className="swat-section mb-2">Удержано</p>
        <Row label="Жильё" amount={formatUsd(result.living.housing)} negative />
        <Row
          label="Еда и транспорт"
          amount={formatUsd(result.living.food + result.living.transport)}
          negative
        />
        <Row
          label="Федеральный налог"
          amount={formatUsd(result.taxes.federal)}
          negative
        />
        <Row
          label={`Налог штата (${base.stateCode})`}
          amount={formatUsd(stateTaxTotal)}
          negative={stateTaxTotal > 0}
        />
        <Row
          label="Программа и перелёт"
          amount={formatUsd(result.upfrontTotal)}
          negative
        />
        <Row
          label="Итого удержано"
          amount={formatUsd(
            result.living.total + result.taxes.total + result.upfrontTotal,
          )}
          negative
          total
        />
      </div>

      {/*
        FICA стоит здесь со знаком плюс, а не в удержаниях: участник J-1
        в статусе нерезидента от него освобождён по IRC 3121(b)(19).
        Показать его удержанием — соврать в первом же экране.
      */}
      <div className="mt-3 border-t border-dotted border-[var(--color-stub-line)] pt-3">
        <Row
          label="FICA не удерживается · J-1 nonresident"
          amount={`+${formatUsd(result.taxes.ficaSaved)}`}
          muted
        />
        {result.taxes.obbbaDeduction > 0 && (
          <Row
            label="Чаевые и переработка вне налога"
            amount={`+${formatUsd(result.taxes.obbbaDeduction)}`}
            muted
          />
        )}
      </div>

      {/* Итог */}
      <div className="swat-total mt-5">
        <span className="swat-total__label">На руки домой</span>
        <span
          className="swat-total__value transition-colors duration-200"
          style={{ color: isLoss ? "var(--color-void)" : "var(--color-ink)" }}
        >
          {formatUsd(result.netHome)}
        </span>
      </div>

      <p className="swat-caption mt-3">
        {result.breakEvenWeek === null
          ? "Не окупается: расходы съедают весь доход"
          : result.breakEvenWeek > weeks
            ? `Не окупается: нужно ${result.breakEvenWeek} недель, а сезон — ${weeks}`
            : `Выход в ноль · ${result.breakEvenWeek}-я неделя из ${weeks} · ${formatUsd(result.netPerWeek)}/нед.`}
      </p>

      {result.warnings.length > 0 && (
        <div className="mt-4 grid gap-2">
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
        Предварительная оценка. Ставки, жильё и длительность сезона
        подтверждаются письменно у работодателя и спонсора до оплаты.
      </p>
    </div>
  );
}
