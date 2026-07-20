import {
  calculateEarnings,
  type EarningsInput,
  type EarningsResult,
} from "./earnings";
import { STATES, type StateCode } from "./states";

/**
 * Типовые условия сезона по направлениям.
 *
 * Числа опираются на исследование рынка от 20.07.2026
 * (docs/2026-07-20-стратегический-брифинг.md) и остаются предварительными,
 * пока не сверены с конкретными офферами работодателей.
 *
 * Два решения, определяющие всю модель:
 *
 * 1. Сезон — 10 рабочих недель, а не 16. Чарт Госдепа даёт Казахстану
 *    окно 8 мая – 1 сентября, но участник ограничен длительностью своих
 *    академических каникул. Сессия в казахстанских вузах часто идёт
 *    до конца июня, осенний семестр начинается 1–2 сентября.
 *
 * 2. Ключевая переменная — не ставка и не регион, а наличие второй
 *    одобренной работы. Разница между одной работой и двумя больше,
 *    чем разница между всеми регионами вместе взятыми.
 */

/** Реалистичное число рабочих недель для студента из Казахстана. */
export const REALISTIC_SEASON_WEEKS = 10;

/** Приоритет направления по итогам анализа рынка. */
export type Tier = "target" | "second" | "trap";

export interface StateScenario {
  readonly stateCode: StateCode;
  readonly town: string;
  readonly role: string;
  readonly hourlyWage: number;
  readonly weeklyHours: number;
  readonly tipsPerWeek: number;
  readonly housingPerWeek: number;
  readonly foodPerWeek: number;
  readonly transportPerWeek: number;
  readonly weeks: number;
  /** Перелёт из Алматы туда-обратно. */
  readonly flights: number;
  /**
   * Часов в неделю на второй работе, которые реально доступны в этой локации.
   * Ноль означает, что второй работы здесь нет: изолированный кластер
   * или моногород вокруг одного работодателя.
   */
  readonly secondJobHours: number;
  readonly tier: Tier;
  readonly tierNote: string;
  readonly verified: boolean;
}

/**
 * Разовые затраты, одинаковые для всех направлений.
 * SEVIS для SWT — льготные $35, а не $220.
 */
export const FIXED_UPFRONT = {
  /** Взнос за программу. Рыночный коридор Казахстана на сезон 2027: $1 650–2 690. */
  programFee: 1_900,
  sevisFee: 35,
  visaFee: 185,
  /** Контингенция: сбор существует в законе, но правила Госдепа ещё нет. */
  integrityFee: 250,
  insurance: 180,
} as const;

export const SCENARIOS: readonly StateScenario[] = [
  {
    stateCode: "MD",
    town: "Ocean City",
    role: "Фудкорт на променаде",
    hourlyWage: 15.0,
    weeklyHours: 38,
    tipsPerWeek: 90,
    housingPerWeek: 190,
    foodPerWeek: 70,
    transportPerWeek: 10,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_400,
    secondJobHours: 18,
    tier: "target",
    tierNote:
      "Крупнейшее направление J-1 в США: 3 635 участников и около 12 000 сезонных мест. Сотни мелких работодателей в пешей доступности — лучший в стране рынок для второй работы.",
    verified: false,
  },
  {
    stateCode: "NJ",
    town: "Wildwood",
    role: "Аттракционы и кафе",
    hourlyWage: 15.23,
    weeklyHours: 38,
    tipsPerWeek: 100,
    housingPerWeek: 150,
    foodPerWeek: 70,
    transportPerWeek: 10,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_400,
    secondJobHours: 18,
    tier: "target",
    tierNote:
      "Плотная застройка курорта даёт вторую работу пешком. Внимание: у курортных работодателей действует сезонный минимум $15.23, а не общий $15.92.",
    verified: false,
  },
  {
    stateCode: "SC",
    town: "Myrtle Beach",
    role: "Официант",
    hourlyWage: 13.0,
    weeklyHours: 38,
    tipsPerWeek: 110,
    housingPerWeek: 120,
    foodPerWeek: 60,
    transportPerWeek: 10,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_450,
    secondJobHours: 16,
    tier: "target",
    tierNote:
      "Четвёртое направление страны. Город построил комплекс студенческого жилья за $45 млн — проблема с проживанием решена капитально. Своего минимума у штата нет, ставку проверяй придирчиво.",
    verified: false,
  },
  {
    stateCode: "WI",
    town: "Wisconsin Dells",
    role: "Аквапарк",
    hourlyWage: 13.5,
    weeklyHours: 40,
    tipsPerWeek: 0,
    housingPerWeek: 110,
    foodPerWeek: 60,
    transportPerWeek: 0,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_450,
    secondJobHours: 12,
    tier: "target",
    tierNote:
      "Третье направление страны. Город на 4 000 жителей целенаправленно построил жильё под участников программы. Своего минимума у штата нет.",
    verified: false,
  },
  {
    stateCode: "FL",
    town: "Orlando",
    role: "Парки и отели",
    hourlyWage: 15.0,
    weeklyHours: 38,
    tipsPerWeek: 40,
    housingPerWeek: 160,
    foodPerWeek: 65,
    transportPerWeek: 20,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_500,
    secondJobHours: 16,
    tier: "target",
    tierNote:
      "Второе направление страны, около 3 500 участников. Подоходного налога штата нет. В популярных списках направлений почти не встречается.",
    verified: false,
  },
  {
    stateCode: "OH",
    town: "Sandusky",
    role: "Парк аттракционов",
    hourlyWage: 15.0,
    weeklyHours: 42,
    tipsPerWeek: 0,
    housingPerWeek: 105,
    foodPerWeek: 60,
    transportPerWeek: 0,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_450,
    secondJobHours: 0,
    tier: "target",
    tierNote:
      "Пятое направление страны: Cedar Point набирает около 7 000 сезонных сотрудников. Первые $26 050 не облагаются налогом штата. Минус — моногород вокруг парка, второй работы нет.",
    verified: false,
  },
  {
    stateCode: "TN",
    town: "Gatlinburg",
    role: "Отель и парк",
    hourlyWage: 13.0,
    weeklyHours: 38,
    tipsPerWeek: 20,
    housingPerWeek: 115,
    foodPerWeek: 60,
    transportPerWeek: 10,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_450,
    secondJobHours: 10,
    tier: "second",
    tierNote:
      "Подоходного налога штата нет, есть построенное общежитие на 780 мест. Но своего минимума оплаты у штата тоже нет, и ставки заметно ниже побережья.",
    verified: false,
  },
  {
    stateCode: "AK",
    town: "Denali",
    role: "Отель в нацпарке",
    hourlyWage: 15.0,
    weeklyHours: 45,
    tipsPerWeek: 0,
    // Комната и трёхразовое питание включены и удерживаются из зарплаты.
    housingPerWeek: 105,
    foodPerWeek: 0,
    transportPerWeek: 0,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_900,
    secondJobHours: 0,
    tier: "second",
    tierNote:
      "Лучший режим переработок в стране: полуторная ставка после 8 часов в день, а не только после 40 в неделю. Налога штата нет, жильё с питанием $105/нед. Но дорогой перелёт съедает преимущество, а второй работы в изолированном кластере не существует.",
    verified: false,
  },
  {
    stateCode: "DE",
    town: "Rehoboth Beach",
    role: "Кафе-мороженое",
    hourlyWage: 15.0,
    weeklyHours: 36,
    tipsPerWeek: 90,
    housingPerWeek: 180,
    foodPerWeek: 65,
    transportPerWeek: 10,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_400,
    secondJobHours: 12,
    tier: "second",
    tierNote:
      "Нет налога с продаж — экономия на всех бытовых покупках. Но направление маленькое, жильё дорогое, а вакансий мало.",
    verified: false,
  },
  {
    stateCode: "MA",
    town: "Cape Cod",
    role: "Горничная в отеле",
    hourlyWage: 15.0,
    weeklyHours: 36,
    tipsPerWeek: 60,
    housingPerWeek: 210,
    foodPerWeek: 70,
    transportPerWeek: 15,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_400,
    secondJobHours: 14,
    tier: "trap",
    tierNote:
      "Направление схлопнулось: около 2 100 участников против 5 000 в 2018 году. В 2022-м спонсоры увели с Кейпа 3 000 студентов из-за того, что им негде было жить. Оффер без письменно подтверждённого жилья здесь брать нельзя.",
    verified: false,
  },
  {
    stateCode: "CO",
    town: "Estes Park",
    role: "Курортный комплекс",
    hourlyWage: 15.16,
    weeklyHours: 38,
    tipsPerWeek: 30,
    housingPerWeek: 200,
    foodPerWeek: 70,
    transportPerWeek: 10,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_500,
    secondJobHours: 6,
    tier: "trap",
    tierNote:
      "Горнолыжные городки живут зимой, а зимний сезон казахстанскому студенту недоступен. Летний рынок мал, жильё дорогое, участникам программы в служебном жилье часто отказывают.",
    verified: false,
  },
  {
    stateCode: "ME",
    town: "Bar Harbor",
    role: "Магазин у порта",
    hourlyWage: 15.1,
    weeklyHours: 36,
    tipsPerWeek: 30,
    housingPerWeek: 190,
    foodPerWeek: 70,
    transportPerWeek: 10,
    weeks: REALISTIC_SEASON_WEEKS,
    flights: 1_400,
    secondJobHours: 6,
    tier: "trap",
    tierNote:
      "Самая высокая нижняя ступень налога штата среди всех направлений: 5.8% с первого доллара. Короткий сезон, дорогое жильё, мало работодателей.",
    verified: false,
  },
];

export function scenarioToInput(
  scenario: StateScenario,
  withSecondJob: boolean,
): EarningsInput {
  return {
    hourlyWage: scenario.hourlyWage,
    weeklyHours: scenario.weeklyHours,
    weeks: scenario.weeks,
    tipsPerWeek: scenario.tipsPerWeek,
    secondJobWage: withSecondJob ? scenario.hourlyWage : 0,
    secondJobHours: withSecondJob ? scenario.secondJobHours : 0,
    housingPerWeek: scenario.housingPerWeek,
    foodPerWeek: scenario.foodPerWeek,
    transportPerWeek: scenario.transportPerWeek,
    stateCode: scenario.stateCode,
    upfront: { ...FIXED_UPFRONT, flights: scenario.flights },
  };
}

export interface RankedScenario {
  readonly scenario: StateScenario;
  /** Итог с одной работой — то, что студент получает по умолчанию. */
  readonly oneJob: EarningsResult;
  /** Итог с двумя одобренными работами. */
  readonly twoJobs: EarningsResult;
  /** Сколько добавляет вторая работа. */
  readonly secondJobGain: number;
  readonly stateNameRu: string;
  readonly hasOwnMinimum: boolean;
  readonly hasStateIncomeTax: boolean;
}

/**
 * Ранжирует направления по остатку на руках при двух работах.
 * Сортировка по ставке или по «популярности штата» даёт другой порядок
 * и приводит студента не туда.
 */
export function rankScenarios(): readonly RankedScenario[] {
  return SCENARIOS.map((scenario) => {
    const state = STATES[scenario.stateCode];
    const oneJob = calculateEarnings(scenarioToInput(scenario, false));
    const twoJobs = calculateEarnings(scenarioToInput(scenario, true));

    return {
      scenario,
      oneJob,
      twoJobs,
      secondJobGain: twoJobs.netHome - oneJob.netHome,
      stateNameRu: state.nameRu,
      hasOwnMinimum: state.hasOwnMinimum,
      hasStateIncomeTax: state.incomeTaxBrackets.length > 0,
    };
  }).sort((a, b) => b.twoJobs.netHome - a.twoJobs.netHome);
}
