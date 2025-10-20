import { useState, useEffect } from 'react';
import { Calendar } from '@/components/Calendar';
import { FamilyMembers } from '@/components/FamilyMembers';
import { AvailabilityList } from '@/components/AvailabilityList';
import { Header } from '@/components/Header';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';

export interface FamilyMember {
  id: string;
  name: string;
  color: string;
  avatar?: string;
}

export interface Availability {
  id: string;
  memberId: string;
  date: Date;
  timeSlots?: { start: string; end: string }[];
  allDay: boolean;
  note?: string;
}

function App() {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [selectedMember, setSelectedMember] = useState<string | null>(null);

  // Load data from localStorage
  useEffect(() => {
    const savedMembers = localStorage.getItem('familyMembers');
    const savedAvailabilities = localStorage.getItem('availabilities');

    if (savedMembers) {
      setFamilyMembers(JSON.parse(savedMembers));
    }

    if (savedAvailabilities) {
      const parsed = JSON.parse(savedAvailabilities);
      setAvailabilities(
        parsed.map((a: any) => ({
          ...a,
          date: new Date(a.date),
        }))
      );
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
  }, [familyMembers]);

  useEffect(() => {
    localStorage.setItem('availabilities', JSON.stringify(availabilities));
  }, [availabilities]);

  const addFamilyMember = (member: Omit<FamilyMember, 'id'>) => {
    const newMember = {
      ...member,
      id: crypto.randomUUID(),
    };
    setFamilyMembers([...familyMembers, newMember]);
    return newMember;
  };

  const removeFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter((m) => m.id !== id));
    setAvailabilities(availabilities.filter((a) => a.memberId !== id));
    if (selectedMember === id) {
      setSelectedMember(null);
    }
  };

  const addAvailability = (availability: Omit<Availability, 'id'>) => {
    const newAvailability = {
      ...availability,
      id: crypto.randomUUID(),
    };
    setAvailabilities([...availabilities, newAvailability]);
  };

  const removeAvailability = (id: string) => {
    setAvailabilities(availabilities.filter((a) => a.id !== id));
  };

  const updateAvailability = (id: string, updates: Partial<Availability>) => {
    setAvailabilities(
      availabilities.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="family-scheduler-theme">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <Header />
        
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Family Members Section */}
            <div className="lg:col-span-1">
              <FamilyMembers
                members={familyMembers}
                selectedMember={selectedMember}
                onSelectMember={setSelectedMember}
                onAddMember={addFamilyMember}
                onRemoveMember={removeFamilyMember}
              />
            </div>

            {/* Calendar Section */}
            <div className="lg:col-span-2">
              <Calendar
                familyMembers={familyMembers}
                availabilities={availabilities}
                selectedMember={selectedMember}
                onAddAvailability={addAvailability}
              />
            </div>
          </div>

          {/* Availability List */}
          <div className="mt-6">
            <AvailabilityList
              familyMembers={familyMembers}
              availabilities={availabilities}
              onRemoveAvailability={removeAvailability}
              onUpdateAvailability={updateAvailability}
            />
          </div>
          <div className="container mx-auto px-4 py-4 max-w-7xl"><div className="flex items-center justify-between"><p>🎵 Made by <a href="https://github.com/workhardbekind/hamfam">workhardbekind</a>  💨</p><p className="mt-2"><script src='https://storage.ko-fi.com/cdn/scripts/overlay-widget.js'></script>
<script>
  kofiWidgetOverlay.draw('districtdave', {
    'type': 'floating-chat',
    'floating-chat.donateButton.text': 'Support me',
    'floating-chat.donateButton.background-color': '#00b9fe',
    'floating-chat.donateButton.text-color': '#fff'
  });
</script></p></div></div>
        </main>

        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
