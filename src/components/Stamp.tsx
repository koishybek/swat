/**
 * Марка SWAT как оттиск штампа.
 *
 * Почему штамп, а не орёл: весь путь участника — это документы, которые кто-то
 * должен проверить и заверить (DS-2019, оффер, виза). Штамп означает «проверено»,
 * а проверенность и есть то, что мы продаём. Орёл со свушем означает
 * «мы такое же визовое агентство, как остальные».
 */
export function Stamp({ size = "md" }: { size?: "sm" | "md" }) {
  const isSmall = size === "sm";

  return (
    <span
      className="swat-stamp"
      style={{
        padding: isSmall ? "0.22rem 0.5rem 0.18rem" : "0.3rem 0.7rem 0.25rem",
      }}
    >
      <span
        className="swat-stamp__word"
        style={{ fontSize: isSmall ? "1.15rem" : "1.6rem" }}
      >
        SWAT
      </span>
      <span
        className="swat-stamp__sub"
        style={{ fontSize: isSmall ? "0.3rem" : "0.375rem" }}
      >
        Swift Work and Travel
      </span>
    </span>
  );
}
