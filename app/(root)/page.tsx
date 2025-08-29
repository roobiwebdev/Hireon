import InterviewCard from "@/components/InterviewCard";
import { Button } from "@/components/ui/button";
import {
  getCurrentUser,
  getInterviewsByUserId,
  getLatestInterviews,
  getAvailableInterviews,
} from "@/lib/actions/auth.action";
import Image from "next/image";
import Link from "next/link";

const page = async () => {
  const user = await getCurrentUser();

  const [userInterviews, latestInterviews, availableInterviews] =
    await Promise.all([
      await getInterviewsByUserId(user?.id!),
      await getLatestInterviews({
        userId: user?.id!,
        limit: 20,
      }),
      await getAvailableInterviews(user?.id!, 20),
    ]);

  const hasPastInterviews = userInterviews && userInterviews?.length > 0;
  const hasUpcomingInterviews =
    latestInterviews && latestInterviews?.length > 0;
  const hasAvailableInterviews =
    availableInterviews && availableInterviews?.length > 0;

  // const userInterviews = await getInterviewsByUserId(user?.id!);
  // const latestInterviews = await getLatestInterviews({
  //   userId: user?.id!,
  //   limit: 20,
  // });

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-1g">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>

          <p className="text-lg">
            Practice on real interview questions and get instant feedback from
            AI.
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="robot dude"
          className="max-sm:hidden"
          width={400}
          height={400}
        />
      </section>

      {/* Your Interviews */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview: any) => (
              <InterviewCard key={interview.id} {...interview} />
            ))
          ) : (
            <p>You haven't taken any interviews yet</p>
          )}
        </div>
      </section>

      {/* Take an Interview */}
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an Interview</h2>

        <div className="interviews-section">
          {hasAvailableInterviews ? (
            availableInterviews?.map((interview: any) => (
              <InterviewCard key={interview.id} {...interview} />
            ))
          ) : (
            <p>There are no new interviews available</p>
          )}
        </div>
      </section>
    </>
  );
};
export default page;
