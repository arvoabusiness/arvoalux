import { notFound } from "next/navigation";
import { HealthGoalPage, healthGoalBySlug } from "@arvoalux/core";
import { brand } from "@/brand.config";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const goal = healthGoalBySlug(slug);
  if (!goal) notFound();

  return (
    <HealthGoalPage
      brand={brand}
      title={goal.title}
      intro={goal.intro}
      benefits={goal.benefits}
      collectionHandle={goal.collectionHandle}
    />
  );
}
