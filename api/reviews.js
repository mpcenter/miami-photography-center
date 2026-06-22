// Vercel Serverless Function — Google reviews for the site.
// Fetches up to 5 reviews + overall rating from the Google Places API (New)
// and caches them at the edge so we make very few API calls (stays within
// Google's free monthly credit). Returns {ok:false, reviews:[]} when not
// configured or on error, so the UI just hides gracefully.
//
// Env vars (set in the Vercel project):
//   GOOGLE_PLACES_API_KEY  — API key with "Places API (New)" enabled
//   GOOGLE_PLACE_ID        — the business Place ID

// Trim to tolerate stray spaces/newlines pasted into the dashboard values.
const API_KEY = (process.env.GOOGLE_PLACES_API_KEY || process.env.google_places_api_key || '').trim();
// Place ID is public + stable, so it's hardcoded here (only the API key is a
// secret kept in env). Hardcoded outright because the env var holds a wrong
// pasted value; the GOOGLE_PLACE_ID env var is no longer used.
const PLACE_ID = 'ChIJMZHpzKqt2YgRGuM9p0PfTh4'; // Miami Photography Center (5★)

export default async function handler(req, res) {
  if (!API_KEY || !PLACE_ID) {
    return res.status(200).json({ ok: false, reviews: [], error: 'not_configured' });
  }

  try {
    const r = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(PLACE_ID)}?languageCode=es`,
      {
        headers: {
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'rating,userRatingCount,googleMapsUri,reviews',
        },
      }
    );

    if (!r.ok) {
      const detail = await r.text();
      return res.status(200).json({ ok: false, reviews: [], error: 'api_error', detail });
    }

    const data = await r.json();
    const reviews = (data.reviews || [])
      .map((rv) => ({
        author: rv.authorAttribution?.displayName || '',
        photo: rv.authorAttribution?.photoUri || '',
        rating: rv.rating || 5,
        text: (rv.text?.text || rv.originalText?.text || '').trim(),
        time: rv.relativePublishTimeDescription || '',
      }))
      .filter((rv) => rv.text && rv.author);

    // Cache at the edge for 6h, serve stale up to 24h while revalidating.
    res.setHeader('Cache-Control', 'public, s-maxage=21600, stale-while-revalidate=86400');
    return res.status(200).json({
      ok: true,
      rating: data.rating || null,
      total: data.userRatingCount || null,
      url: data.googleMapsUri || null,
      reviews,
    });
  } catch (err) {
    return res.status(200).json({ ok: false, reviews: [], error: String(err) });
  }
}
