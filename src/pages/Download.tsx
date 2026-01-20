import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download as DownloadIcon, Loader2, AlertCircle, Home, FileDown } from 'lucide-react';

const PRODUCT_FILES: Record<string, { name: string; files: { label: string; url: string }[] }> = {
  'santa-letter': {
    name: 'Santa Letter',
    files: [
      { label: 'Santa Letter Design', url: 'https://cdn1.site-media.eu/images/0/21587768/design1-Z3wu6c1nLAh3ACrbe46Gmg.png' },
    ],
  },
  'christmas-note': {
    name: 'Christmas Note',
    files: [
      { label: 'Christmas Note Design', url: 'https://cdn1.site-media.eu/images/0/21587536/ChristmasNotes-RFAy0MOttbNqrOGEc3EkCg.png' },
    ],
  },
  'notes-bundle': {
    name: 'Christmas Notes Bundle',
    files: [
      { label: 'Vintage Christmas Notes Lined', url: 'https://cdn1.site-media.eu/images/0/21587536/ChristmasNotes-RFAy0MOttbNqrOGEc3EkCg.png' },
      { label: "Santa's Workshop Notes Lined", url: 'https://cdn1.site-media.eu/images/0/21587693/ChristmasNotes3-lined-J0xhPIRuUzj56rqkQCSn0A.png' },
      { label: "Santa's Workshop Notes", url: 'https://cdn1.site-media.eu/images/0/21587575/ChristmasNotes3-KfzspG5RqPBYZ-u3jxt5tQ.png' },
      { label: 'Vintage Christmas Notes', url: 'https://cdn1.site-media.eu/images/0/21587542/ChristmasNotes-blank-FeUDnrdQLKzZkZEYLgmt-A.png' },
    ],
  },
  'all-18-bundle': {
    name: 'Complete Collection (All 18 Designs)',
    files: [
      { label: 'Design 1 - Vintage Storybook Santa', url: 'https://cdn1.site-media.eu/images/0/21587768/design1-Z3wu6c1nLAh3ACrbe46Gmg.png' },
      { label: 'Design 2 - Christmas Eve Heartside', url: 'https://cdn1.site-media.eu/images/0/21587759/design2-Xs-oos-r7fL_Gn4-yusolg.png' },
      { label: 'Design 3 - Snowy Cutie Santa', url: 'https://cdn1.site-media.eu/images/0/21587758/design3-rpLHL3OeUCdrIqzMr7wNYA.png' },
      { label: 'Design 4 - Felt Santa Reindeer', url: 'https://cdn1.site-media.eu/images/0/21587450/DearSanta2-EyDV0P1Wf8rh1mYm0lQwew.png' },
      { label: 'Design 5 - Felt Santa Elves', url: 'https://cdn1.site-media.eu/images/0/21587438/DearSantaLetter-X4mrLdblVYGmVh_xVEIdhg.png' },
      { label: 'Design 6 - Snowflake Wonder', url: 'https://cdn1.site-media.eu/images/0/21587392/DearSantaLetter4-_CjR-X24vAzawUhHvsEB7A.png' },
      { label: 'Design 7 - Bold Metallic Shine', url: 'https://cdn1.site-media.eu/images/0/21587432/DearSantaLetter1-Gr0SVAqpn4KVS5U8qkGlfQ.png' },
      { label: 'Design 8 - Bold Faux Glitter', url: 'https://cdn1.site-media.eu/images/0/21587416/DearSantaLetter2-3iGVMx_c3Va-NcPSt486AA.png' },
      { label: 'Design 9 - Gamer', url: 'https://cdn1.site-media.eu/images/0/21587763/design9-be-BNu7ELngHsB4-prRBsw.png' },
      { label: 'Design 10 - Fortnite Inspired', url: 'https://cdn1.site-media.eu/images/0/21587361/DearSantaLetter8-7XA4wULg3muTEB7z7NkmXg.png' },
      { label: 'Design 11 - Bold Santa Reindeer', url: 'https://cdn1.site-media.eu/images/0/21587888/design11-y92iFyQtYnasvWXozYAjTg.png' },
      { label: 'Design 12 - Comic Bold Glitter', url: 'https://cdn1.site-media.eu/images/0/21587761/design12-mVBhwMJJ1BEl0y8ocesZlQ.png' },
      { label: 'Design 13 - Roblox Inspired', url: 'https://cdn1.site-media.eu/images/0/21587363/DearSantaLetter7-hENBo0gX6c_LqXxJD56whQ.png' },
      { label: 'Design 14 - Traditional Glitter', url: 'https://cdn1.site-media.eu/images/0/21587399/DearSantaLetter3-PmrmOxSHQkpwG_jKh2M2vQ.png' },
      { label: 'Christmas Note 1 - Vintage Lined', url: 'https://cdn1.site-media.eu/images/0/21587536/ChristmasNotes-RFAy0MOttbNqrOGEc3EkCg.png' },
      { label: 'Christmas Note 2 - Workshop Lined', url: 'https://cdn1.site-media.eu/images/0/21587693/ChristmasNotes3-lined-J0xhPIRuUzj56rqkQCSn0A.png' },
      { label: 'Christmas Note 3 - Workshop Blank', url: 'https://cdn1.site-media.eu/images/0/21587575/ChristmasNotes3-KfzspG5RqPBYZ-u3jxt5tQ.png' },
      { label: 'Christmas Note 4 - Vintage Blank', url: 'https://cdn1.site-media.eu/images/0/21587542/ChristmasNotes-blank-FeUDnrdQLKzZkZEYLgmt-A.png' },
    ],
  },
  'teacher-license': {
    name: 'Teacher License Bundle',
    files: [
      { label: 'Teacher License Certificate', url: 'https://cdn1.site-media.eu/images/0/21587768/design1-Z3wu6c1nLAh3ACrbe46Gmg.png' },
      { label: 'All 14 Santa Letters (ZIP)', url: 'https://cdn1.site-media.eu/images/0/21587768/design1-Z3wu6c1nLAh3ACrbe46Gmg.png' },
      { label: 'All 4 Christmas Notes (ZIP)', url: 'https://cdn1.site-media.eu/images/0/21587536/ChristmasNotes-RFAy0MOttbNqrOGEc3EkCg.png' },
    ],
  },
  'free-coloring': {
    name: 'Free Coloring Sheets',
    files: [
      { label: 'Intricate Mandala Wreath', url: 'https://cdn1.site-media.eu/images/0/21587522/coloringsheet-IntricateMandalaChristmasWreath-N0MesPRJvpIQqMoOqSjpLA.jpg' },
      { label: 'Ornamental Tree', url: 'https://cdn1.site-media.eu/images/0/21587521/coloringsheet-OrnamentalChristmasTreeWithFiligreePatterns-iK1VBjuqWCToeWeFUV82TQ.jpg' },
      { label: 'Victorian Street Scene', url: 'https://cdn1.site-media.eu/images/0/21587716/coloringsheet-VictorianChristmasStreetScene-uFxaHo7iSJBtVTTmNiphMQ.jpg' },
      { label: "Santa's Workshop", url: 'https://cdn1.site-media.eu/images/0/21587507/coloringpages-SantasWorkshopHyper-DetailedLineArt-HXMJtPgkf0CVY6dm6DZDdw.jpg' },
      { label: 'Gingerbread Cityscape', url: 'https://cdn1.site-media.eu/images/0/21587494/coloringpages-GingerbreadCityscape-Sikuj3H5mHfruzhOqXPrOg.jpg' },
      { label: 'Festive Patterns (Kids)', url: 'https://cdn1.site-media.eu/images/0/21587509/coloringsheet2-f9nybkb9Ilb3N2Tjv0ChRw.jpg' },
      { label: 'Holiday Fun (Kids)', url: 'https://cdn1.site-media.eu/images/0/21587515/coloringsheet5-K_VmLl_kgh-1P-4C0WD-tA.jpg' },
      { label: 'Winter Wonderland (Kids)', url: 'https://cdn1.site-media.eu/images/0/21587506/coloringsheet6-QccnrzfbkCEPUmckBjmE9A.jpg' },
      { label: 'Christmas Joy (Kids)', url: 'https://cdn1.site-media.eu/images/0/21587530/coloringsheet10-c9V0SulK6cYd1YRMhljGEQ.jpg' },
      { label: 'Holiday Magic (Kids)', url: 'https://cdn1.site-media.eu/images/0/21587501/coloringsheet12-WBA6Fy9wbtojx_ncIim57Q.jpg' },
    ],
  },
};

export default function Download() {
  const { productId } = useParams<{ productId: string }>();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<{ name: string; files: { label: string; url: string }[] } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productId && PRODUCT_FILES[productId]) {
        setProduct(PRODUCT_FILES[productId]);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [productId]);

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch {
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-400 animate-spin mx-auto mb-4" />
          <p className="text-white/70">Loading your downloads...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Product Not Found</h1>
          <p className="text-white/70 mb-6">
            We couldn't find the download you're looking for. Please check your email for the correct download link.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold hover:from-red-700 hover:to-red-800 transition-all"
          >
            <Home className="w-5 h-5" />
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <DownloadIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Your Downloads</h1>
          <p className="text-xl text-amber-300 font-medium">{product.name}</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-2">Download Instructions</h2>
            <ul className="text-white/70 text-sm space-y-1">
              <li>- Click each download button to save the file</li>
              <li>- If it opens in a new tab, right-click and "Save As"</li>
              <li>- Print at 100% scale on 8.5" x 11" paper</li>
              <li>- Cardstock paper gives the best results</li>
            </ul>
          </div>

          <div className="space-y-3">
            {product.files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileDown className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-medium">{file.label}</span>
                </div>
                <button
                  onClick={() => handleDownload(file.url, `${file.label.replace(/\s+/g, '_')}.png`)}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold text-sm hover:from-green-600 hover:to-emerald-700 transition-all flex items-center gap-2"
                >
                  <DownloadIcon className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-white/60 text-sm mb-4">
              Need help? Contact us at{' '}
              <a href="mailto:support@juldd.com" className="text-amber-400 hover:underline">
                support@juldd.com
              </a>
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors"
            >
              <Home className="w-4 h-4" />
              Return to Store
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
