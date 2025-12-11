import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Download,
  GraduationCap,
  ChevronRight,
  Sparkles,
  Gift,
  Star,
  Plus,
  Check,
} from 'lucide-react';
import { BackgroundMusic } from '../components/BackgroundMusic';
import { PremiumSnowfall } from '../components/PremiumSnowfall';
import { ChristmasCartProvider, useChristmasCart } from '../contexts/ChristmasCartContext';
import { ChristmasCartButton } from '../components/ChristmasCartButton';
import { ChristmasCartDrawer } from '../components/ChristmasCartDrawer';

interface DesignCardProps {
  number: number;
  title: string;
  description: string;
  image: string;
  onAddToCart: () => void;
  isInCart: boolean;
}

const SUPABASE_URL = 'https://kvnbgubooykiveogifwt.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const DesignCard = ({
  number,
  title,
  description,
  image,
  onAddToCart,
  isInCart,
}: DesignCardProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-gold"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative p-8">
        <div className="aspect-[3/4] bg-gradient-to-br from-white/5 to-white/10 rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
          <img
            src={image}
            alt={title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h3 className="text-2xl font-serif text-white">Design #{number}</h3>
          </div>
          <p className="text-lg text-amber-300 font-medium">{title}</p>
          <p className="text-sm text-white/70">{description}</p>
          <p className="text-xl font-bold text-white">$0.99</p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart();
            }}
            disabled={isInCart}
            className={`mt-4 w-full py-3 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:translate-y-[-2px] shadow-lg border border-amber-400/30 flex items-center justify-center gap-2 ${
              isInCart
                ? 'bg-green-600/50 text-white cursor-default'
                : 'bg-gradient-to-r from-red-600 to-red-700 text-amber-100 hover:from-red-700 hover:to-red-800 hover:shadow-red-500/50'
            }`}
          >
            {isInCart ? (
              <>
                <Check className="w-5 h-5" />
                In Cart
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-400 rounded-full animate-sparkle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

function ChristmasContent() {
  const [email, setEmail] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [isSubmittingFreebie, setIsSubmittingFreebie] = useState(false);
  const [freebieMessage, setFreebieMessage] = useState<string | null>(null);
  const [coloringTab, setColoringTab] = useState<'adult' | 'kids'>('adult');
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [emailInputShake, setEmailInputShake] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { addToCart, isInCart } = useChristmasCart();

  // Load saved email from localStorage on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('christmas_customer_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  // Save email to localStorage when it changes
  useEffect(() => {
    if (email && email.includes('@')) {
      localStorage.setItem('christmas_customer_email', email);
    }
  }, [email]);

  const designs = [
    {
      title: 'Vintage Storybook Santa Wish',
      description: 'Charming soft watercolor design',
      image:
        'https://cdn1.site-media.eu/images/0/21587768/design1-Z3wu6c1nLAh3ACrbe46Gmg.png',
    },
    {
      title: 'Christmas Eve Heartside Santa letter with woodland friends',
      description: 'Heartwarming, storybook-style Santa letter',
      image:
        'https://cdn1.site-media.eu/images/0/21587759/design2-Xs-oos-r7fL_Gn4-yusolg.png',
    },
    {
      title: 'Snowy Cutie Santa & Reindeer Letter',
      description: 'Adorable chibi-style Santa and reindeer',
      image:
        'https://cdn1.site-media.eu/images/0/21587758/design3-rpLHL3OeUCdrIqzMr7wNYA.png',
    },
    {
      title: 'Felt Santa Reindeer',
      description: 'Cozy felt-textured Santa and reindeer design',
      image:
        'https://cdn1.site-media.eu/images/0/21587450/DearSanta2-EyDV0P1Wf8rh1mYm0lQwew.png',
    },
    {
      title: 'Felt Santa Elves',
      description: "Adorable felt-style Santa's helpers",
      image:
        'https://cdn1.site-media.eu/images/0/21587438/DearSantaLetter-X4mrLdblVYGmVh_xVEIdhg.png',
    },
    {
      title: 'Snowflake Wonder',
      description: 'Delicate winter crystals',
      image:
        'https://cdn1.site-media.eu/images/0/21587392/DearSantaLetter4-_CjR-X24vAzawUhHvsEB7A.png',
    },
    {
      title: 'Bold Metallic Shine',
      description: 'Shimmering metallic Christmas glamour',
      image:
        'https://cdn1.site-media.eu/images/0/21587432/DearSantaLetter1-Gr0SVAqpn4KVS5U8qkGlfQ.png',
    },
    {
      title: 'Bold Faux Glitter',
      description: 'Sparkling glitter effect design',
      image:
        'https://cdn1.site-media.eu/images/0/21587416/DearSantaLetter2-3iGVMx_c3Va-NcPSt486AA.png',
    },
    {
      title: 'Gamer',
      description: 'Video game inspired Christmas letter',
      image:
        'https://cdn1.site-media.eu/images/0/21587763/design9-be-BNu7ELngHsB4-prRBsw.png',
    },
    {
      title: 'Fortnite Inspired',
      description: "Battle royale meets Santa's workshop",
      image:
        'https://cdn1.site-media.eu/images/0/21587361/DearSantaLetter8-7XA4wULg3muTEB7z7NkmXg.png',
    },
    {
      title: 'Bold Santa Reindeer Ribbon',
      description: 'Festive ribbons and classic characters',
      image:
        'https://cdn1.site-media.eu/images/0/21587888/design11-y92iFyQtYnasvWXozYAjTg.png',
    },
    {
      title: 'Comic Bold Glitter',
      description: 'Fun comic style with metallic accents',
      image:
        'https://cdn1.site-media.eu/images/0/21587761/design12-mVBhwMJJ1BEl0y8ocesZlQ.png',
    },
    {
      title: 'Roblox Inspired',
      description: 'Pixelated blocky Christmas adventure',
      image:
        'https://cdn1.site-media.eu/images/0/21587363/DearSantaLetter7-hENBo0gX6c_LqXxJD56whQ.png',
    },
    {
      title: 'Traditional Christmas Glitter',
      description: 'Timeless classic holiday design',
      image:
        'https://cdn1.site-media.eu/images/0/21587399/DearSantaLetter3-PmrmOxSHQkpwG_jKh2M2vQ.png',
    },
  ];

  const christmasNotes = [
    {
      title: 'Vintage Christmas Notes Lined',
      description: 'Watercolor Woodland with lined writing space',
      image:
        'https://cdn1.site-media.eu/images/0/21587536/ChristmasNotes-RFAy0MOttbNqrOGEc3EkCg.png',
    },
    {
      title: "Santa's Workshop Notes Lined",
      description: 'Whimsical workshop scene with guided lines',
      image:
        'https://cdn1.site-media.eu/images/0/21587693/ChristmasNotes3-lined-J0xhPIRuUzj56rqkQCSn0A.png',
    },
    {
      title: "Santa's Workshop Notes",
      description: 'Festive border with blank space for creativity',
      image:
        'https://cdn1.site-media.eu/images/0/21587575/ChristmasNotes3-KfzspG5RqPBYZ-u3jxt5tQ.png',
    },
    {
      title: 'Vintage Christmas Notes',
      description: 'Watercolor Woodland frame for freeform writing',
      image:
        'https://cdn1.site-media.eu/images/0/21587542/ChristmasNotes-blank-FeUDnrdQLKzZkZEYLgmt-A.png',
    },
  ];

  const adultColoringSheets = [
    {
      title: 'Intricate Mandala Wreath',
      file: 'https://cdn1.site-media.eu/images/0/21587522/coloringsheet-IntricateMandalaChristmasWreath-N0MesPRJvpIQqMoOqSjpLA.jpg',
      description: 'Detailed mandala patterns in festive wreath',
    },
    {
      title: 'Ornamental Tree',
      file: 'https://cdn1.site-media.eu/images/0/21587521/coloringsheet-OrnamentalChristmasTreeWithFiligreePatterns-iK1VBjuqWCToeWeFUV82TQ.jpg',
      description: 'Filigree patterns and ornate details',
    },
    {
      title: 'Victorian Street Scene',
      file: 'https://cdn1.site-media.eu/images/0/21587716/coloringsheet-VictorianChristmasStreetScene-uFxaHo7iSJBtVTTmNiphMQ.jpg',
      description: 'Classic Victorian Christmas setting',
    },
    {
      title: "Santa's Workshop",
      file: 'https://cdn1.site-media.eu/images/0/21587507/coloringpages-SantasWorkshopHyper-DetailedLineArt-HXMJtPgkf0CVY6dm6DZDdw.jpg',
      description: 'Hyper-detailed workshop scene',
    },
    {
      title: 'Gingerbread Cityscape',
      file: 'https://cdn1.site-media.eu/images/0/21587494/coloringpages-GingerbreadCityscape-Sikuj3H5mHfruzhOqXPrOg.jpg',
      description: 'Whimsical gingerbread city',
    },
  ];

  const kidsColoringSheets = [
    {
      title: 'Festive Patterns',
      file: 'https://cdn1.site-media.eu/images/0/21587509/coloringsheet2-f9nybkb9Ilb3N2Tjv0ChRw.jpg',
      description: 'Fun Christmas patterns for kids',
    },
    {
      title: 'Holiday Fun',
      file: 'https://cdn1.site-media.eu/images/0/21587515/coloringsheet5-K_VmLl_kgh-1P-4C0WD-tA.jpg',
      description: 'Kid-friendly holiday artwork',
    },
    {
      title: 'Winter Wonderland',
      file: 'https://cdn1.site-media.eu/images/0/21587506/coloringsheet6-QccnrzfbkCEPUmckBjmE9A.jpg',
      description: 'Magical winter scene',
    },
    {
      title: 'Christmas Joy',
      file: 'https://cdn1.site-media.eu/images/0/21587530/coloringsheet10-c9V0SulK6cYd1YRMhljGEQ.jpg',
      description: 'Festive design for young artists',
    },
    {
      title: 'Holiday Magic',
      file: 'https://cdn1.site-media.eu/images/0/21587501/coloringsheet12-WBA6Fy9wbtojx_ncIim57Q.jpg',
      description: 'Cheerful Christmas artwork',
    },
  ];

  const faqs = [
    {
      question: 'How quickly will I receive my designs?',
      answer:
        "Instantly! As soon as your payment is complete, you'll receive an email with download links to all your purchased designs.",
    },
    {
      question: 'What format are the designs in?',
      answer:
        'Free coloring sheets are provided as high-resolution PDF files. Santa Letters and Christmas Notes are PNG files. All designs are optimized for printing on standard 8.5" x 11" paper.',
    },
    {
      question: 'Can I use these in my classroom?',
      answer:
        'Yes! With the Teacher License, you can print unlimited copies for your students and use them in classroom activities.',
    },
    {
      question: 'Can I resell or share the digital files?',
      answer:
        'No. These are for personal or licensed classroom use only. You may not resell, redistribute, or share the digital files.',
    },
    {
      question: 'What if I have printing issues?',
      answer:
        'We recommend printing on white cardstock for best results. If you experience issues, contact us at ChristmasMagicDesigns@juldd.com',
    },
  ];

  const scrollToEmailInput = () => {
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement | null;
    if (emailInput) {
      emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      emailInput.focus();

      setEmailInputShake(true);
      setTimeout(() => setEmailInputShake(false), 500);
    }
  };

  const handleCheckout = async (productId: string, designNumber?: number) => {
    const currentEmail = email || localStorage.getItem('christmas_customer_email') || '';

    if (!currentEmail) {
      setShowEmailNotification(true);
      scrollToEmailInput();
      setTimeout(() => setShowEmailNotification(false), 4000);
      return;
    }

    if (currentEmail && currentEmail.includes('@')) {
      localStorage.setItem('christmas_customer_email', currentEmail);
    }

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/christmas-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          apikey: SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          productId,
          customerEmail: currentEmail,
          designNumber,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Checkout failed:', text);
        try {
          const parsed = JSON.parse(text);
          setFreebieMessage(parsed.error || 'Checkout failed. Please try again.');
        } catch {
          setFreebieMessage('Checkout failed. Please try again.');
        }
        return;
      }

      const data = await response.json();

      if (data.error) {
        setFreebieMessage(data.error);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        setFreebieMessage('Failed to create checkout session. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setFreebieMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 relative overflow-hidden">
      <BackgroundMusic />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />

      <PremiumSnowfall />

      <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
        <nav className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/logo_(2).png" alt="JULDD" className="h-12 w-auto" />
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a
                href="#home"
                className="text-white/90 hover:text-amber-300 transition-colors font-medium"
              >
                Home
              </a>
              <a
                href="#designs"
                className="text-white/90 hover:text-amber-300 transition-colors font-medium"
              >
                Santa Letters
              </a>
              <a
                href="#christmas-notes"
                className="text-white/90 hover:text-amber-300 transition-colors font-medium"
              >
                Christmas Notes
              </a>
              <a
                href="#adult-coloring"
                className="text-white/90 hover:text-amber-300 transition-colors font-medium"
              >
                Free Coloring
              </a>
              <a
                href="#bundle"
                className="text-white/90 hover:text-amber-300 transition-colors font-medium"
              >
                Bundle
              </a>
              <a
                href="#teachers"
                className="text-white/90 hover:text-amber-300 transition-colors font-medium"
              >
                Teachers
              </a>
              <a
                href="#faq"
                className="text-white/90 hover:text-amber-300 transition-colors font-medium"
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-4">
              <ChristmasCartButton onClick={() => setIsCartOpen(true)} />
            </div>
          </div>
        </nav>
      </header>

      <ChristmasCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        customerEmail={email}
      />

      <main className="relative z-10 pt-20">
        {showEmailNotification && (
          <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[200] animate-slideDown">
            <div className="bg-gradient-to-r from-amber-500/95 to-amber-600/95 backdrop-blur-xl border-2 border-amber-400 rounded-2xl px-8 py-4 shadow-2xl shadow-amber-500/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <p className="text-white font-semibold text-lg">
                  Please enter your email address to continue
                </p>
              </div>
            </div>
          </div>
        )}

        {/* HERO */}
        <section id="home" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-red-900/70 via-red-800/60 to-red-950/70"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(218,165,32,0.2),transparent_50%)]"></div>
          <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9InNoaW1tZXIiIHg9IjAiIHk9IjAiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0iI0RBQTUyMCIgb3BhY2l0eT0iMC4zIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI3NoaW1tZXIpIi8+PC9zdmc+')]"></div>

          <div className="container mx-auto px-6 py-24 md:py-32 relative z-10">
            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-amber-600/30 to-amber-700/30 backdrop-blur-xl border border-amber-400/40 text-amber-200 font-medium mb-6 shadow-lg shadow-amber-900/50">
                <Sparkles className="w-5 h-5 text-amber-300" />
                Limited Time Holiday Collection
              </div>

              <h1 className="text-5xl md:text-6xl font-serif text-white leading-tight tracking-tight">
                <span className="block">
                  Santa Letters &amp; Christmas Notes
                </span>
                <span className="block mt-4 text-4xl md:text-5xl text-amber-200 drop-shadow-[0_0_30px_rgba(218,165,32,0.5)]">
                  Printable Stationery &amp; Coloring Sheets
                </span>
              </h1>

              <p className="text-lg md:text-xl text-amber-100/80 max-w-2xl mx-auto leading-relaxed tracking-wide">
  Includes 14 Santa Letters · 4 Christmas Notes 
                · 10 Bonus Christmas Coloring Pages
</p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12">
                <input
                  id="hero-email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full sm:w-96 px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all ${
                    emailInputShake ? 'animate-shake border-amber-400 ring-2 ring-amber-400' : ''
                  }`}
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-8">
                <button
                  onClick={() => handleCheckout('bundle_14_999')}
                  className="group relative px-10 py-5 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white text-xl font-bold shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 overflow-hidden border-2 border-amber-400/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center gap-3">
                    <Gift className="w-6 h-6 text-amber-300" />
                    <span className="text-amber-100">Get the Full Bundle — $9.99</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const element = document.getElementById('designs');
                    element?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-10 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border-2 border-amber-400/30 text-amber-100 text-xl font-semibold hover:bg-amber-900/30 transition-all duration-300 transform hover:scale-105"
                >
                  Browse Individual Letters — $0.99
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SANTA LETTERS */}
        <section id="designs" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">14 Magical Designs</h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Each design is an original, handcrafted illustration created exclusively for this collection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {designs.map((design, index) => (
              <DesignCard
                key={index}
                number={index + 1}
                title={design.title}
                description={design.description}
                image={design.image}
                onAddToCart={() => {
                  addToCart({
                    id: `santa_letter_${index + 1}`,
                    type: 'santa_letter',
                    designNumber: index + 1,
                    name: design.title,
                    description: design.description,
                    image: design.image,
                    price: 0.99,
                  });
                }}
                isInCart={isInCart(`santa_letter_${index + 1}`)}
              />
            ))}
          </div>
        </section>

        {/* CHRISTMAS NOTES */}
        <section id="christmas-notes" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-600/30 to-red-700/30 backdrop-blur-xl border border-amber-400/40 text-amber-200 font-medium mb-6">
              <Sparkles className="w-5 h-5 text-amber-300" />
              New Christmas Notes Collection
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Christmas Notes &amp; Stationery
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
   Beautiful lined and blank note designs perfect for holiday greetings, gift tags, and Christmas messages
  <br />
  <span className="text-amber-100/90">
    Exclusive curated artwork thoughtfully crafted for holiday letters, stationery, and keepsakes.
  </span>
</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {christmasNotes.map((note, index) => {
              const noteId = `christmas_note_${index + 1}`;
              const inCart = isInCart(noteId);

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-amber-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6">
                    <div className="aspect-[3/4] bg-gradient-to-br from-white/5 to-white/10 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                      <img
                        src={note.image}
                        alt={note.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    <h3 className="text-xl font-serif text-white mb-2">{note.title}</h3>
                    <p className="text-sm text-white/70 mb-3">{note.description}</p>
                    <p className="text-lg font-bold text-white mb-3">$0.99</p>
                    <button
                      onClick={() => {
                        addToCart({
                          id: noteId,
                          type: 'christmas_note',
                          noteNumber: index + 1,
                          name: note.title,
                          description: note.description,
                          image: note.image,
                          price: 0.99,
                        });
                      }}
                      disabled={inCart}
                      className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 border border-amber-400/30 flex items-center justify-center gap-2 ${
                        inCart
                          ? 'bg-green-600/50 text-white cursor-default'
                          : 'bg-gradient-to-r from-red-600 to-red-700 text-amber-100 hover:from-red-700 hover:to-red-800'
                      }`}
                    >
                      {inCart ? (
                        <>
                          <Check className="w-4 h-4" />
                          In Cart
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <div className="mb-8">
              <p className="text-2xl text-white font-semibold mb-4">
                Individual Notes: $0.99 each
              </p>
              <p className="text-xl text-amber-200">Or get all 4 Christmas Notes for just $2.99</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <button
                onClick={() => handleCheckout('notes_bundle_299')}
                className="group relative px-8 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-amber-100 text-lg font-bold shadow-lg hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 border-2 border-amber-400/40"
              >
                <div className="relative flex items-center gap-2">Get All 4 Notes — $2.99</div>
              </button>
            </div>
          </div>
        </section>

        {/* FREE COLORING */}
        <section id="adult-coloring" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-amber-400/30 text-amber-300 font-medium mb-6">
              <Sparkles className="w-5 h-5" />
              Free Coloring Downloads
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Free Coloring Collection
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto mb-8">
              10 beautiful coloring sheets - 5 intricate designs for adults and 5 fun designs for
              kids
            </p>

            <div className="flex items-center justify-center gap-4 mb-12">
              <button
                onClick={() => setColoringTab('adult')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  coloringTab === 'adult'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-amber-100 border-2 border-amber-400/40 shadow-lg'
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                }`}
              >
                Adult Designs (5)
              </button>
              <button
                onClick={() => setColoringTab('kids')}
                className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  coloringTab === 'kids'
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-amber-100 border-2 border-amber-400/40 shadow-lg'
                    : 'bg-white/10 text-white/70 border border-white/20 hover:bg-white/20'
                }`}
              >
                Kids Designs (5)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
            {(coloringTab === 'adult' ? adultColoringSheets : kidsColoringSheets).map(
              (sheet, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl transition-all duration-500 hover:scale-105 hover:shadow-amber-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-transparent to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative p-4">
                    <div className="aspect-[3/4] bg-gradient-to-br from-white/5 to-white/10 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                      <img
                        src={sheet.file}
                        alt={sheet.title}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-sm font-serif text-white">{sheet.title}</h3>
                      <p className="text-xs text-white/70">{sheet.description}</p>
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 p-12 shadow-2xl text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-amber-500/10 animate-pulse" />

              <div className="relative z-10">
                <h3 className="text-3xl md:text-4xl font-serif text-white mb-3">
                  Get All Free Coloring Sheets
                </h3>
                <p className="text-lg text-white/80 mb-6">
                  10 beautiful designs - 5 kids sheets + 5 intricate adult sheets
                </p>

                <div className="max-w-lg mx-auto mb-8">
                  <input
                    id="coloring-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email for instant access"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all mb-4"
                  />
                </div>

                {freebieMessage && (
                  <div
                    className={`mb-6 p-4 rounded-xl ${
                      freebieMessage.includes('Success')
                        ? 'bg-green-900/40 border border-green-500/50 text-green-200'
                        : 'bg-red-900/40 border border-red-500/50 text-red-200'
                    }`}
                  >
                    {freebieMessage}
                  </div>
                )}

                <button
                  onClick={async () => {
                    if (!email) {
                      setFreebieMessage('Please enter your email address');
                      return;
                    }

                    setIsSubmittingFreebie(true);
                    setFreebieMessage(null);

                    try {
                      const response = await fetch(
                        `${SUPABASE_URL}/functions/v1/send-freebie-coloring`,
                        {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
                            apikey: SUPABASE_ANON_KEY,
                          },
                          body: JSON.stringify({ email }),
                        },
                      );

                      const data = await response.json();

                      if (!response.ok) {
                        setFreebieMessage(data.error || 'An error occurred');
                      } else {
                        setFreebieMessage(
                          'Success! Check your email for download links to all 10 coloring sheets!',
                        );
                        setEmail('');
                      }
                    } catch (error) {
                      console.error('Freebie submission error:', error);
                      setFreebieMessage('An error occurred. Please try again.');
                    } finally {
                      setIsSubmittingFreebie(false);
                    }
                  }}
                  disabled={isSubmittingFreebie}
                  className="group relative px-10 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-amber-100 text-xl font-bold shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed border-2 border-amber-400/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center gap-2">
                    {isSubmittingFreebie ? (
                      <>
                        <div className="w-5 h-5 border-4 border-amber-300 border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 text-amber-300" />
                        Get Free Coloring Sheets
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* TEACHERS */}
        <section id="teachers" className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 p-12 shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-amber-500/20">
                    <GraduationCap className="w-12 h-12 text-amber-300" />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-serif text-white">
                    Teachers Love These!
                  </h2>
                </div>

                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-400" />
                    <p className="text-xl text-white/90">Perfect for creative writing prompts</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-400" />
                    <p className="text-xl text-white/90">Beautiful classroom bulletin boards</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-400" />
                    <p className="text-xl text-white/90">Engaging holiday learning packets</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 w-2 h-2 rounded-full bg-amber-400" />
                    <p className="text-xl text-white/90">Unlimited printing with license</p>
                  </div>
                </div>

                <div className="flex justify-center">
                  <button
                    onClick={() => handleCheckout('teacher_license_499')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 to-red-700 text-amber-100 text-xl font-bold shadow-lg hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3 border-2 border-amber-400/40"
                  >
                    <Download className="w-6 h-6 text-amber-300" />
                    Add Teacher License — $4.99
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BUNDLE */}
        <section id="bundle" className="container mx-auto px-6 py-24">
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border-2 border-white/20 p-12 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-amber-500/10 animate-pulse" />

              <div className="relative z-10 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold mb-6">
                  <Star className="w-5 h-5 fill-amber-300" />
                  BEST VALUE
                  <Star className="w-5 h-5 fill-amber-300" />
                </div>

                <h2 className="text-5xl md:text-6xl font-serif text-white mb-4">
                  Get All 18 Designs
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  14 Santa Letters + 4 Christmas Notes
                </p>
                <div className="text-7xl font-bold text-amber-300 mb-8">Only $9.99</div>

                <div className="space-y-4 mb-10">
                  <div className="flex items-center justify-center gap-3 text-lg text-white/90">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Instant download - no waiting
                  </div>
                  <div className="flex items-center justify-center gap-3 text-lg text-white/90">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Unlimited personal prints
                  </div>
                  <div className="flex items-center justify-center gap-3 text-lg text-white/90">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Create lasting holiday keepsakes
                  </div>
                  <div className="flex items-center justify-center gap-3 text-lg text-white/90">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    Save Over $7 When You Bundle!
                  </div>
                </div>

                <button
                  onClick={() => handleCheckout('bundle_14_999')}
                  className="group relative px-12 py-6 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-amber-100 text-2xl font-bold shadow-2xl hover:shadow-red-500/50 transition-all duration-300 transform hover:scale-105 overflow-hidden border-2 border-amber-400/40"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                  <div className="relative flex items-center gap-3">
                    <ShoppingCart className="w-7 h-7 text-amber-300" />
                    Buy Bundle Now
                  </div>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-serif text-white text-center mb-16">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 overflow-hidden transition-all duration-300 hover:bg-white/15"
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between"
                  >
                    <span className="text-xl font-semibold text-white">{faq.question}</span>
                    <ChevronRight
                      className={`w-6 h-6 text-white/70 transition-transform duration-300 ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-8 pb-6">
                      <p className="text-white/70 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/10 mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-3">
              <img
                src="/logo_(2).png"
                alt="JULDD"
                loading="lazy"
                className="h-10 w-auto opacity-80"
              />
            </div>
            <p className="text-white/60 text-center">
              © 2025 JULDD. All rights reserved. Made with love for magical holidays.
            </p>
            <div className="flex gap-6">
              <a href="/privacy" className="text-white/60 hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="text-white/60 hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Christmas() {
  return (
    <ChristmasCartProvider>
      <ChristmasContent />
    </ChristmasCartProvider>
  );
}
