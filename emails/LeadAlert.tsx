import { Body, Container, Head, Heading, Html, Preview, Text } from "@react-email/components";

type Props = {
  name: string;
  email: string;
  track: string;
  source?: string | null;
  assessmentResult?: string | null;
  createdAt: Date;
};

/** Internal alert sent to LEADS_NOTIFY_EMAIL for every new lead. */
export function LeadAlert({ name, email, track, source, assessmentResult, createdAt }: Props) {
  const rows: [string, string][] = [
    ["Name", name],
    ["Email", email],
    ["Track", track],
    ["Assessment result", assessmentResult ?? "—"],
    ["Source", source || "—"],
    ["Received", createdAt.toISOString()],
  ];
  return (
    <Html lang="en">
      <Head />
      <Preview>
        New lead: {name} — {track}
      </Preview>
      <Body style={{ fontFamily: "Arial, sans-serif", backgroundColor: "#ffffff", color: "#111111" }}>
        <Container style={{ maxWidth: 560, padding: 24 }}>
          <Heading as="h2" style={{ fontSize: 20 }}>
            New TrustedtrAiner lead
          </Heading>
          {rows.map(([label, value]) => (
            <Text key={label} style={{ margin: "4px 0", fontSize: 14 }}>
              <strong>{label}:</strong> {value}
            </Text>
          ))}
        </Container>
      </Body>
    </Html>
  );
}
