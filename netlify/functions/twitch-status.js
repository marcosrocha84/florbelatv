// Netlify Function: proxy seguro para o status "ao vivo" do canal na Twitch.
// O Client Secret só existe aqui (server-side) — nunca é exposto ao front-end.

const TOKEN_URL = 'https://id.twitch.tv/oauth2/token';
const STREAMS_URL = 'https://api.twitch.tv/helix/streams';

// Cache do App Access Token em memória do processo (sobrevive entre invocações
// enquanto a função ficar "quente"), evitando pedir um token novo a cada chamada.
let cachedToken = null;
let tokenExpiresAt = 0;

async function getAppAccessToken(clientId, clientSecret) {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
  });

  const res = await fetch(`${TOKEN_URL}?${params.toString()}`, { method: 'POST' });
  if (!res.ok) {
    throw new Error(`Falha ao obter token da Twitch: ${res.status}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  // Renova um pouco antes de expirar de verdade (margem de 60s).
  tokenExpiresAt = now + Math.max(0, (data.expires_in - 60)) * 1000;
  return cachedToken;
}

exports.handler = async function () {
  const offlineResponse = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30',
    },
    body: JSON.stringify({ live: false }),
  };

  try {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;
    const userLogin = process.env.TWITCH_USER_LOGIN || 'florbelatv';

    if (!clientId || !clientSecret) {
      return offlineResponse;
    }

    const token = await getAppAccessToken(clientId, clientSecret);

    const streamsRes = await fetch(`${STREAMS_URL}?user_login=${encodeURIComponent(userLogin)}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Client-Id': clientId,
      },
    });

    if (!streamsRes.ok) {
      return offlineResponse;
    }

    const streamsData = await streamsRes.json();
    const stream = streamsData.data && streamsData.data[0];

    if (!stream) {
      return offlineResponse;
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=30',
      },
      body: JSON.stringify({
        live: true,
        title: stream.title,
        game: stream.game_name,
        viewers: stream.viewer_count,
      }),
    };
  } catch (err) {
    return offlineResponse;
  }
};
