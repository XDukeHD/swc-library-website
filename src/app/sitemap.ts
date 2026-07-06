import { MetadataRoute } from 'next';
import { db } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://swclibrary.online';

  // Fetch games, categories, and publishers
  const games = await db.getGames();
  const categories = await db.getCategories();
  const publishers = await db.getPublishers();

  const gameUrls = games.map((game) => ({
    url: `${baseUrl}/roms/${game.slug}`,
    lastModified: game.updated_at ? new Date(game.updated_at) : new Date(game.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryUrls = categories.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  const publisherUrls = publishers.map((pub) => ({
    url: `${baseUrl}/publisher/${pub.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/category`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...gameUrls,
    ...categoryUrls,
    ...publisherUrls,
  ];
}
