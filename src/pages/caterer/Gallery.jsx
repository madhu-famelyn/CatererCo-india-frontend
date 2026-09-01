import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { Card } from "@/components/ui/Card";
import { Upload, Image as ImageIcon, Trash2, Loader2, Star, Check } from "lucide-react";
import { api } from "@/lib/api";
import { catererService } from "@/services/catererService";

// ── Gallery API helpers ──────────────────────────────────────
const galleryApi = {
  getMyGallery: () => api.get("/caterers/me/gallery").then((r) => r.data.gallery || []),
  uploadPhoto: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/caterers/me/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 120000,
    }).then((r) => r.data.gallery || []);
  },
  deletePhoto: (url) => api.delete("/caterers/me/gallery", { data: { url } }).then((r) => r.data.gallery || []),
};

export default function Gallery() {
  const qc = useQueryClient();
  const fileRef = useRef();

  // Get the caterer profile to check auth & current cover photo
  const { data: profile } = useQuery({
    queryKey: ["my-caterer-profile"],
    queryFn: catererService.getMyProfile,
  });

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["caterer-gallery"],
    queryFn: galleryApi.getMyGallery,
    enabled: Boolean(profile?.id),
  });

  // ── Set Cover Mutation ──────────────────────────────────────
  const setCoverMutation = useMutation({
    mutationFn: (url) => catererService.updateMyProfile({ cover: url }),
    onSuccess: (updated) => {
      qc.invalidateQueries(["my-caterer-profile"]);
      qc.invalidateQueries(["caterers"]);
      toast.success("Set as your main profile cover photo!");
    },
    onError: () => toast.error("Failed to update profile cover photo"),
  });

  // ── Upload mutation (uploads file directly to storage via gallery endpoint) ───
  const uploadMutation = useMutation({
    mutationFn: (file) => galleryApi.uploadPhoto(file),
    onSuccess: (gallery) => {
      qc.setQueryData(["caterer-gallery"], gallery);
      toast.success("Photo uploaded successfully!");

      // If caterer has no cover photo set yet, auto-set first uploaded photo as cover!
      if (!profile?.cover && gallery.length > 0) {
        setCoverMutation.mutate(gallery[0]);
      }
    },
    onError: (err) => {
      console.error(err);
      toast.error(err?.response?.data?.detail || "Failed to upload photo");
    },
  });

  // ── Delete mutation ─────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: (url) => galleryApi.deletePhoto(url),
    onMutate: async (url) => {
      await qc.cancelQueries(["caterer-gallery"]);
      const prev = qc.getQueryData(["caterer-gallery"]);
      // Optimistic removal
      qc.setQueryData(["caterer-gallery"], (old = []) => old.filter((u) => u !== url));
      return { prev };
    },
    onSuccess: (gallery) => {
      qc.setQueryData(["caterer-gallery"], gallery);
      toast.success("Photo removed");
    },
    onError: (_e, _u, ctx) => {
      if (ctx?.prev) qc.setQueryData(["caterer-gallery"], ctx.prev);
      toast.error("Failed to remove photo");
    },
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    uploadMutation.mutate(file);
  };

  return (
    <>
      <PageHeader
        title="Gallery"
        description="Showcase your best events and choose your profile cover photo."
        action={
          <label className={`flex cursor-pointer items-center gap-2 rounded-xl gradient-gold px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition ${uploadMutation.isPending ? "opacity-60 cursor-wait" : "hover:opacity-90"}`}>
            {uploadMutation.isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
              : <><Upload className="h-4 w-4" /> Upload photo</>}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploadMutation.isPending} />
          </label>
        }
      />

      {isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-8">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading gallery…
        </div>
      ) : photos.length === 0 ? (
        <Card className="p-12 text-center text-muted-foreground">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
          <p className="font-medium text-foreground">No gallery photos yet</p>
          <p className="text-sm mt-1">Click <strong>Upload photo</strong> above to upload your first image.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((url, i) => {
            const isCover = profile?.cover === url;
            return (
              <div key={url} className={`group relative aspect-square overflow-hidden rounded-2xl border bg-muted transition ${isCover ? "ring-2 ring-[var(--primary)] border-[var(--primary)]" : "border-border"}`}>
                <img
                  src={url}
                  alt={`Gallery ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />

                {/* Badge if current profile cover */}
                {isCover ? (
                  <div className="absolute left-2 top-2 rounded-lg bg-[var(--primary)] px-2.5 py-1 text-[10px] font-bold text-accent-foreground shadow-sm flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" /> Cover Photo
                  </div>
                ) : (
                  <button
                    onClick={() => setCoverMutation.mutate(url)}
                    disabled={setCoverMutation.isPending}
                    className="absolute left-2 top-2 rounded-lg bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 hover:bg-[var(--primary)] hover:text-black transition flex items-center gap-1"
                    title="Set as profile cover photo"
                  >
                    <Star className="h-3 w-3" /> Set as Cover
                  </button>
                )}

                <button
                  onClick={() => deleteMutation.mutate(url)}
                  disabled={deleteMutation.isPending}
                  className="absolute right-2 top-2 p-2 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 hover:bg-red-600 transition disabled:opacity-40"
                  title="Remove photo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
