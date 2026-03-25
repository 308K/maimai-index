import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import cityData from '../data/cityData.json';

interface ChinaMapProps {
  selectedProvince: string | null;
  onCityClick: (cityName: string) => void;
}

export default function ChinaMap({ selectedProvince, onCityClick }: ChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // 对数变换函数
  const transformIndex = (idx: number) => {
    if (idx <= 0) return 0;
    return Math.log10(idx * 1000 + 1);
  };

  // 根据舞萌指数获取颜色
  const getColor = (index: number) => {
    if (index > 0.15) return '#ff0000';
    if (index > 0.08) return '#ff7f00';
    if (index > 0.05) return '#ffff00';
    if (index > 0.02) return '#00ff00';
    if (index > 0.01) return '#00ffff';
    return '#0000ff';
  };

  // 加载中国地图
  useEffect(() => {
    const loadMap = async () => {
      try {
        const response = await fetch('/100000_full.json');
        const response = await fetch(localMapUrl);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const chinaJson = await response.json();
        echarts.registerMap('china', chinaJson);
        setMapLoaded(true);
      } catch (error) {
        console.error('加载地图失败:', error);
      }
    };
    loadMap();
  }, []);

  // 初始化图表
  useEffect(() => {
    if (!mapLoaded || !chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current);

    const handleResize = () => {
      chartInstance.current?.resize();
    };
    window.addEventListener('resize', handleResize);

    // 点击事件
    chartInstance.current.on('click', (params: any) => {
      if (params.componentType === 'series') {
        onCityClick(params.name);
      }
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [mapLoaded]);

  // 更新图表数据
  useEffect(() => {
    if (!chartInstance.current) return;

    // 过滤数据
    const filteredData = selectedProvince
      ? cityData.filter((city: any) => city.province === selectedProvince)
      : cityData;

    // 准备地图数据
    const mapData = filteredData.map((city: any) => ({
      name: city.name,
      value: [
        city.coord[0],
        city.coord[1],
        city.maimai_index,
        transformIndex(city.maimai_index),
        city.maimai_count,
        city.population_total,
        city.grp_total,
        city.per_capita_total,
        city.province
      ],
      itemStyle: {
        color: getColor(city.maimai_index),
        shadowBlur: 15,
        shadowColor: getColor(city.maimai_index)
      }
    }));

    // 获取Top10用于涟漪效果
    const top10Data = [...mapData]
      .sort((a: any, b: any) => b.value[2] - a.value[2])
      .slice(0, 10);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderColor: '#00d4ff',
        borderWidth: 1,
        textStyle: { color: '#fff' },
        formatter: (params: any) => {
          const v = params.value;
          const gdp = v[6] != null ? `${v[6]}亿元` : '暂无';
          const perCapita = v[7] != null ? `${v[7]}元` : '暂无';
          return `<div style="padding:12px;">
            <div style="font-size:16px;font-weight:bold;color:#00d4ff;margin-bottom:10px;">${params.name}</div>
            <div style="line-height:2;">
              <div>🎮 舞萌指数: <strong style="color:#ff7f00;font-size:18px;">${v[2]}</strong></div>
              <div>🕹️ 机台数量: ${v[4]}台</div>
              <div>👥 人口: ${v[5]}万</div>
              <div>💰 GDP总量: ${gdp}</div>
              <div>💵 人均GDP: ${perCapita}</div>
              <div>📍 所属省份: ${v[8]}</div>
            </div>
          </div>`;
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: 1.2,
        center: selectedProvince === '台湾' ? [121, 24] : selectedProvince === '新疆' ? [87, 42] : undefined,
        label: {
          show: false
        },
        itemStyle: {
          areaColor: 'rgba(20,40,80,0.5)',
          borderColor: '#1e4a6e',
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            areaColor: 'rgba(30,60,100,0.7)'
          }
        }
      },
      series: [
        {
          name: '舞萌指数',
          type: 'scatter',
          coordinateSystem: 'geo',
          data: mapData,
          symbolSize: (val: any) => Math.max(6, val[3] * 12),
          label: {
            show: selectedProvince !== null,
            formatter: '{b}',
            position: 'top',
            color: '#fff',
            fontSize: 11,
            backgroundColor: 'rgba(0,0,0,0.6)',
            padding: [4, 8],
            borderRadius: 4
          },
          emphasis: {
            scale: true,
            label: {
              show: true,
              formatter: '{b}',
              position: 'top',
              color: '#fff',
              fontSize: 12,
              backgroundColor: 'rgba(0,0,0,0.8)',
              padding: [6, 10],
              borderRadius: 5
            }
          }
        },
        {
          name: 'Top10高亮',
          type: 'effectScatter',
          coordinateSystem: 'geo',
          data: selectedProvince ? [] : top10Data,
          symbolSize: (val: any) => Math.max(8, val[3] * 14),
          showEffectOn: 'render',
          rippleEffect: {
            brushType: 'stroke',
            scale: 3,
            period: 4
          },
          label: {
            show: true,
            formatter: '{b}',
            position: 'top',
            color: '#fff',
            fontSize: 11,
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: [4, 8],
            borderRadius: 4
          },
          zlevel: 1
        }
      ]
    };

    chartInstance.current.setOption(option);
  }, [selectedProvince, onCityClick]);

  return (
    <div 
      ref={chartRef} 
      className="w-full h-full min-h-[500px]"
      style={{ background: 'transparent' }}
    />
  );
}
