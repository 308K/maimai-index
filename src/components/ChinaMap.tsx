import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import cityData from '../data/cityData.json';
import './china-map.css';

interface ChinaMapProps {
  selectedProvince: string | null;
  onCityClick: (cityName: string) => void;
}

type LngLat = [number, number];
type BBox = [number, number, number, number];

interface ProvinceViewMeta {
  center: LngLat;
  bbox: BBox;
}

interface MapViewMeta {
  chinaBbox: BBox;
  provinces: Record<string, ProvinceViewMeta>;
}

const DEFAULT_ZOOM = 1.2;

const SPECIAL_PROVINCE_NAME_MAP: Record<string, string> = {
  北京: '北京市',
  天津: '天津市',
  上海: '上海市',
  重庆: '重庆市',
  内蒙古: '内蒙古自治区',
  广西: '广西壮族自治区',
  西藏: '西藏自治区',
  宁夏: '宁夏回族自治区',
  新疆: '新疆维吾尔自治区',
  香港: '香港特别行政区',
  澳门: '澳门特别行政区',
  台湾: '台湾省'
};

const resolveGeoProvinceName = (province: string) => {
  if (SPECIAL_PROVINCE_NAME_MAP[province]) return SPECIAL_PROVINCE_NAME_MAP[province];
  return province.endsWith('省') || province.endsWith('市') ? province : `${province}省`;
};

const createEmptyBbox = (): BBox => [Infinity, Infinity, -Infinity, -Infinity];

const expandBbox = (bbox: BBox, lng: number, lat: number) => {
  bbox[0] = Math.min(bbox[0], lng);
  bbox[1] = Math.min(bbox[1], lat);
  bbox[2] = Math.max(bbox[2], lng);
  bbox[3] = Math.max(bbox[3], lat);
};

const collectCoordsToBbox = (coordinates: any, bbox: BBox): void => {
  if (!Array.isArray(coordinates) || coordinates.length === 0) return;
  const first = coordinates[0];
  if (typeof first === 'number' && typeof coordinates[1] === 'number') {
    expandBbox(bbox, coordinates[0], coordinates[1]);
    return;
  }
  for (const item of coordinates) {
    collectCoordsToBbox(item, bbox);
  }
};

const buildMapViewMeta = (chinaJson: any): MapViewMeta => {
  const chinaBbox = createEmptyBbox();
  const provinces: Record<string, ProvinceViewMeta> = {};
  const features = Array.isArray(chinaJson?.features) ? chinaJson.features : [];

  for (const feature of features) {
    const name = feature?.properties?.name;
    const center = feature?.properties?.center;
    const geometry = feature?.geometry;
    if (typeof name !== 'string' || !Array.isArray(center) || center.length !== 2 || !geometry) {
      continue;
    }

    const bbox = createEmptyBbox();
    collectCoordsToBbox(geometry.coordinates, bbox);
    if (!Number.isFinite(bbox[0]) || !Number.isFinite(bbox[1]) || !Number.isFinite(bbox[2]) || !Number.isFinite(bbox[3])) {
      continue;
    }

    provinces[name] = {
      center: [Number(center[0]), Number(center[1])],
      bbox
    };

    expandBbox(chinaBbox, bbox[0], bbox[1]);
    expandBbox(chinaBbox, bbox[2], bbox[3]);
  }

  return { chinaBbox, provinces };
};

const bboxSpan = (bbox: BBox, latForCorrection: number): { width: number; height: number } => {
  const lngSpan = Math.max(0.0001, bbox[2] - bbox[0]);
  const latSpan = Math.max(0.0001, bbox[3] - bbox[1]);
  const latRad = (latForCorrection * Math.PI) / 180;
  const lngAdjusted = lngSpan * Math.max(0.2, Math.cos(latRad));
  return { width: lngAdjusted, height: latSpan };
};

const getDynamicProvinceZoom = (
  provinceMeta: ProvinceViewMeta | undefined,
  mapMeta: MapViewMeta | null,
  containerWidth: number,
  containerHeight: number
) => {
  if (!provinceMeta || !mapMeta) return DEFAULT_ZOOM;

  const provinceMidLat = (provinceMeta.bbox[1] + provinceMeta.bbox[3]) / 2;
  const chinaMidLat = (mapMeta.chinaBbox[1] + mapMeta.chinaBbox[3]) / 2;
  const provinceSpan = bboxSpan(provinceMeta.bbox, provinceMidLat);
  const chinaSpan = bboxSpan(mapMeta.chinaBbox, chinaMidLat);

  const regionFit = Math.min(
    containerWidth / provinceSpan.width,
    containerHeight / provinceSpan.height
  );
  const chinaFit = Math.min(
    containerWidth / chinaSpan.width,
    containerHeight / chinaSpan.height
  );

  const rawZoom = DEFAULT_ZOOM * (regionFit / chinaFit) * 0.78;
  return Math.max(2, Math.min(10, rawZoom));
};

export default function ChinaMap({ selectedProvince, onCityClick }: ChinaMapProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapViewMeta, setMapViewMeta] = useState<MapViewMeta | null>(null);

  const getCssVar = (name: string) => {
    const element = chartRef.current;
    if (!element) return '';
    return getComputedStyle(element).getPropertyValue(name).trim();
  };

  // 对数变换函数
  const transformIndex = (idx: number) => {
    if (idx <= 0) return 0;
    return Math.log10(idx * 1000 + 1);
  };

  // 根据舞萌指数获取颜色
  const getColor = (index: number, levelColors: string[]) => {
    if (index > 0.15) return levelColors[0];
    if (index > 0.08) return levelColors[1];
    if (index > 0.05) return levelColors[2];
    if (index > 0.02) return levelColors[3];
    if (index > 0.01) return levelColors[4];
    return levelColors[5];
  };

  // 加载中国地图
  useEffect(() => {
    const loadMap = async () => {
      try {
        const response = await fetch('/中华人民共和国.geojson');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status} ${response.statusText}`);
        }
        const chinaJson = await response.json();
        echarts.registerMap('china', chinaJson);
        setMapViewMeta(buildMapViewMeta(chinaJson));
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

    const resizeObserver = new ResizeObserver(() => {
      chartInstance.current?.resize();
      setTimeout(() => {
        chartInstance.current?.resize();
      }, 150);
    });
    resizeObserver.observe(chartRef.current);

    // 点击事件
    chartInstance.current.on('click', (params: any) => {
      if (params.componentType === 'series') {
        onCityClick(params.name);
      }
    });

    return () => {
      resizeObserver.disconnect();
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, [mapLoaded]);

  // 更新图表数据
  useEffect(() => {
    if (!mapLoaded || !chartInstance.current) return;

    const levelColors = [
      getCssVar('--china-map-level-1'),
      getCssVar('--china-map-level-2'),
      getCssVar('--china-map-level-3'),
      getCssVar('--china-map-level-4'),
      getCssVar('--china-map-level-5'),
      getCssVar('--china-map-level-6')
    ];
    const chartBg = getCssVar('--china-map-background');
    const tooltipBg = getCssVar('--china-map-tooltip-bg');
    const tooltipBorder = getCssVar('--china-map-tooltip-border');
    const tooltipText = getCssVar('--china-map-tooltip-text');
    const tooltipTitle = getCssVar('--china-map-tooltip-title');
    const tooltipHighlight = getCssVar('--china-map-tooltip-highlight');
    const geoArea = getCssVar('--china-map-geo-area');
    const geoBorder = getCssVar('--china-map-geo-border');
    const geoAreaEmphasis = getCssVar('--china-map-geo-area-emphasis');
    const labelColor = getCssVar('--china-map-label-color');
    const labelBg = getCssVar('--china-map-label-bg');
    const labelBgEmphasis = getCssVar('--china-map-label-bg-emphasis');
    const topLabelBg = getCssVar('--china-map-top-label-bg');

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
      // 点和阴影使用同一颜色层级，保证视觉一致。
      itemStyle: {
        color: getColor(city.maimai_index, levelColors),
        shadowBlur: 15,
        shadowColor: getColor(city.maimai_index, levelColors)
      }
    }));

    // 获取Top10用于涟漪效果
    const top10Data = [...mapData]
      .sort((a: any, b: any) => b.value[2] - a.value[2])
      .slice(0, 10);

    const selectedGeoName = selectedProvince ? resolveGeoProvinceName(selectedProvince) : null;
    const selectedProvinceMeta = selectedGeoName ? mapViewMeta?.provinces[selectedGeoName] : undefined;
    const selectedCenter = selectedProvinceMeta?.center;
    const containerWidth = chartRef.current?.clientWidth ?? 1200;
    const containerHeight = chartRef.current?.clientHeight ?? 700;
    const selectedZoom = selectedProvince
      ? getDynamicProvinceZoom(selectedProvinceMeta, mapViewMeta, containerWidth, containerHeight)
      : DEFAULT_ZOOM;

    const option: echarts.EChartsOption = {
      backgroundColor: chartBg,
      tooltip: {
        trigger: 'item',
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: { color: tooltipText },
        formatter: (params: any) => {
          const v = params.value;
          const gdp = v[6] != null ? `${v[6]}亿元` : '暂无';
          const perCapita = v[7] != null ? `${v[7]}元` : '暂无';
          return `<div style="padding:12px;">
            <div style="font-size:16px;font-weight:bold;color:${tooltipTitle};margin-bottom:10px;">${params.name}</div>
            <div style="line-height:2;">
              <div>舞萌指数: <strong style="color:${tooltipHighlight};font-size:18px;">${v[2]}</strong></div>
              <div>机台数量: ${v[4]}台</div>
              <div>人口: ${v[5]}万</div>
              <div>GDP总量: ${gdp}</div>
              <div>人均GDP: ${perCapita}</div>
              <div>所属省份: ${v[8]}</div>
            </div>
          </div>`;
        }
      },
      geo: {
        map: 'china',
        roam: true,
        zoom: selectedZoom,
        center: selectedCenter,
        label: {
          show: false
        },
        regions: [
          {
            name: '南海诸岛',
            itemStyle: {
              opacity: 0
            },
            label: {
              show: false
            },
            emphasis: {
              itemStyle: {
                opacity: 0
              },
              label: {
                show: false
              }
            },
            tooltip: {
              show: false
            }
          }
        ],
        itemStyle: {
          areaColor: geoArea,
          borderColor: geoBorder,
          borderWidth: 1
        },
        emphasis: {
          itemStyle: {
            areaColor: geoAreaEmphasis
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
            color: labelColor,
            fontSize: 11,
            backgroundColor: labelBg,
            padding: [4, 8],
            borderRadius: 4
          },
          emphasis: {
            scale: true,
            label: {
              show: true,
              formatter: '{b}',
              position: 'top',
              color: labelColor,
              fontSize: 12,
              backgroundColor: labelBgEmphasis,
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
            color: labelColor,
            fontSize: 11,
            backgroundColor: topLabelBg,
            padding: [4, 8],
            borderRadius: 4
          },
          zlevel: 1
        }
      ]
    };

    chartInstance.current.setOption(option);
  }, [mapLoaded, selectedProvince, onCityClick, mapViewMeta]);

  return (
    <div className="china-map-theme w-full h-full min-h-[500px]">
      <div
        ref={chartRef}
        className="china-map-canvas w-full h-full min-h-[500px]"
      />
    </div>
  );
}
