import { z } from "zod";
import {
  FEDERAL_BRACKETS,
  FICA_RATE,
  STATE_CODES,
  STATES,
  taxByBrackets,
  type StateCode,
} from "./states";

/**
 * Движок расчёта чистого заработка за сезон Work & Travel.
 *
 * Смысл существования: студент видит ставку $16/час, умножает на 40 часов и 14 недель,
 * получает $8 960 и покупает билет. Реальность вычитает жильё, еду, дорогу, налоги
 * и стоимость самой программы — и на руках остаётся втрое меньше.
 * Этот модуль считает то, что останется, включая случаи, когда остаётся минус.
 */

/** Порог сверхурочных по федеральному закону США (FLSA): свыше 40 часов в неделю. */
const OVERTIME_THRESHOLD_HOURS = 40;
const OVERTIME_MULTIPLIER = 1.5;

/** Выше этой доли дохода жильё считается неподъёмным. */
const HOUSING_BURDEN_LIMIT = 0.35;

/** Минимум часов в неделю, ниже которого оффер считается рискованным. */
const MIN_SAFE_WEEKLY_HOURS = 32;

export const earningsInputSchema = z.object({
  /** Базовая ставка в долларах за час. */
  hourlyWage: z.number().min(0).max(200),
  /** Ожидаемые часы в неделю на основной работе. */
  weeklyHours: z.number().min(0).max(80),
  /** Длительность сезона в неделях. */
  weeks: z.number().int().min(1).max(30),
  /** Оценка чаевых в неделю. Для позиций без чаевых — 0. */
  tipsPerWeek: z.number().min(0).max(3_000).default(0),
  /** Ставка второй работы. Вторая работа разрешена только с согласия спонсора. */
  secondJobWage: z.number().min(0).max(200).default(0),
  secondJobHours: z.number().min(0).max(40).default(0),
  /** Стоимость жилья в неделю. */
  housingPerWeek: z.number().min(0).max(2_000),
  /** Расходы на еду в неделю. */
  foodPerWeek: z.number().min(0).max(2_000).default(0),
  /** Транспорт до работы и обратно в неделю. */
  transportPerWeek: z.number().min(0).max(2_000).default(0),
  stateCode: z.enum(STATE_CODES),
  /** Разовые затраты до вылета — то, что студент платит из своего кармана заранее. */
  upfront: z
    .object({
      /** Взнос агентству и спонсору за программу. */
      programFee: z.number().min(0).max(20_000).default(0),
      /** Сбор SEVIS I-901. */
      sevisFee: z.number().min(0).max(1_000).default(0),
      /** Консульский сбор за визу DS-160. */
      visaFee: z.number().min(0).max(1_000).default(0),
      /** Перелёт туда и обратно. */
      flights: z.number().min(0).max(10_000).default(0),
      /** Страховка на период программы. */
      insurance: z.number().min(0).max(3_000).default(0),
    })
    .default({}),
});

export type EarningsInput = z.input<typeof earningsInputSchema>;
export type ResolvedEarningsInput = z.output<typeof earningsInputSchema>;

export type WarningLevel = "danger" | "caution" | "info";

export interface EarningsWarning {
  readonly level: WarningLevel;
  readonly message: string;
}

export interface EarningsResult {
  readonly gross: {
    readonly base: number;
    readonly overtime: number;
    readonly tips: number;
    readonly secondJob: number;
    readonly total: number;
  };
  readonly taxes: {
    readonly federal: number;
    readonly state: number;
    readonly local: number;
    readonly total: number;
    /** Сколько студент НЕ платит благодаря освобождению от FICA. */
    readonly ficaSaved: number;
  };
  readonly living: {
    readonly housing: number;
    readonly food: number;
    readonly transport: number;
    readonly total: number;
  };
  readonly upfrontTotal: number;
  /** Остаток на руках в США — до вычета того, что уже потрачено на программу. */
  readonly netInUsa: number;
  /** Итог поездки: что реально останется, с учётом всех разовых затрат. */
  readonly netHome: number;
  /** Чистыми в неделю после налогов и быта. */
  readonly netPerWeek: number;
  /**
   * Неделя, на которой поездка окупает разовые затраты.
   * null — если при таких условиях не окупается никогда.
   */
  readonly breakEvenWeek: number | null;
  /** Доля недельного дохода, уходящая на жильё. */
  readonly housingBurden: number;
  readonly warnings: readonly EarningsWarning[];
}

function round(value: number): number {
  return Math.round(value);
}

/**
 * Считает сезон целиком. Функция чистая: одинаковый вход даёт одинаковый выход,
 * без обращений к сети, дате или окружению.
 */
export function calculateEarnings(rawInput: EarningsInput): EarningsResult {
  const input = earningsInputSchema.parse(rawInput);
  const state = STATES[input.stateCode];

  const regularHours = Math.min(input.weeklyHours, OVERTIME_THRESHOLD_HOURS);
  const overtimeHours = Math.max(
    0,
    input.weeklyHours - OVERTIME_THRESHOLD_HOURS,
  );

  const baseWeekly = regularHours * input.hourlyWage;
  const overtimeWeekly = overtimeHours * input.hourlyWage * OVERTIME_MULTIPLIER;
  const secondJobWeekly = input.secondJobHours * input.secondJobWage;

  const grossBase = baseWeekly * input.weeks;
  const grossOvertime = overtimeWeekly * input.weeks;
  const grossTips = input.tipsPerWeek * input.weeks;
  const grossSecondJob = secondJobWeekly * input.weeks;
  const grossTotal = grossBase + grossOvertime + grossTips + grossSecondJob;

  // Сезонный заработок — единственный доход студента в США за налоговый год,
  // поэтому шкала применяется к нему напрямую, без годовой экстраполяции.
  const federal = taxByBrackets(grossTotal, FEDERAL_BRACKETS);
  const stateTax = taxByBrackets(grossTotal, state.incomeTaxBrackets);
  const localTax = grossTotal * state.localTaxRate;
  const taxTotal = federal + stateTax + localTax;

  const housing = input.housingPerWeek * input.weeks;
  const food = input.foodPerWeek * input.weeks;
  const transport = input.transportPerWeek * input.weeks;
  const livingTotal = housing + food + transport;

  const upfrontTotal =
    input.upfront.programFee +
    input.upfront.sevisFee +
    input.upfront.visaFee +
    input.upfront.flights +
    input.upfront.insurance;

  const netInUsa = grossTotal - taxTotal - livingTotal;
  const netHome = netInUsa - upfrontTotal;
  const netPerWeek = netInUsa / input.weeks;

  const breakEvenWeek =
    netPerWeek > 0 ? Math.ceil(upfrontTotal / netPerWeek) : null;

  const weeklyGross = grossTotal / input.weeks;
  const housingBurden = weeklyGross > 0 ? input.housingPerWeek / weeklyGross : 0;

  return {
    gross: {
      base: round(grossBase),
      overtime: round(grossOvertime),
      tips: round(grossTips),
      secondJob: round(grossSecondJob),
      total: round(grossTotal),
    },
    taxes: {
      federal: round(federal),
      state: round(stateTax),
      local: round(localTax),
      total: round(taxTotal),
      ficaSaved: round(grossTotal * FICA_RATE),
    },
    living: {
      housing: round(housing),
      food: round(food),
      transport: round(transport),
      total: round(livingTotal),
    },
    upfrontTotal: round(upfrontTotal),
    netInUsa: round(netInUsa),
    netHome: round(netHome),
    netPerWeek: round(netPerWeek),
    breakEvenWeek,
    housingBurden,
    warnings: buildWarnings(input, { netHome, breakEvenWeek, housingBurden }),
  };
}

interface WarningContext {
  readonly netHome: number;
  readonly breakEvenWeek: number | null;
  readonly housingBurden: number;
}

/**
 * Правила, по которым продукт говорит «не езжай».
 * Это и есть главное отличие от конкурентов: калькулятор, который умеет отговорить.
 */
function buildWarnings(
  input: ResolvedEarningsInput,
  context: WarningContext,
): readonly EarningsWarning[] {
  const warnings: EarningsWarning[] = [];
  const state = STATES[input.stateCode];

  if (input.hourlyWage < state.minimumWage) {
    warnings.push({
      level: "danger",
      message: `Ставка $${input.hourlyWage.toFixed(2)} ниже законного минимума в ${state.nameRu} ($${state.minimumWage.toFixed(2)}). Такой оффер незаконен — требуй письменное подтверждение ставки у спонсора до любой оплаты.`,
    });
  }

  if (context.netHome < 0) {
    warnings.push({
      level: "danger",
      message: `Поездка убыточна: домой возвращаешься с минусом ${formatUsd(Math.abs(context.netHome))}. При таких условиях ехать нельзя.`,
    });
  }

  if (context.breakEvenWeek === null) {
    warnings.push({
      level: "danger",
      message:
        "Недельный остаток нулевой или отрицательный — расходы съедают весь доход. Такой оффер не окупится никогда.",
    });
  } else if (context.breakEvenWeek > input.weeks) {
    warnings.push({
      level: "danger",
      message: `Затраты на программу окупаются к ${context.breakEvenWeek}-й неделе, а сезон длится ${input.weeks}. Ты не успеешь выйти в ноль.`,
    });
  } else if (context.breakEvenWeek > input.weeks * 0.7) {
    warnings.push({
      level: "caution",
      message: `В ноль выходишь только к ${context.breakEvenWeek}-й неделе из ${input.weeks}. Болезнь или срезанные часы уводят сезон в минус — запаса нет.`,
    });
  }

  if (input.weeklyHours < MIN_SAFE_WEEKLY_HOURS) {
    warnings.push({
      level: "caution",
      message: `${input.weeklyHours} часов в неделю — мало. Проси письменную гарантию минимума часов: устное «часов будет много» ничего не значит.`,
    });
  }

  if (context.housingBurden > HOUSING_BURDEN_LIMIT) {
    warnings.push({
      level: "caution",
      message: `Жильё съедает ${Math.round(context.housingBurden * 100)}% недельного дохода. Выше 35% — сезон работает на арендодателя, а не на тебя.`,
    });
  }

  if (!state.hasOwnMinimum) {
    warnings.push({
      level: "info",
      message: `У штата ${state.nameRu} нет своего минимума оплаты труда — действует федеральный $${state.minimumWage.toFixed(2)}. Ставку в оффере проверяй особенно внимательно.`,
    });
  }

  if (state.incomeTaxBrackets.length === 0) {
    warnings.push({
      level: "info",
      message: `В ${state.nameRu} нет подоходного налога штата — при равной ставке здесь на руках останется больше.`,
    });
  }

  if (input.secondJobHours > 0) {
    warnings.push({
      level: "info",
      message:
        "Вторую работу нужно согласовать со спонсором до выхода на неё. Работа без согласования — нарушение условий визы J-1.",
    });
  }

  return warnings;
}

/**
 * Форматирует сумму как «$8 400».
 *
 * Разделитель разрядов проставляется вручную, а не через toLocaleString:
 * вывод Intl зависит от сборки Node и ломает тесты между машинами.
 */
export function formatUsd(value: number): string {
  const rounded = Math.round(value);
  const digits = Math.abs(rounded)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${rounded < 0 ? "−" : ""}$${digits}`;
}

export type { StateCode };
