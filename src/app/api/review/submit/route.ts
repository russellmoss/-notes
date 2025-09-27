import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import type {
  ReviewSubmission,
  ReviewApiResponse,
  ReviewResult,
} from "@/types/review.types";

export async function POST(req: NextRequest) {
  console.log("📝 Review submission endpoint called");

  try {
    const body = await req.json();
    const { reviews } = body as { reviews: ReviewSubmission[] };

    if (!reviews || !Array.isArray(reviews)) {
      return NextResponse.json(
        { error: "Invalid request: reviews array is required" },
        { status: 400 },
      );
    }

    console.log(`📊 Processing ${reviews.length} reviews`);

    const notion = new Client({ auth: process.env.NOTION_TOKEN! });
    const results: ReviewResult[] = [];
    const successfulIds: string[] = [];

    for (const review of reviews) {
      try {
        const updateData: any = {
          page_id: review.id,
          properties: {},
        };

        // Mark the appropriate review type as completed
        if (review.reviewType === "next-day") {
          updateData.properties["Reviewed Next Day"] = { checkbox: true };
        } else if (review.reviewType === "week-later") {
          updateData.properties["Reviewed Week Later"] = { checkbox: true };
        }

        // Add review notes if provided
        if (review.edits && review.edits.trim().length > 0) {
          updateData.properties["Review Notes"] = {
            rich_text: [
              {
                type: "text",
                text: { content: review.edits.trim() },
              },
            ],
          };
        }

        // Set last review date to current timestamp
        updateData.properties["Last Review Date"] = {
          date: { start: new Date().toISOString() },
        };

        // Update the page (DO NOT ARCHIVE)
        await notion.pages.update(updateData);

        successfulIds.push(review.id);
        results.push({
          id: review.id,
          success: true,
          reviewType: review.reviewType,
        });

        console.log(
          `✅ Updated review for ${review.id} (${review.reviewType})`,
        );
      } catch (error) {
        console.error(`❌ Failed to update review for ${review.id}:`, error);
        results.push({
          id: review.id,
          success: false,
          reviewType: review.reviewType,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const successCount = successfulIds.length;
    const failureCount = results.length - successCount;

    const response: ReviewApiResponse = {
      success: successCount > 0,
      reviewedCount: successCount,
      totalCount: results.length,
      successfulIds,
      failureCount,
      results,
      message:
        failureCount > 0
          ? `Submitted ${successCount} of ${results.length} reviews (${failureCount} failed)`
          : `Successfully submitted all ${successCount} reviews`,
    };

    console.log(
      `📊 Review submission complete: ${successCount}/${results.length} successful`,
    );

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Review submission failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
