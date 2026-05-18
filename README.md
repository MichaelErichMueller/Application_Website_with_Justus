# Michaels Bewerbungswebsite

Statische Bewerbungswebsite mit Lebenslauf, Arbeitszeugnis und Notenspiegel.

## Lokal öffnen

Die Seite kann direkt über `index.html` im Browser geöffnet werden.

Alternativ kann ein lokaler Server im Projektordner gestartet werden:

```powershell
python -m http.server 8000
```

Danach ist die Seite unter `http://localhost:8000` erreichbar.

## Unterlagen

Die PDF-Dateien liegen unter `assets/documents/` und sind in der Website relativ verlinkt.

## Bewerbungsfoto

Im geretteten Ordner war keine Bilddatei enthalten. Die Website nutzt deshalb aktuell einen Platzhalter mit den Initialen `MM`.

## Supabase-Datenbank

Die Website kann Bewerbungsstellen dauerhaft in Supabase speichern.

1. Neues Projekt bei Supabase erstellen.
2. In Supabase den SQL Editor öffnen.
3. Inhalt aus `supabase-setup.sql` ausführen.
4. Unter Project Settings > API die Project URL und den anon/public key kopieren.
5. Die Werte in `supabase-config.js` eintragen.

Ohne Supabase-Konfiguration speichert die Seite nur lokal im Browser.
