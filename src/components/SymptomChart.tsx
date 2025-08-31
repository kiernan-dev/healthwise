import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SymptomEntry } from "@/services/symptomStorageService";
import { useMemo } from 'react';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

interface SymptomChartProps {
  symptoms: SymptomEntry[];
}

const SymptomChart = ({ symptoms }: SymptomChartProps) => {
  const chartData = useMemo(() => {
    if (symptoms.length === 0) return [];
    
    // Recharts works best with chronological data
    const sortedSymptoms = [...symptoms].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    return sortedSymptoms.map(entry => ({
      date: format(entry.timestamp, 'MMM d'),
      severity: entry.severity,
      symptom: entry.symptom,
    }));
  }, [symptoms]);

  if (symptoms.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Symptom Severity Trend
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p>Not enough data to display a trend.</p>
            <p>Log at least two symptoms to see a chart.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Symptom Severity Trend
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{
              top: 5,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 10]} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
              }}
              formatter={(value, name, props) => [`${value}/10 (${props.payload.symptom})`, 'Severity']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="severity"
              stroke="#8884d8"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SymptomChart;