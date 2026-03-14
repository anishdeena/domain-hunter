import { NextRequest } from 'next/server';
import dns from 'dns';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PRICES: Record<string, string> = {
  ai: '~$70/yr',
  com: '~$12/yr',
};

const VOWELS = new Set('aeiou');

function isReadable(name: string): boolean {
  // Must contain at least one vowel
  let hasVowel = false;
  for (const c of name) {
    if (VOWELS.has(c)) { hasVowel = true; break; }
  }
  if (!hasVowel) return false;

  // No double letters at end (e.g. "xyzz", "bckk")
  if (name.length >= 2 && name[name.length - 1] === name[name.length - 2]) {
    if (!VOWELS.has(name[name.length - 1])) return false;
  }

  // No triple consecutive consonants (e.g. "bcrk", "nght")
  let consRun = 0;
  for (const c of name) {
    if (VOWELS.has(c)) {
      consRun = 0;
    } else {
      consRun++;
      if (consRun >= 3) return false;
    }
  }

  // No triple consecutive vowels (e.g. "aaei")
  let vowelRun = 0;
  for (const c of name) {
    if (VOWELS.has(c)) {
      vowelRun++;
      if (vowelRun >= 3) return false;
    } else {
      vowelRun = 0;
    }
  }

  // No repeated same letter 3+ times anywhere (e.g. "aaab")
  for (let i = 2; i < name.length; i++) {
    if (name[i] === name[i - 1] && name[i] === name[i - 2]) return false;
  }

  // Reject awkward consonant pairs that are hard to pronounce
  const hardPairs = new Set([
    'bk', 'bx', 'cb', 'cd', 'cf', 'cg', 'cj', 'cp', 'cv', 'cw', 'cx',
    'db', 'dc', 'df', 'dg', 'dk', 'dm', 'dp', 'dt', 'dv', 'dw', 'dx', 'dz',
    'fb', 'fc', 'fd', 'fg', 'fh', 'fj', 'fk', 'fm', 'fp', 'fv', 'fw', 'fx', 'fz',
    'gb', 'gc', 'gd', 'gf', 'gj', 'gk', 'gm', 'gp', 'gt', 'gv', 'gw', 'gx', 'gz',
    'hb', 'hc', 'hd', 'hf', 'hg', 'hh', 'hj', 'hk', 'hm', 'hp', 'hq', 'hr', 'ht', 'hv', 'hw', 'hx', 'hz',
    'jb', 'jc', 'jd', 'jf', 'jg', 'jh', 'jj', 'jk', 'jl', 'jm', 'jn', 'jp', 'jq', 'jr', 'js', 'jt', 'jv', 'jw', 'jx', 'jz',
    'kb', 'kc', 'kd', 'kf', 'kg', 'kh', 'kj', 'kk', 'km', 'kp', 'kq', 'kt', 'kv', 'kw', 'kx', 'kz',
    'lx', 'lz',
    'mk', 'mq', 'mv', 'mx', 'mz',
    'nq', 'nx', 'nz',
    'pb', 'pc', 'pd', 'pf', 'pg', 'pj', 'pk', 'pm', 'pn', 'pq', 'pv', 'pw', 'px', 'pz',
    'qb', 'qc', 'qd', 'qf', 'qg', 'qh', 'qj', 'qk', 'ql', 'qm', 'qn', 'qp', 'qq', 'qr', 'qs', 'qt', 'qv', 'qw', 'qx', 'qy', 'qz',
    'rx', 'rz',
    'sx', 'sz',
    'tb', 'tc', 'td', 'tf', 'tg', 'tj', 'tk', 'tm', 'tn', 'tp', 'tq', 'tv', 'tx', 'tz',
    'vb', 'vc', 'vd', 'vf', 'vg', 'vh', 'vj', 'vk', 'vl', 'vm', 'vn', 'vp', 'vq', 'vr', 'vs', 'vt', 'vv', 'vw', 'vx', 'vz',
    'wb', 'wc', 'wd', 'wf', 'wg', 'wj', 'wk', 'wm', 'wp', 'wq', 'wt', 'wv', 'ww', 'wx', 'wz',
    'xb', 'xc', 'xd', 'xf', 'xg', 'xh', 'xj', 'xk', 'xl', 'xm', 'xn', 'xp', 'xq', 'xr', 'xs', 'xt', 'xv', 'xw', 'xx', 'xz',
    'zb', 'zc', 'zd', 'zf', 'zg', 'zh', 'zj', 'zk', 'zm', 'zn', 'zp', 'zq', 'zr', 'zs', 'zt', 'zv', 'zw', 'zx', 'zz',
  ]);

  for (let i = 0; i < name.length - 1; i++) {
    if (!VOWELS.has(name[i]) && !VOWELS.has(name[i + 1])) {
      if (hardPairs.has(name[i] + name[i + 1])) return false;
    }
  }

  return true;
}

function generateDomains(length: number, tld: string): string[] {
  const domains: string[] = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const vowels = 'aeiou';
  const consonants = 'bcdfghjklmnpqrstvwxyz';

  // For short domains (2-3 chars), enumerate all combinations
  if (length <= 3) {
    const generate = (prefix: string, remaining: number) => {
      if (remaining === 0) {
        domains.push(`${prefix}.${tld}`);
        return;
      }
      for (const c of letters) {
        generate(prefix + c, remaining - 1);
      }
    };
    generate('', length);
    // Shuffle for more interesting discovery order
    for (let i = domains.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [domains[i], domains[j]] = [domains[j], domains[i]];
    }
    return domains;
  }

  // For 4+ chars, generate pronounceable combinations first, then random
  const patterns = [
    // CVCV - most pronounceable
    () => {
      const c1 = consonants[Math.floor(Math.random() * consonants.length)];
      const v1 = vowels[Math.floor(Math.random() * vowels.length)];
      const c2 = consonants[Math.floor(Math.random() * consonants.length)];
      const v2 = vowels[Math.floor(Math.random() * vowels.length)];
      return c1 + v1 + c2 + v2;
    },
    // CVCC
    () => {
      const c1 = consonants[Math.floor(Math.random() * consonants.length)];
      const v1 = vowels[Math.floor(Math.random() * vowels.length)];
      const c2 = consonants[Math.floor(Math.random() * consonants.length)];
      const c3 = consonants[Math.floor(Math.random() * consonants.length)];
      return c1 + v1 + c2 + c3;
    },
    // CCVC
    () => {
      const c1 = consonants[Math.floor(Math.random() * consonants.length)];
      const c2 = consonants[Math.floor(Math.random() * consonants.length)];
      const v1 = vowels[Math.floor(Math.random() * vowels.length)];
      const c3 = consonants[Math.floor(Math.random() * consonants.length)];
      return c1 + c2 + v1 + c3;
    },
    // VCVC
    () => {
      const v1 = vowels[Math.floor(Math.random() * vowels.length)];
      const c1 = consonants[Math.floor(Math.random() * consonants.length)];
      const v2 = vowels[Math.floor(Math.random() * vowels.length)];
      const c2 = consonants[Math.floor(Math.random() * consonants.length)];
      return v1 + c1 + v2 + c2;
    },
    // Random
    () => {
      let s = '';
      for (let i = 0; i < length; i++) {
        s += letters[Math.floor(Math.random() * letters.length)];
      }
      return s;
    },
  ];

  const seen = new Set<string>();

  // Generate 4-letter domains using patterns
  if (length === 4) {
    while (domains.length < 500) {
      const patternFn = patterns[Math.floor(Math.random() * patterns.length)];
      const name = patternFn();
      if (name.length !== length || seen.has(name)) continue;
      seen.add(name);
      domains.push(`${name}.${tld}`);
    }
  } else {
    // For 5-6, just random
    while (domains.length < 400) {
      let name = '';
      for (let i = 0; i < length; i++) {
        name += letters[Math.floor(Math.random() * letters.length)];
      }
      if (seen.has(name)) continue;
      seen.add(name);
      domains.push(`${name}.${tld}`);
    }
  }

  return domains;
}

function checkDomain(domain: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Check multiple record types - if none exist, domain is likely available
    let resolved = false;
    let pending = 3;

    const done = (found: boolean) => {
      if (resolved) return;
      if (found) {
        resolved = true;
        resolve(false); // domain is taken
        return;
      }
      pending--;
      if (pending <= 0) {
        resolved = true;
        resolve(true); // likely available
      }
    };

    dns.resolve4(domain, (err) => done(!err));
    dns.resolve6(domain, (err) => done(!err));
    dns.resolveMx(domain, (err) => done(!err));

    // Timeout after 4 seconds
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(true); // timeout = likely available
      }
    }, 4000);
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ALLOWED_TLDS = ['ai', 'com'];
  const tld = ALLOWED_TLDS.includes(searchParams.get('tld') || '') ? searchParams.get('tld')! : 'ai';
  const length = Math.max(2, Math.min(6, parseInt(searchParams.get('length') || '4')));
  const readable = searchParams.get('readable') === '1';
  const price = PRICES[tld] || '~$15/yr';

  let domains = generateDomains(length, tld);
  if (readable) {
    domains = domains.filter((d) => isReadable(d.split('.')[0]));
  }
  // Cap at reasonable amount
  const toCheck = domains.slice(0, 500);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let checked = 0;
      const batchSize = 15;

      for (let i = 0; i < toCheck.length; i += batchSize) {
        const batch = toCheck.slice(i, i + batchSize);

        const results = await Promise.all(
          batch.map(async (domain) => {
            const available = await checkDomain(domain);
            return { domain, available };
          })
        );

        checked += batch.length;

        // Send progress
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: 'progress', checked }) + '\n'
          )
        );

        // Send results
        for (const r of results) {
          const buyUrl = new URL('https://www.namecheap.com/domains/registration/results/');
          buyUrl.searchParams.set('domain', r.domain);
          const buyLink = buyUrl.toString();
          controller.enqueue(
            encoder.encode(
              JSON.stringify({
                type: 'result',
                result: {
                  domain: r.domain,
                  available: r.available,
                  price: r.available ? price : '',
                  buyLink,
                },
              }) + '\n'
            )
          );
        }
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
