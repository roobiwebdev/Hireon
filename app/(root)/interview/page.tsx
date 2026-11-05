import Agent from "@/components/Agent";
import InterviewSetupForm from "@/components/InterviewSetupForm";
import { requireUser } from "@/lib/auth/session";
import { voiceProvider } from "@/lib/voice/provider";

const page = async () => {
  const user = await requireUser();

  // Vapi sets interviews up by voice; the free browser mode uses a short form instead.
  if (voiceProvider === "vapi") {
    return (
      <>
        <h3>Interview Generation</h3>
        <Agent userName={user.name} userImage={user.image} userId={user.id} type="generate" />
      </>
    );
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <InterviewSetupForm />
    </section>
  );
};

export default page;
