# Pannello organizzatore

Il pannello è disponibile su `/admin.html` e non richiede alcun PIN agli ospiti.

Configura in Cloudflare Pages:

```text
ADMIN_PASSWORD=<password lunga e casuale>
```

La sessione amministrativa dura 8 ore ed è salvata in un cookie `HttpOnly`, `Secure` e `SameSite=Strict`. Per ambienti pubblici è consigliato aggiungere anche Cloudflare Access davanti a `/admin.html`.

Per rigenerare il refresh token Spotify, autorizza l’app con questi scope:

```text
user-modify-playback-state user-read-playback-state
```

Facoltativamente puoi configurare `SPOTIFY_MARKET` con un codice paese ISO a due lettere, ad esempio `IT`. Se assente, viene usato `IT`.
