import SymptomTracker from "./SymptomTracker";
import { SymptomEntry } from "@/services/symptomStorageService";

interface TrackerTabProps {
  onSymptomLogged: (entry: SymptomEntry) => void;
}

const TrackerTab = ({ onSymptomLogged }: TrackerTabProps) => {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <SymptomTracker onSymptomLogged={onSymptomLogged} />
        </div>
      </div>
    </div>
  );
};

export default TrackerTab;