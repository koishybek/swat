import { calculateEarnings, type EarningsResult } from "./earnings";
import { STATES, type StateCode } from "./states";

/**
 * Типовой сценарий сезона по каждому направлению.
 *
 * Это не офферы, а модельные условия: «средняя работа средней руки» в этом месте.
 * Нужны, чтобы честно сравнить направления между собой — по остатку на руках,
 * а не по ставке и не по красоте пляжа.
 *
 * СТАТУС ДАННЫХ: предварительные оценки. Пока `verified: false`, интерфейс обязан
 * показывать их с оговоркой. Числа заменяются подтверждёнными после сверки
 * с вакансиями работодателей и данными по аренде за сезон.
 */
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
  /** Перелёт из Алматы туда-обратно — заметно отличается по направлениям. */
  readonly flights: number;
  readonly verified: boolean;
}

/** Разовые затраты, одинаковые для всех направлений. */
export const FIXED_UPFRONT = {
  /** Взнос за программу: спонсорский сбор плюс работа агентства. */
  programFee: 1_900,
  /** Сбор SEVIS I-901. */
  sevisFee: 35,
  /** Консульский сбор за визу. */
  visaFee: 185,
  insurance: 180,
} as const;

export const SCENARIOS: readonly StateScenario[] = [
  {
    stateCode: "NJ",
    town: "Ocean City",
    role: "Кафе на набережной",
    hourlyWage: 16.0,
    weeklyHours: 38,
    tipsPerWeek: 120,
    housingPerWeek: 165,
    foodPerWeek: 65,
    transportPerWeek: 10,
    weeks: 14,
    flights: 1_400,
    verified: false,
  },
  {
    stateCode: "MA",
    town: "Hyannis",
    role: "Горничная в отеле",
    hourlyWage: 17.0,
    weeklyHours: 36,
    tipsPerWeek: 0,
    housingPerWeek: 200,
    foodPerWeek: 70,
    transportPerWeek: 15,
    weeks: 13,
    flights: 1_400,
    verified: false,
  },
  {
    stateCode: "MD",
    town: "Ocean City",
    role: "Продавец и фудкорт",
    hourlyWage: 15.5,
    weeklyHours: 38,
    tipsPerWeek: 80,
    housingPerWeek: 150,
    foodPerWeek: 65,
    transportPerWeek: 10,
    weeks: 14,
    flights: 1_400,
    verified: false,
  },
  {
    stateCode: "SC",
    town: "Myrtle Beach",
    role: "Официант",
    hourlyWage: 13.0,
    weeklyHours: 38,
    tipsPerWeek: 110,
    housingPerWeek: 130,
    foodPerWeek: 60,
    transportPerWeek: 15,
    weeks: 14,
    flights: 1_450,
    verified: false,
  },
  {
    stateCode: "WI",
    town: "Wisconsin Dells",
    role: "Аквапарк",
    hourlyWage: 14.0,
    weeklyHours: 40,
    tipsPerWeek: 0,
    housingPerWeek: 110,
    foodPerWeek: 60,
    transportPerWeek: 0,
    weeks: 14,
    flights: 1_450,
    verified: false,
  },
  {
    stateCode: "AK",
    town: "Seward",
    role: "Отель и рыбопереработка",
    hourlyWage: 17.5,
    weeklyHours: 42,
    tipsPerWeek: 40,
    housingPerWeek: 120,
    foodPerWeek: 75,
    transportPerWeek: 0,
    weeks: 13,
    flights: 1_900,
    verified: false,
  },
  {
    stateCode: "CO",
    town: "Estes Park",
    role: "Курортный комплекс",
    hourlyWage: 16.5,
    weeklyHours: 38,
    tipsPerWeek: 30,
    housingPerWeek: 175,
    foodPerWeek: 70,
    transportPerWeek: 10,
    weeks: 14,
    flights: 1_500,
    verified: false,
  },
  {
    stateCode: "TN",
    town: "Gatlinburg",
    role: "Ресепшн в отеле",
    hourlyWage: 14.5,
    weeklyHours: 38,
    tipsPerWeek: 20,
    housingPerWeek: 115,
    foodPerWeek: 60,
    transportPerWeek: 10,
    weeks: 14,
    flights: 1_450,
    verified: false,
  },
  {
    stateCode: "DE",
    town: "Rehoboth Beach",
    role: "Кафе-мороженое",
    hourlyWage: 15.5,
    weeklyHours: 36,
    tipsPerWeek: 100,
    housingPerWeek: 170,
    foodPerWeek: 65,
    transportPerWeek: 10,
    weeks: 13,
    flights: 1_400,
    verified: false,
  },
  {
    stateCode: "ME",
    town: "Bar Harbor",
    role: "Магазин у порта",
    hourlyWage: 16.0,
    weeklyHours: 36,
    tipsPerWeek: 30,
    housingPerWeek: 180,
    foodPerWeek: 70,
    transportPerWeek: 10,
    weeks: 12,
    flights: 1_400,
    verified: false,
  },
];

export interface RankedScenario {
  readonly scenario: StateScenario;
  readonly result: EarningsResult;
  readonly stateName: string;
  readonly minimumWage: number;
  readonly hasOwnMinimum: boolean;
  readonly hasStateIncomeTax: boolean;
}

export function scenarioToInput(scenario: StateScenario) {
  return {
    hourlyWage: scenario.hourlyWage,
    weeklyHours: scenario.weeklyHours,
    weeks: scenario.weeks,
    tipsPerWeek: scenario.tipsPerWeek,
    housingPerWeek: scenario.housingPerWeek,
    foodPerWeek: scenario.foodPerWeek,
    transportPerWeek: scenario.transportPerWeek,
    stateCode: scenario.stateCode,
    upfront: { ...FIXED_UPFRONT, flights: scenario.flights },
  };
}

/**
 * Ранжирует направления по остатку на руках — а не по ставке.
 * Именно здесь популярный рейтинг «топ-10 штатов» обычно и разваливается.
 */
export function rankScenarios(): readonly RankedScenario[] {
  return SCENARIOS.map((scenario) => {
    const state = STATES[scenario.stateCode];
    return {
      scenario,
      result: calculateEarnings(scenarioToInput(scenario)),
      stateName: state.nameRu,
      minimumWage: state.minimumWage,
      hasOwnMinimum: state.hasOwnMinimum,
      hasStateIncomeTax: state.incomeTaxBrackets.length > 0,
    };
  }).sort((a, b) => b.result.netHome - a.result.netHome);
}
