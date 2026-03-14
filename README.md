# Domain Finder

Searches for short available domains so you don't have to manually check them one by one.

You pick a TLD, pick how many characters you want, and hit Go. It checks domains against DNS and streams the results back as it finds them. Available ones link straight to Namecheap so you can grab them.

The whole thing is styled like Windows 3.1 because why not.

---

## What it does

- Finds available `.ai` and `.com` domains between 2 and 6 characters long
- Results stream in live as they're checked, you don't wait for everything to finish
- Available domains link to Namecheap for purchase
- Has a "readable only" filter that throws out unpronounceable junk like `bxqz` or `xyzz`

## The look

Beveled borders, navy title bars, system gray, a taskbar with a clock at the bottom. It looks like it runs on a Compaq Presario but it's actually a Next.js app checking live DNS under the hood.

Available domains show up green, taken ones show up red. They scroll in like a feed as the scan runs.

---

## Setup

```bash
git clone <repo-url>
cd ai-domain-finder
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## How to use it

1. **Pick a TLD** in the sidebar, `.ai` or `.com`
2. **Set character count** from 2 to 6. Shorter means rarer finds, longer gives you more to work with
3. **"Readable only"** is on by default. It filters out triple consonants, weird letter combos, and anything you'd stumble over trying to say out loud
4. **Hit Go** and watch domains stream in. Available ones show estimated pricing and a buy link
5. **Filter the results** with the All/Available toggle in the toolbar
6. **Run it again** whenever you want. Each run generates a fresh batch so you'll see different domains every time

## A note on accuracy

Availability is checked via DNS (A, AAAA, and MX records). If nothing resolves, the domain gets marked as likely available.

This isn't perfect. Some registered domains don't have DNS records set up, so they'll show as available when they're not. And some parked domains resolve through wildcard DNS, so they'll show as taken when they might actually be free. Always double check on the registrar before you buy.

---

## Stack

- Next.js 14 with App Router and streaming API routes
- Node.js `dns` module for availability checks
- No external APIs, no keys, no accounts needed

## License

MIT
