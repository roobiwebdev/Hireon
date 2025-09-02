"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/client";
import { updateUserProfile } from "@/lib/actions/general.action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] =
    useState<string>("/user-avatar.png");
  const [resumeName, setResumeName] = useState<string>("");
  const [font, setFont] = useState<string>("");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (formData: FormData) => {
    setIsSaving(true);
    try {
      const userId = (window as any).__USER_ID__ || "";

      const updates: UpdateUserProfileParams = { userId };

      const avatar = formData.get("avatar") as File | null;
      if (avatar && avatar.size > 0) {
        const avatarRef = ref(storage, `avatars/${userId}`);
        await uploadBytes(avatarRef, avatar);
        updates.profileURL = await getDownloadURL(avatarRef);
      }

      const resume = formData.get("resume") as File | null;
      if (resume && resume.size > 0) {
        const resumeRef = ref(storage, `resumes/${userId}`);
        await uploadBytes(resumeRef, resume);
        updates.resumeURL = await getDownloadURL(resumeRef);
      }

      const selectedFont = formData.get("font") as string;
      if (selectedFont) updates.font = selectedFont;

      await updateUserProfile(updates);
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl w-full mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Settings</h1>

      <form
        className="space-y-6"
        action={(formData) => void handleSave(formData)}
      >
        <div className="space-y-2">
          <Label htmlFor="avatar">Profile picture</Label>
          <div className="flex items-center gap-4">
            <Image
              src={avatarPreview}
              alt="avatar preview"
              width={64}
              height={64}
              className="rounded-full object-cover"
            />
            <Input id="avatar" name="avatar" type="file" accept="image/*" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="resume">Resume (PDF)</Label>
          <Input
            id="resume"
            name="resume"
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeName(e.target.files?.[0]?.name || "")}
          />
          {resumeName && <p className="text-xs text-light-100">{resumeName}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="font">Font</Label>
          <select
            id="font"
            name="font"
            className="bg-dark-200 rounded-md px-3 py-2"
            value={font}
            onChange={(e) => setFont(e.target.value)}
          >
            <option value="">Default</option>
            <option value="--font-mona-sans">Mona Sans</option>
          </select>
        </div>

        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save settings"}
        </Button>
      </form>
    </div>
  );
}
