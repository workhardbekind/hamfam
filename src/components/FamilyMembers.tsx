import { useState } from 'react';
import { Plus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { FamilyMember } from '@/App';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface FamilyMembersProps {
  members: FamilyMember[];
  selectedMember: string | null;
  onSelectMember: (id: string | null) => void;
  onAddMember: (member: Omit<FamilyMember, 'id'>) => FamilyMember;
  onRemoveMember: (id: string) => void;
}

const COLORS = [
  '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
  '#06b6d4', '#6366f1', '#f43f5e', '#84cc16', '#a855f7'
];

export function FamilyMembers({
  members,
  selectedMember,
  onSelectMember,
  onAddMember,
  onRemoveMember,
}: FamilyMembersProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleAddMember = () => {
    if (!name.trim()) {
      toast.error('Please enter a name');
      return;
    }

    onAddMember({
      name: name.trim(),
      color: selectedColor,
    });

    toast.success(`${name} added to family!`);
    setName('');
    setSelectedColor(COLORS[0]);
    setOpen(false);
  };

  const handleRemoveMember = (id: string, memberName: string) => {
    onRemoveMember(id);
    toast.success(`${memberName} removed from family`);
  };

  return (
    <Card className="shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Family Members
            </CardTitle>
            <CardDescription>
              Select a member to add their availability
            </CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Family Member</DialogTitle>
                <DialogDescription>
                  Add a new member to your family schedule
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {COLORS.map((color) => (
                      <button
                        key={color}
                        className={cn(
                          'w-10 h-10 rounded-full border-2 transition-all',
                          selectedColor === color
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-transparent hover:scale-105'
                        )}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddMember}>Add Member</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No family members yet</p>
            <p className="text-xs mt-1">Add your first member to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.id}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md',
                  selectedMember === member.id
                    ? 'border-primary bg-primary/5'
                    : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                )}
                onClick={() =>
                  onSelectMember(selectedMember === member.id ? null : member.id)
                }
              >
                <Avatar className="h-10 w-10 border-2" style={{ borderColor: member.color }}>
                  <AvatarFallback style={{ backgroundColor: member.color + '20', color: member.color }}>
                    {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{member.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedMember === member.id ? 'Selected' : 'Click to select'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveMember(member.id, member.name);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
