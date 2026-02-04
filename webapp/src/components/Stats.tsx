export default function Stats() {
  const stats = [
    { value: "$2.4M+", label: "Saved by users" },
    { value: "50K+", label: "Active users" },
    { value: "4.8", label: "Chrome Store rating" },
  ];

  return (
    <section className="py-16 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-bold text-[--primary] mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
