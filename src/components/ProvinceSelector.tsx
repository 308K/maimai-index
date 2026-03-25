import { ChevronDown, MapPin } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import provinceList from '../data/provinceList.json';

interface ProvinceSelectorProps {
  selectedProvince: string | null;
  onSelectProvince: (province: string | null) => void;
}

export default function ProvinceSelector({ selectedProvince, onSelectProvince }: ProvinceSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="bg-slate-800/80 border-slate-600 text-white hover:bg-slate-700 hover:text-white min-w-[140px]"
          >
            <MapPin className="w-4 h-4 mr-2" />
            {selectedProvince || '全国视图'}
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className="max-h-[400px] overflow-y-auto bg-slate-800 border-slate-600"
          align="start"
        >
          <DropdownMenuItem 
            onClick={() => onSelectProvince(null)}
            className="text-white hover:bg-slate-700 cursor-pointer"
          >
            全国视图
          </DropdownMenuItem>
          <div className="h-px bg-slate-600 my-1" />
          {provinceList.map((province) => (
            <DropdownMenuItem 
              key={province}
              onClick={() => onSelectProvince(province)}
              className="text-white hover:bg-slate-700 cursor-pointer"
            >
              {province}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {selectedProvince && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelectProvince(null)}
          className="text-slate-400 hover:text-white"
        >
          清除筛选
        </Button>
      )}
    </div>
  );
}
