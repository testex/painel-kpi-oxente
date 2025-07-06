import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Calendar, ChevronDown, Filter, RotateCcw, ArrowRight } from 'lucide-react'
import { DateRangePicker } from './DateRangePicker'

interface TemporalFilterProps {
  onPeriodChange?: (period: string) => void
  defaultPeriod?: string
}

const FILTER_OPTIONS = [
  { value: 'esta-semana', label: 'Esta semana' },
  { value: 'semana-passada', label: 'Semana passada' },
  { value: 'ultimos-15-dias', label: 'Últimos 15 dias' },
  { value: 'mes-atual', label: 'Mês atual' },
  { value: 'mes-passado', label: 'Mês passado' },
  { value: 'ultimo-trimestre', label: 'Último trimestre' },
  { value: '180-dias', label: '180 dias' },
  { value: 'este-ano', label: 'Este ano' },
  { value: 'ano-passado', label: 'Ano passado' }
]

export function TemporalFilter({ onPeriodChange, defaultPeriod = 'mes-atual' }: TemporalFilterProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(defaultPeriod)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customDateRange, setCustomDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined })
  
  const getDisplayLabel = () => {
    if (selectedPeriod === 'personalizado') {
      return 'Período'
    }
    const selectedOption = FILTER_OPTIONS.find(option => option.value === selectedPeriod)
    return selectedOption?.label || 'Selecionar período'
  }
  
  const handlePeriodSelect = (period: string) => {
    setSelectedPeriod(period)
    setShowDatePicker(false)
    onPeriodChange?.(period)
  }

  const handleCustomPeriodClick = () => {
    setSelectedPeriod('personalizado')
    setShowDatePicker(true)
  }

  const handleDateRangeChange = (dateRange: { from: Date | undefined; to: Date | undefined }) => {
    setCustomDateRange(dateRange)
  }

  const handleClearFilters = () => {
    setSelectedPeriod(defaultPeriod)
    setShowDatePicker(false)
    setCustomDateRange({ from: undefined, to: undefined })
    onPeriodChange?.(defaultPeriod)
  }

  const handleApplyCustomPeriod = () => {
    if (customDateRange.from && customDateRange.to) {
      onPeriodChange?.(`custom:${customDateRange.from.toISOString()}:${customDateRange.to.toISOString()}`)
      setShowDatePicker(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Filter className="h-4 w-4" />
        <span>Filtro Temporal</span>
      </div>
      
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2 text-foreground border-border hover:bg-accent hover:text-foreground w-fit">
                <Calendar className="h-4 w-4" />
                <span>{getDisplayLabel()}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border-border shadow-lg" align="start">
              {FILTER_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handlePeriodSelect(option.value)}
                  className={`cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-foreground ${
                    selectedPeriod === option.value ? 'bg-primary/10 text-primary font-medium' : 'text-popover-foreground'
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleCustomPeriodClick}
                className={`cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-foreground ${
                  selectedPeriod === 'personalizado' ? 'bg-primary/10 text-primary font-medium' : 'text-popover-foreground'
                }`}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Período
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleClearFilters}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            title="Limpar filtros"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {showDatePicker && selectedPeriod === 'personalizado' && (
          <div className="pl-6 border-l-2 border-border space-y-4">
            <DateRangePicker 
              onDateRangeChange={handleDateRangeChange}
            />
            
            <Button 
              onClick={handleApplyCustomPeriod}
              disabled={!customDateRange.from || !customDateRange.to}
              className="flex items-center gap-2"
              size="sm"
            >
              <ArrowRight className="h-4 w-4" />
              Aplicar Período
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}