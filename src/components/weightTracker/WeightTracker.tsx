import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Calendar, TrendingDown, TrendingUp, Minus, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedContainer from './AnimatedContainer';
import ValidatedInput from './ValidatedInput';
import { validationRules } from '../../utils/validation';
import { toast } from 'sonner';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
  change?: number;
}

export default function WeightTracker() {
  const [weight, setWeight] = useState<string | number>('');
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadData = async () => {
      // Simulate loading delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));

      const savedEntries = localStorage.getItem('weightEntries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Save data to localStorage whenever entries change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('weightEntries', JSON.stringify(entries));
    }
  }, [entries, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || !selectedDate) return;

    const weightValue = Number(weight);
    if (isNaN(weightValue)) return;

    setIsSubmitting(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Check if entry for this date already exists
      const existingEntryIndex = entries.findIndex(
        (entry) => entry.date === selectedDate
      );

      const newEntries = [...entries];
      const previousEntry = newEntries
        .filter((entry) => entry.date < selectedDate)
        .sort((a, b) => b.date.localeCompare(a.date))[0];

      const change = previousEntry ? weightValue - previousEntry.weight : 0;

      const newEntry: WeightEntry = {
        id: Date.now().toString(),
        date: selectedDate,
        weight: weightValue,
        change: change,
      };

      if (existingEntryIndex >= 0) {
        // Update existing entry
        newEntries[existingEntryIndex] = newEntry;
        toast.success('체중 기록이 수정되었습니다');
      } else {
        // Add new entry
        newEntries.push(newEntry);
        toast.success('체중이 성공적으로 기록되었습니다');
      }

      // Recalculate changes for all entries
      newEntries.sort((a, b) => a.date.localeCompare(b.date));
      for (let i = 0; i < newEntries.length; i++) {
        if (i === 0) {
          newEntries[i].change = 0;
        } else {
          newEntries[i].change =
            newEntries[i].weight - newEntries[i - 1].weight;
        }
      }

      setEntries(newEntries);
      setWeight('');
    } catch (error) {
      toast.error('체중 기록 중 오류가 발생했습니다');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (change < 0) return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getChangeBadge = (change: number) => {
    const variant =
      change > 0 ? 'destructive' : change < 0 ? 'default' : 'secondary';
    const prefix = change > 0 ? '+' : '';
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        {getChangeIcon(change)}
        {prefix}
        {change.toFixed(1)}kg
      </Badge>
    );
  };

  const chartData = entries
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((entry) => ({
      date: formatDate(entry.date),
      weight: entry.weight,
    }));

  const currentWeight =
    entries.length > 0
      ? entries.sort((a, b) => b.date.localeCompare(a.date))[0].weight
      : null;

  const totalChange =
    entries.length > 1
      ? entries[entries.length - 1].weight - entries[0].weight
      : 0;

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-16" />
              <Skeleton className="h-16" />
            </div>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Weight Input Form */}
      <AnimatedContainer>
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
                <ValidatedInput
                  id="date"
                  label="날짜"
                  type="date"
                  value={selectedDate}
                  onChange={(value) => setSelectedDate(String(value))}
                  validationRules={{ required: true }}
                  placeholder="날짜를 선택하세요"
                  disabled={isSubmitting}
                />

                <ValidatedInput
                  id="weight"
                  label="체중 (kg)"
                  type="number"
                  value={weight}
                  onChange={setWeight}
                  validationRules={validationRules.weight}
                  placeholder="예: 65.5"
                  disabled={isSubmitting}
                  validateOnChange={true}
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || !weight || !selectedDate}
                >
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: 'linear',
                        }}
                        className="mr-2"
                      >
                        <Plus className="h-4 w-4" />
                      </motion.div>
                      기록 중...
                    </>
                  ) : (
                    '체중 기록'
                  )}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Current Stats */}
      <AnimatePresence>
        {currentWeight && (
          <AnimatedContainer delay={0.1} direction="up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: '현재 체중', value: `${currentWeight}kg`, icon: null },
                {
                  label: '총 변화량',
                  value: `${totalChange.toFixed(1)}kg`,
                  icon: getChangeIcon(totalChange),
                },
                {
                  label: '기록된 일수',
                  value: `${entries.length}일`,
                  icon: null,
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold flex items-center gap-2">
                        {stat.value}
                        {stat.icon}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {stat.label}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </AnimatedContainer>
        )}
      </AnimatePresence>

      {/* Weight Chart */}
      <AnimatePresence>
        {chartData.length > 1 && (
          <AnimatedContainer delay={0.2} direction="up">
            <Card>
              <CardHeader>
                <CardTitle>체중 변화 차트</CardTitle>
                <CardDescription>
                  시간에 따른 체중 변화를 확인해보세요
                </CardDescription>
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
          </AnimatedContainer>
        )}
      </AnimatePresence>

      {/* Recent Entries */}
      <AnimatePresence>
        {entries.length > 0 && (
          <AnimatedContainer delay={0.3} direction="up">
            <Card>
              <CardHeader>
                <CardTitle>최근 기록</CardTitle>
                <CardDescription>
                  최근 체중 기록들을 확인해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .slice(0, 7)
                    .map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{entry.weight}kg</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString('ko-KR')}
                          </span>
                        </div>
                        <div>
                          {entry.change !== undefined &&
                            getChangeBadge(entry.change)}
                        </div>
                      </motion.div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </AnimatedContainer>
        )}
      </AnimatePresence>
    </div>
  );
}
