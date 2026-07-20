/**
 * Налоговые и зарплатные параметры штатов, где реально работают участники J-1 SWT.
 *
 * ВАЖНО про честность данных: каждое поле помечено источником и статусом проверки.
 * Продукт продаёт точность расчёта — значит непроверенное число не имеет права
 * выглядеть как проверенное. Всё, что `verified: false`, показывается в UI с оговоркой.
 */

export const STATE_CODES = [
  "NJ",
  "MA",
  "MD",
  "SC",
  "WI",
  "AK",
  "CO",
  "TN",
  "DE",
  "ME",
] as const;

export type StateCode = (typeof STATE_CODES)[number];

/** Ступень прогрессивной шкалы: ставка действует на доход до `upTo` включительно. */
export interface TaxBracket {
  /** Верхняя граница ступени в долларах годового налогооблагаемого дохода. */
  readonly upTo: number;
  /** Ставка долей единицы: 0.05 = 5%. */
  readonly rate: number;
}

export interface StateProfile {
  readonly code: StateCode;
  readonly name: string;
  readonly nameRu: string;
  /**
   * Законный минимум оплаты труда на 2026 год.
   * Там, где штат не установил свой минимум, действует федеральный $7.25.
   */
  readonly minimumWage: number;
  /** Есть ли у штата собственный минимум выше федерального. */
  readonly hasOwnMinimum: boolean;
  /** Ступени подоходного налога штата. Пустой массив = налога нет. */
  readonly incomeTaxBrackets: readonly TaxBracket[];
  /** Дополнительный местный налог (округ/город) долей единицы. */
  readonly localTaxRate: number;
  readonly popularTowns: readonly string[];
  /** Что здесь надо знать студенту до того, как он согласится. */
  readonly reality: string;
  readonly verified: boolean;
}

/**
 * Федеральный минимум. Не менялся с 2009 года — и это ключ к пониманию,
 * почему в трёх «топовых» курортных штатах законный пол зарплаты втрое ниже,
 * чем на восточном побережье.
 */
export const FEDERAL_MINIMUM_WAGE = 7.25;

export const STATES: Readonly<Record<StateCode, StateProfile>> = {
  NJ: {
    code: "NJ",
    name: "New Jersey",
    nameRu: "Нью-Джерси",
    minimumWage: 15.92,
    hasOwnMinimum: true,
    incomeTaxBrackets: [
      { upTo: 20_000, rate: 0.014 },
      { upTo: 35_000, rate: 0.0175 },
      { upTo: Infinity, rate: 0.035 },
    ],
    localTaxRate: 0,
    popularTowns: [
      "Ocean City",
      "Wildwood",
      "Seaside Heights",
      "Atlantic City",
      "Cape May",
    ],
    reality:
      "Высокий законный минимум и почти нулевой подоходный налог на сезонных доходах. Плотная застройка курортов даёт вторую работу в пешей доступности — главный источник переработки.",
    verified: false,
  },
  MA: {
    code: "MA",
    name: "Massachusetts",
    nameRu: "Массачусетс",
    minimumWage: 15.0,
    hasOwnMinimum: true,
    incomeTaxBrackets: [{ upTo: Infinity, rate: 0.05 }],
    localTaxRate: 0,
    popularTowns: ["Cape Cod", "Hyannis", "Falmouth", "Provincetown", "Dennis"],
    reality:
      "Ставки выше среднего, но Кейп-Код — один из самых дорогих рынков аренды на сезон. Плоский налог 5% съедает больше, чем в соседних штатах.",
    verified: false,
  },
  MD: {
    code: "MD",
    name: "Maryland",
    nameRu: "Мэриленд",
    minimumWage: 15.0,
    hasOwnMinimum: true,
    incomeTaxBrackets: [
      { upTo: 1_000, rate: 0.02 },
      { upTo: 2_000, rate: 0.03 },
      { upTo: 3_000, rate: 0.04 },
      { upTo: 100_000, rate: 0.0475 },
      { upTo: Infinity, rate: 0.05 },
    ],
    localTaxRate: 0.0225,
    popularTowns: ["Ocean City"],
    reality:
      "Ocean City — крупнейшая точка концентрации J-1 в стране: много работодателей и реальная конкуренция за часы. Нерезиденты платят дополнительный местный налог 2.25%.",
    verified: false,
  },
  SC: {
    code: "SC",
    name: "South Carolina",
    nameRu: "Южная Каролина",
    minimumWage: FEDERAL_MINIMUM_WAGE,
    hasOwnMinimum: false,
    incomeTaxBrackets: [
      { upTo: 3_560, rate: 0 },
      { upTo: 17_830, rate: 0.03 },
      { upTo: Infinity, rate: 0.062 },
    ],
    localTaxRate: 0,
    popularTowns: ["Myrtle Beach"],
    reality:
      "Своего минимума у штата нет — действует федеральные $7.25. Рынок платит выше, но законной защиты снизу нет: ставку в оффере проверяй особенно придирчиво. Первые $3 560 дохода налогом штата не облагаются.",
    verified: false,
  },
  WI: {
    code: "WI",
    name: "Wisconsin",
    nameRu: "Висконсин",
    minimumWage: FEDERAL_MINIMUM_WAGE,
    hasOwnMinimum: false,
    incomeTaxBrackets: [
      { upTo: 14_680, rate: 0.035 },
      { upTo: 29_370, rate: 0.044 },
      { upTo: Infinity, rate: 0.053 },
    ],
    localTaxRate: 0,
    popularTowns: ["Wisconsin Dells", "Lake Delton"],
    reality:
      "Своего минимума нет, действуют федеральные $7.25. Wisconsin Dells — закрытая курортная экосистема: жильё обычно от работодателя, но и альтернатив рядом почти нет.",
    verified: false,
  },
  AK: {
    code: "AK",
    name: "Alaska",
    nameRu: "Аляска",
    minimumWage: 14.0,
    hasOwnMinimum: true,
    incomeTaxBrackets: [],
    localTaxRate: 0,
    popularTowns: ["Anchorage", "Denali", "Seward", "Talkeetna"],
    reality:
      "Подоходного налога штата нет вообще — это плюс несколько сотен долларов к сезону по сравнению с Массачусетсом при той же ставке. Минус: самый дорогой перелёт и почти нет шансов на вторую работу.",
    verified: false,
  },
  CO: {
    code: "CO",
    name: "Colorado",
    nameRu: "Колорадо",
    minimumWage: 15.16,
    hasOwnMinimum: true,
    incomeTaxBrackets: [{ upTo: Infinity, rate: 0.044 }],
    localTaxRate: 0,
    popularTowns: ["Estes Park", "Aspen", "Vail", "Breckenridge"],
    reality:
      "Высокие ставки в горных городах, но жильё в Аспене и Вейле — самое дорогое из всех направлений. Без служебного жилья от работодателя сезон может уйти в минус.",
    verified: false,
  },
  TN: {
    code: "TN",
    name: "Tennessee",
    nameRu: "Теннесси",
    minimumWage: FEDERAL_MINIMUM_WAGE,
    hasOwnMinimum: false,
    incomeTaxBrackets: [],
    localTaxRate: 0,
    popularTowns: ["Gatlinburg", "Pigeon Forge", "Sevierville"],
    reality:
      "Подоходного налога штата нет — и это главный аргумент. Но своего минимума тоже нет: федеральные $7.25. Дешёвое жильё частично компенсирует более низкие ставки.",
    verified: false,
  },
  DE: {
    code: "DE",
    name: "Delaware",
    nameRu: "Делавэр",
    minimumWage: 15.0,
    hasOwnMinimum: true,
    incomeTaxBrackets: [
      { upTo: 2_000, rate: 0 },
      { upTo: 5_000, rate: 0.022 },
      { upTo: 10_000, rate: 0.039 },
      { upTo: Infinity, rate: 0.048 },
    ],
    localTaxRate: 0,
    popularTowns: ["Rehoboth Beach", "Bethany Beach", "Fenwick Island"],
    reality:
      "Нет налога с продаж — экономия на всех бытовых покупках за сезон ощутима. Первые $2 000 дохода не облагаются налогом штата.",
    verified: false,
  },
  ME: {
    code: "ME",
    name: "Maine",
    nameRu: "Мэн",
    minimumWage: 15.1,
    hasOwnMinimum: true,
    incomeTaxBrackets: [
      { upTo: 26_800, rate: 0.058 },
      { upTo: 63_450, rate: 0.0675 },
      { upTo: Infinity, rate: 0.0715 },
    ],
    localTaxRate: 0,
    popularTowns: ["Bar Harbor", "Old Orchard Beach"],
    reality:
      "Самая высокая нижняя ступень подоходного налога штата среди всех направлений — 5.8% с первого доллара. Короткий сезон: Бар-Харбор живёт примерно с июня по сентябрь.",
    verified: false,
  },
};

export const STATE_LIST: readonly StateProfile[] = STATE_CODES.map(
  (code) => STATES[code],
);

/**
 * Федеральные ступени подоходного налога для нерезидента (single) на 2026 год.
 *
 * Нерезидент по J-1 не получает стандартный вычет, поэтому налог считается
 * с первого доллара. Это отличает расчёт от привычного американцам.
 */
export const FEDERAL_BRACKETS: readonly TaxBracket[] = [
  { upTo: 12_400, rate: 0.1 },
  { upTo: 50_400, rate: 0.12 },
  { upTo: Infinity, rate: 0.22 },
];

/**
 * Ставка FICA (Social Security 6.2% + Medicare 1.45%), от которой участник
 * J-1 SWT в статусе нерезидента освобождён. Используется, чтобы показать
 * студенту размер льготы, а не чтобы списать деньги.
 */
export const FICA_RATE = 0.0765;

/** Считает налог по прогрессивной шкале. Пустая шкала = налога нет. */
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
