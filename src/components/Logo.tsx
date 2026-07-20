/**
 * Логотип SWAT: орёл слева, наборный знак справа.
 *
 * Исходный файл — квадратная картинка, где орёл стоит НАД надписью, а нужна
 * горизонтальная блокировка. Поэтому орёл вырезается кадрированием: картинка
 * увеличивается и сдвигается внутри окна с overflow: hidden, а слова набираются
 * шрифтами. Так знак остаётся резким на любом экране и не тянет за собой
 * растровый текст.
 */

/** Доли исходного квадрата, в которых лежит орёл. */
const CROP = { left: 0.234, top: 0.098, width: 0.508, ratio: 1.153 } as const;

export function Logo({ height = 40 }: { height?: number }) {
  const boxWidth = height / CROP.ratio;
  const imageSize = boxWidth / CROP.width;

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        aria-hidden="true"
        style={{
          position: "relative",
          display: "block",
          width: boxWidth,
          height,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Локальный растр с ручным кадрированием — next/image здесь только мешает. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/eagle.png"
          alt=""
          width={imageSize}
          height={imageSize}
          style={{
            position: "absolute",
            left: -CROP.left * imageSize,
            top: -CROP.top * imageSize,
            maxWidth: "none",
            // Исходник лежит на белом фоне. Орёл тёмный, поэтому умножение
            // растворяет подложку в кремовой бумаге и не трогает сам знак —
            // дешевле, чем перерисовывать файл с прозрачностью.
            mixBlendMode: "multiply",
          }}
        />
      </span>
      <span className="flex flex-col justify-center">
        <span
          className="font-[family-name:var(--font-display)] font-bold uppercase leading-none"
          style={{
            color: "var(--color-stamp)",
            fontSize: height * 0.62,
            letterSpacing: "0.01em",
          }}
        >
          SWAT
        </span>
        <span
          className="swat-num uppercase leading-none"
          style={{
            color: "var(--color-stamp)",
            fontSize: Math.max(6, height * 0.16),
            letterSpacing: "0.12em",
            marginTop: height * 0.09,
          }}
        >
          Swift Work and Travel
        </span>
      </span>
    </span>
  );
}
