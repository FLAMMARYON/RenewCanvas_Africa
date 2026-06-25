import { render, screen } from "@testing-library/react";
import Footer from "@/components/Footer";

// Footer pulls copy through react-i18next; stub the hook so the test renders the
// translation keys verbatim and never depends on a loaded i18n instance.
jest.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe("Footer", () => {
  it("renders as a contentinfo landmark", () => {
    render(<Footer />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("links to the legal policy pages", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "footer.privacy" })).toHaveAttribute("href", "/privacy");
    expect(screen.getByRole("link", { name: "footer.terms" })).toHaveAttribute("href", "/terms");
    expect(screen.getByRole("link", { name: "footer.refund" })).toHaveAttribute(
      "href",
      "/refund-policy",
    );
  });

  it("exposes a contact email and LinkedIn link", () => {
    render(<Footer />);
    const emailLinks = screen.getAllByRole("link", { name: /hello\.renewcanvas@gmail\.com/ });
    expect(emailLinks[0]).toHaveAttribute("href", "mailto:hello.renewcanvas@gmail.com");
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/company/renewcanvas-africa/",
    );
  });

  it("shows the current year in the copyright line", () => {
    render(<Footer />);
    const year = String(new Date().getFullYear());
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });
});
