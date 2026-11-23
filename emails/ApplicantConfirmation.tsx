import { Body, Container, Head, Heading, Hr, Html, Preview, Section, Text } from "@react-email/components";

type Props = { name: string; track: string };

const colors = { ink: "#030303", panel: "#100f0c", gold: "#e0a940", cream: "#f4f0e8", muted: "#a39e94" };

/** Sent to the applicant after a successful Apply submission. */
export function ApplicantConfirmation({ name, track }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <Html lang="en">
      <Head />
      <Preview>You&apos;re on the list for {track}.</Preview>
      <Body style={{ backgroundColor: colors.ink, color: colors.cream, fontFamily: "Arial, sans-serif", margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
          <Text style={{ fontSize: 20, fontWeight: 700, margin: "0 0 32px" }}>
            Trustedtr<span style={{ color: colors.gold }}>Ai</span>ner
          </Text>
          <Section
            style={{ backgroundColor: colors.panel, border: "1px solid #e0a94057", borderRadius: 16, padding: 32 }}
          >
            <Text style={{ color: colors.gold, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
              Request received
            </Text>
            <Heading as="h1" style={{ fontSize: 28, margin: "12px 0 16px", color: colors.cream }}>
              You&apos;re on the list, {firstName}.
            </Heading>
            <Text style={{ color: colors.muted, fontSize: 15, lineHeight: "24px" }}>
              Thanks for your interest in <strong style={{ color: colors.cream }}>{track}</strong>. An academy adviser
              will be in touch shortly to recommend the right next step for you.
            </Text>
            <Text style={{ color: colors.muted, fontSize: 15, lineHeight: "24px" }}>
              No spam. No hard sell. Just a useful conversation.
            </Text>
          </Section>
          <Hr style={{ borderColor: "#ffffff1c", margin: "32px 0 16px" }} />
          <Text style={{ color: colors.muted, fontSize: 12 }}>Train. Build. Prove. Transform. · London</Text>
        </Container>
      </Body>
    </Html>
  );
}
