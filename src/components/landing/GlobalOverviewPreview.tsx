import React, { useMemo } from "react";
import { RAW_COUNTRIES } from "@/data/countries";
import { getAllProcessedCountries } from "@/lib/methodology";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { formatHours, formatPercent } from "@/lib/utils";
import { BarChart3, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GlobalOverviewPreview() {
  const countries = useMemo(() => getAllProcessedCountries(RAW_COUNTRIES), []);

  // Pick representative selection for preview (top 5 and bottom 5)
  const previewData = useMemo(() => {
    const top = countries.slice(0, 5);
    const bottom = countries.slice(-5);
    const mid = [countries[Math.floor(countries.length / 2)]];
    const combined = [...top, ...mid, ...bottom];
    return combined.map((c) => ({
      name: `${c.flag} ${c.name}`,
      shortName: c.code,
      laborHours: parseFloat(c.laborHoursForBasket.toFixed(1)),
      wagePercent: parseFloat(c.basketPercentOfWage.toFixed(1)),
      tier: c.stressTier,
    }));
  }, [countries]);

  const getColor = (tier: string) => {
    switch (tier) {
      case "Low": return "hsl(var(--success))";
      case "Moderate": return "hsl(var(--chart-3))";
      case "High": return "hsl(var(--chart-5))";
      default: return "hsl(var(--destructive))";
    }
  };

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <BarChart3 className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-bold">Labor Hours Spectrum</CardTitle>
            <CardDescription className="text-xs">
              Hours of median labor required to afford the monthly nutritional food basket
            </CardDescription>
          </div>
        </div>
        <a href="/dashboard">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <span>Explore Full Dashboard</span>
            <ArrowUpRight className="size-3.5" />
          </Button>
        </a>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={previewData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="shortName"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
                unit="h"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border border-border/80 bg-popover p-2.5 shadow-md text-xs">
                        <div className="font-bold text-popover-foreground mb-1">{data.name}</div>
                        <div className="text-muted-foreground flex justify-between gap-4">
                          <span>Labor Hours:</span>
                          <span className="font-semibold text-foreground">{formatHours(data.laborHours)}</span>
                        </div>
                        <div className="text-muted-foreground flex justify-between gap-4">
                          <span>Wage Burden:</span>
                          <span className="font-semibold text-foreground">{formatPercent(data.wagePercent)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="laborHours" radius={[4, 4, 0, 0]}>
                {previewData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.tier)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[11px] text-muted-foreground border-t border-border/40">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500"></span>
            <span>Low Burden (&lt;10%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-500"></span>
            <span>Moderate (10-20%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-orange-500"></span>
            <span>High (20-35%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-rose-500"></span>
            <span>Severe (&gt;35%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
