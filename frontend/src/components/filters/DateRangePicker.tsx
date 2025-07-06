import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DateRangePickerProps {
  onDateRangeChange?: (dateRange: { from: Date | undefined; to: Date | undefined }) => void
  initialFromDate?: Date
  initialToDate?: Date
}

export function DateRangePicker({ onDateRangeChange, initialFromDate, initialToDate }: DateRangePickerProps) {
  const [fromDate, setFromDate] = useState<Date | undefined>(initialFromDate)
  const [toDate, setToDate] = useState<Date | undefined>(initialToDate)
  const [isFromOpen, setIsFromOpen] = useState(false)
  const [isToOpen, setIsToOpen] = useState(false)

  const handleFromDateSelect = (date: Date | undefined) => {
    setFromDate(date)
    setIsFromOpen(false)
    onDateRangeChange?.({ from: date, to: toDate })
  }

  const handleToDateSelect = (date: Date | undefined) => {
    setToDate(date)
    setIsToOpen(false)
    onDateRangeChange?.({ from: fromDate, to: date })
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Data De */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">De:</label>
        <Popover open={isFromOpen} onOpenChange={setIsFromOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !fromDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fromDate ? format(fromDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fromDate}
              onSelect={handleFromDateSelect}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Data Até */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-foreground">Até:</label>
        <Popover open={isToOpen} onOpenChange={setIsToOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[200px] justify-start text-left font-normal",
                !toDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {toDate ? format(toDate, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecionar data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={toDate}
              onSelect={handleToDateSelect}
              initialFocus
              disabled={(date) => fromDate ? date < fromDate : false}
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}