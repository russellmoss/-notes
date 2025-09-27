// src/app/api/review/pending/route.ts
import { NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { addDays, getDateRange } from "@/lib/date-utils";
import type {
  PendingReviewsResponse,
  ReviewNote,
  ActionItem,
} from "@/types/review.types";

export async function GET() {
  console.log("📅 Starting review pending check...");

  const notion = new Client({ auth: process.env.NOTION_TOKEN! });

  // Calculate date ranges
  const today = new Date();
  const yesterday = addDays(today, -1);
  const weekAgo = addDays(today, -7);

  // Get date boundaries for filtering
  const yesterdayRange = getDateRange(yesterday);
  const weekAgoRange = getDateRange(weekAgo);

  console.log(`📅 Today: ${today.toISOString()}`);
  console.log(
    `📅 Yesterday range: ${yesterdayRange.start} to ${yesterdayRange.end}`,
  );
  console.log(
    `📅 Week ago range: ${weekAgoRange.start} to ${weekAgoRange.end}`,
  );

  try {
    // Get database and data source
    const database = await notion.databases.retrieve({
      database_id: process.env.NOTION_DB_ID!,
    });

    const dataSourceId = (database as any).data_sources?.[0]?.id;
    if (!dataSourceId) {
      console.error("❌ No data source found in database");
      return NextResponse.json(
        {
          error: "No data source found in database",
          notes: [],
          reviewDate: today.toISOString(),
          counts: { nextDay: 0, weekLater: 0, total: 0 },
        } as PendingReviewsResponse,
        { status: 500 },
      );
    }

    console.log(`🔍 Using data source: ${dataSourceId}`);

    // Query for next-day reviews (submitted yesterday, not yet reviewed)
    const nextDayFilter = {
      and: [
        {
          property: "Submission Date",
          date: {
            on_or_after: yesterdayRange.start,
            on_or_before: yesterdayRange.end,
          },
        },
        {
          property: "Reviewed Next Day",
          checkbox: { equals: false },
        },
      ],
    };

    console.log("🔍 Querying next-day reviews...");
    const nextDayReviews = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      filter: nextDayFilter,
      sorts: [
        {
          property: "Submission Date",
          direction: "descending",
        },
      ],
      page_size: 100,
    });

    console.log(`✅ Found ${nextDayReviews.results.length} next-day reviews`);

    // Query for week-later reviews (submitted 7 days ago, next-day done, week not done)
    const weekLaterFilter = {
      and: [
        {
          property: "Submission Date",
          date: {
            on_or_after: weekAgoRange.start,
            on_or_before: weekAgoRange.end,
          },
        },
        {
          property: "Reviewed Next Day",
          checkbox: { equals: true },
        },
        {
          property: "Reviewed Week Later",
          checkbox: { equals: false },
        },
      ],
    };

    console.log("🔍 Querying week-later reviews...");
    const weekLaterReviews = await (notion as any).dataSources.query({
      data_source_id: dataSourceId,
      filter: weekLaterFilter,
      sorts: [
        {
          property: "Submission Date",
          direction: "descending",
        },
      ],
      page_size: 100,
    });

    console.log(
      `✅ Found ${weekLaterReviews.results.length} week-later reviews`,
    );

    // Format notes helper function
    const formatNote = (
      page: any,
      reviewType: "next-day" | "week-later",
    ): ReviewNote => {
      const props = page.properties;

      // Parse LLM JSON data
      let llmData: any = {};
      try {
        const llmContent = props["LLM JSON"]?.rich_text?.[0]?.text?.content;
        if (llmContent) {
          llmData = JSON.parse(llmContent);
        }
      } catch (e) {
        console.warn(`Failed to parse LLM JSON for page ${page.id}`);
      }

      // Parse action items
      let actionItems: ActionItem[] = [];
      try {
        const actionItemsText =
          props["Action Items"]?.rich_text?.[0]?.text?.content || "";
        if (
          actionItemsText &&
          actionItemsText !== "-" &&
          actionItemsText !== ""
        ) {
          actionItems = actionItemsText
            .split("\n")
            .filter((line: string) => line.trim().startsWith("•"))
            .map((line: string) => {
              // Parse format: • Owner: Task (due Date)
              const match = line.match(
                /•\s*(.+?):\s*(.+?)(?:\s*\(due\s+(.+?)\))?$/,
              );
              if (match) {
                return {
                  owner: match[1].trim(),
                  task: match[2].trim(),
                  due: match[3]?.trim() || null,
                };
              }
              // Fallback for simple format: • Task
              const simpleMatch = line.match(/•\s*(.+)/);
              if (simpleMatch) {
                return {
                  owner: "Unassigned",
                  task: simpleMatch[1].trim(),
                  due: null,
                };
              }
              return null;
            })
            .filter(
              (item: ActionItem | null): item is ActionItem => item !== null,
            );
        }
      } catch (e) {
        console.warn(`Failed to parse action items for page ${page.id}`);
      }

      return {
        id: page.id,
        title: props.Title?.title?.[0]?.text?.content || "Untitled Note",
        date:
          props.Date?.date?.start ||
          props["Submission Date"]?.date?.start ||
          "",
        submissionDate:
          props["Submission Date"]?.date?.start || page.created_time,
        tldr: props.TLDR?.rich_text?.[0]?.text?.content || "",
        summary: props.Summary?.rich_text?.[0]?.text?.content || "",
        keyTakeaways: llmData.keyTakeaways || llmData.key_takeaways || [],
        actionItems,
        notionUrl: page.url || `https://notion.so/${page.id.replace(/-/g, "")}`,
        reviewType,
        reviewed: false,
        edits: "",
      };
    };

    // Format all notes
    const notes: ReviewNote[] = [
      ...nextDayReviews.results.map((p: any) => formatNote(p, "next-day")),
      ...weekLaterReviews.results.map((p: any) => formatNote(p, "week-later")),
    ];

    // Sort by submission date (most recent first)
    notes.sort(
      (a, b) =>
        new Date(b.submissionDate).getTime() -
        new Date(a.submissionDate).getTime(),
    );

    console.log(`📊 Total notes for review: ${notes.length}`);

    const response: PendingReviewsResponse = {
      notes,
      reviewDate: today.toISOString(),
      counts: {
        nextDay: nextDayReviews.results.length,
        weekLater: weekLaterReviews.results.length,
        total: notes.length,
      },
      debug: {
        yesterdayRange,
        weekAgoRange,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("❌ Error fetching pending reviews:", error);

    const errorResponse: PendingReviewsResponse = {
      notes: [],
      reviewDate: today.toISOString(),
      counts: {
        nextDay: 0,
        weekLater: 0,
        total: 0,
      },
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
