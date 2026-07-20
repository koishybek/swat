/**
 * Налоговые и зарплатные параметры штатов, где реально работают участники J-1 SWT.
 *
 * Числа сверены с исследованием рынка от 20.07.2026
 * (docs/2026-07-20-стратегический-брифинг.md). Поле `verified` отмечает,
 * подтверждено ли значение первичным источником. Продукт продаёт точность
 * расчёта — значит непроверенное число не имеет права выглядеть проверенным.
 */

export const STATE_CODES = [
  "MD",
  "WI",
  "SC",
  "OH",
  "FL",
  "NJ",
  "TN",
  "AK",
  "MA",
  "CO",
  "DE",
  "ME",
] as const;

export type StateCode = (typeof STATE_CODES)[number];

/** Ступень прогрессивной шкалы: ставка действует на доход до `upTo` включительно. */
export interface TaxBracket {
  readonly upTo: number;
  /** Ставка долей единицы: 0.05 = 5%. */
  readonly rate: number;
}

export interface StateProfile {
  readonly code: StateCode;
  readonly name: string;
  readonly nameRu: string;
  /** Законный минимум оплаты труда, действующий летом 2027. */
  readonly minimumWage: number;
  /** Есть ли у штата собственный минимум выше федерального. */
  readonly hasOwnMinimum: boolean;
  /**
   * Порог подачи декларации. Если валовый доход не превышает его,
   * налог штата равен нулю. Превышение облагает доход по шкале целиком,
   * а не только сумму сверх порога — это не нулевая ступень.
   */
  readonly filingThreshold: number;
  /** Ступени подоходного налога штата. Пустой массив — налога нет. */
  readonly incomeTaxBrackets: readonly TaxBracket[];
  /** Местный налог округа или города, долей единицы. */
  readonly localTaxRate: number;
  readonly verified: boolean;
}

/** Федеральный минимум. Не менялся с 2009 года. */
export const FEDERAL_MINIMUM_WAGE = 7.25;

export const STATES: Readonly<Record<StateCode, StateProfile>> = {
  MD: {
    code: "MD",
    name: "Maryland",
    nameRu: "Мэриленде",
    minimumWage: 15.0,
    hasOwnMinimum: true,
    filingThreshold: 0,
    incomeTaxBrackets: [
      { upTo: 1_000, rate: 0.02 },
      { upTo: 2_000, rate: 0.03 },
      { upTo: 3_000, rate: 0.04 },
      { upTo: 100_000, rate: 0.0475 },
      { upTo: Infinity, rate: 0.05 },
    ],
    localTaxRate: 0.0225,
    verified: false,
  },
  WI: {
    code: "WI",
    name: "Wisconsin",
    nameRu: "Висконсине",
    minimumWage: FEDERAL_MINIMUM_WAGE,
    hasOwnMinimum: false,
    filingThreshold: 0,
    incomeTaxBrackets: [
      { upTo: 14_680, rate: 0.035 },
      { upTo: 29_370, rate: 0.044 },
      { upTo: Infinity, rate: 0.053 },
    ],
    localTaxRate: 0,
    verified: false,
  },
  SC: {
    code: "SC",
    name: "South Carolina",
    nameRu: "Южной Каролине",
    minimumWage: FEDERAL_MINIMUM_WAGE,
    hasOwnMinimum: false,
    filingThreshold: 0,
    incomeTaxBrackets: [
      { upTo: 3_560, rate: 0 },
      { upTo: 17_830, rate: 0.03 },
      { upTo: Infinity, rate: 0.062 },
    ],
    localTaxRate: 0,
    verified: false,
  },
  OH: {
    code: "OH",
    name: "Ohio",
    nameRu: "Огайо",
    minimumWage: 10.9,
    hasOwnMinimum: true,
    filingThreshold: 0,
    // Первая ступень Огайо нулевая до $26 050 — сезонный заработок в неё умещается.
    incomeTaxBrackets: [
      { upTo: 26_050, rate: 0 },
      { upTo: 100_000, rate: 0.0275 },
      { upTo: Infinity, rate: 0.035 },
    ],
    localTaxRate: 0,
    verified: false,
  },
  FL: {
    code: "FL",
    name: "Florida",
    nameRu: "Флориде",
    minimumWage: 15.0,
    hasOwnMinimum: true,
    filingThreshold: 0,
    incomeTaxBrackets: [],
    localTaxRate: 0,
    verified: false,
  },
  NJ: {
    code: "NJ",
    name: "New Jersey",
    nameRu: "Нью-Джерси",
    // Сезонный минимум ниже общего: у большинства курортных работодателей
    // действует именно он.
    minimumWage: 15.23,
    hasOwnMinimum: true,
    filingThreshold: 10_000,
    incomeTaxBrackets: [
      { upTo: 20_000, rate: 0.014 },
      { upTo: 35_000, rate: 0.0175 },
      { upTo: Infinity, rate: 0.035 },
    ],
    localTaxRate: 0,
    verified: false,
  },
  TN: {
    code: "TN",
    name: "Tennessee",
    nameRu: "Теннесси",
    minimumWage: FEDERAL_MINIMUM_WAGE,
    hasOwnMinimum: false,
    filingThreshold: 0,
    incomeTaxBrackets: [],
    localTaxRate: 0,
    verified: false,
  },
  AK: {
    code: "AK",
    name: "Alaska",
    nameRu: "Аляске",
    // Ballot Measure 1 поднимает минимум до $15.00 с 1 июля 2027 —
    // то есть в середине сезона 2027.
    minimumWage: 15.0,
    hasOwnMinimum: true,
    filingThreshold: 0,
    incomeTaxBrackets: [],
    localTaxRate: 0,
    verified: false,
  },
  MA: {
    code: "MA",
    name: "Massachusetts",
    nameRu: "Массачусетсе",
    minimumWage: 15.0,
    hasOwnMinimum: true,
    filingThreshold: 8_000,
    incomeTaxBrackets: [{ upTo: Infinity, rate: 0.05 }],
    localTaxRate: 0,
    verified: false,
  },
  CO: {
    code: "CO",
    name: "Colorado",
    nameRu: "Колорадо",
    minimumWage: 15.16,
    hasOwnMinimum: true,
    filingThreshold: 0,
    incomeTaxBrackets: [{ upTo: Infinity, rate: 0.044 }],
    localTaxRate: 0,
    verified: false,
  },
  DE: {
    code: "DE",
    name: "Delaware",
    nameRu: "Делавэре",
    minimumWage: 15.0,
    hasOwnMinimum: true,
    filingThreshold: 0,
    incomeTaxBrackets: [
      { upTo: 2_000, rate: 0 },
      { upTo: 5_000, rate: 0.022 },
      { upTo: 10_000, rate: 0.039 },
      { upTo: Infinity, rate: 0.048 },
    ],
    localTaxRate: 0,
    verified: false,
  },
  ME: {
    code: "ME",
    name: "Maine",
    nameRu: "Мэне",
    minimumWage: 15.1,
    hasOwnMinimum: true,
    filingThreshold: 0,
    incomeTaxBrackets: [
      { upTo: 26_800, rate: 0.058 },
      { upTo: 63_450, rate: 0.0675 },
      { upTo: Infinity, rate: 0.0715 },
    ],
    localTaxRate: 0,
    verified: false,
  },
};

export const STATE_LIST: readonly StateProfile[] = STATE_CODES.map(
  (code) => STATES[code],
);

/**
 * Федеральные ступени подоходного налога для нерезидента (single).
 *
 * Нерезидент по J-1 не получает стандартный вычет — налог считается
 * с первого доллара.
 *
 * ВАЖНО ПРО КАЗАХСТАН: у большинства стран Центральной Азии и Кавказа
 * действует конвенция США–СССР 1973 года, освобождающая доход при
 * пребывании менее 183 дней. У Казахстана собственный договор 1993 года,
 * который дополнительно требует, чтобы работодатель не был резидентом США.
 * Для американского сезонного работодателя это условие не выполняется,
 * поэтому казахстанский студент платит федеральный налог, а узбекский — нет.
 */
export const FEDERAL_BRACKETS: readonly TaxBracket[] = [
  { upTo: 12_400, rate: 0.1 },
  { upTo: 50_400, rate: 0.12 },
  { upTo: Infinity, rate: 0.22 },
];

/**
 * Потолки вычетов по OBBBA, действуют для налоговых лет 2025–2028
 * и поэтому покрывают сезон 2027. Доступны нерезидентам через Schedule 1-A
 * при наличии SSN. Для позиций с чаевыми и переработками уводят
 * федеральную базу почти в ноль.
 */
export const OBBBA_TIPS_DEDUCTION_CAP = 25_000;
export const OBBBA_OVERTIME_DEDUCTION_CAP = 12_500;

/**
 * Ставка FICA (Social Security 6.2% + Medicare 1.45%), от которой участник
 * J-1 SWT в статусе нерезидента освобождён по IRC 3121(b)(19).
 * Используется, чтобы показать размер льготы, а не чтобы списать деньги.
 */
export const FICA_RATE = 0.0765;

/** Считает налог по прогрессивной шкале. Пустая шкала — налога нет. */
export function taxByBrackets(
  income: number,
  brackets: readonly TaxBracket[],
): number {
  if (income <= 0 || brackets.length === 0) return 0;

  let tax = 0;
  let lowerBound = 0;

  for (const bracket of brackets) {
    if (income <= lowerBound) break;
    const taxableInBracket = Math.min(income, bracket.upTo) - lowerBound;
    tax += taxableInBracket * bracket.rate;
    lowerBound = bracket.upTo;
  }

  return tax;
}

/**
 * Налог штата с учётом порога подачи декларации.
 * Ниже порога налога нет вовсе; выше — облагается весь доход по шкале.
 */
export function stateTax(income: number, state: StateProfile): number {
  if (income <= state.filingThreshold) return 0;
  return taxByBrackets(income, state.incomeTaxBrackets);
}
