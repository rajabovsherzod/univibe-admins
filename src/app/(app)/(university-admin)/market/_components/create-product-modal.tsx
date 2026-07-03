"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { X, Image01, Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
import { PremiumFormModal } from "@/components/application/modals/premium-modal";
import { useCreateProduct } from "../_hooks/use-products";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProductModal({ isOpen, onClose }: CreateProductModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priceCoins, setPriceCoins] = useState("");
  const [stockType, setStockType] = useState<"UNLIMITED" | "LIMITED">("UNLIMITED");
  const [stockQuantity, setStockQuantity] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { mutate: create, isPending } = useCreateProduct();

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceCoins.trim()) {
      toast.error("Nomi va narxini kiriting");
      return;
    }
    const fd = new FormData();
    fd.append("name", name.trim());
    if (description.trim()) fd.append("description", description.trim());
    fd.append("price_coins", priceCoins);
    fd.append("stock_type", stockType);
    if (stockType === "LIMITED" && stockQuantity) {
      fd.append("stock_quantity", stockQuantity);
    }
    if (imageFile) fd.append("image", imageFile);

    create(fd, {
      onSuccess: () => {
        toast.success("Mahsulot muvaffaqiyatli yaratildi");
        onClose();
        resetForm();
      },
      onError: () => toast.error("Xatolik yuz berdi"),
    });
  };

  const resetForm = () => {
    setName(""); setDescription(""); setPriceCoins("");
    setStockType("UNLIMITED"); setStockQuantity("");
    setImageFile(null); setImagePreview(null);
  };

  return (
    <PremiumFormModal
      isOpen={isOpen}
      onOpenChange={(open) => { if (!open) onClose(); }}
      title="Yangi mahsulot"
      description="Marketda yangi mahsulot yarating."
      icon={Plus}
      size="md"
      footer={
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" color="secondary" size="md" onClick={onClose}>Bekor qilish</Button>
          <Button type="submit" form="create-product-form" color="primary" size="md" iconLeading={Plus} isLoading={isPending}>Yaratish</Button>
        </div>
      }
    >
        <form id="create-product-form" onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload */}
          <div>
            <label className="text-sm font-medium text-secondary mb-1.5 block">Rasm</label>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-secondary hover:border-brand-400 bg-secondary/50 flex flex-col items-center justify-center gap-2 transition-colors group">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-full w-full object-contain p-2 rounded-xl" />
              ) : (
                <>
                  <Image01 className="size-8 text-tertiary group-hover:text-brand-500 transition-colors" />
                  <span className="text-xs text-tertiary">Rasm yuklash</span>
                </>
              )}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Nomi *" placeholder="Futbolka, kitob, ..." value={name} onChange={(v) => setName(v)} />
            <Input label="Narx (ball) *" placeholder="100" type="number" value={priceCoins} onChange={(v) => setPriceCoins(v)} />
          </div>

          <Input label="Tavsif" placeholder="Qo'shimcha ma'lumot" value={description} onChange={(v) => setDescription(v)} />

          <div className="grid grid-cols-2 gap-4 items-start">
            <div className={stockType === "UNLIMITED" ? "col-span-2" : "col-span-1"}>
              <Select label="Ombor turi" size="md"
                selectedKey={stockType}
                onSelectionChange={(k) => setStockType(k as "UNLIMITED" | "LIMITED")}
                items={[{ id: "UNLIMITED", label: "Cheksiz" }, { id: "LIMITED", label: "Cheklangan" }]}
              >
                {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
              </Select>
            </div>
            {stockType === "LIMITED" && (
              <div className="col-span-1">
                <Input label="Soni" placeholder="50" type="number" value={stockQuantity} onChange={(v) => setStockQuantity(v)} />
              </div>
            )}
          </div>

        </form>
    </PremiumFormModal>
  );
}
