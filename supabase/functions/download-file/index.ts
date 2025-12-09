import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': '*',
};

const FILES: Record<string, { url: string; filename: string }> = {
  'kids-1': { url: 'https://cdn1.site-media.eu/images/0/21587509/coloringsheet2-f9nybkb9Ilb3N2Tjv0ChRw.jpg', filename: 'Festive-Patterns-1.jpg' },
  'kids-2': { url: 'https://cdn1.site-media.eu/images/0/21587515/coloringsheet5-K_VmLl_kgh-1P-4C0WD-tA.jpg', filename: 'Holiday-Design-1.jpg' },
  'kids-3': { url: 'https://cdn1.site-media.eu/images/0/21587506/coloringsheet6-QccnrzfbkCEPUmckBjmE9A.jpg', filename: 'Winter-Wonderland.jpg' },
  'kids-4': { url: 'https://cdn1.site-media.eu/images/0/21587530/coloringsheet10-c9V0SulK6cYd1YRMhljGEQ.jpg', filename: 'Christmas-Elegance.jpg' },
  'kids-5': { url: 'https://cdn1.site-media.eu/images/0/21587501/coloringsheet12-WBA6Fy9wbtojx_ncIim57Q.jpg', filename: 'Holiday-Magic.jpg' },
  'adult-1': { url: 'https://cdn1.site-media.eu/images/0/21587522/coloringsheet-IntricateMandalaChristmasWreath-N0MesPRJvpIQqMoOqSjpLA.jpg', filename: 'Intricate-Mandala-Wreath.jpg' },
  'adult-2': { url: 'https://cdn1.site-media.eu/images/0/21587521/coloringsheet-OrnamentalChristmasTreeWithFiligreePatterns-iK1VBjuqWCToeWeFUV82TQ.jpg', filename: 'Ornamental-Tree.jpg' },
  'adult-3': { url: 'https://cdn1.site-media.eu/images/0/21587716/coloringsheet-VictorianChristmasStreetScene-uFxaHo7iSJBtVTTmNiphMQ.jpg', filename: 'Victorian-Street-Scene.jpg' },
  'adult-4': { url: 'https://cdn1.site-media.eu/images/0/21587507/coloringpages-SantasWorkshopHyper-DetailedLineArt-HXMJtPgkf0CVY6dm6DZDdw.jpg', filename: 'Santas-Workshop.jpg' },
  'adult-5': { url: 'https://cdn1.site-media.eu/images/0/21587494/coloringpages-GingerbreadCityscape-Sikuj3H5mHfruzhOqXPrOg.jpg', filename: 'Gingerbread-Cityscape.jpg' },
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get('file');

    if (!fileId || !FILES[fileId]) {
      return new Response('File not found', { status: 404, headers: corsHeaders });
    }

    const fileInfo = FILES[fileId];
    const response = await fetch(fileInfo.url);
    
    if (!response.ok) {
      return new Response('Failed to fetch file', { status: 500, headers: corsHeaders });
    }

    const fileData = await response.arrayBuffer();

    return new Response(fileData, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'image/jpeg',
        'Content-Disposition': `attachment; filename="${fileInfo.filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return new Response('Download failed', { status: 500, headers: corsHeaders });
  }
});