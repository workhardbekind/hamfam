import { format, isSameDay } from 'date-fns';
import { Calendar, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { FamilyMember, Availability } from '@/App';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface AvailabilityListProps {
  familyMembers: FamilyMember[];
  availabilities: Availability[];
  onRemoveAvailability: (id: string) => void;
  onUpdateAvailability: (id: string, updates: Partial<Availability>) => void;
}

export function AvailabilityList({
  familyMembers,
  availabilities,
  onRemoveAvailability,
}: AvailabilityListProps) {
  const getMember = (memberId: string) => {
    return familyMembers.find((m) => m.id === memberId);
  };

  const groupedByDate = availabilities.reduce((acc, avail) => {
    const dateKey = format(new Date(avail.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(avail);
    return acc;
  }, {} as Record<string, Availability[]>);

  const sortedDates = Object.keys(groupedByDate).sort();

  const handleRemove = (id: string, memberName: string, date: Date) => {
    onRemoveAvailability(id);
    toast.success(`Removed ${memberName}'s availability for ${format(date, 'MMM d')}`);
  };

  const getCommonDates = () => {
    const dateGroups = Object.entries(groupedByDate).filter(
      ([_, avails]) => avails.length > 1
    );
    return dateGroups;
  };

  const commonDates = getCommonDates();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* All Availabilities */}
      <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Availabilities
          </CardTitle>
          <CardDescription>
            {availabilities.length} availability slot{availabilities.length !== 1 ? 's' : ''} scheduled
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {sortedDates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No availabilities yet</p>
                <p className="text-xs mt-1">Add dates when family members are free</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedDates.map((dateKey) => {
                  const date = new Date(dateKey);
                  const avails = groupedByDate[dateKey];

                  return (
                    <div key={dateKey} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {format(date, 'EEEE, MMMM d, yyyy')}
                      </div>
                      <div className="space-y-2 pl-6">
                        {avails.map((avail) => {
                          const member = getMember(avail.memberId);
                          if (!member) return null;

                          return (
                            <div
                              key={avail.id}
                              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:shadow-md transition-shadow"
                            >
                              <Avatar className="h-8 w-8 border-2" style={{ borderColor: member.color }}>
                                <AvatarFallback style={{ backgroundColor: member.color + '20', color: member.color }}>
                                  {member.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium">{member.name}</p>
                                {avail.note && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {avail.note}
                                  </p>
                                )}
                              </div>
                              <Badge variant="secondary">All Day</Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemove(avail.id, member.name, date)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Common Availability */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
            <Users className="h-5 w-5" />
            Common Availability
          </CardTitle>
          <CardDescription>
            Dates when multiple family members are free
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] pr-4">
            {commonDates.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No common dates yet</p>
                <p className="text-xs mt-1">Add more availabilities to find overlaps</p>
              </div>
            ) : (
              <div className="space-y-4">
                {commonDates.map(([dateKey, avails]) => {
                  const date = new Date(dateKey);

                  return (
                    <div
                      key={dateKey}
                      className="p-4 rounded-lg border-2 border-green-200 dark:border-green-800 bg-white/50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="font-semibold text-green-700 dark:text-green-400">
                            {format(date, 'EEEE, MMM d')}
                          </span>
                        </div>
                        <Badge className="bg-green-600 hover:bg-green-700">
                          {avails.length} available
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {avails.map((avail) => {
                          const member = getMember(avail.memberId);
                          if (!member) return null;

                          return (
                            <div
                              key={avail.id}
                              className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2"
                              style={{ 
                                borderColor: member.color,
                                backgroundColor: member.color + '10'
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: member.color }}
                              />
                              <span className="text-sm font-medium">{member.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
