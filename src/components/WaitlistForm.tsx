"use client";

import { useState } from "react";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export function WaitlistForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ kind: "sending" });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          contact: data.get("contact"),
          note: data.get("note"),
          // Скрытое поле: люди его не видят, боты заполняют.
          company: data.get("company"),
        }),
      });

      if (!response.ok) {
        const body: unknown = await response.json().catch(() => null);
        const message =
          body &&
          typeof body === "object" &&
          "error" in body &&
          typeof body.error === "string"
            ? body.error
            : "Не получилось отправить. Напиши нам в Telegram — ответим вручную.";
        setStatus({ kind: "error", message });
        return;
      }

      form.reset();
      setStatus({ kind: "sent" });
    } catch {
      setStatus({
        kind: "error",
        message:
          "Нет связи с сервером. Проверь интернет или напиши нам в Telegram.",
      });
    }
  }

  if (status.kind === "sent") {
    return (
      <div className="swat-stub flex flex-col justify-center px-6 py-10">
        <p className="swat-caption">Записали</p>
        <p className="mt-3 font-[family-name:var(--font-display)] text-[1.6rem] uppercase leading-tight">
          Ты в списке
        </p>
        <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--color-ink-soft)]">
          Напишем, когда появятся подтверждённые офферы с полным расчётом.
          Одно сообщение — без рассылок и звонков.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="swat-stub px-6 py-8" noValidate>
      <p className="swat-caption">Лист ожидания · сезон 2027</p>

      <div className="mt-5 grid gap-5">
        <div>
          <label htmlFor="name" className="swat-caption">
            Как тебя зовут
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="name"
            className="mt-2 w-full border-b-2 border-[var(--color-ink)] bg-transparent px-1 py-2 text-[1rem] outline-none focus:border-[var(--color-stamp)]"
            placeholder="Айдана"
          />
        </div>

        <div>
          <label htmlFor="contact" className="swat-caption">
            Telegram, почта или телефон
          </label>
          <input
            id="contact"
            name="contact"
            required
            className="mt-2 w-full border-b-2 border-[var(--color-ink)] bg-transparent px-1 py-2 text-[1rem] outline-none focus:border-[var(--color-stamp)]"
            placeholder="@username"
          />
        </div>

        <div>
          <label htmlFor="note" className="swat-caption">
            Что важно знать — необязательно
          </label>
          <input
            id="note"
            name="note"
            className="mt-2 w-full border-b-2 border-[var(--color-ink)] bg-transparent px-1 py-2 text-[1rem] outline-none focus:border-[var(--color-stamp)]"
            placeholder="2 курс, хочу на побережье"
          />
        </div>
      </div>

      {/* Ловушка для ботов: скрыта от людей и от скринридеров. */}
      <div aria-hidden="true" className="absolute h-0 w-0 overflow-hidden">
        <label htmlFor="company">Компания</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        className="swat-button swat-button--solid mt-7 w-full"
        disabled={status.kind === "sending"}
      >
        {status.kind === "sending" ? "Отправляем…" : "Записаться в список"}
      </button>

      {status.kind === "error" && (
        <p className="swat-flag swat-flag--danger mt-4" role="alert">
          <b className="swat-num shrink-0" aria-hidden="true">
            [!]
          </b>
          <span>{status.message}</span>
        </p>
      )}

      <p className="swat-note mt-4">
        Контакт нужен только чтобы написать про офферы. Не передаём третьим
        лицам и не звоним без твоего запроса.
      </p>
    </form>
  );
}
