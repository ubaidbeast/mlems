import { Hono } from "hono";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import z from "zod";
import { subDays, parse, differenceInDays } from "date-fns";
import { db } from "@/db/drizzle";
import { and, desc, eq, gte, lt, lte, sql, sum } from "drizzle-orm";
import { accounts, categories, transactions } from "@/db/schema";
import { claculatePercentageChange, fillMissingDays } from "@/lib/utils";
import { getRoleFromSessionClaims } from "@/lib/roles";
import { getUserDepartmentByClerkId } from "@/lib/get-user-department";

const app = new Hono()
    .get(
        "/",
        clerkMiddleware(),
        zValidator(
            "query",
            z.object({
                from: z.string().optional(),
                to: z.string().optional(),
                accountId: z.string().optional(),
            })
        ),
        async (c) => {
            const auth = getAuth(c);
            const {from, to, accountId} = c.req.valid("query");

            if (!auth?.userId) {
                return c.json({error: "Unauthorized"}, 401);
            }

            const role = getRoleFromSessionClaims(auth.sessionClaims);
            const userDepartment =
                role !== "admin" ? await getUserDepartmentByClerkId(auth.userId) : null;

            if (role !== "admin" && !userDepartment) {
                return c.json({ error: "forbidden" }, 403);
            }

            const scopedAccountId = role === "admin" ? accountId : userDepartment;

            const defaultTo = new Date();
            const defaultFrom = subDays(defaultTo, 30);

            const startDate = from ? parse(from, "yyyy-MM-dd", new Date()) : defaultFrom;
            const endDate = to ? parse(to, "yyyy-MM-dd", new Date()) : defaultTo;

            const periodLength = differenceInDays(endDate, startDate) + 1;
            const lastPeriodStart = subDays(startDate, periodLength);
            const lastPeriodEnd = subDays(endDate, periodLength);

            async function fetchFinancialData(
                start: Date,
                end: Date,
            ) {
                return await db
                    .select({
                        income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                        expense: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                        remaining: sum(transactions.amount).mapWith(Number),
                    })
                    .from(transactions)
                    .innerJoin(
                        accounts,
                        eq(transactions.accountId, accounts.id),
                    )
                    .where(
                        and(
                            scopedAccountId ? eq(transactions.accountId, scopedAccountId) : undefined,
                            gte(transactions.date, start),
                            lte(transactions.date, end)
                        )
                    )
            }

            const [currentPeriod] = await fetchFinancialData(startDate, endDate);
            const [lastPeriod] = await fetchFinancialData(lastPeriodStart, lastPeriodEnd);

            const incomeChange = claculatePercentageChange(currentPeriod.income, lastPeriod.income);
            const expenseChange = claculatePercentageChange(currentPeriod.expense, lastPeriod.expense);
            const remainingChange = claculatePercentageChange(currentPeriod.remaining, lastPeriod.remaining);

            const category = await db
                .select({
                    name:categories.name,
                    value: sql`SUM(ABS(${transactions.amount}))`.mapWith(Number),
                })
                .from(transactions)
                .innerJoin(
                    accounts,
                    eq(transactions.accountId, accounts.id),
                )
                .innerJoin(
                    categories,
                    eq(transactions.categoryId, categories.id),
                )
                .where(
                        and(
                            scopedAccountId ? eq(transactions.accountId, scopedAccountId) : undefined,
                            lt(transactions.amount, 0),
                            gte(transactions.date, startDate),
                            lte(transactions.date, endDate)
                        )
                )
                .groupBy(categories.name)
                .orderBy(desc(sql`SUM(ABS(${transactions.amount}))`))

            const topCategories = category.slice(0, 3);
            const otherCategories = category.slice(3);
            const otherSum = otherCategories.reduce((sum, current) => sum + current.value, 0);

            const finalCategories = topCategories;
            if(otherCategories.length > 0) {
                finalCategories.push({
                    name: "Other",
                    value: otherSum,
                })
            }

            const activeDyas = await db
                .select({
                    date: transactions.date,
                    income: sql`SUM(CASE WHEN ${transactions.amount} >= 0 THEN ${transactions.amount} ELSE 0 END)`.mapWith(Number),
                    expense: sql`SUM(CASE WHEN ${transactions.amount} < 0 THEN ABS(${transactions.amount}) ELSE 0 END)`.mapWith(Number),
                })
                .from(transactions)
                .innerJoin(
                    accounts,
                    eq(transactions.accountId, accounts.id),
                )
                .where(
                        and(
                            scopedAccountId ? eq(transactions.accountId, scopedAccountId) : undefined,
                            gte(transactions.date, startDate),
                            lte(transactions.date, endDate)
                        )
                )
                .groupBy(transactions.date)
                .orderBy(transactions.date)

            const days = fillMissingDays(
                activeDyas,
                startDate,
                endDate,
            )


            return c.json({
                data: {
                    remainingAmount: currentPeriod.remaining,
                    remainingChange,
                    incomeAmount: currentPeriod.income,
                    incomeChange,
                    expenseAmount: currentPeriod.expense,
                    expenseChange,
                    categories: finalCategories,
                    days,
                }
            })
        }
    )

export default app;