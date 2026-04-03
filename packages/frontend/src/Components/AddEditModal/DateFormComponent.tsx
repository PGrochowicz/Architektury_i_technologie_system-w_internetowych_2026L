import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'

interface DateFormComponentProps {
  takenYear: number | null
  takenMonth: number | null
  takenDay: number | null
  onYearChange: (year: number | null) => void
  onMonthChange: (month: number | null) => void
  onDayChange: (day: number | null) => void
}

export function DateFormComponent({
  takenYear,
  takenMonth,
  takenDay,
  onYearChange,
  onMonthChange,
  onDayChange,
}: DateFormComponentProps) {
  return (
    <Stack direction="row" spacing={1} flexWrap="wrap">
      <TextField
        size="small"
        type="number"
        label="Rok"
        required
        value={!takenYear ? '' : takenYear}
        onChange={(e) => onYearChange(!e.target.value ? null : Number(e.target.value))}
        inputProps={{ min: 1900, max: 2100 }}
      />
      <TextField
        size="small"
        type="number"
        label="Miesiąc"
        value={!takenMonth ? '' : takenMonth}
        onChange={(e) => onMonthChange(!e.target.value ? null : Number(e.target.value))}
        inputProps={{ min: 1, max: 12 }}
      />
      <TextField
        size="small"
        type="number"
        label="Dzień"
        value={!takenDay ? '' : takenDay}
        onChange={(e) => onDayChange(!e.target.value ? null : Number(e.target.value))}
        inputProps={{ min: 1, max: 31 }}
      />
    </Stack>
  )
}
