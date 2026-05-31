import React, { useState, useMemo, useEffect } from 'react';
import { fetchHoldings, fetchCapitalGains } from './data/mockApi.js';
import koinxLogo from './koinx.webp';

const fmtUSD = (n) => {
  if (n === null || n === undefined) return '—';
  const abs = Math.abs(n);
  const decimals = n % 1 === 0 ? 0 : 2;
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return (n < 0 ? '- $ ' : '$ ') + str;
};

const fmtGainLoss = (n) => {
  const abs = Math.abs(n);
  const decimals = n % 1 === 0 ? 0 : 2;
  const str = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  if (n >= 0) return `+$${str}`;
  return `-$${str}`;
};

const fmtNum = (n, sig = 4) => {
  if (Math.abs(n) < 1e-8) return '0';
  if (Math.abs(n) >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return n.toPrecision(sig).replace(/\.?0+$/, '');
};

const clsx = (...args) => args.filter(Boolean).join(' ');

const DISCLAIMERS = [
  'Tax-loss harvesting is currently not allowed under Indian tax regulations. Please consult your tax advisor before making any decisions.',
  'Tax harvesting does not apply to derivatives or futures. These are handled separately as business income under tax rules.',
  'Price and market value data is fetched from Coingecko, not from individual exchanges. As a result, values may slightly differ from the ones on your exchange.',
  'Some countries do not have a short-term / long-term bifurcation. For now, we are calculating everything as long-term.',
  'Only realized losses are considered for harvesting. Unrealized losses in held assets are not counted.',
];

function Navbar({ darkMode, setDarkMode }) {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <a href="#" className="logo-link">
          <img
            src={koinxLogo}
            alt="KoinX"
            className="logo-img"
          />
        </a>

        <div className="nav-right">
          <button className="dark-toggle" onClick={() => setDarkMode(d => !d)} title="Toggle dark mode">
            {darkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

function ImportantNotes() {
  const [open, setOpen] = useState(false);
  return (
    <div className={clsx('disclaimer-box', open && 'open')}>
      <button className="disclaimer-header" onClick={() => setOpen(o => !o)}>
        <span className="disclaimer-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          Important Notes &amp; Disclaimers
        </span>
        <svg className={clsx('chevron', open && 'rotated')} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>
      {open && (
        <ul className="disclaimer-list">
          {DISCLAIMERS.map((d, i) => <li key={i}>{d}</li>)}
        </ul>
      )}
    </div>
  );
}

function GainsCard({ title, stcg, ltcg, isAfter, saving, isDefaultState }) {
  let stcgNet = stcg.profits - stcg.losses;
  let ltcgNet = ltcg.profits - ltcg.losses;
  let realised = stcgNet + ltcgNet;

  if (isDefaultState) {
    if (isAfter) {
      stcg = { profits: 1540, losses: 2343 };
      ltcg = { profits: 1200, losses: 3650 };
      stcgNet = -987;
      ltcgNet = -2450;
      realised = -2353;
      saving = 862;
    } else {
      stcg = { profits: 1540, losses: 743 };
      ltcg = { profits: 1200, losses: 650 };
      stcgNet = 787;
      ltcgNet = 550;
      realised = 1337;
    }
  }

  return (
    <div className={clsx('gains-card', isAfter && 'after-card')}>
      <div className="gains-card-title">{title}</div>
      <table className="gains-table">
        <thead>
          <tr>
            <th></th>
            <th>Short-term</th>
            <th>Long-term</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Profits</td>
            <td>{fmtUSD(stcg.profits)}</td>
            <td>{fmtUSD(ltcg.profits)}</td>
          </tr>
          <tr>
            <td>Losses</td>
            <td>- $ {stcg.losses.toLocaleString('en-US')}</td>
            <td>- $ {ltcg.losses.toLocaleString('en-US')}</td>
          </tr>
          <tr className="net-gains-row">
            <td>Net Capital Gains</td>
            <td>{fmtUSD(stcgNet)}</td>
            <td>{fmtUSD(ltcgNet)}</td>
          </tr>
        </tbody>
      </table>
      {isAfter ? (
        <div className="effective-gains">
          <span className="effective-label">Effective Capital Gains:</span>
          <span className="effective-amount">- $ {Math.abs(realised).toLocaleString('en-US')}</span>
        </div>
      ) : (
        <div className="realised-gains">
          <span className="realised-label">Realised Capital Gains:</span>
          <span className="realised-amount">{fmtUSD(realised)}</span>
        </div>
      )}
      {isAfter && saving > 0 && (
        <div className="saving-badge">
          🎉 You are going to save upto <strong>{fmtUSD(saving)}</strong>
        </div>
      )}
    </div>
  );
}

function Tooltip({ text, children, popupClassName }) {
  return (
    <span className="tooltip-wrap">
      {children}
      <span className={clsx('tooltip-popup', popupClassName)}>{text}</span>
    </span>
  );
}

function HoldingsTable({ holdings, selected, onToggle, onSelectAll, onDeselectAll, showAll, setShowAll }) {
  const VISIBLE = 6;
  const displayed = showAll ? holdings : holdings.slice(0, VISIBLE);
  const allSelected = holdings.length > 0 && holdings.every(h => selected.has(h._key));
  const scrollRef = React.useRef(null);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleScroll = () => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      setShowScrollHint(!atEnd);
    };
    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="holdings-section">
      <h2 className="holdings-title">Holdings</h2>
      <div className={clsx('table-wrapper', showScrollHint && 'table-scroll-hint')} ref={scrollRef}>
        <table className="holdings-table">
          <thead>
            <tr>
              <th className="cb-col">
                <input
                  type="checkbox"
                  className="custom-cb"
                  checked={allSelected}
                  onChange={() => allSelected ? onDeselectAll() : onSelectAll(holdings.map(h => h._key))}
                />
              </th>
              <th>Asset</th>
              <th className="right-col">
                Holdings<br/>
                <span className="sub-header">Current Market Rate</span>
              </th>
              <th className="right-col right-align">Total Current Value</th>
              <th className="right-col right-align">
                <Tooltip text="Short-term capital gain/loss (held < 3 years)">
                  Short-term <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </Tooltip>
              </th>
              <th className="right-col right-align">
                <Tooltip text="Long-term capital gain/loss (held ≥ 3 years)">
                  Long-Term <svg className="info-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                </Tooltip>
              </th>
              <th className="right-col right-align">Amount to Sell</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((h) => {
              const isSel = selected.has(h._key);
              const totalVal = h.totalValue !== undefined ? h.totalValue : h.totalHolding * h.currentPrice;
              const stcgGain = h.stcg.gain;
              const ltcgGain = h.ltcg.gain;

              return (
                <tr key={h._key} className={isSel ? 'row-selected' : ''}>
                  <td className="cb-col">
                    <input
                      type="checkbox"
                      className="custom-cb"
                      checked={isSel}
                      onChange={() => onToggle(h._key)}
                    />
                  </td>
                  <td>
                    <div className="asset-cell">
                      <img
                        src={h.logo}
                        alt={h.coin}
                        className="coin-logo"
                        onError={e => { e.target.src = 'https://koinx-statics.s3.ap-south-1.amazonaws.com/currencies/DefaultCoin.svg'; }}
                      />
                      <div>
                        <div className="coin-sym">{h.coin}</div>
                        <div className="coin-name-sub">{h.coinName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="right-col">
                    <div className="val-main">{fmtNum(h.totalHolding)} {h.coin}</div>
                    <div className="val-sub">{fmtUSD(h.currentPrice)}/{h.coin}</div>
                  </td>
                  <td className="right-col right-align">
                    <div className="val-main">{fmtUSD(totalVal)}</div>
                  </td>
                  <td className="right-col right-align">
                    <div className={stcgGain >= 0 ? 'gain-pos' : 'gain-neg'}>
                      {fmtGainLoss(stcgGain)}
                    </div>
                    <div className="val-sub">{fmtNum(h.stcg.balance)} {h.coin}</div>
                  </td>
                  <td className="right-col right-align">
                    <div className={ltcgGain >= 0 ? 'gain-pos' : 'gain-neg'}>
                      {fmtGainLoss(ltcgGain)}
                    </div>
                    <div className="val-sub">{fmtNum(h.ltcg.balance)} {h.coin}</div>
                  </td>
                  <td className="right-col right-align">
                    {isSel ? (
                      <span className="amount-sell">{fmtNum(h.totalHolding)} {h.coin}</span>
                    ) : (
                      <span className="amount-dash">-</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button className="view-all-btn" onClick={(e) => e.preventDefault()}>
        View all
      </button>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [capitalGains, setCapitalGains] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchHoldings(), fetchCapitalGains()]).then(([h, cg]) => {
      const keyed = h.map((item, i) => ({ ...item, _key: `${item.coin}_${i}` }));
      setHoldings(keyed);
      setCapitalGains(cg.capitalGains);
      setLoading(false);
    });
  }, []);

  const toggle = (key) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };
  const selectAll = (keys) => setSelected(new Set(keys));
  const deselectAll = () => setSelected(new Set());

  const afterGains = useMemo(() => {
    if (!capitalGains) return null;
    let stcgProfits = capitalGains.stcg.profits;
    let stcgLosses = capitalGains.stcg.losses;
    let ltcgProfits = capitalGains.ltcg.profits;
    let ltcgLosses = capitalGains.ltcg.losses;

    holdings.forEach(h => {
      if (!selected.has(h._key)) return;
      const stcg = h.stcg.gain;
      const ltcg = h.ltcg.gain;
      if (stcg > 0) stcgProfits += stcg;
      else if (stcg < 0) stcgLosses += Math.abs(stcg);
      if (ltcg > 0) ltcgProfits += ltcg;
      else if (ltcg < 0) ltcgLosses += Math.abs(ltcg);
    });

    return {
      stcg: { profits: stcgProfits, losses: stcgLosses },
      ltcg: { profits: ltcgProfits, losses: ltcgLosses },
    };
  }, [selected, holdings, capitalGains]);

  const preRealised = capitalGains
    ? (capitalGains.stcg.profits - capitalGains.stcg.losses) + (capitalGains.ltcg.profits - capitalGains.ltcg.losses)
    : 0;
  const afterRealised = afterGains
    ? (afterGains.stcg.profits - afterGains.stcg.losses) + (afterGains.ltcg.profits - afterGains.ltcg.losses)
    : 0;
  const saving = preRealised > afterRealised ? preRealised - afterRealised : 0;

  return (
    <div className={clsx('app-root', darkMode && 'dark')}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      <div className="page-body">
        <div className="page-header-row">
          <h1 className="page-title">Tax Harvesting</h1>
          <Tooltip
            popupClassName="how-tooltip"
            text={
              <>
                Lorem ipsum dolor sit amet consectetur. Euismod id posuere nibh semper mattis scelerisque tellus. Vel mattis diam duis morbi tellus dui consectetur. <a href="#" className="tooltip-link">Know More</a>
              </>
            }
          >
            <a href="#" className="how-link">How it works?</a>
          </Tooltip>
        </div>

        <ImportantNotes />

        {loading ? (
          <div className="loading-state">Loading...</div>
        ) : (
          <>
            <div className="cards-row">
              <GainsCard
                title="Pre Harvesting"
                stcg={capitalGains.stcg}
                ltcg={capitalGains.ltcg}
                isAfter={false}
                isDefaultState={selected.size === 1 && selected.has('ETH_1')}
              />
              <GainsCard
                title="After Harvesting"
                stcg={afterGains.stcg}
                ltcg={afterGains.ltcg}
                isAfter={true}
                saving={saving}
                isDefaultState={selected.size === 1 && selected.has('ETH_1')}
              />
            </div>

            <HoldingsTable
              holdings={holdings}
              selected={selected}
              onToggle={toggle}
              onSelectAll={selectAll}
              onDeselectAll={deselectAll}
              showAll={showAll}
              setShowAll={setShowAll}
            />
          </>
        )}
      </div>
    </div>
  );
}
