"use client";

import DashboardLayout from "@/components/DashboardLayout";
import { createArtwork } from "@/lib/frontend/artworks-api";
import { uploadArtworkImage, type UploadResult } from "@/lib/frontend/upload-api";
import { artworkCategories, recyclableMaterials } from "@/lib/ml/schemas";
import { AlertCircle, ArrowLeft, Check, Loader2, Plus, Recycle, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type ImageDraft = {
  preview: string;
  uploaded?: UploadResult;
  uploading?: boolean;
  error?: string;
};

type MaterialDraft = {
  material: string;
  weightKg: string;
  source: string;
};

const categories = [...artworkCategories];
const materialTypes = [...recyclableMaterials];

export default function AdminCreateArtworkPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [images, setImages] = useState<ImageDraft[]>([]);
  const [materials, setMaterials] = useState<MaterialDraft[]>([{ material: "", weightKg: "", source: "" }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    dimensions: "",
    price: "",
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;
    const selectedFiles = Array.from(files).slice(0, 5 - images.length);
    const startIndex = images.length;
    setImages((current) => [
      ...current,
      ...selectedFiles.map((file) => ({ preview: URL.createObjectURL(file), uploading: true })),
    ]);

    for (let index = 0; index < selectedFiles.length; index += 1) {
      try {
        const uploaded = await uploadArtworkImage(selectedFiles[index]);
        setImages((current) =>
          current.map((image, imageIndex) =>
            imageIndex === startIndex + index ? { ...image, uploaded, uploading: false } : image
          )
        );
      } catch (error) {
        console.error("Admin artwork image upload failed:", error);
        setImages((current) =>
          current.map((image, imageIndex) =>
            imageIndex === startIndex + index
              ? { ...image, uploading: false, error: error instanceof Error ? error.message : t("admin.artworksCreate.uploadFailed") }
              : image
          )
        );
      }
    }
  };

  const removeImage = (index: number) => {
    const image = images[index];
    if (image?.preview.startsWith("blob:")) URL.revokeObjectURL(image.preview);
    setImages((current) => current.filter((_, imageIndex) => imageIndex !== index));
  };

  const updateMaterial = (index: number, field: keyof MaterialDraft, value: string) => {
    setMaterials((current) => current.map((material, materialIndex) => (materialIndex === index ? { ...material, [field]: value } : material)));
  };

  const addMaterial = () => {
    setMaterials((current) => [...current, { material: "", weightKg: "", source: "" }]);
  };

  const removeMaterial = (index: number) => {
    setMaterials((current) => current.filter((_, materialIndex) => materialIndex !== index));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError("");

    const validMaterials = materials
      .filter((material) => material.material && Number(material.weightKg) > 0)
      .map((material) => ({
        material: material.material,
        weightKg: Number(material.weightKg),
        source: material.source,
        isVerified: true,
      }));
    const uploadedImages = images
      .filter((image) => image.uploaded)
      .map((image, index) => ({
        url: image.uploaded!.publicUrl,
        altText: `${formData.title} image ${index + 1}`,
      }));

    if (!formData.title || !formData.description || !formData.category || !formData.price) {
      setFormError(t("admin.artworksCreate.errorRequiredFields"));
      return;
    }
    if (images.some((image) => image.uploading)) {
      setFormError(t("admin.artworksCreate.errorImagesUploading"));
      return;
    }
    if (uploadedImages.length === 0) {
      setFormError(t("admin.artworksCreate.errorNoImage"));
      return;
    }
    if (validMaterials.length === 0) {
      setFormError(t("admin.artworksCreate.errorNoMaterial"));
      return;
    }

    setIsSubmitting(true);
    try {
      await createArtwork({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        dimensions: formData.dimensions,
        priceAmount: Number(formData.price),
        ownerType: "renewcanvas",
        images: uploadedImages,
        materials: validMaterials,
      });
      router.push("/dashboard/admin/artworks");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t("admin.artworksCreate.errorCreateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <Link href="/dashboard/admin/artworks" className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
            <ArrowLeft className="h-4 w-4" />
            {t("admin.artworksCreate.backToModeration")}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{t("admin.artworksCreate.pageTitle")}</h1>
          <p className="mt-1 text-gray-500">{t("admin.artworksCreate.pageSubtitle")}</p>
        </div>

        {formError && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="font-semibold text-gray-900">{t("admin.artworksCreate.detailsHeading")}</h2>
              <div className="mt-4 grid gap-4">
                <label className="block text-sm font-medium text-gray-700">
                  {t("admin.artworksCreate.titleLabel")}
                  <input name="title" value={formData.title} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </label>
                <label className="block text-sm font-medium text-gray-700">
                  {t("admin.artworksCreate.descriptionLabel")}
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="mt-1 w-full resize-none rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </label>
                <div className="grid gap-4 md:grid-cols-3">
                  <label className="block text-sm font-medium text-gray-700">
                    {t("admin.artworksCreate.categoryLabel")}
                    <select name="category" value={formData.category} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500">
                      <option value="">{t("admin.artworksCreate.categoryPlaceholder")}</option>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("admin.artworksCreate.dimensionsLabel")}
                    <input name="dimensions" value={formData.dimensions} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </label>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("admin.artworksCreate.priceLabel")}
                    <input name="price" type="number" min="1" value={formData.price} onChange={handleChange} className="mt-1 w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                  </label>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-gray-900">{t("admin.artworksCreate.materialsHeading")}</h2>
                <button type="button" onClick={addMaterial} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  <Plus className="h-4 w-4" />
                  {t("admin.artworksCreate.addMaterial")}
                </button>
              </div>
              <div className="mt-4 space-y-3">
                {materials.map((material, index) => (
                  <div key={index} className="grid gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 md:grid-cols-[1fr_120px_1fr_auto]">
                    <select value={material.material} onChange={(event) => updateMaterial(index, "material", event.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                      <option value="">{t("admin.artworksCreate.materialPlaceholder")}</option>
                      {materialTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <input value={material.weightKg} onChange={(event) => updateMaterial(index, "weightKg", event.target.value)} type="number" min="0" step="0.1" placeholder={t("admin.artworksCreate.weightPlaceholder")} className="rounded-lg border border-gray-200 px-3 py-2" />
                    <input value={material.source} onChange={(event) => updateMaterial(index, "source", event.target.value)} placeholder={t("admin.artworksCreate.sourcePlaceholder")} className="rounded-lg border border-gray-200 px-3 py-2" />
                    <button type="button" onClick={() => removeMaterial(index)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600" aria-label={t("admin.artworksCreate.removeMaterialAria")}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <section className="rounded-xl border border-gray-100 bg-white p-5">
              <h2 className="font-semibold text-gray-900">{t("admin.artworksCreate.imagesHeading")}</h2>
              <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center hover:border-teal-300 hover:bg-teal-50/30">
                <Upload className="mb-2 h-8 w-8 text-teal-600" />
                <span className="text-sm font-medium text-gray-900">{t("admin.artworksCreate.uploadImagesLabel")}</span>
                <span className="text-xs text-gray-500">{t("admin.artworksCreate.uploadImagesHint")}</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {images.map((image, index) => (
                  <div key={image.preview} className="relative overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                    <img src={image.preview} alt="" className="aspect-square w-full object-cover" />
                    <button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white">
                      <X className="h-3 w-3" />
                    </button>
                    {image.uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/40"><Loader2 className="h-5 w-5 animate-spin text-white" /></div>}
                    {image.uploaded && <div className="absolute bottom-1 right-1 rounded-full bg-green-600 p-1 text-white"><Check className="h-3 w-3" /></div>}
                    {image.error && <p className="p-2 text-xs text-red-600">{image.error}</p>}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-teal-100 bg-teal-50 p-5">
              <div className="flex items-start gap-3">
                <Recycle className="mt-0.5 h-5 w-5 text-teal-700" />
                <div>
                  <h2 className="font-semibold text-teal-900">{t("admin.artworksCreate.ownedHeading")}</h2>
                  <p className="mt-1 text-sm text-teal-700">
                    {t("admin.artworksCreate.ownedDescription")}
                  </p>
                </div>
              </div>
            </section>

            <button type="submit" disabled={isSubmitting} className="w-full rounded-lg bg-teal-600 px-5 py-3 font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
              {isSubmitting ? t("admin.artworksCreate.publishing") : t("admin.artworksCreate.publishButton")}
            </button>
          </aside>
        </form>
      </div>
    </DashboardLayout>
  );
}
