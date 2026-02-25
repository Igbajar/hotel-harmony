import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Smartphone, Wifi, WifiOff, Share2, CheckCircle2, ArrowLeft, Shield, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import phoneMockup from '@/assets/phone-mockup.png';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallApp() {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const appUrl = window.location.origin + '/install';

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'HotelPro - Hotel Management App',
          text: 'Download HotelPro – the complete hotel management app!',
          url: appUrl,
        });
      } catch {}
    } else {
      navigator.clipboard.writeText(appUrl);
    }
  };

  const features = [
    { icon: Zap, title: 'Lightning Fast', desc: 'Instant load times, even on slow connections' },
    { icon: WifiOff, title: 'Works Offline', desc: 'Access key features without internet' },
    { icon: Shield, title: 'Secure', desc: 'Enterprise-grade security for your data' },
    { icon: Globe, title: 'Always Updated', desc: 'Auto-updates with latest features' },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Floating back button */}
      <div className="fixed top-4 left-4 z-50">
        <Button variant="ghost" size="sm" className="gap-2 bg-background/80 backdrop-blur" onClick={() => navigate('/')}>
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Online/Offline indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground text-center py-2 text-sm font-medium flex items-center justify-center gap-2"
          >
            <WifiOff className="h-4 w-4" />
            You're offline — some features may be limited
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-12 lg:pt-28 lg:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <Badge variant="secondary" className="mb-4 text-sm">
                <Smartphone className="h-3 w-3 mr-1" />
                Progressive Web App
              </Badge>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4">
                HotelPro in <br />
                <span className="text-accent">Your Pocket</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                Install HotelPro on your phone for instant access to manage rooms, reservations, billing, and more — even offline.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                {isInstalled ? (
                  <Button size="lg" disabled className="gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5" />
                    Already Installed
                  </Button>
                ) : (
                  <Button size="lg" onClick={handleInstall} className="gap-2 text-base bg-accent text-accent-foreground hover:bg-accent/90">
                    <Download className="h-5 w-5" />
                    Install App
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={handleShare} className="gap-2 text-base">
                  <Share2 className="h-5 w-5" />
                  Share Link
                </Button>
              </div>

              {/* Connection status */}
              <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground justify-center lg:justify-start">
                {isOnline ? (
                  <>
                    <Wifi className="h-4 w-4 text-success" />
                    <span>Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-destructive" />
                    <span>Offline mode active</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Right: Phone Mockup with animations */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative flex justify-center"
            >
              <motion.div
                animate={{
                  y: [0, -12, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                {/* Glow effect */}
                <div className="absolute -inset-8 bg-accent/20 rounded-[3rem] blur-3xl opacity-50" />

                {/* Phone image */}
                <img
                  src={phoneMockup}
                  alt="HotelPro app on mobile phone"
                  className="relative w-64 sm:w-72 lg:w-80 drop-shadow-2xl"
                />

                {/* Floating notification cards */}
                <motion.div
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  className="absolute -right-4 top-1/4"
                >
                  <Card className="shadow-xl border-accent/20 w-44">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium text-foreground">New Booking</p>
                      <p className="text-[10px] text-muted-foreground">Room 201 • 3 nights</p>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.4, duration: 0.5 }}
                  className="absolute -left-4 top-1/2"
                >
                  <Card className="shadow-xl border-success/20 w-40">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium text-success">Revenue ↑ 12%</p>
                      <p className="text-[10px] text-muted-foreground">Today's earnings</p>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl font-bold text-center mb-12 text-foreground"
          >
            Why Install the App?
          </motion.h2>

          <div className="grid sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 flex gap-4">
                    <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                      <f.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                      <p className="text-sm text-muted-foreground">{f.desc}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QR Code Section */}
      <section className="px-4 py-16">
        <div className="container mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">
              Scan to Install
            </h2>
            <p className="text-muted-foreground mb-8">
              Scan this QR code with your phone camera to open the install page directly
            </p>

            <Card className="inline-block">
              <CardContent className="p-8">
                <div className="bg-white p-4 rounded-xl inline-block">
                  <QRCodeSVG
                    value={appUrl}
                    size={200}
                    bgColor="#ffffff"
                    fgColor="#1a2744"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p className="mt-4 text-sm text-muted-foreground font-mono break-all">
                  {appUrl}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigator.clipboard.writeText(appUrl)}
                >
                  Copy Link
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Manual Install Instructions */}
      <section className="px-4 py-16 bg-muted/30">
        <div className="container mx-auto max-w-2xl">
          <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
            How to Install
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-foreground">📱 iPhone / Safari</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Tap the <strong>Share</strong> button (box with arrow)</li>
                  <li>Scroll down and tap <strong>"Add to Home Screen"</strong></li>
                  <li>Tap <strong>"Add"</strong></li>
                </ol>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3 text-foreground">🤖 Android / Chrome</h3>
                <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                  <li>Tap the <strong>⋮ menu</strong> (three dots)</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></li>
                  <li>Tap <strong>"Install"</strong></li>
                </ol>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-border text-center text-sm text-muted-foreground">
        <p>
          Developed by{' '}
          <a
            href="https://www.rajabgi.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            Igbajar Abraham; Rajabgi Services Limited
          </a>
          {' · '}
          <a
            href="https://wa.me/+2348032864085"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            WhatsApp
          </a>
        </p>
      </footer>
    </div>
  );
}
