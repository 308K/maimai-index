import { useState, useMemo, useRef, useEffect } from 'react';
import { MapPin, Gamepad2, TrendingUp, BarChart3, Info, Maximize, Minimize } from 'lucide-react';
import ChinaMap from './components/ChinaMap';
import ProvinceSelector from './components/ProvinceSelector';
import CityRanking from './components/CityRanking';
import ProvinceDetail from './components/ProvinceDetail';
import StatsCard from './components/StatsCard';
import cityData from './data/cityData.json';
import provinceData from './data/provinceData.json';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function App() {
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // 统计数据
  const stats = useMemo(() => {
    const totalCities = cityData.length;
    const totalMachines = cityData.reduce((sum, c) => sum + c.maimai_count, 0);
    const maxIndex = Math.max(...cityData.map(c => c.maimai_index));
    const avgIndex = cityData.reduce((sum, c) => sum + c.maimai_index, 0) / cityData.length;
    
    return {
      totalCities,
      totalMachines,
      maxIndex: maxIndex.toFixed(4),
      avgIndex: avgIndex.toFixed(4)
    };
  }, []);

  // 全国Top20
  const topCities = useMemo(() => {
    return [...cityData].sort((a, b) => b.maimai_index - a.maimai_index).slice(0, 20);
  }, []);

  // 当前选中的省份城市
  const provinceCities = useMemo(() => {
    if (!selectedProvince) return [];
    return (provinceData as any)[selectedProvince] || [];
  }, [selectedProvince]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                中国城市舞萌指数地图
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                每万人口舞萌机台数量分布
              </p>
            </div>
            <div className="flex items-center gap-3">
              <ProvinceSelector 
                selectedProvince={selectedProvince}
                onSelectProvince={setSelectedProvince}
              />
              <a
                href="https://github.com/308K/maimai-index"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-slate-800/80 border border-slate-600 hover:bg-slate-700 transition-colors"
                aria-label="GitHub"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-slate-300"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58V21.1c-3.34.73-4.04-1.42-4.04-1.42-.55-1.37-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.09 1.83 1.2 1.83 1.2 1.08 1.82 2.83 1.3 3.52.99.11-.77.42-1.29.76-1.59-2.67-.3-5.48-1.31-5.48-5.85 0-1.29.47-2.34 1.24-3.16-.12-.3-.54-1.53.12-3.19 0 0 1.01-.32 3.3 1.21a11.6 11.6 0 0 1 6 0c2.29-1.53 3.3-1.21 3.3-1.21.66 1.66.24 2.89.12 3.19.77.82 1.24 1.87 1.24 3.16 0 4.55-2.82 5.55-5.5 5.84.43.37.82 1.09.82 2.2v3.26c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
                </svg>
              </a>
              <Dialog>
                <DialogTrigger asChild>
                  <button className="p-2 rounded-lg bg-slate-800/80 border border-slate-600 hover:bg-slate-700 transition-colors">
                    <Info className="w-5 h-5 text-slate-300" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="text-xl">关于舞萌指数</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-slate-300">
                    <div>
                      <h4 className="font-semibold text-white mb-2">计算公式</h4>
                      <div className="bg-slate-900/50 rounded-lg p-3 font-mono text-sm">
                        <p>舞萌指数 = 机台数量 ÷ 人口(万)</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">可视化变换</h4>
                      <div className="bg-slate-900/50 rounded-lg p-3 font-mono text-sm">
                        <p>显示值 = log₁₀(指数×1000+1)</p>
                        <p className="text-slate-500 text-xs mt-1">使用对数变换拉大数值差距</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-2">颜色图例</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-red-500"></span>
                          <span>极高 (&gt;0.15)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-orange-500"></span>
                          <span>很高 (0.08-0.15)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
                          <span>较高 (0.05-0.08)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-green-500"></span>
                          <span>中等 (0.02-0.05)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-cyan-400"></span>
                          <span>较低 (0.01-0.02)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-blue-600"></span>
                          <span>低 (&lt;0.01)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatsCard 
            title="覆盖城市" 
            value={stats.totalCities} 
            icon={MapPin} 
            color="text-cyan-400"
            subtitle="全国地级市"
          />
          <StatsCard 
            title="机台总数" 
            value={stats.totalMachines} 
            icon={Gamepad2} 
            color="text-purple-400"
            subtitle="舞萌DX机台"
          />
          <StatsCard 
            title="最高指数" 
            value={stats.maxIndex} 
            icon={TrendingUp} 
            color="text-yellow-400"
            subtitle="澳门"
          />
          <StatsCard 
            title="平均指数" 
            value={stats.avgIndex} 
            icon={BarChart3} 
            color="text-green-400"
            subtitle="全国平均"
          />
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              ref={mapContainerRef}
              className={`bg-slate-800/40 rounded-xl border border-slate-700/50 p-4 ${isFullscreen ? 'bg-slate-900 overflow-hidden flex flex-col' : ''}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-cyan-400" />
                  {selectedProvince ? `${selectedProvince}地图` : '全国分布图'}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-400 hidden sm:flex">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      高
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                      中
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      低
                    </span>
                  </div>
                  <button 
                    onClick={toggleFullscreen}
                    className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600 text-slate-300 transition-colors"
                    title={isFullscreen ? "退出全屏" : "全屏显示"}
                  >
                    {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className={`rounded-lg overflow-hidden bg-slate-900/50 ${isFullscreen ? 'flex-1 min-h-0' : 'h-[500px]'}`}>
                <ChinaMap 
                  key={isFullscreen ? 'map-fullscreen' : 'map-windowed'}
                  selectedProvince={selectedProvince}
                  onCityClick={(cityName) => console.log('Clicked:', cityName)}
                />
              </div>
            </div>

            {/* Province Detail */}
            {selectedProvince && (
              <ProvinceDetail 
                province={selectedProvince}
                cities={provinceCities}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Tabs defaultValue="national" className="w-full">
              <TabsList className="w-full bg-slate-800/60">
                <TabsTrigger value="national" className="flex-1 text-white data-[state=active]:text-black">全国排行</TabsTrigger>
                {selectedProvince && (
                  <TabsTrigger value="province" className="flex-1 text-white data-[state=active]:text-black">省内排行</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="national" className="mt-4">
                <CityRanking 
                  cities={topCities}
                  title="全国舞萌指数 TOP20"
                  limit={20}
                  showProvince={true}
                />
              </TabsContent>
              
              {selectedProvince && (
                <TabsContent value="province" className="mt-4">
                  <CityRanking 
                    cities={provinceCities.sort((a: any, b: any) => b.maimai_index - a.maimai_index)}
                    title={`${selectedProvince}省内排名`}
                    limit={15}
                    showProvince={false}
                  />
                </TabsContent>
              )}
            </Tabs>

            {/* Legend */}
            <div className="bg-slate-800/60 rounded-xl border border-slate-700/50 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">图例说明</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></span>
                  <span className="text-slate-300">极高 (&gt;0.15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></span>
                  <span className="text-slate-300">很高 (0.08-0.15)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50"></span>
                  <span className="text-slate-300">较高 (0.05-0.08)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50"></span>
                  <span className="text-slate-300">中等 (0.02-0.05)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></span>
                  <span className="text-slate-300">较低 (0.01-0.02)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-blue-600 shadow-lg shadow-blue-600/50"></span>
                  <span className="text-slate-300">低 (&lt;0.01)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 mt-8 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>
            数据来源：
            <a
              href="https://map.bemanicn.com/games/1"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              全国音游地图
            </a>
            、
            <a
              href="https://data.cnki.net/yearBook/single?id=N2025020156&pinyinCode=YZGCA"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              中国城市统计年鉴2024
            </a>
            、
            <a
              href="https://datav.aliyun.com/portal/school/atlas/area_selector"
              target="_blank"
              rel="noreferrer"
              className="text-slate-300 hover:text-cyan-400 transition-colors"
            >
              阿里云DataV.GeoAtlas
            </a>
          </p>
          <p className="mt-1">舞萌指数 = 机台数量 ÷ 人口(万) | 可视化变换: log₁₀(指数×1000+1)</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
