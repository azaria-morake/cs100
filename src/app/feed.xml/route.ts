import { getArticles } from '@/lib/firebase/articles';

export async function GET() {
  const articles = await getArticles();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://distantcs.org';

  const itemsXml = articles
    .map((art) => {
      const pubDate = art.publishedAt ? new Date(art.publishedAt).toUTCString() : new Date().toUTCString();
      const articleUrl = `${siteUrl}/dissections/${art.slug}`;
      const description = art.lead || '';
      
      return `
    <item>
      <title><![CDATA[${art.title}]]></title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${art.category}]]></category>
      <author><![CDATA[${art.author}]]></author>
      <description><![CDATA[${description}]]></description>
    </item>`;
    })
    .join('');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Distant CS — No Fear, No Favor Computational Theory</title>
    <link>${siteUrl}</link>
    <description>Resource-Agnostic Computational Theory, Systems Architecture, and Empirical Latency Audits.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${itemsXml}
  </channel>
</rss>`;

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
