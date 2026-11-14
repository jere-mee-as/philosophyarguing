"""Builds ../index.html from content*.txt, template.html, app.js and jere-pfp.txt.  Run: python3 build.py"""
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
page = open(os.path.join(here, 'template.html'), encoding='utf-8').read()
app = open(os.path.join(here, 'app.js'), encoding='utf-8').read().replace('JERE_PFP', open(os.path.join(here, 'jere-pfp.txt')).read().strip())
app = app.replace('LEVEL_SIGILS', json.dumps([SG['levels'][x] for x in ('serious', 'bait', 'rage bait')], ensure_ascii=False))
page = page.replace('__APP__', app).replace('__DATA__', json.dumps(data, ensure_ascii=False).replace('</', '<\\/'))
open(os.path.join(here, '..', 'index.html'), 'w', encoding='utf-8').write(page)
ks = [k for t in T.values() for k in t['k']]
print(len(data), 'fields,', len(T), 'philosophies,', len(ks), 'claims,', len(ks) * 3, 'replies')
for g, ts in groups.items(): print(f'  {g}: {len(ts)}')
lines = [l for k in ks for l in k['l']]
print('repeated replies:', [x for x, c in collections.Counter(lines).items() if c > 1])
print('longest claims:', sorted(((len(k['b']), k['b']) for k in ks), reverse=True)[:6])
print('shared sigils:', dup)
print('answers back:', sum(1 for t in T.values() if 'r' in t['k'][0]), 'philosophies,', sum(3 for k in ks if 'r' in k), 'lines')
print('odd counts:', [(t['t'], len(t['k'])) for t in T.values() if len(t['k']) not in (4, 5)])
