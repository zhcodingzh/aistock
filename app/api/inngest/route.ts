import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { sendWeeklyNewsSummary, sendSignUpEmail, checkStockAlerts, checkInactiveUsers, analyzeAllStocks, analyzeUserStocks, analyzeStockOnDemand } from "@/lib/inngest/functions";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [sendSignUpEmail, sendWeeklyNewsSummary, checkStockAlerts, checkInactiveUsers, analyzeAllStocks, analyzeUserStocks, analyzeStockOnDemand],
})