import { NextResponse } from "next/server";
import { z } from "zod";

/**
 * Приём заявок в лист ожидания.
 *
 * Лид уезжает в Telegram: основатель работает один, а Telegram — это уже
 * открытое приложение на телефоне. Отдельная CRM на этой стадии только
 * добавит место, куда можно не заглянуть вовремя.
 *
 * Если бот не настроен, ручка честно отвечает ошибкой. Молча принять заявку
 * и потерять её — худшее, что может сделать сервис, который продаёт надёжность.
 */

const leadSchema = z.object({
  name: z.string().trim().min(1).max(120),
  contact: z.string().trim().min(2).max(200),
  note: z.string().trim().max(500).optional().nullable(),
  /** Приманка для ботов: люди это поле не видят, поэтому оно должно быть пустым. */
  company: z.string().max(200).optional().nullable(),
});

/** Экранирует текст для Telegram в режиме HTML. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Не удалось прочитать заявку." },
      { status: 400 },
    );
  }

  const parsed = leadSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Заполни имя и контакт — остальное необязательно." },
      { status: 400 },
    );
  }

  const lead = parsed.data;

  // Бот заполнил скрытое поле. Отвечаем успехом, чтобы он не подбирал обход,
  // но никуда не пересылаем.
  if (lead.company) {
    return NextResponse.json({ ok: true });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.error(
      "[lead] TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID не заданы — заявка не доставлена:",
      lead,
    );
    return NextResponse.json(
      {
        error:
          "Приём заявок сейчас настраивается. Напиши нам в Telegram — ответим вручную.",
      },
      { status: 503 },
    );
  }

  const lines = [
    "<b>Новая заявка в лист ожидания</b>",
    `Имя: ${escapeHtml(lead.name)}`,
    `Контакт: ${escapeHtml(lead.contact)}`,
    lead.note ? `Комментарий: ${escapeHtml(lead.note)}` : null,
  ].filter((line): line is string => line !== null);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      },
    );

    if (!response.ok) {
      const detail = await response.text();
      console.error("[lead] Telegram отклонил сообщение:", detail, lead);
      return NextResponse.json(
        {
          error:
            "Не получилось доставить заявку. Напиши нам в Telegram — ответим вручную.",
        },
        { status: 502 },
      );
    }
  } catch (error) {
    console.error("[lead] Сеть недоступна при отправке в Telegram:", error, lead);
    return NextResponse.json(
      {
        error:
          "Не получилось доставить заявку. Напиши нам в Telegram — ответим вручную.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
