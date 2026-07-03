"use client";

import { Camera01, Trash01 } from "@untitledui/icons";
import { toast } from "sonner";
import { AvatarProfilePhoto } from "@/components/base/avatar/avatar-profile-photo";
import { FileTrigger } from "@/components/base/file-upload-trigger/file-upload-trigger";
import { Button } from "@/components/base/buttons/button";
import { cx } from "@/utils/cx";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

interface ProfilePhotoUploaderProps {
  /** Preview URL (object URL for a freshly picked file, or the existing photo URL). */
  photoPreview: string | null;
  /** Used to render initials when no photo is set. */
  fullName?: string;
  onSelect: (file: File) => void;
  onRemove?: () => void;
  isDisabled?: boolean;
}

function getInitials(fullName?: string) {
  const trimmed = fullName?.trim();
  if (!trimmed) return undefined;
  return trimmed
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/** A circular profile-picture editor: avatar + camera overlay button to pick a new photo. */
export function ProfilePhotoUploader({
  photoPreview,
  fullName,
  onSelect,
  onRemove,
  isDisabled,
}: ProfilePhotoUploaderProps) {
  const handleSelect = (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    if (file.size > MAX_SIZE) {
      toast.error("Kechirasiz, rasm hajmi 5 MB dan oshmasligi kerak");
      return;
    }
    onSelect(file);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6">
      <div className="relative">
        <AvatarProfilePhoto size="lg" src={photoPreview ?? undefined} initials={getInitials(fullName)} />

        <FileTrigger acceptedFileTypes={["image/png", "image/jpeg", "image/webp"]} onSelect={handleSelect}>
          <button
            type="button"
            disabled={isDisabled}
            aria-label="Rasmni o'zgartirish"
            className={cx(
              "absolute right-1 bottom-1 flex size-10 items-center justify-center rounded-full",
              "bg-brand-solid text-white shadow-md ring-4 ring-primary transition duration-100 ease-linear",
              "hover:bg-brand-solid_hover disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            <Camera01 className="size-4.5" />
          </button>
        </FileTrigger>
      </div>

      {photoPreview && onRemove && (
        <Button color="link-destructive" size="sm" iconLeading={Trash01} onClick={onRemove} isDisabled={isDisabled}>
          Rasmni olib tashlash
        </Button>
      )}

      <p className="text-center text-xs text-tertiary">PNG, JPG yoki WebP (Maks. 5 MB)</p>
    </div>
  );
}
