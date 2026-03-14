# Domain Finder

A short-domain hunting tool dressed in Windows 3.1 clothing.

Pick a TLD, set your character count, hit Go — available domains stream in as they're found, each one a click away from registration.

Built for the kind of person who refreshes WHOIS lookups at 2am hoping a four-letter .ai just expired.

---

## What it does

- Scans for available domains by TLD (`.ai` or `.com`) and character length (2–6 letters)
- Streams results in real time — no waiting for a full batch to finish
- Links each available domain directly to Namecheap for purchase
- **Readable filter** skips unpronounceable garbage like `bxqz` or `xyzz` so you only see domains a human could actually say out loud

## The UI

Beveled borders. Navy title bars. System gray everything. A taskbar with a clock.

It looks like something you'd find on a Compaq Presario — but it's checking live DNS and streaming results through a modern Next.js backend. The results scroll in like a terminal feed, green for available, red for taken.

---

## Setup

```bash
git clone <repo-url>
cd ai-domain-finder
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to use it

1. **Pick a TLD** — `.ai` or `.com` in the sidebar
2. **Set character count** — 2 through 6. Shorter = rarer finds, longer = more options
3. **Toggle "Readable only"** — on by default. Filters out triple consonants, awkward letter pairs, and anything you couldn't say in a meeting without biting your tongue
4. **Hit Go** — domains stream in as they're checked. Available ones show estimated pricing and a buy link
5. **Filter results** — toggle between "All" and "Available" in the results toolbar
6. **Hit Go again** — each run generates a fresh random batch, so you'll get different results every time

## How availability checking works

Domains are checked via DNS resolution (A, AAAA, and MX records). If no records exist, the domain is marked as likely available.

**This is approximate.** Some registered domains have no DNS records (false positives). Some parked domains resolve via wildcard DNS (false negatives). Always confirm availability on the registrar before purchasing.

---

## Stack

- **Next.js 14** — App Router, API routes, streaming responses
- **Node.js `dns` module** — domain availability checks
- **Zero external APIs** — no keys, no rate limits, no accounts needed

## License

MIT
