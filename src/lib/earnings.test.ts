import { describe, expect, it } from "vitest";
import { calculateEarnings, formatUsd, type EarningsInput } from "./earnings";
import { FEDERAL_BRACKETS, taxByBrackets } from "./states";

/** Базовый оффер: Теннесси выбран специально — там нет подоходного налога штата,
 *  поэтому федеральную часть видно в чистом виде. */
function offer(overrides: Partial<EarningsInput> = {}): EarningsInput {
  return {
    hourlyWage: 15,
    weeklyHours: 40,
    weeks: 14,
    housingPerWeek: 0,
    stateCode: "TN",
    ...overrides,
  };
}

describe("calculateEarnings — начисления", () => {
  it("считает базовый заработок как ставка × часы × недели", () => {
    const result = calculateEarnings(offer());

    expect(result.gross.base).toBe(8_400);
    expect(result.gross.overtime).toBe(0);
    expect(result.gross.total).toBe(8_400);
  });

  it("оплачивает часы свыше 40 в неделю по полуторной ставке", () => {
    const result = calculateEarnings(
      offer({ hourlyWage: 20, weeklyHours: 48, weeks: 10 }),
    );

    // 40 ч × $20 × 10 нед.
    expect(result.gross.base).toBe(8_000);
    // 8 ч × $20 × 1.5 × 10 нед.
    expect(result.gross.overtime).toBe(2_400);
    expect(result.gross.total).toBe(10_400);
  });

  it("учитывает чаевые и вторую работу отдельными строками", () => {
    const result = calculateEarnings(
      offer({
        weeks: 10,
        tipsPerWeek: 120,
        secondJobWage: 15,
        secondJobHours: 10,
      }),
    );

    expect(result.gross.tips).toBe(1_200);
    expect(result.gross.secondJob).toBe(1_500);
  });
});

describe("calculateEarnings — налоги", () => {
  it("применяет федеральную ставку 10% на доход в первой ступени", () => {
    const result = calculateEarnings(offer());

    expect(result.gross.total).toBe(8_400);
    expect(result.taxes.federal).toBe(840);
  });

  it("переходит на вторую федеральную ступень выше порога", () => {
    const result = calculateEarnings(
      offer({ hourlyWage: 25, weeks: 15 }), // $15 000 брутто
    );

    // $12 400 × 10% + $2 600 × 12%
    expect(result.taxes.federal).toBe(1_552);
  });

  it("не берёт налог штата там, где его нет", () => {
    const tennessee = calculateEarnings(offer({ stateCode: "TN" }));
    const alaska = calculateEarnings(offer({ stateCode: "AK" }));

    expect(tennessee.taxes.state).toBe(0);
    expect(alaska.taxes.state).toBe(0);
  });

  it("применяет плоскую ставку штата в Массачусетсе", () => {
    const result = calculateEarnings(offer({ stateCode: "MA" }));

    expect(result.taxes.state).toBe(420); // $8 400 × 5%
  });

  it("добавляет местный налог для нерезидентов в Мэриленде", () => {
    const result = calculateEarnings(offer({ stateCode: "MD" }));

    // 1000×2% + 1000×3% + 1000×4% + 5400×4.75%
    expect(result.taxes.state).toBe(347);
    expect(result.taxes.local).toBe(189); // $8 400 × 2.25%
  });

  it("не облагает налогом штата первую ступень в Южной Каролине", () => {
    const result = calculateEarnings(offer({ stateCode: "SC" }));

    // Первые $3 560 под 0%, остальные $4 840 под 3%
    expect(result.taxes.state).toBe(145);
  });

  it("не удерживает FICA, но показывает размер льготы", () => {
    const result = calculateEarnings(offer());

    expect(result.taxes.ficaSaved).toBe(643); // $8 400 × 7.65%
    // Главное: льгота не входит в удержания и не уменьшает остаток.
    expect(result.taxes.total).toBe(result.taxes.federal + result.taxes.state);
    expect(result.netInUsa).toBe(
      result.gross.total - result.taxes.total - result.living.total,
    );
  });
});

describe("calculateEarnings — итог поездки", () => {
  it("вычитает разовые затраты из остатка, чтобы получить итог домой", () => {
    const result = calculateEarnings(
      offer({
        housingPerWeek: 150,
        foodPerWeek: 60,
        transportPerWeek: 20,
        upfront: {
          programFee: 1_800,
          sevisFee: 35,
          visaFee: 185,
          flights: 1_300,
          insurance: 180,
        },
      }),
    );

    expect(result.living.total).toBe(3_220); // ($150+$60+$20) × 14
    expect(result.upfrontTotal).toBe(3_500);
    expect(result.netInUsa).toBe(4_340); // 8400 − 840 − 3220
    expect(result.netHome).toBe(840); // 4340 − 3500
  });

  it("считает неделю выхода в ноль", () => {
    const result = calculateEarnings(
      offer({
        housingPerWeek: 150,
        foodPerWeek: 60,
        transportPerWeek: 20,
        upfront: { programFee: 1_800, flights: 1_300 },
      }),
    );

    // Чистыми $310/нед., разовые затраты $3 100 → десятая неделя.
    expect(result.netPerWeek).toBe(310);
    expect(result.breakEvenWeek).toBe(10);
  });

  it("возвращает breakEvenWeek = null, когда расходы съедают весь доход", () => {
    const result = calculateEarnings(
      offer({ housingPerWeek: 600, foodPerWeek: 200 }),
    );

    expect(result.netPerWeek).toBeLessThanOrEqual(0);
    expect(result.breakEvenWeek).toBeNull();
  });
});

describe("calculateEarnings — предупреждения", () => {
  it("помечает ставку ниже законного минимума штата как опасность", () => {
    const result = calculateEarnings(
      offer({ hourlyWage: 10, stateCode: "NJ" }), // минимум NJ — $15.92
    );

    const danger = result.warnings.filter((w) => w.level === "danger");
    expect(danger.some((w) => w.message.includes("незаконен"))).toBe(true);
  });

  it("не жалуется на ставку, законную для штата без своего минимума", () => {
    const result = calculateEarnings(
      offer({ hourlyWage: 10, stateCode: "TN" }), // федеральные $7.25
    );

    expect(
      result.warnings.some((w) => w.message.includes("незаконен")),
    ).toBe(false);
    // Но обязан предупредить, что защиты снизу почти нет.
    expect(
      result.warnings.some(
        (w) => w.level === "info" && w.message.includes("нет своего минимума"),
      ),
    ).toBe(true);
  });

  it("распознаёт заведомо убыточный оффер и объясняет почему", () => {
    const result = calculateEarnings(
      offer({
        hourlyWage: 15,
        weeklyHours: 30,
        weeks: 12,
        stateCode: "ME",
        housingPerWeek: 250,
        foodPerWeek: 80,
        transportPerWeek: 30,
        upfront: {
          programFee: 2_500,
          sevisFee: 35,
          visaFee: 185,
          flights: 1_400,
          insurance: 200,
        },
      }),
    );

    expect(result.netHome).toBe(-4_093);
    expect(result.breakEvenWeek).toBe(229);

    const messages = result.warnings.map((w) => w.message).join(" ");
    expect(messages).toContain("убыточна");
    // Ставка $15 ниже минимума Мэна $15.10 — это тоже должно всплыть.
    expect(messages).toContain("незаконен");
    // Часы и жильё — две причины, по которым сезон не выходит в плюс.
    expect(messages).toContain("часов в неделю — мало");
    expect(messages).toContain("Жильё съедает");

    expect(result.warnings.filter((w) => w.level === "danger")).toHaveLength(3);
  });

  it("предупреждает, когда жильё съедает больше 35% дохода", () => {
    const result = calculateEarnings(
      offer({ hourlyWage: 16, weeklyHours: 40, housingPerWeek: 250 }),
    );

    expect(result.housingBurden).toBeCloseTo(0.39, 2);
    expect(
      result.warnings.some((w) => w.message.includes("Жильё съедает")),
    ).toBe(true);
  });

  it("напоминает согласовать вторую работу со спонсором", () => {
    const result = calculateEarnings(
      offer({ secondJobWage: 15, secondJobHours: 10 }),
    );

    expect(
      result.warnings.some((w) => w.message.includes("согласовать со спонсором")),
    ).toBe(true);
  });

  it("не выдумывает предупреждений для здорового оффера", () => {
    const result = calculateEarnings(
      offer({
        hourlyWage: 17,
        weeklyHours: 40,
        stateCode: "NJ",
        housingPerWeek: 140,
        foodPerWeek: 60,
        upfront: { programFee: 1_500, flights: 1_200 },
      }),
    );

    expect(result.warnings.filter((w) => w.level === "danger")).toHaveLength(0);
    expect(result.warnings.filter((w) => w.level === "caution")).toHaveLength(0);
  });
});

describe("calculateEarnings — валидация входа", () => {
  it("отвергает сезон нулевой длины", () => {
    expect(() => calculateEarnings(offer({ weeks: 0 }))).toThrow();
  });

  it("отвергает отрицательную ставку", () => {
    expect(() => calculateEarnings(offer({ hourlyWage: -1 }))).toThrow();
  });

  it("отвергает неизвестный штат", () => {
    expect(() =>
      calculateEarnings(offer({ stateCode: "XX" as never })),
    ).toThrow();
  });
});

describe("taxByBrackets", () => {
  it("возвращает ноль при пустой шкале", () => {
    expect(taxByBrackets(10_000, [])).toBe(0);
  });

  it("возвращает ноль при нулевом и отрицательном доходе", () => {
    expect(taxByBrackets(0, FEDERAL_BRACKETS)).toBe(0);
    expect(taxByBrackets(-100, FEDERAL_BRACKETS)).toBe(0);
  });

  it("облагает каждую ступень по своей ставке, а не весь доход по верхней", () => {
    // Наивная ошибка дала бы 15000 × 12% = 1800.
    expect(taxByBrackets(15_000, FEDERAL_BRACKETS)).toBeCloseTo(1_552, 5);
  });
});

describe("formatUsd", () => {
  it("разделяет разряды", () => {
    expect(formatUsd(8_400)).toMatch(/^\$8\s400$/u);
    expect(formatUsd(1_000)).toMatch(/^\$1\s000$/u);
  });

  it("не вставляет обычный пробел, чтобы сумма не рвалась на строки", () => {
    expect(formatUsd(8_400)).not.toContain(" ");
  });

  it("не разделяет числа короче четырёх знаков", () => {
    expect(formatUsd(999)).toBe("$999");
    expect(formatUsd(0)).toBe("$0");
  });

  it("показывает минус типографским знаком", () => {
    expect(formatUsd(-4_093)).toMatch(/^−\$4\s093$/u);
  });
});
