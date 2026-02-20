import { Section, ChromeButton } from "./ui";

export default function CTA() {
  return (
    <Section className="bg-dark text-offwhite text-center">
      <h2 className="text-3xl md:text-4xl font-bold mb-3">
        Start Making Smarter Purchases Today
      </h2>
      <p className="text-lg text-mint mb-8">
        Join thousands of users who are building wealth one decision at a time.
      </p>
      <ChromeButton className="bg-mint hover:bg-offwhite text-dark" />
    </Section>
  );
}
