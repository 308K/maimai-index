import { Trophy, TrendingUp, Users, Gamepad2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface City {
  name: string;
  province: string;
  maimai_count: number;
  population_total: number;
  maimai_index: number;
  grp_total?: number | null;
  per_capita_total?: number | null;
}

interface CityRankingProps {
  cities: City[];
  title: string;
  limit?: number;
  showProvince?: boolean;
}

export default function CityRanking({ cities, title, limit = 20, showProvince = true }: CityRankingProps) {
  const displayCities = cities.slice(0, limit);

  const getRankClass = (index: number) => {
    if (index === 0) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-black';
    if (index === 1) return 'bg-gradient-to-br from-gray-300 to-gray-500 text-black';
    if (index === 2) return 'bg-gradient-to-br from-amber-600 to-amber-800 text-white';
    return 'bg-slate-700 text-slate-300';
  };

  return (
    <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-400" />
          {title}
        </h3>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="p-2">
          {displayCities.map((city, index) => (
            <div 
              key={city.name}
              className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-slate-700/40 hover:bg-slate-700/60 transition-colors"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${getRankClass(index)}`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white truncate">{city.name}</span>
                  {showProvince && (
                    <span className="text-xs text-slate-400">{city.province}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span className="flex items-center gap-1">
                    <Gamepad2 className="w-3 h-3" />
                    {city.maimai_count}台
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {city.population_total}万人
                  </span>
                  {city.grp_total && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {city.grp_total}亿
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-cyan-400">{city.maimai_index.toFixed(4)}</div>
                <div className="text-xs text-slate-500">舞萌指数</div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
