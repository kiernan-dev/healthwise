import HealthInsights from "./HealthInsights";

const InsightsTab = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <HealthInsights />
        </div>
      </div>
    </div>
  );
};

export default InsightsTab;