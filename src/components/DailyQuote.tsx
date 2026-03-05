"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const QUOTES = [
  {
    text: "It is better to conquer yourself than to win a thousand battles.",
    author: "Buddha",
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    author: "Winston Churchill",
  },
  {
    text: "Believe you can and you&apos;re halfway there.",
    author: "Theodore Roosevelt",
  },
  {
    text: "Act as if what you do makes a difference. It does.",
    author: "William James",
  },
  {
    text: "Happiness is not something ready made. It comes from your own actions.",
    author: "Dalai Lama",
  },
  {
    text: "Simplicity is the ultimate sophistication.",
    author: "Leonardo da Vinci",
  },
  {
    text: "Be the change that you wish to see in the world.",
    author: "Mahatma Gandhi",
  },
];

export function DailyQuote() {
  const today = new Date().toDateString();

  const hash = today
    .replace(/\s/g, "")
    .split("")
    .reduce((a, b) => a + b.charCodeAt(0), 0);

  const quote = QUOTES[Math.abs(hash) % QUOTES.length];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Quote</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm font-medium italic">&quot;{quote.text}&quot;</p>
        <p className="text-muted-foreground text-xs mt-2 text-right">- {quote.author}</p>
      </CardContent>
    </Card>
  );
}
