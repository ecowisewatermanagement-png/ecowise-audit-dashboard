import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import type {
  Audit,
  AuditCalculations,
  ExteriorAudit,
  InteriorAudit,
  Recommendation,
} from "@/types/audit";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 10, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  logo: { width: 140 },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 2 },
  subtitle: { fontSize: 9, color: "#666666" },
  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6, color: "#0f4c5c" },
  row: { flexDirection: "row", flexWrap: "wrap", marginBottom: 8 },
  col: { width: "50%", marginBottom: 4 },
  label: { fontSize: 8, color: "#666666", textTransform: "uppercase" },
  value: { fontSize: 10, marginTop: 1 },
  statGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8 },
  statBox: { width: "23%", padding: 8, backgroundColor: "#f0f6f4", borderRadius: 4, marginRight: 8, marginBottom: 8 },
  statValue: { fontSize: 14, fontWeight: 700, color: "#0f4c5c" },
  statLabel: { fontSize: 7, color: "#666666", marginTop: 2 },
  recRow: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 0.5, borderBottomColor: "#dddddd", paddingVertical: 5 },
  recTitle: { fontSize: 9.5, fontWeight: 700 },
  recMeta: { fontSize: 8, color: "#666666" },
  footer: { position: "absolute", bottom: 30, left: 40, right: 40, fontSize: 8, color: "#888888", textAlign: "center", borderTopWidth: 0.5, borderTopColor: "#dddddd", paddingTop: 8 },
});

const currency = (n?: number) =>
  n == null ? "—" : `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const gallons = (n?: number) => (n == null ? "—" : `${n.toLocaleString()} gal/yr`);

function ExteriorSummary({ exterior }: { exterior: ExteriorAudit }) {
  const items: [string, string][] = [
    ["Irrigated area", exterior.irrigatedAreaSqFt ? `${exterior.irrigatedAreaSqFt} sq ft` : "—"],
    ["Landscape type", exterior.landscapeType ?? "—"],
    ["Irrigation controller", exterior.hasIrrigationController ? (exterior.isSmartController ? "Smart controller" : "Standard timer") : "None"],
    ["Sprinkler type", exterior.sprinklerType ?? "—"],
    ["Rain sensor", exterior.hasRainSensor ? "Yes" : "No"],
    ["Issues observed", [
      exterior.hasOverspray && "Overspray",
      exterior.hasRunoff && "Runoff",
      exterior.hasLeaks && "Leaks",
      exterior.brokenHeadCount ? `${exterior.brokenHeadCount} broken heads` : null,
    ].filter(Boolean).join(", ") || "None"],
    ["Pool", exterior.hasPool
      ? [
          exterior.poolGallons ? `${exterior.poolGallons.toLocaleString()} gal capacity` : null,
          exterior.poolGallonsUsedPerYear ? `${exterior.poolGallonsUsedPerYear.toLocaleString()} gal/yr used` : null,
        ].filter(Boolean).join(", ") || "Yes"
      : "None"],
    ["Spa", exterior.hasSpa
      ? [
          exterior.spaGallons ? `${exterior.spaGallons.toLocaleString()} gal capacity` : null,
          exterior.spaGallonsUsedPerYear ? `${exterior.spaGallonsUsedPerYear.toLocaleString()} gal/yr used` : null,
        ].filter(Boolean).join(", ") || "Yes"
      : "None"],
  ];
  return (
    <View style={styles.row}>
      {items.map(([label, value]) => (
        <View style={styles.col} key={label}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

function InteriorSummary({ interior }: { interior: InteriorAudit }) {
  const items: [string, string][] = [
    ["Toilets", interior.toiletCount ? `${interior.toiletCount} @ ${interior.toiletFlushVolumeGal ?? "?"} GPF` : "—"],
    ["Showerheads", interior.showerheadCount ? `${interior.showerheadCount} @ ${interior.showerheadFlowRateGpm ?? "?"} GPM` : "—"],
    ["Bathroom faucets", interior.bathroomFaucetCount ? `${interior.bathroomFaucetCount} @ ${interior.bathroomFaucetFlowRateGpm ?? "?"} GPM` : "—"],
    ["Kitchen faucet", interior.kitchenFaucetFlowRateGpm ? `${interior.kitchenFaucetFlowRateGpm} GPM` : "—"],
    ["High-efficiency washer", interior.hasHighEfficiencyWasher ? "Yes" : "No"],
    ["Leaks found", [
      interior.hasToiletLeaks && "Toilet",
      interior.hasFaucetLeaks && "Faucet",
      interior.hasShowerLeaks && "Shower",
    ].filter(Boolean).join(", ") || "None"],
  ];
  return (
    <View style={styles.row}>
      {items.map(([label, value]) => (
        <View style={styles.col} key={label}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

export function AuditReportDocument({
  audit,
  auditorName,
  logoUrl,
}: {
  audit: Pick<
    Audit,
    | "address"
    | "homeownerName"
    | "auditDate"
    | "exterior"
    | "interior"
    | "recommendations"
    | "calculations"
  >;
  auditorName?: string | null;
  logoUrl: string;
}) {
  const c: AuditCalculations = audit.calculations ?? {};
  const recs: Recommendation[] = audit.recommendations ?? [];
  const priorityRecs = recs.filter((r) => r.priority === "high");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={logoUrl} style={styles.logo} />
          <View>
            <Text style={styles.title}>Water Conservation Audit Report</Text>
            <Text style={styles.subtitle}>
              {audit.auditDate} · Auditor: {auditorName ?? "—"}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Information</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Address</Text>
              <Text style={styles.value}>{audit.address}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Homeowner</Text>
              <Text style={styles.value}>{audit.homeownerName ?? "—"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estimated Savings</Text>
          <View style={styles.statGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{gallons(c.gallonsSavedPerYear)}</Text>
              <Text style={styles.statLabel}>WATER SAVED / YEAR</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{currency(c.dollarSavingsPerYear)}</Text>
              <Text style={styles.statLabel}>DOLLAR SAVINGS / YEAR</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{currency(c.rebateAmount)}</Text>
              <Text style={styles.statLabel}>REBATE OPPORTUNITY</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{c.efficiencyScore ?? "—"}/100</Text>
              <Text style={styles.statLabel}>EFFICIENCY SCORE</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exterior Summary</Text>
          <ExteriorSummary exterior={audit.exterior ?? {}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interior Summary</Text>
          <InteriorSummary interior={audit.interior ?? {}} />
        </View>

        {priorityRecs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority Actions</Text>
            {priorityRecs.map((r) => (
              <Text key={r.id} style={{ fontSize: 9.5, marginBottom: 3 }}>
                • {r.title}
              </Text>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Upgrades</Text>
          {recs.length === 0 && <Text style={{ fontSize: 9 }}>No recommendations recorded.</Text>}
          {recs.map((r) => (
            <View key={r.id} style={styles.recRow}>
              <View>
                <Text style={styles.recTitle}>{r.title}</Text>
                <Text style={styles.recMeta}>{r.category} · {r.priority} priority</Text>
              </View>
              <Text style={styles.recMeta}>
                {r.estimatedGallonsSavedPerYear ? `${r.estimatedGallonsSavedPerYear.toLocaleString()} gal/yr` : ""}
                {r.rebateAmount ? `  ·  ${currency(r.rebateAmount)} rebate` : ""}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          EcoWise Water Management · This report is an estimate based on a visual audit and standard fixture usage assumptions.
        </Text>
      </Page>
    </Document>
  );
}
