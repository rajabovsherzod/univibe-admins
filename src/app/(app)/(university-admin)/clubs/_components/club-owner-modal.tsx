'use client';

import { useState } from 'react';
import { useAdminAssignClubOwner } from '@/hooks/api/use-clubs-admin';
import { useInfiniteStudents } from '@/hooks/api/use-students';
import { ClubList } from '@/types/clubs';
import { PremiumFormModal } from '@/components/application/modals/premium-modal';
import { Button } from '@/components/base/buttons/button';
import { Loader2, Search, Check, UserPlus } from 'lucide-react';
import { Input } from '@/components/base/input/input';
import { useDebounce } from '@/hooks/use-debounce';

interface ClubOwnerModalProps {
  club: ClubList;
  isOpen: boolean;
  onClose: () => void;
}

export function ClubOwnerModal({ club, isOpen, onClose }: ClubOwnerModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const { 
    data: studentsData, 
    isLoading: isLoadingStudents,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteStudents({
    status: 'approved',
    search: debouncedSearch,
    page_size: 10,
  });

  const students = studentsData?.pages.flatMap(page => page.results || []) || [];

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  const { mutate: assignOwner, isPending } = useAdminAssignClubOwner();

  const handleClose = () => {
    setSearchTerm('');
    setSelectedStudentId(null);
    onClose();
  };

  const onSubmit = () => {
    if (!selectedStudentId) return;
    
    assignOwner(
      { clubId: club.public_id, data: { student_id: selectedStudentId } },
      { onSuccess: () => handleClose() }
    );
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) handleClose(); }}
      title="Klub rahbari tayinlash"
      description="Talabalar ro'yxatidan tanlab yangi rahbar tayinlang."
      icon={UserPlus}
      size="md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button color="secondary" type="button" onClick={handleClose}>
            Bekor qilish
          </Button>
          <Button type="button" onClick={onSubmit} isDisabled={isPending || !selectedStudentId} isLoading={isPending}>
            Tayinlash
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            <strong>{club.name}</strong> klubiga yangi rahbar tayinlash uchun talabani qidiring va tanlang. 
            Agar klubda oldingi rahbar bo'lsa, u oddiy a'zoga aylanadi.
          </p>

          <div className="relative mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Talaba ismi yoki ID bo'yicha qidirish..."
              className="pl-9 w-full bg-background"
              value={searchTerm}
              onChange={setSearchTerm}
            />
          </div>

          <div className="border border-border-secondary rounded-xl bg-secondary/30 overflow-hidden shadow-xs">
            <div 
              className="h-[250px] overflow-y-auto p-1.5 custom-scrollbar"
              onScroll={handleScroll}
            >
              {isLoadingStudents ? (
                <div className="flex items-center justify-center h-full p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : students.length === 0 ? (
                <div className="flex items-center justify-center h-full p-4 text-muted-foreground text-sm">
                  Talabalar topilmadi.
                </div>
              ) : (
                <div className="p-1 space-y-1">
                  {students.map((student) => {
                    const isSelected = selectedStudentId === student.user_public_id;
                    // Fallback initials
                    const nameParts = student.full_name?.split(' ') || [];
                    const initials = (nameParts[0]?.charAt(0) || '') + (nameParts[1]?.charAt(0) || '');

                    return (
                      <div
                        key={student.user_public_id}
                        className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'bg-brand-solid/10 ring-1 ring-brand-solid/30 shadow-sm' 
                            : 'hover:bg-primary hover:shadow-xs'
                        }`}
                        onClick={() => setSelectedStudentId(student.user_public_id)}
                      >
                        <div className="flex items-center gap-3">
                          {student.profile_photo_url ? (
                            <img src={student.profile_photo_url} className="h-8 w-8 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-brand-solid text-white flex items-center justify-center text-xs font-medium">
                              {initials.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {student.full_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ID: {student.university_student_id || 'Kiritilmagan'}
                            </span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-brand-solid" />}
                      </div>
                    );
                  })}
                  
                  {isFetchingNextPage && (
                    <div className="flex justify-center p-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PremiumFormModal>
  );
}
