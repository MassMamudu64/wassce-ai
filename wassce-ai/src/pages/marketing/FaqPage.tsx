import MarketingLayout from "./MarketingLayout";

const faqs = [
  { q: "Is WASSCE AI free?", a: "You can study with sample content for free. AI features require your own API key." },
  {
    q: "Where is my data stored?",
    a: "Your account and progress are stored in Supabase.",
  },
  { q: "How do AI quizzes work?", a: "Pick a subject and we generate exam-style MCQs; results save to Progress." },
  { q: "Will AI show answers?", a: "In-quiz AI hints are subtle by design. You can review correct answers after finishing." },
] as const;

export default function FaqPage() {
  return (
    <MarketingLayout title="FAQ" subtitle="Quick answers to common questions.">
      <div className="space-y-4">
        {faqs.map((item) => (
          <details key={item.q} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
            <summary className="cursor-pointer text-sm font-semibold text-slate-900">{item.q}</summary>
            <p className="mt-3 text-sm text-slate-700">{item.a}</p>
          </details>
        ))}
      </div>
    </MarketingLayout>
  );
}
