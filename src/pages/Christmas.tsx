import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  ShoppingCart,
  Download,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  Maximize2,
  Minimize2,
  X,
  Sparkles,
  Moon,
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

const GothmasGallery = ({ images, name }: { images: string[]; name: string }) => {
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [detail, setDetail] = useState(false);
  const total = images.length;
  const goPrev = () => { setDetail(false); setIndex((i) => (i - 1 + total) % total); };
  const goNext = () => { setDetail(false); setIndex((i) => (i + 1) % total); };
  const closeZoom = () => { setZoom(false); setDetail(false); };

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeZoom();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom, total]);

  const navBtn = "w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors";
  const chip = "flex items-center gap-2 rounded-full bg-zinc-900/95 border border-white/50 text-white shadow-lg transition-colors hover:bg-zinc-700";

  return (
    <div className="relative w-full h-full bg-black/30">
      <img
        src={images[index]}
        alt={name}
        loading="lazy"
        onClick={() => setZoom(true)}
        className="w-full h-full object-contain cursor-zoom-in"
      />
      {total > 1 && (
        <>
          <button type="button" onClick={goPrev} aria-label="Previous image" className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 ${navBtn}`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button type="button" onClick={goNext} aria-label="Next image" className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 ${navBtn}`}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <span className="absolute top-2 right-2 z-10 px-2 py-0.5 rounded-full bg-black/55 text-white text-xs font-medium">
            {index + 1} / {total}
          </span>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </>
      )}
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label="Enlarge image"
        className="absolute bottom-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/75 transition-colors"
      >
        <Maximize2 className="w-4 h-4" />
      </button>
      {zoom && createPortal((
        <div className="fixed inset-0 z-[120] bg-black/95 flex flex-col">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="rounded-full bg-zinc-900/95 border border-white/30 text-white/90 text-sm font-medium px-3 py-1.5 truncate">
              {name} — {index + 1} / {total}
            </span>
            <button
              type="button"
              aria-label="Close"
              onClick={closeZoom}
              className={`${chip} px-4 py-2 text-sm font-bold shrink-0`}
            >
              <X className="w-5 h-5" />
              Close
            </button>
          </div>
          <div
            className="flex-1 min-h-0 overflow-auto"
            onClick={(e) => { if ((e.target as HTMLElement).closest('img') === null) closeZoom(); }}
          >
            <div className="min-h-full w-max min-w-full mx-auto flex items-center justify-center p-2">
              <img
                src={images[index]}
                alt={name}
                onClick={(e) => { e.stopPropagation(); setDetail((d) => !d); }}
                className={detail
                  ? "max-w-none max-h-none rounded-lg cursor-zoom-out"
                  : "max-h-[78vh] max-w-[94vw] object-contain rounded-lg cursor-zoom-in"}
              />
            </div>
          </div>
          <div className="flex items-center justify-center gap-3 px-4 py-3">
            {total > 1 && (
              <button type="button" onClick={goPrev} aria-label="Previous image" className={`${chip} w-10 h-10 justify-center`}>
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <button type="button" onClick={() => setDetail((d) => !d)} className={`${chip} px-4 py-2 text-sm font-semibold`}>
              {detail ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {detail ? "Fit whole image" : "Zoom in to see details"}
            </button>
            {total > 1 && (
              <button type="button" onClick={goNext} aria-label="Next image" className={`${chip} w-10 h-10 justify-center`}>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ), document.body)}
    </div>
  );
};

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
      description: 'Charming soft watercolor design with vintage Santa and Rudolph',
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
    {
      title: "Baby's First Christmas",
      description: 'Soft pastel keepsake letter for a precious first Christmas',
      image:
        'https://drive.google.com/thumbnail?id=1p3V8Nig-5vCpIlSWTdxEnbOT06GNYwtI&sz=w1200',
    },
    {
      title: 'Reindeer Games',
      description: 'Rudolph and reindeer friends with a glowing red nose',
      image:
        'https://drive.google.com/thumbnail?id=1T4vmXr7kWTmSU7HyhJbE9a0r5MkHVDmD&sz=w1200',
    },
    {
      title: 'Julius & Gemma Christmas',
      description: 'Two panda friends trimming the tree and opening gifts',
      image:
        'https://drive.google.com/thumbnail?id=1JIG8Mngh3tnFxR5vSUfrOxvK1t0JQkzB&sz=w1200',
    },
    {
      title: "Santa's Workshop",
      description: 'Busy toy workshop with teddy bears and a wooden train',
      image:
        'https://drive.google.com/thumbnail?id=18m6YOCIXmn9eRKmDtZupmmfdKq_oqhV6&sz=w1200',
    },
    {
      title: 'North Pole Post Office',
      description: 'Special delivery - letters, stamps and parcels to Santa',
      image:
        'https://drive.google.com/thumbnail?id=1XvyWZjitTDb2fMQgXW8xOwVhGM1RI-hb&sz=w1200',
    },
    {
      title: 'The Nice List',
      description: 'Official Nice List certificate with quill and candelabra',
      image:
        'https://drive.google.com/thumbnail?id=1PFUKgPVDhONlaUxsf8GROeyrZxTjtdPZ&sz=w1200',
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

  const gothmasProducts: Array<{
    id: string;
    type: 'gothmas_ornaments' | 'gothmas_wall_art' | 'gothmas_cards' | 'gothmas_tags_wrap' | 'gothmas_countdown' | 'gothmas_collection';
    name: string;
    description: string;
    images: string[];
    price: number;
    priceId: string;
  }> = [
    {
      id: 'gothmas_ornaments',
      type: 'gothmas_ornaments',
      name: 'Ornament Design Bundle - Set of 12',
      description: 'Print at home, cut to a circle, and add to a blank ornament — flat wood or ceramic blanks, or inside clear fillable ornaments. Twelve dark celestial designs: crescent moons, a raven, black roses, and a black cat with a gold bow.',
      images: [
        'https://drive.google.com/thumbnail?id=1QG1V39MOXJFIo7hPzS7fpREjd-2W8Pvv&sz=w1200',
        'https://drive.google.com/thumbnail?id=1iNNBrxzqcYMu6EplWg0EBxpvS41tOvjg&sz=w1200',
        'https://drive.google.com/thumbnail?id=1QOMNHdRga8aAeZP_1d2J21VcRK1P5A2t&sz=w1200',
        'https://drive.google.com/thumbnail?id=18pmM_cyC7hp66AN-HyVErYGcMyqPiNwH&sz=w1200',
        'https://drive.google.com/thumbnail?id=1NeU3G7G4sbKRwiywQVXJWCAWRPKeLX_K&sz=w1200',
        'https://drive.google.com/thumbnail?id=1sZ6qJ-tfIPsLH_SFdnUekA7p5lxQxu3G&sz=w1200',
        'https://drive.google.com/thumbnail?id=1OL-urFmrVgE7F-xB5_frcL6JPGtTlqp3&sz=w1200',
        'https://drive.google.com/thumbnail?id=1j-jUUzwDNFhlfur4J9ju3cT69hI-GHc8&sz=w1200',
        'https://drive.google.com/thumbnail?id=1cJLWxprBtFoh4geXdPwj9PPIcZrPc4xS&sz=w1200',
        'https://drive.google.com/thumbnail?id=1Hj5PaQiI2t1X3Yj50SGEeYrR1ttk4MKR&sz=w1200',
        'https://drive.google.com/thumbnail?id=16x4sTyOzRpSv1eh_1gqaH4WxhsuaahzJ&sz=w1200',
        'https://drive.google.com/thumbnail?id=1ULK026bRHvJMzwMPVJkGyNzdixAo_wgW&sz=w1200',
        'https://drive.google.com/thumbnail?id=16g5d1aKPOsooWZu6qmnotQ04UpNil7X7&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPbfPBsr66TjEhQAgZ52nsc',
    },
    {
      id: 'gothmas_wall_art',
      type: 'gothmas_wall_art',
      name: 'Gothic Winter Wall Art - Set of 3',
      description: 'A snow-covered gothic cathedral, a candlelit tree, and a winter raven. Print-ready in 5x7, 8x10, and 11x14.',
      images: [
        'https://drive.google.com/thumbnail?id=1o4I_DNtXyMsODmOMXLjfswLTXATrvLmV&sz=w1200',
        'https://drive.google.com/thumbnail?id=1C79FxdiHiAP-coV48_5jdFjB0uHkRbV4&sz=w1200',
        'https://drive.google.com/thumbnail?id=1QbTrwlSd4E3hQnFcK6YI9itpei9hhcyv&sz=w1200',
        'https://drive.google.com/thumbnail?id=1i_sBlRANAmN5GqSc6nrjlAp7_9CPh0q1&sz=w1200',
      ],
      price: 2.99,
      priceId: 'price_1UPbfkBsr66TjEhQKvjSkHYW',
    },
    {
      id: 'gothmas_cards',
      type: 'gothmas_cards',
      name: 'Greeting Cards - Set of 6',
      description: 'Six folded cards with ravens, black roses, and celestial details. Blank inside, print-ready with trim guides.',
      images: [
        'https://drive.google.com/thumbnail?id=1R6q1JFviWLQSfGd8qnT77giuKaZ9aSAk&sz=w1200',
        'https://drive.google.com/thumbnail?id=1ljhFf__QvyCrQ3VqB3isPMDZWQq-1leV&sz=w1200',
        'https://drive.google.com/thumbnail?id=1zAEfuqIKSN0e3RuqkmeP2nMUgDSO0t-i&sz=w1200',
        'https://drive.google.com/thumbnail?id=1znnY9iq0OnjAIsFXoaiut4GDNdF5kSyF&sz=w1200',
        'https://drive.google.com/thumbnail?id=1dP8E09X4lxrlE1Hv8NaZO88COF7UyrZK&sz=w1200',
        'https://drive.google.com/thumbnail?id=1bAJuUAq3TyXDZ6_Hk9efCp-cBpYEvuQH&sz=w1200',
        'https://drive.google.com/thumbnail?id=1i0xe5i7LLLFhY6uO2P7h-1O_cflqCN8-&sz=w1200',
      ],
      price: 2.99,
      priceId: 'price_1UPbfnBsr66TjEhQbVsExDOc',
    },
    {
      id: 'gothmas_tags_wrap',
      type: 'gothmas_tags_wrap',
      name: 'Gift Tags and Wrap Sheets',
      description: 'Raven and rose gift tags, eight to a page with an editable-names version, plus two coordinating wrap designs.',
      images: [
        'https://drive.google.com/thumbnail?id=1JeUgCUJ62sg7xg3qfFpSh5BOEo5GRzRJ&sz=w1200',
        'https://drive.google.com/thumbnail?id=1Y82dLilJPBEUDlovngJ1lT3Ow_jhw3dS&sz=w1200',
        'https://drive.google.com/thumbnail?id=1qEEt4JKl5Ru4NbDQfUsFOBpxdR3TlxbR&sz=w1200',
        'https://drive.google.com/thumbnail?id=1HiYeoDjPBxiY_WGCGqI2R1XVJui7mbUe&sz=w1200',
      ],
      price: 2.99,
      priceId: 'price_1UPbfsBsr66TjEhQrn4uFnwN',
    },
    {
      id: 'gothmas_countdown',
      type: 'gothmas_countdown',
      name: 'Countdown Advent Cards - Set of 25',
      description: 'One card for each day from December 1 to Christmas, each with a short, cozy prompt on the back. Two sizes included.',
      images: [
        'https://drive.google.com/thumbnail?id=1sFDs-I-Sl76sVlD53GqldAit_ZW-CYIh&sz=w1200',
        'https://drive.google.com/thumbnail?id=1NRpdcl2VF9vsz_B0lKt4X8BoFXC4eIBx&sz=w1200',
        'https://drive.google.com/thumbnail?id=1YB0tQYVN-r5QNWwBrkOODnddqbV_wR0y&sz=w1200',
        'https://drive.google.com/thumbnail?id=1zp9A5rpWaf0-2sb3xXmesuimOSFC9LRV&sz=w1200',
        'https://drive.google.com/thumbnail?id=1troDpVgZplkgw8MHqymCzQJWaYRZHmc5&sz=w1200',
        'https://drive.google.com/thumbnail?id=1dC7m9rDI_B_t0XTV3x1KjsyDZHKz4Un8&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPbfvBsr66TjEhQ4fda2F6C',
    },
    {
      id: 'gothmas_collection',
      type: 'gothmas_collection',
      name: 'The Gothmas Collection - All 5 Sets',
      description: 'Every Gothmas set in one download: ornaments, wall art, greeting cards, tags and wrap, and the 25-card countdown.',
      images: [
        'https://drive.google.com/thumbnail?id=1lP0DgUDj2nAeM8FRD6X5ZiTQ5bDeJa_P&sz=w1200',
        'https://drive.google.com/thumbnail?id=1QG1V39MOXJFIo7hPzS7fpREjd-2W8Pvv&sz=w1200',
        'https://drive.google.com/thumbnail?id=1o4I_DNtXyMsODmOMXLjfswLTXATrvLmV&sz=w1200',
        'https://drive.google.com/thumbnail?id=1R6q1JFviWLQSfGd8qnT77giuKaZ9aSAk&sz=w1200',
        'https://drive.google.com/thumbnail?id=1JeUgCUJ62sg7xg3qfFpSh5BOEo5GRzRJ&sz=w1200',
        'https://drive.google.com/thumbnail?id=1sFDs-I-Sl76sVlD53GqldAit_ZW-CYIh&sz=w1200',
      ],
      price: 9.99,
      priceId: 'price_1UPbfyBsr66TjEhQaZIpki1T',
    },
  ];

  const nutcrackerProducts: Array<{
    id: string;
    type: 'nutcracker_wall_art' | 'nutcracker_coloring_wrap' | 'nutcracker_party_kit' | 'nutcracker_ornament' | 'nutcracker_cocoa_set' | 'nutcracker_collection';
    name: string;
    description: string;
    images: string[];
    price: number;
    priceId: string;
  }> = [
    {
      id: 'nutcracker_wall_art',
      type: 'nutcracker_wall_art',
      name: 'Wall Art Bundle - Set of 8',
      description: 'Eight prints from the ballet: the Nutcracker soldier, the Sugar Plum Fairy, Clara, the Mouse King, and the Land of Sweets. Print-ready in 5x7, 8x10, and 11x14.',
      images: [
        'https://drive.google.com/thumbnail?id=1j2BqPZ87PolBHBDbB3CR8vr0Q6G6iujz&sz=w1200',
        'https://drive.google.com/thumbnail?id=1vcfX9fjltDoo6aobtg_n4XtKQOc9Vgnd&sz=w1200',
        'https://drive.google.com/thumbnail?id=1u3z-23CFTZCcW9fp0_mx1js1BPo6Uks0&sz=w1200',
        'https://drive.google.com/thumbnail?id=1GMqQLP7oRfmsIF_gevgN4BYlAWP9NsF4&sz=w1200',
        'https://drive.google.com/thumbnail?id=1ZKg5JY2ePh9i_DBZzqsUZEcI8KTdO-T5&sz=w1200',
        'https://drive.google.com/thumbnail?id=1ImZCyaTesCTeVY05h7_Ziox_wxf1hLkG&sz=w1200',
        'https://drive.google.com/thumbnail?id=15AiFCJUSDO6PlHvlhL_u_386qRopiOZy&sz=w1200',
        'https://drive.google.com/thumbnail?id=11ZL2uji1guLghfaTiGNuZ0pnXKiL4xiI&sz=w1200',
        'https://drive.google.com/thumbnail?id=1TKUfO8izwbSRsUH2-uaOs0jgUyXzS5qa&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPnc7Bsr66TjEhQWXtfdtIA',
    },
    {
      id: 'nutcracker_coloring_wrap',
      type: 'nutcracker_coloring_wrap',
      name: 'Color-Your-Own Wrap & Poster',
      description: 'One big Nutcracker coloring design with a drummer soldier, tree, Sugar Plum Fairy, and candy. Print it as a poster or table cover, or use the tiled pages as gift wrap.',
      images: [
        'https://drive.google.com/thumbnail?id=1yU4pRKZuQRAER5PUEWnRFLOnS9iteOlr&sz=w1200',
        'https://drive.google.com/thumbnail?id=1BxsmbxIzSBRb3q87ZgUfc0Pue_EdLmzp&sz=w1200',
      ],
      price: 2.99,
      priceId: 'price_1UPnc9Bsr66TjEhQ6PU6D7o1',
    },
    {
      id: 'nutcracker_party_kit',
      type: 'nutcracker_party_kit',
      name: 'Party Printable Kit',
      description: 'Invitations with fill-in fields, tent place cards, a bunting banner that spells NUTCRACKER, food and drink labels, and thank-you cards.',
      images: [
        'https://drive.google.com/thumbnail?id=1qf4aHo6kazYBHqS67FlbF3yPjeGe6VhS&sz=w1200',
        'https://drive.google.com/thumbnail?id=15mtJlzAXF3MDoE8m81886es3F4nSzbMd&sz=w1200',
        'https://drive.google.com/thumbnail?id=1vBJZa5ZU2r59HkmzV8Ib2KM8WnnR3iUX&sz=w1200',
        'https://drive.google.com/thumbnail?id=1NNaEMULZzSCw-C-nRJIP2cbl-ZGOGZwV&sz=w1200',
        'https://drive.google.com/thumbnail?id=1PWpIZ_o6T33xloq2ZJhRuqokB4sbf2ac&sz=w1200',
        'https://drive.google.com/thumbnail?id=1RSoKci_sCHb3_wJokb3fsi2wiNBDcqVN&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPncCBsr66TjEhQUmAoiOba',
    },
    {
      id: 'nutcracker_ornament',
      type: 'nutcracker_ornament',
      name: 'Personalized Nutcracker Ornament',
      description: 'A toy-soldier ornament in three colorways: classic red, emerald, and plum. Open the editable PDF, type a name and year into the fields, and print.',
      images: [
        'https://drive.google.com/thumbnail?id=1b0gcki67aIL61wbP8csPggeEdhIUm07J&sz=w1200',
        'https://drive.google.com/thumbnail?id=1a3GhItwZ9vAG2qgTPa-0zASV0q2g6Gp9&sz=w1200',
        'https://drive.google.com/thumbnail?id=1oEb2P_tLKwodcm0Jh9-NNM8mxzk990BR&sz=w1200',
        'https://drive.google.com/thumbnail?id=1IjWDGJL18Hk0a-2KFm3cmDZ3h7yChg9n&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPncEBsr66TjEhQrF2AJXBG',
    },
    {
      id: 'nutcracker_cocoa_set',
      type: 'nutcracker_cocoa_set',
      name: 'Sugar Plum Cocoa Bar Set',
      description: 'A cocoa bar sign, topping labels, and recipe cards for classic, peppermint, and spiced cocoa. Plum, cream, and gold.',
      images: [
        'https://drive.google.com/thumbnail?id=1JDGrIGdvs8BHfz-5dxjixvvPoqN7s0gx&sz=w1200',
        'https://drive.google.com/thumbnail?id=1RCllKSzNERXn1EWk__WfcfgBBdSAX6AA&sz=w1200',
        'https://drive.google.com/thumbnail?id=1g_Dtns-GkqP_PFr6WT3TB-gOzBVv01v0&sz=w1200',
        'https://drive.google.com/thumbnail?id=1UUQRJrtah51BPP5JOibxZmldcdXJxaJz&sz=w1200',
        'https://drive.google.com/thumbnail?id=1VnWNBggOe_xmuaKD__w0mzFqSAsGp4Qk&sz=w1200',
        'https://drive.google.com/thumbnail?id=1FVpLfTADJfUIqY0slfjusinOTtwZS9Tg&sz=w1200',
      ],
      price: 3.99,
      priceId: 'price_1UPncHBsr66TjEhQLNju2iU7',
    },
    {
      id: 'nutcracker_collection',
      type: 'nutcracker_collection',
      name: 'The Nutcrackercore Collection - All 5 Sets',
      description: 'Every Nutcrackercore set in one download: wall art, coloring wrap and poster, party kit, personalized ornament, and the cocoa bar set.',
      images: [
        'https://drive.google.com/thumbnail?id=1jLm3CHM_fVMeBU5mw-SdkAg5u0YOQ0Bb&sz=w1200',
        'https://drive.google.com/thumbnail?id=1j2BqPZ87PolBHBDbB3CR8vr0Q6G6iujz&sz=w1200',
        'https://drive.google.com/thumbnail?id=1yU4pRKZuQRAER5PUEWnRFLOnS9iteOlr&sz=w1200',
        'https://drive.google.com/thumbnail?id=1qf4aHo6kazYBHqS67FlbF3yPjeGe6VhS&sz=w1200',
        'https://drive.google.com/thumbnail?id=1b0gcki67aIL61wbP8csPggeEdhIUm07J&sz=w1200',
        'https://drive.google.com/thumbnail?id=1JDGrIGdvs8BHfz-5dxjixvvPoqN7s0gx&sz=w1200',
      ],
      price: 9.99,
      priceId: 'price_1UPncJBsr66TjEhQVrePkRnV',
    },
  ];

  const personalizedProducts: Array<{
    id: string;
    type: 'personalized_engaged' | 'personalized_baby' | 'personalized_gingerbread' | 'personalized_year_review' | 'personalized_pet' | 'personalized_collection';
    name: string;
    description: string;
    images: string[];
    price: number;
    priceId: string;
  }> = [
    {
      id: 'personalized_engaged',
      type: 'personalized_engaged',
      name: 'Our First Christmas Engaged',
      description: 'A glossy ruby bauble with gold rings and a cream banner for your names. Type them into the editable PDF and print - no extra software needed.',
      images: [
        'https://drive.google.com/thumbnail?id=1C5zx3wQ_NFkI0-PYTb3noP_ukZ0e3o8_&sz=w1200',
        'https://drive.google.com/thumbnail?id=1VzyZlFcNQPmCkyHDEdbXSmyqWbdhSbfb&sz=w1200',
        'https://drive.google.com/thumbnail?id=1h1yZ06jF7I4tSB2wuTYxGPvbLwGaBIv6&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPo4BBsr66TjEhQ47OQNQlz',
    },
    {
      id: 'personalized_baby',
      type: 'personalized_baby',
      name: "Baby's First Christmas 2026",
      description: "A photo ornament frame in jewel rose-pink, sapphire blue, and classic red-green, with an oval window for the baby's photo. Type the name into the editable PDF and print.",
      images: [
        'https://drive.google.com/thumbnail?id=10KKiX2n-MTixBoiuYn1_LT-OP6Jx8qbF&sz=w1200',
        'https://drive.google.com/thumbnail?id=1J3Vty6DcDSpE0FDha0Uh9JoGgGSaM5kH&sz=w1200',
        'https://drive.google.com/thumbnail?id=19HwpJWNcD7ubwwxTCtAXJ8SxafIbfrm2&sz=w1200',
        'https://drive.google.com/thumbnail?id=1QNecmmMfsMKiCRgxr_unjk3p9yoy59aq&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPo4DBsr66TjEhQoBY2dpuZ',
    },
    {
      id: 'personalized_gingerbread',
      type: 'personalized_gingerbread',
      name: 'Gingerbread Name Ornaments & Tags',
      description: 'Boy, little boy, girl, and plain gingerbread figures with type-in name fields - one for every kid in the family. Hang them as tree ornaments or stocking tags.',
      images: [
        'https://drive.google.com/thumbnail?id=1edpujtt2tE26pCEgfsdN7Xu4OG_4ViT4&sz=w1200',
        'https://drive.google.com/thumbnail?id=1rnHTgcrJc4xlek6yxg79eFYyNJl3yvdw&sz=w1200',
        'https://drive.google.com/thumbnail?id=1AU2Wh__9zz8bJp9IeJJBcVBFy8KH0U_-&sz=w1200',
        'https://drive.google.com/thumbnail?id=1vMVbM_5ek4hLq6S7aKWDHE15S3d16lc-&sz=w1200',
        'https://drive.google.com/thumbnail?id=1SoFbsOORpkKdvY-T6MsRS3p2XNTMzdib&sz=w1200',
      ],
      price: 2.99,
      priceId: 'price_1UPo4FBsr66TjEhQw4HquAvT',
    },
    {
      id: 'personalized_year_review',
      type: 'personalized_year_review',
      name: 'The 2026 Year in Review',
      description: "A keepsake ornament card with your family name and five lines for the year's big moments - a move, a new baby, a wedding. Type yours into the editable PDF and print.",
      images: [
        'https://drive.google.com/thumbnail?id=1ub0Yzh0oNzZxSrVtQLNlJdchs0GI2GW6&sz=w1200',
        'https://drive.google.com/thumbnail?id=1RXB_LyytICrA_b-W1_2ZLHW8QnGqhd9w&sz=w1200',
        'https://drive.google.com/thumbnail?id=1H9hKY9_eM-DgAGutWYj15JTNsLEhwRp-&sz=w1200',
      ],
      price: 3.99,
      priceId: 'price_1UPo4HBsr66TjEhQPsaoETnj',
    },
    {
      id: 'personalized_pet',
      type: 'personalized_pet',
      name: "Pet's First Christmas",
      description: "A paw-print photo frame for the dog or cat who joined the family this year, with a puppy and kitten under the oval window. Type the name and year into the editable PDF and print.",
      images: [
        'https://drive.google.com/thumbnail?id=1qL9tYLa4d-8UNvdDxU8F-c5mk60skJVR&sz=w1200',
        'https://drive.google.com/thumbnail?id=1Tkcsr5528Mx3fB6HlQSQC7W447Vi6Y6y&sz=w1200',
        'https://drive.google.com/thumbnail?id=1beYQCgUjb8v2gtXxZdBTpmQMfC1XJYOQ&sz=w1200',
      ],
      price: 4.99,
      priceId: 'price_1UPo4KBsr66TjEhQQTrj8HzZ',
    },
    {
      id: 'personalized_collection',
      type: 'personalized_collection',
      name: 'The Personalized Collection - All 5 Sets',
      description: "Every Personalized Ornaments set in one download: the engaged ornament, baby's first Christmas, gingerbread tags, the year in review, and pet's first Christmas.",
      images: [
        'https://drive.google.com/thumbnail?id=1Q3QRmfHhic7K19rTULU3XYyAWnJZK2-A&sz=w1200',
        'https://drive.google.com/thumbnail?id=1C5zx3wQ_NFkI0-PYTb3noP_ukZ0e3o8_&sz=w1200',
        'https://drive.google.com/thumbnail?id=10KKiX2n-MTixBoiuYn1_LT-OP6Jx8qbF&sz=w1200',
        'https://drive.google.com/thumbnail?id=1edpujtt2tE26pCEgfsdN7Xu4OG_4ViT4&sz=w1200',
        'https://drive.google.com/thumbnail?id=1ub0Yzh0oNzZxSrVtQLNlJdchs0GI2GW6&sz=w1200',
        'https://drive.google.com/thumbnail?id=1qL9tYLa4d-8UNvdDxU8F-c5mk60skJVR&sz=w1200',
      ],
      price: 9.99,
      priceId: 'price_1UPo4MBsr66TjEhQMIEzjICq',
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
      question: 'How do I personalize an editable design?',
      answer:
        'Right inside the PDF — no Canva account and no special software needed. Open the editable PDF in any free PDF reader (like Adobe Acrobat Reader, or the PDF viewer built into your web browser), click the name field, type your names or message, and print. Every editable listing also includes a filled sample so you can see the finished look, print-ready files, and a short instruction sheet.',
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
        },
        body: JSON.stringify({
          productId,
          email: currentEmail,
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
        const newWindow = window.open(data.url, '_blank');
        if (!newWindow || newWindow.closed) {
          window.location.href = data.url;
        }
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
                href="#gothmas"
                className="text-purple-200 hover:text-white transition-colors font-semibold border border-purple-400/50 rounded-full px-4 py-1.5 bg-purple-500/20 hover:bg-purple-500/40"
              >
                Gothmas
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-950">New</span>
              </a>
              <a
                href="#nutcrackercore"
                className="text-red-200 hover:text-white transition-colors font-semibold border border-red-400/50 rounded-full px-4 py-1.5 bg-red-500/20 hover:bg-red-500/40"
              >
                Nutcrackercore
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-950">New</span>
              </a>
              <a
                href="#personalized"
                className="text-emerald-200 hover:text-white transition-colors font-semibold border border-emerald-400/50 rounded-full px-4 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/40"
              >
                Personalized
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-950">New</span>
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
              <a
                href="#gothmas"
                className="md:hidden text-purple-200 font-semibold border border-purple-400/50 rounded-full px-3 py-1.5 bg-purple-500/20"
              >
                Gothmas
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-purple-950">New</span>
              </a>
              <a
                href="#nutcrackercore"
                className="md:hidden text-red-200 font-semibold border border-red-400/50 rounded-full px-3 py-1.5 bg-red-500/20"
              >
                Nutcrackercore
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-950">New</span>
              </a>
              <a
                href="#personalized"
                className="md:hidden text-emerald-200 font-semibold border border-emerald-400/50 rounded-full px-3 py-1.5 bg-emerald-500/20"
              >
                Personalized
                <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-950">New</span>
              </a>
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
  Includes 20 Santa Letters · 4 Christmas Notes 
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

        {/* NEW FOR 2026 COLLECTIONS BANNER */}
        <section className="container mx-auto px-6 pt-16 relative z-10">
          <p className="text-center text-amber-300 font-semibold uppercase tracking-[0.25em] text-sm mb-6">
            New for 2026 — Three New Collections
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <a
              href="#gothmas"
              className="block rounded-3xl border border-purple-400/30 bg-gradient-to-br from-purple-950/80 via-purple-900/60 to-slate-900/80 backdrop-blur-xl px-7 py-7 shadow-2xl shadow-purple-950/50 hover:border-purple-300/60 transition-colors"
            >
              <Moon className="w-9 h-9 text-purple-300 mb-4" />
              <h3 className="text-2xl font-serif text-white mb-2">The Gothmas Collection</h3>
              <p className="text-purple-100/70 text-sm leading-relaxed mb-5">
                Christmas, but darker: printable ornaments, gothic wall art, greeting cards,
                gift tags and wrap, and a 25-day countdown — in black, burgundy, and gold.
              </p>
              <span className="inline-block px-6 py-3 rounded-2xl bg-purple-500/80 text-white font-semibold shadow-lg shadow-purple-900/50">
                Shop Gothmas
              </span>
            </a>
            <a
              href="#nutcrackercore"
              className="block rounded-3xl border border-red-400/30 bg-gradient-to-br from-red-950/80 via-rose-900/50 to-slate-900/80 backdrop-blur-xl px-7 py-7 shadow-2xl shadow-red-950/50 hover:border-red-300/60 transition-colors"
            >
              <Sparkles className="w-9 h-9 text-red-300 mb-4" />
              <h3 className="text-2xl font-serif text-white mb-2">Nutcrackercore</h3>
              <p className="text-red-100/70 text-sm leading-relaxed mb-5">
                A Nutcracker Christmas: storybook wall art, a printable party kit, a
                personalized ornament, and a Sugar Plum cocoa bar set.
              </p>
              <span className="inline-block px-6 py-3 rounded-2xl bg-red-600/80 text-white font-semibold shadow-lg shadow-red-900/50">
                Shop Nutcrackercore
              </span>
            </a>
            <a
              href="#personalized"
              className="block rounded-3xl border border-emerald-400/30 bg-gradient-to-br from-emerald-950/80 via-emerald-900/50 to-slate-900/80 backdrop-blur-xl px-7 py-7 shadow-2xl shadow-emerald-950/50 hover:border-emerald-300/60 transition-colors"
            >
              <Gift className="w-9 h-9 text-emerald-300 mb-4" />
              <h3 className="text-2xl font-serif text-white mb-2">Personalized Ornaments</h3>
              <p className="text-emerald-100/70 text-sm leading-relaxed mb-5">
                Their name on the tree: editable ornaments for newlyweds, baby's first
                Christmas, pets, and gingerbread name tags for the whole family.
              </p>
              <span className="inline-block px-6 py-3 rounded-2xl bg-emerald-600/80 text-white font-semibold shadow-lg shadow-emerald-900/50">
                Shop Personalized
              </span>
            </a>
          </div>
        </section>

        {/* SANTA LETTERS */}
        <section id="designs" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">20 Magical Designs</h2>
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
              Christmas Notes Collection
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Christmas Notes &amp; Stationery
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
   Beautiful lined and blank note designs perfect for holiday greetings, gift tags, and Christmas messages
  <br />
  <span className="text-amber-100/90">
    Exclusive artwork created only for this collection.
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
                  The Christmas Classics Bundle
                </h2>
                <p className="text-xl text-white/80 mb-4">
                  20 Santa Letters + 4 Christmas Notes
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

        {/* ABOUT */}
        <section id="about" className="container mx-auto px-6 py-24">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-amber-300 font-semibold uppercase tracking-[0.25em] text-sm mb-6">
              About the shop
            </p>
            <h2 className="text-4xl md:text-5xl font-serif text-white mb-6">
              Made for magical Christmases
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-8">
              ChristmasFun.store is a small independent shop creating original printable
              Christmas designs — Santa letters, stationery, wall art, greeting cards, and
              more. Every design is made in-house, delivered instantly by email, and prints
              beautifully at home on standard paper.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-5">
                <p className="text-amber-200 font-semibold mb-1">Instant download</p>
                <p className="text-sm text-white/70">Links arrive by email right after checkout</p>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-5">
                <p className="text-amber-200 font-semibold mb-1">Print at home</p>
                <p className="text-sm text-white/70">Designed for standard 8.5&Prime; x 11&Prime; paper</p>
              </div>
              <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-5">
                <p className="text-amber-200 font-semibold mb-1">Original artwork</p>
                <p className="text-sm text-white/70">Every design created for this shop</p>
              </div>
            </div>
            <p className="text-white/70">
              Questions about an order or a design? Write to{' '}
              <a href="mailto:ChristmasMagicDesigns@juldd.com" className="text-amber-300 hover:underline font-medium">
                ChristmasMagicDesigns@juldd.com
              </a>{' '}
              — a real person reads every message.
            </p>
          </div>
        </section>

        {/* FAQ */}
        {/* GOTHMAS COLLECTION */}
        <section id="gothmas" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-600/30 to-indigo-700/30 backdrop-blur-xl border border-purple-300/40 text-purple-100 font-medium mb-6">
              <Moon className="w-5 h-5 text-purple-200" />
              New for 2026 - The Gothmas Collection
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Gothmas - A Darker Kind of Christmas
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Black, burgundy, deep green, and gold. Printable ornaments, wall art, cards, and a countdown
              for the people whose Christmas runs a little darker - elegant, never scary.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gothmasProducts.map((product) => {
              const inCart = isInCart(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-purple-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-transparent to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6">
                    <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                      <GothmasGallery images={product.images} name={product.name} />
                    </div>
                    <h3 className="text-xl font-serif text-white mb-2">{product.name}</h3>
                    <p className="text-sm text-white/70 mb-3">{product.description}</p>
                    <p className="text-lg font-bold text-white mb-3">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          type: product.type,
                          name: product.name,
                          description: product.description,
                          image: product.images[0],
                          price: product.price,
                          priceId: product.priceId,
                        });
                      }}
                      disabled={inCart}
                      className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 border border-purple-300/30 flex items-center justify-center gap-2 ${
                        inCart
                          ? 'bg-green-600/50 text-white cursor-default'
                          : 'bg-gradient-to-r from-purple-600 to-indigo-700 text-purple-50 hover:from-purple-700 hover:to-indigo-800'
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

          <div className="text-center mt-12">
            <p className="text-xl text-purple-100/90">
              Every set is an instant download - print at home for your own tree, mantel, cards, and gifts.
            </p>
          </div>
        </section>


        {/* NUTCRACKERCORE COLLECTION */}
        <section id="nutcrackercore" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-amber-300 font-semibold uppercase tracking-[0.25em] text-sm mb-4">
              New for 2026
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-red-600/30 to-amber-600/30 backdrop-blur-xl border border-red-300/40 text-red-100 font-medium mb-6">
              <Sparkles className="w-5 h-5 text-amber-200" />
              The Nutcrackercore Collection
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Nutcrackercore - A Nutcracker Christmas
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Ruby, emerald, deep plum, and gold. Printable wall art, a party kit, a color-your-own wrap,
              and a personalized ornament, all drawn from the ballet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nutcrackerProducts.map((product) => {
              const inCart = isInCart(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-red-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 via-transparent to-amber-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6">
                    <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                      <GothmasGallery images={product.images} name={product.name} />
                    </div>
                    <h3 className="text-xl font-serif text-white mb-2">{product.name}</h3>
                    <p className="text-sm text-white/70 mb-3">{product.description}</p>
                    <p className="text-lg font-bold text-white mb-3">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          type: product.type,
                          name: product.name,
                          description: product.description,
                          image: product.images[0],
                          price: product.price,
                          priceId: product.priceId,
                        });
                      }}
                      disabled={inCart}
                      className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 border border-red-300/30 flex items-center justify-center gap-2 ${
                        inCart
                          ? 'bg-green-600/50 text-white cursor-default'
                          : 'bg-gradient-to-r from-red-700 to-rose-800 text-red-50 hover:from-red-800 hover:to-rose-900'
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

          <div className="text-center mt-12">
            <p className="text-xl text-red-100/90">
              Every set is an instant download - print at home for the party, the mantel, and the tree.
            </p>
          </div>
        </section>


        {/* PERSONALIZED ORNAMENTS COLLECTION */}
        <section id="personalized" className="container mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <p className="text-amber-300 font-semibold uppercase tracking-[0.25em] text-sm mb-4">
              New for 2026
            </p>
            <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600/30 to-green-700/30 backdrop-blur-xl border border-emerald-300/40 text-emerald-100 font-medium mb-6">
              <Sparkles className="w-5 h-5 text-emerald-200" />
              The Personalized Ornaments Collection
            </div>
            <h2 className="text-5xl md:text-6xl font-serif text-white mb-6">
              Personalized Ornaments - Their Name on the Tree
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
              Deep emerald, ruby, and glowing gold. Editable ornaments for engagements, new babies, new
              pets, and the whole family - type the names into the PDF and print at home. No extra software needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {personalizedProducts.map((product) => {
              const inCart = isInCart(product.id);

              return (
                <div
                  key={product.id}
                  className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-500 hover:scale-105 hover:shadow-emerald-500/30"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-green-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative p-6">
                    <div className="aspect-[4/3] bg-gradient-to-br from-white/5 to-white/10 rounded-2xl mb-4 flex items-center justify-center overflow-hidden">
                      <GothmasGallery images={product.images} name={product.name} />
                    </div>
                    <h3 className="text-xl font-serif text-white mb-2">{product.name}</h3>
                    <p className="text-sm text-white/70 mb-3">{product.description}</p>
                    <p className="text-lg font-bold text-white mb-3">${product.price.toFixed(2)}</p>
                    <button
                      onClick={() => {
                        addToCart({
                          id: product.id,
                          type: product.type,
                          name: product.name,
                          description: product.description,
                          image: product.images[0],
                          price: product.price,
                          priceId: product.priceId,
                        });
                      }}
                      disabled={inCart}
                      className={`w-full py-2 px-4 rounded-xl font-semibold transition-all duration-300 border border-emerald-300/30 flex items-center justify-center gap-2 ${
                        inCart
                          ? 'bg-green-600/50 text-white cursor-default'
                          : 'bg-gradient-to-r from-emerald-700 to-green-800 text-emerald-50 hover:from-emerald-800 hover:to-green-900'
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

          <div className="text-center mt-12">
            <p className="text-xl text-emerald-100/90">
              Every set is an instant download - type in the names, print at home, and hang them on the tree.
            </p>
          </div>
        </section>

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
              © 2026 JULDD. All rights reserved. Made with love for magical holidays.
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
