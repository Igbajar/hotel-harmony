import { useSiteSettings } from '@/hooks/useSiteSettings';

export function Footer() {
  const { data: settings, isLoading } = useSiteSettings();

  if (isLoading) return null;

  const footerText = settings?.footer_text || 'Developed by Igbajar Abraham; Rajabgi Services Limited';
  const footerLinkUrl = settings?.footer_link_url || 'https://www.rajabgi.com';
  const footerLinkLabel = settings?.footer_link_label || 'Rajabgi Services Limited';
  const footerWhatsapp = settings?.footer_whatsapp || '+2348032864085';
  const extraLinks: Array<{ label: string; url: string }> = settings?.footer_extra_links || [];
  const extraImages: Array<{ url: string; alt: string }> = settings?.footer_extra_images || [];

  return (
    <footer className="border-t border-border bg-muted/30 px-6 py-4">
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground text-center flex-wrap">
        {extraImages.length > 0 && (
          <div className="flex items-center gap-3 mb-2 sm:mb-0">
            {extraImages.map((img, i) => (
              <img key={i} src={img.url} alt={img.alt} className="h-6 object-contain" />
            ))}
          </div>
        )}
        <span>{footerText?.split(';')[0]?.trim()}</span>
        <span>·</span>
        <a
          href={footerLinkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          {footerLinkLabel}
        </a>
        <span>·</span>
        <a
          href={`https://wa.me/${footerWhatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline"
        >
          WhatsApp
        </a>
        {extraLinks.map((link, i) => (
          <span key={i}>
            <span className="mx-1">·</span>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              {link.label}
            </a>
          </span>
        ))}
      </div>
    </footer>
  );
}
