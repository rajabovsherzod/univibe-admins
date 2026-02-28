"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { X, Image01, Plus } from "@untitledui/icons";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Select } from "@/components/base/select/select";
import { SelectItem } from "@/components/base/select/select-item";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 rounded-2xl bg-primary border border-secondary shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary">
          <h2 className="text-lg font-semibold text-primary">Yangi mahsulot</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-tertiary hover:bg-secondary transition-colors">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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

          <Input label="Nomi *" placeholder="Futbolka, kitob, ..." value={name} onChange={(v) => setName(v)} />
          <Input label="Tavsif" placeholder="Qo'shimcha ma'lumot" value={description} onChange={(v) => setDescription(v)} />
          <Input label="Narx (ball) *" placeholder="100" type="number" value={priceCoins} onChange={(v) => setPriceCoins(v)} />

          <Select label="Ombor turi" size="md"
            selectedKey={stockType}
            onSelectionChange={(k) => setStockType(k as "UNLIMITED" | "LIMITED")}
            items={[{ id: "UNLIMITED", label: "Cheksiz" }, { id: "LIMITED", label: "Cheklangan" }]}
          >
            {(item) => <SelectItem id={item.id}>{item.label}</SelectItem>}
          </Select>

          {stockType === "LIMITED" && (
            <Input label="Soni" placeholder="50" type="number" value={stockQuantity} onChange={(v) => setStockQuantity(v)} />
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" color="secondary" size="md" onClick={onClose}>Bekor qilish</Button>
            <Button type="submit" color="primary" size="md" iconLeading={Plus} isLoading={isPending}>Yaratish</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
