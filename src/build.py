"""Builds ../index.html from content*.txt, comebacks*.txt and sigils.txt, inside the shared shell in src/shell/.  Run: python3 src/build.py"""
import json, collections, glob, os, re, sys
here = os.path.dirname(os.path.abspath(__file__))
T = collections.OrderedDict(); cur = None; block = None
for f in sorted(glob.glob(os.path.join(here, 'content*.txt'))):
    for ln, line in enumerate(open(f, encoding='utf-8'), 1):
        line = line.strip()
        if not line or line.startswith('# '): continue
        if line.startswith('## '):
            n, g = [x.strip() for x in line[3:].split('|')]; assert n not in T, n
            cur = T[n] = {'t': n, 'g': g, 'k': []}; block = None; continue
        if line.startswith('> '):
            block = {'b': line[2:].strip(), 'l': []}; cur['k'].append(block); continue
        assert block is not None and len(block['l']) < 3, f'{f}:{ln}: stray line'
        block['l'].append(line)
def curl(s):
    """typographic quotes, to match the heading"""
    s = re.sub(r'(^|[\s(\[])"', r'\1“', s).replace('"', '”')
    return re.sub(r"(^|[\s(\[“])'(?=\w)", r'\1‘', s).replace("'", '’')
for t in T.values():
    for k in t['k']: k['b'] = curl(k['b']); k['l'] = [curl(x) for x in k['l']]
FIELDS = ['Ancients','Metaphysics','Mind','Knowledge','Science','Language & Logic','Ethics','How to Live','Religion','The East','Continental','Theory','Political Thinkers','Politics']
# the philosophy's own answers, where written: three per claim, in claim order
for f in sorted(glob.glob(os.path.join(here, 'comebacks*.txt'))):
    cur = None
    for ln, line in enumerate(open(f, encoding='utf-8'), 1):
        line = line.strip()
        if not line or line.startswith('# '): continue
        if line.startswith('## '): cur = T[line[3:].strip()]; cur['_r'] = []; continue
        if line.startswith('> '):   # optional marker: the start of the claim these three lines belong to
            i = len(cur['_r']); assert i % 3 == 0 and i // 3 < len(cur['k']), f'{f}:{ln}: out of step at {line}'
            assert cur['k'][i // 3]['b'].startswith(curl(line[2:].strip())), f"{f}:{ln}: expected claim {cur['k'][i // 3]['b']!r}"
            continue
        assert line.startswith('< '), f'{f}:{ln}'
        cur['_r'].append(curl(line[2:].strip()))
for t in T.values():
    r = t.pop('_r', None)
    if r is None: continue
    assert len(r) == 3 * len(t['k']), (t['t'], len(r), len(t['k']))
    for i, k in enumerate(t['k']): k['r'] = r[3*i:3*i+3]
groups = collections.OrderedDict((f, []) for f in FIELDS)
for t in T.values():
    for k in t['k']: assert len(k['l']) == 3, (t['t'], k['b'])
    groups[t['g']].append({'t': t['t'], 'k': t['k']})
SG = {}; sec = None
for line in open(os.path.join(here, 'sigils.txt'), encoding='utf-8'):
    line = line.strip()
    if not line or line.startswith('# '): continue
    if line.startswith('['): sec = line.strip('[]'); SG[sec] = {}; continue
    n, s = line.rsplit(' = ', 1)
    # keep symbols in their text form where a font also has an emoji for them
    SG[sec][n] = ''.join(c + ('\ufe0e' if 0x2190 <= ord(c) <= 0x2bff else '') for c in s.strip())
missing = [t for t in T if t not in SG['philosophies']] + [f for f in FIELDS if f not in SG['fields']]
assert not missing, missing
dup = [s for s, c in collections.Counter(list(SG['philosophies'].values()) + list(SG['fields'].values())).items() if c > 1]
for g in groups.values():
    for t in g: t['s'] = SG['philosophies'][t['t']]
data = [{'n': g, 's': SG['fields'][g], 't': ts} for g, ts in groups.items()]
# the page is the "So you're sure about…" shell (src/shell): field → philosophy → claim → the three replies, each folding open to the philosophy's answer
sys.path.insert(0, os.path.join(here, 'shell')); import shell
LV = [(SG['levels'][x], x) for x in ('serious', 'bait', 'rage bait')]
P = []
for d in data:
    s = {'n': d['n'], 'i': d['s'], 'u': [], 't': []}
    for ph in d['t']:
        u = {'n': ph['t'], 'i': ph['s'], 't': []}
        for k in ph['k']:
            u['t'].append(len(s['t']))
            s['t'].append({'t': '“' + k['b'] + '”', 'k': [{'q': g + '  ' + n, 'f': k['l'][i], 'm': k['r'][i] if 'r' in k else '', 'ml': ph['s'] + '  ' + ph['t'] + ' answers'} for i, (g, n) in enumerate(LV)]})
        s['u'].append(u)
    P.append(s)
size = shell.build(P, os.path.join(here, '..', 'index.html'), title='So you’re arguing about…', lead='So you’re arguing about', key='pa',
    words=['field', 'philosophy', 'claim', 'reply'], steps=['field', 'philosophy', 'claim', 'replies'], plurals={'philosophy': 'philosophies', 'reply': 'replies'},
    foot='<a class="foot" href="https://jere-mee-as.github.io/philosophyragebait/">Just the rage bait →</a>')
print('built index.html', size)
ks = [k for t in T.values() for k in t['k']]
print(len(data), 'fields,', len(T), 'philosophies,', len(ks), 'claims,', len(ks) * 3, 'replies')
for g, ts in groups.items(): print(f'  {g}: {len(ts)}')
lines = [l for k in ks for l in k['l']]
print('repeated replies:', [x for x, c in collections.Counter(lines).items() if c > 1])
print('longest claims:', sorted(((len(k['b']), k['b']) for k in ks), reverse=True)[:6])
print('shared sigils:', dup)
print('answers back:', sum(1 for t in T.values() if 'r' in t['k'][0]), 'philosophies,', sum(3 for k in ks if 'r' in k), 'lines')
print('odd counts:', [(t['t'], len(t['k'])) for t in T.values() if len(t['k']) not in (4, 5)])
