import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingDown, TrendingUp, Minus } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  change?: number;
}

export default function WeightTracker() {
  const [weight, setWeight] = useState('');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('weightEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('weightEntries', JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !selectedDate) return;

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue)) return;

    // Check if entry for this date already exists
    const existingEntryIndex = entries.findIndex(entry => entry.date === selectedDate);
    
    let newEntries = [...entries];
    const previousEntry = newEntries
      .filter(entry => entry.date < selectedDate)
      .sort((a, b) => b.date.localeCompare(a.date))[0];

    const change = previousEntry ? weightValue - previousEntry.weight : 0;

    const newEntry: WeightEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      weight: weightValue,
      change: change
    };

    if (existingEntryIndex >= 0) {
      // Update existing entry
      newEntries[existingEntryIndex] = newEntry;
    } else {
      // Add new entry
      newEntries.push(newEntry);
    }

    // Recalculate changes for all entries
    newEntries.sort((a, b) => a.date.localeCompare(b.date));
    for (let i = 0; i < newEntries.length; i++) {
      if (i === 0) {
        newEntries[i].change = 0;
      } else {
        newEntries[i].change = newEntries[i].weight - newEntries[i - 1].weight;
      }
    }

    setEntries(newEntries);
    setWeight('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeBadge = (change: number) => {
    const variant = change > 0 ? 'destructive' : change < 0 ? 'default' : 'secondary';
    const prefix = change > 0 ? '+' : '';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getChangeIcon(change)}
        {prefix}{change.toFixed(1)}kg
      </Badge>
    );
  };

  const chartData = entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(entry => ({
      date: formatDate(entry.date),
      weight: entry.weight
    }));

  const currentWeight = entries.length > 0 ? 
    entries.sort((a, b) => b.date.localeCompare(a.date))[0].weight : null;

  const totalChange = entries.length > 1 ? 
    entries[entries.length - 1].weight - entries[0].weight : 0;

  return (
    <div className="space-y-6">
      {/* Weight Input Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            체중 기록하기
          </CardTitle>
          <CardDescription>
            오늘의 체중을 입력하여 변화를 추적해보세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">날짜</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">체중 (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  placeholder="예: 65.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              체중 기록
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Current Stats */}
      {currentWeight && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{currentWeight}kg</div>
              <p className="text-xs text-muted-foreground">현재 체중</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold flex items-center gap-2">
                {totalChange.toFixed(1)}kg
                {getChangeIcon(totalChange)}
              </div>
              <p className="text-xs text-muted-foreground">총 변화량</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{entries.length}일</div>
              <p className="text-xs text-muted-foreground">기록된 일수</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Weight Chart */}
      {chartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>체중 변화 차트</CardTitle>
            <CardDescription>시간에 따른 체중 변화를 확인해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']}
                    tickFormatter={(value) => `${value}kg`}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `날짜: ${value}`}
                    formatter={(value: number) => [`${value}kg`, '체중']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Entries */}
      {entries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 기록</CardTitle>
            <CardDescription>최근 체중 기록들을 확인해보세요</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {entries
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 7)
                .map(entry => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex flex-col">
                      <span className="font-medium">{entry.weight}kg</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <div>
                      {entry.change !== undefined && getChangeBadge(entry.change)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}