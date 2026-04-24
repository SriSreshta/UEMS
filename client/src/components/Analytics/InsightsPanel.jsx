const InsightsPanel = ({ insights = [] }) => {
  if (!insights.length) return null;

  return (
    <div className="mt-10 bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">📌</span>
        <h3 className="text-lg font-black text-indigo-800">Key Insights</h3>
      </div>
      <ul className="space-y-3">
        {insights.map((insight, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-indigo-200 text-indigo-700 text-xs font-black flex items-center justify-center">
              {i + 1}
            </span>
            <p className="text-sm text-indigo-900 leading-relaxed">{insight}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InsightsPanel;