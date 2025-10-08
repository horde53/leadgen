import { NextApiRequest, NextApiResponse } from 'next';
import puppeteer from 'puppeteer';

interface ScrapedLead {
  id: string;
  name: string;
  category: string;
  rating: string;
  address: string;
  website?: string;
  reviews_count: number;
  scraped_at: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, location } = req.body;

    if (!query || !location) {
      return res.status(400).json({ error: 'Query and location are required' });
    }

    // Inicia o browser em background
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    
    // Simula browser real
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    // Vai para o Google Maps
    const searchUrl = `https://maps.google.com/search/${encodeURIComponent(query)}+${encodeURIComponent(location)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    // Aguarda os resultados carregarem
    await page.waitForSelector('.Nv2PK', { timeout: 10000 });

    // Extrai os dados dos resultados
    const results = await page.evaluate(() => {
      const cards = document.querySelectorAll('.Nv2PK');
      const leads: ScrapedLead[] = [];

      cards.forEach((card, index) => {
        const nameElement = card.querySelector('.fontHeadlineSmall');
        const addressElement = card.querySelector('.fontBodyMedium');
        const ratingElement = card.querySelector('.fontDisplaySmall');
        const websiteElement = card.querySelector('[data-value="Website"]');

        if (nameElement && addressElement) {
          leads.push({
            id: `lead_${Date.now()}_${index}`,
            name: nameElement.textContent?.trim() || '',
            category: 'Negócio Local',
            rating: ratingElement?.textContent?.trim() || 'N/A',
            address: addressElement.textContent?.trim() || '',
            website: websiteElement?.getAttribute('href') || undefined,
            reviews_count: Math.floor(Math.random() * 100) + 1, // Mock
            scraped_at: new Date().toISOString()
          });
        }
      });

      return leads;
    });

    await browser.close();

    // Retorna os resultados
    res.status(200).json({
      success: true,
      count: results.length,
      leads: results,
      search_query: `${query} - ${location}`
    });

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}