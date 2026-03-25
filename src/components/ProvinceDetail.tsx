import { BarChart3, MapPin, Users, Gamepad2, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CityRanking from './CityRanking';

interface ProvinceDetailProps {
  province: string;
  cities: any[];
}

export default function ProvinceDetail({ province, cities }: ProvinceDetailProps) {
  if (!cities || cities.length === 0) return null;

  const totalMachines = cities.reduce((sum, c) => sum + c.maimai_count, 0);
  const totalPop = cities.reduce((sum, c) => sum + c.population_total, 0);
  const avgIndex = cities.reduce((sum, c) => sum + c.maimai_index, 0) / cities.length;
  const topCity = cities.reduce((max, c) => c.maimai_index > max.maimai_index ? c : max, cities[0]);

  const sortedCities = [...cities].sort((a, b) => b.maimai_index - a.maimai_index);

  return (
    <div className="space-y-4">
      <Card className="bg-slate-800/60 border-slate-700/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            {province} - 省内统计
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/40 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <MapPin className="w-4 h-4" />
                城市数量
              </div>
              <div className="text-2xl font-bold text-white">{cities.length}</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Gamepad2 className="w-4 h-4" />
                机台总数
              </div>
              <div className="text-2xl font-bold text-cyan-400">{totalMachines}</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <Users className="w-4 h-4" />
                总人口
              </div>
              <div className="text-2xl font-bold text-white">{totalPop.toFixed(0)}万</div>
            </div>
            <div className="bg-slate-700/40 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                <BarChart3 className="w-4 h-4" />
                平均指数
              </div>
              <div className="text-2xl font-bold text-yellow-400">{avgIndex.toFixed(4)}</div>
            </div>
          </div>
          
          <div className="mt-4 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-3 border border-yellow-500/30">
            <div className="flex items-center gap-2 text-yellow-400 mb-1">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-medium">省内冠军</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xl font-bold text-white">{topCity.name}</span>
                <span className="text-slate-400 text-sm ml-2">舞萌指数: {topCity.maimai_index.toFixed(4)}</span>
              </div>
              <div className="text-right text-sm text-slate-400">
                <div>{topCity.maimai_count}台机台</div>
                <div>{topCity.population_total}万人口</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <CityRanking 
        cities={sortedCities} 
        title={`${province}省内排名`}
        limit={15}
        showProvince={false}
      />
    </div>
  );
}
