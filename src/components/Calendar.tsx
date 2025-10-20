import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FamilyMember, Availability } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CalendarProps {
  familyMembers: FamilyMember[];
  availabilities: Availability[];
  selectedMember: string | null;
  onAddAvailability: (availability: Omit<Availability, 'id'>) => void;
  onRemoveAvailability: (id: string) => void;
}

export function Calendar({
  familyMembers,
  availabilities,
  selectedMember,
  onAddAvailability,
  onRemoveAvailability,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [allDay, setAllDay] = useState(true);
  const [note, setNote] = useState('');

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (date: Date) => {
    if (!selectedMember) {
      toast.error('Please select a family member first');
      return;
    }
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleAddAvailability = () => {
    if (!selectedDate || !selectedMember) return;

    onAddAvailability({
      memberId: selectedMember,
      date: selectedDate,
      allDay,
      note: note.trim() || undefined,
    });

    const member = familyMembers.find((m) => m.id === selectedMember);
    toast.success(`Availability added for ${member?.name} on ${format(selectedDate, 'MMM d, yyyy')}`);
    
    setDialogOpen(false);
    setNote('');
    setAllDay(true);
  };

  const getDateAvailabilities = (date: Date) => {
    return availabilities.filter((a) => isSameDay(new Date(a.date), date));
  };

  const getMemberColor = (memberId: string) => {
    return familyMembers.find((m) => m.id === memberId)?.color || '#3b82f6';
  };

  return (
    <>
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">
              {format(currentMonth, 'MMMM yyyy')}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setCurrentMonth(new Date())}
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}
            {days.map((day, idx) => {
              const dateAvailabilities = getDateAvailabilities(day);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <button
                  key={idx}
                  onClick={() => handleDateClick(day)}
                  disabled={!isCurrentMonth}
                  className={cn(
                    'relative aspect-square p-2 rounded-lg border-2 transition-all hover:shadow-md',
                    isCurrentMonth
                      ? 'hover:border-primary cursor-pointer'
                      : 'opacity-30 cursor-not-allowed',
                    isCurrentDay && 'border-primary bg-primary/5',
                    !isCurrentDay && 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                  )}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isCurrentDay && 'text-primary font-bold'
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    {dateAvailabilities.length > 0 && (
                      <div className="flex-1 flex flex-wrap gap-1 mt-1 justify-center items-center">
                        {dateAvailabilities.slice(0, 3).map((avail) => (
                          <div
                            key={avail.id}
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getMemberColor(avail.memberId) }}
                          />
                        ))}
                        {dateAvailabilities.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{dateAvailabilities.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {!selectedMember && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-100 text-center">
                💡 Select a family member from the left to add their availability
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Availability</DialogTitle>
            <DialogDescription>
              {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="all-day">All Day</Label>
              <Switch
                id="all-day"
                checked={allDay}
                onCheckedChange={setAllDay}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note">Note (optional)</Label>
              <Textarea
                id="note"
                placeholder="Add any notes about your availability..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAvailability}>
              <Plus className="h-4 w-4 mr-2" />
              Add Availability
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
