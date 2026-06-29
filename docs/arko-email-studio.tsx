import { useState } from "react";

const C = { bg:'#f4f4f0', white:'#ffffff', info:'#f8f8f5', main:'#1a1a18', body:'#3a3a38', subtle:'#888', footer:'#aaa', sep:'#e8e8e4' };
const SF = 'Georgia,Times New Roman,serif';
const SS = 'Arial,Helvetica,sans-serif';

const SAMPLES = {
  1: { prenom:'Marie', nom:'Dupont', produit_label:'Arko One (20\u00a0m\u00b2)', message:"Bonjour, je souhaite en savoir plus sur les d\u00e9lais de livraison et les options de financement disponibles pour l\u2019Arko One." },
  2: {
    // Identité
    prenom:'Jean', nom:'Martin', email:'jean.martin@example.com', tel:'06\u202f12\u202f34\u202f56\u202f78',
    // Réservation
    numero:'n\u00b002', produit:'Arko One', maison_ttc:'67\u202f400\u202f\u20ac', livraison:'Via pack terrain', terrain:'Pack \u00c9tendu \u2014 7\u202f300\u202f\u20ac TTC',
    // Configuration
    modele:'Arko One', bardage:'Anthracite', facade:'\u00cclot fa\u00e7ade fonc\u00e9e', bar:'\u00cclot avec barre', chambre:'Ch\u00eane naturel', interieur:'Int\u00e9rieur bois', terrasse_m2:'12', options_labels:'Pack Cuisine Premium, Po\u00eale \u00e0 bois', total_estime:'67\u202f400\u202f\u20ac',
    // Terrain
    pack_label:'Pack \u00c9tendu \u2014 zones \u00e9largies', zones:'Pays Basque, Landes', budget:'80\u202f000\u202f\u20ac',
    // PLU
    plu_zone:'UA', plu_parcelle:'AB\u00a00142', plu_adresse:'12 chemin du Moulin, 64100 Bayonne',
    plu_typedoc:'PLU', plu_datappro:'14/03/2021',
    plu_libelong:'Zone urbaine mixte \u00e0 dominante habitat',
    plu_prescriptions:'Hauteur max\u00a09\u00a0m \u00b7 COS\u00a00,6 \u00b7 retrait 3\u00a0m voie publique',
    plu_servitudes:'AC1 \u2014 Abords monuments historiques'
  }
};

function buildEmail(tplId, mood, mode) {
  const d = SAMPLES[tplId];

  // T1 : lowercase  |  T2 : uppercase (aligne Claude Code)
  const v  = (key) => mode === 'preview' ? (d[key] ?? '') : `{{ params.${key} }}`;
  const ifB = (key, content) => {
    if (mode === 'preview') return d[key] ? content : '';
    return `\n{% if params.${key} %}${content}{% endif %}\n`;
  };
  const vU  = (key) => mode === 'preview' ? (d[key.toLowerCase()] ?? '') : `{{ params.${key} }}`;
  const ifU = (key, content) => {
    if (mode === 'preview') return d[key.toLowerCase()] ? content : '';
    return `\n{% if params.${key} %}${content}{% endif %}\n`;
  };

  const blockSt = mood === 'structure'
    ? `background-color:${C.info};padding:15px 18px;border-left:3px solid ${C.main};`
    : mood === 'signature'
      ? `background-color:${C.info};padding:20px 22px;border-top:2px solid ${C.main};`
      : `background-color:${C.info};padding:20px 22px;`;

  const lbl = `font-family:${SS};font-size:10px;letter-spacing:2.5px;color:${C.subtle};text-transform:uppercase;margin:0 0 6px;`;
  const val = `font-family:${SF};font-size:15px;color:${C.main};margin:0;line-height:1.4;`;

  const sp = (h=20) => `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="height:${h}px;line-height:${h}px;font-size:${h}px;">&nbsp;</td></tr></table>`;

  const infoBlk = (lb, vl) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}">
<p style="${lbl}">${lb}</p><p style="${val}">${vl}</p>
</td></tr></table></td></tr></table>`;

  const twoCol = (l1,v1,l2,v2) => mood === 'structure'
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 12px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
<td width="50%" style="padding-right:6px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}"><p style="${lbl}">${l1}</p><p style="${val}">${v1}</p></td></tr></table></td>
<td width="50%" style="padding-left:6px;vertical-align:top;"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}"><p style="${lbl}">${l2}</p><p style="${val}">${v2}</p></td></tr></table></td>
</tr></table></td></tr></table>`
    : `${infoBlk(l1,v1)}${infoBlk(l2,v2)}`;

  const logoSvg = encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 66" fill="none" stroke="#7469F4" stroke-linecap="round" stroke-width="3.4"><path d="M6,56 C2,47 2,37 2,30 C2,14 13,2 26,2 C39,2 50,14 50,30 C50,43 46,54 37,61"/><path d="M11,60 C8,51 7,42 7,36 C7,22 15,11 26,11 C37,11 45,22 45,36 C45,48 41,58 32,64"/><path d="M17,63 C14,55 13,47 13,42 C13,31 18,21 26,20 C34,21 39,31 39,42 C39,52 35,61 27,66"/><path d="M23,64 C21,57 20,51 20,47 C20,39 22,31 26,29 C30,31 32,39 32,47 C32,53 30,60 25,66"/></svg>');
  const logoUri = `data:image/svg+xml,${logoSvg}`;
  const logoImg = mode === 'preview'
    ? `<img src="${logoUri}" width="34" height="44" alt="Howner" style="display:block;margin-bottom:10px;">`
    : `<!-- ⚠️ Remplacer par URL hébergée ex. https://affinityhousefactory.com/images/howner-logo.png -->\n<img src="https://affinityhousefactory.com/images/howner-logo.png" width="34" height="44" alt="Howner" style="display:block;margin-bottom:10px;">`;

  const hdr = mood === 'signature'
    ? `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="background-color:${C.main};padding:28px 40px;">
${logoImg}
<p style="margin:0 0 3px;font-family:${SF};font-size:19px;font-weight:400;color:#ffffff;letter-spacing:-0.2px;">Howner</p>
<p style="margin:0;font-family:${SS};font-size:10px;letter-spacing:3px;color:#555;text-transform:uppercase;">By Affinity House Factory</p>
</td></tr></table>`
    : `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:32px 40px 0;">
${logoImg}
<p style="margin:0 0 3px;font-family:${SF};font-size:18px;font-weight:400;color:${C.main};letter-spacing:-0.2px;">Howner</p>
<p style="margin:0;font-family:${SS};font-size:10px;letter-spacing:3px;color:${C.subtle};text-transform:uppercase;">By Affinity House Factory</p>
</td></tr></table>`;

  const h1Size = mood === 'signature' ? '27px' : '24px';
  const h1Pad  = mood === 'signature' ? '28px' : '24px';
  const h1 = (txt) => `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:${h1Pad} 40px 0;"><h1 style="font-family:${SF};font-size:${h1Size};font-weight:400;color:${C.main};margin:0;line-height:1.2;letter-spacing:-0.3px;">${txt}</h1></td></tr></table>`;

  const unsubUrl  = mode === 'preview' ? '#' : '{{ unsubscribe_link }}';
  const prefUrl   = mode === 'preview' ? '#' : '{{ update_profile }}';
  const deleteUrl = 'https://affinityhousefactory.com/compte/supprimer';
  const linkSt    = `color:${C.footer};font-family:${SS};font-size:10px;text-decoration:underline;`;

  const foot = `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:24px 40px 40px;">
<hr style="border:none;border-top:1px solid ${C.sep};margin:0 0 18px;">
<p style="font-family:${SS};font-size:11px;color:${C.footer};margin:0 0 3px;">Affinity House Factory \u2014 <a href="https://affinityhousefactory.com" style="color:${C.footer};text-decoration:none;">affinityhousefactory.com</a></p>
<p style="font-family:${SS};font-size:11px;color:${C.footer};margin:0 0 3px;">Howner \u2014 une marque de Affinity House Factory.</p>
<p style="font-family:${SS};font-size:11px;color:${C.footer};margin:0 0 16px;">Cet email confirme la r\u00e9ception de votre demande.</p>
<hr style="border:none;border-top:1px solid ${C.sep};margin:0 0 14px;">
<p style="font-family:${SS};font-size:10px;color:${C.footer};margin:0;line-height:2;letter-spacing:0.2px;">
<a href="${unsubUrl}" style="${linkSt}">Se d\u00e9sinscrire</a>
<span style="color:${C.sep};padding:0 8px;">&middot;</span>
<a href="${prefUrl}" style="${linkSt}">G\u00e9rer mes pr\u00e9f\u00e9rences</a>
<span style="color:${C.sep};padding:0 8px;">&middot;</span>
<a href="${deleteUrl}" style="${linkSt}">Supprimer mon compte</a>
</p>
</td></tr></table>`;

  const wrap = (inner) => `<!DOCTYPE html>
<html lang="fr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:${C.bg};">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${C.bg};padding:36px 16px;">
<tr><td align="center">
<table cellpadding="0" cellspacing="0" border="0" style="background-color:${C.white};width:100%;max-width:560px;">
<tr><td>${inner}</td></tr>
</table></td></tr></table>
</body></html>`;

  const sectionTitle = (txt) => `<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 12px;"><p style="font-family:${SS};font-size:10px;letter-spacing:2.5px;color:${C.subtle};text-transform:uppercase;margin:0;border-bottom:1px solid ${C.sep};padding-bottom:10px;">${txt}</p></td></tr></table>`;

  const bigPrice = (lbTxt, vlTxt) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="border-top:2px solid ${C.main};padding:18px 22px;background-color:${C.info};">
<p style="${lbl}">${lbTxt}</p>
<p style="font-family:${SF};font-size:22px;font-weight:700;color:${C.main};margin:0;">${vlTxt}</p>
</td></tr></table></td></tr></table>`;

  // ─── T1 : Confirmation contact (params lowercase) ───────────────────────
  if (tplId === 1) {
    return wrap(`
${hdr}
${h1('Votre message<br>a bien \u00e9t\u00e9 re\u00e7u.')}
${sp(20)}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px;">
<p style="font-family:${SS};font-size:14px;color:${C.body};line-height:1.65;margin:0 0 6px;">Bonjour <strong style="color:${C.main};">${v('prenom')} ${v('nom')}</strong>,</p>
<p style="font-family:${SS};font-size:14px;color:${C.body};line-height:1.65;margin:0;">Nous avons bien re\u00e7u votre message et reviendrons vers vous sous 24&nbsp;h ouvr\u00e9es.</p>
</td></tr></table>
${sp(22)}
${ifB('produit_label', infoBlk('MOD\u00c8LE CONCERN\u00c9', v('produit_label')))}
${infoBlk('VOTRE MESSAGE', `<em style="font-family:${SF};font-size:14px;color:${C.body};line-height:1.7;font-style:italic;">${v('message')}</em>`)}
${foot}`);
  }

  // ─── T2 : Récap configurateur + Réservation (params UPPERCASE) ──────────
  const reservationSection = `
${sp(8)}
${sectionTitle('VOTRE R\u00c9SERVATION')}
${sp(8)}
${twoCol('N\u00b0\u00a0DE R\u00c9SERVATION', vU('NUMERO'), 'PRODUIT', vU('PRODUIT'))}
${ifU('MAISON_TTC', bigPrice('MAISON TTC', vU('MAISON_TTC')))}
${ifU('LIVRAISON', infoBlk('LIVRAISON', vU('LIVRAISON')))}
${ifU('TERRAIN', infoBlk('TERRAIN', vU('TERRAIN')))}`;

  const configSection = `
${sp(8)}
${sectionTitle('VOTRE CONFIGURATION')}
${sp(8)}
${twoCol('MOD\u00c8LE', vU('MODELE'), 'BARDAGE', vU('BARDAGE'))}
${twoCol('CUISINE', vU('FACADE'), 'BARRE', vU('BAR'))}
${twoCol('CHAMBRE', vU('CHAMBRE'), 'INT\u00c9RIEUR', vU('INTERIEUR'))}
${ifU('TERRASSE_M2', infoBlk('TERRASSE', `${vU('TERRASSE_M2')}\u00a0m\u00b2`))}
${ifU('OPTIONS_LABELS', infoBlk('OPTIONS', vU('OPTIONS_LABELS')))}
${ifU('TOTAL_ESTIME', bigPrice('ESTIMATION TOTALE', vU('TOTAL_ESTIME')))}`;

  const terrainSection = `
${sp(8)}
${sectionTitle('RECHERCHE DE TERRAIN')}
${sp(8)}
${infoBlk('PACK', vU('PACK_LABEL'))}
${ifU('ZONES', infoBlk('ZONES / COMMUNES', vU('ZONES')))}
${ifU('BUDGET', infoBlk('BUDGET TERRAIN', vU('BUDGET')))}`;

  const infoBlkProse = (lb, vl) => `
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px 13px;">
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="${blockSt}">
<p style="${lbl}">${lb}</p><p style="font-family:${SS};font-size:13px;color:${C.body};margin:0;line-height:1.65;">${vl}</p>
</td></tr></table></td></tr></table>`;

  const pluSection = `
${sp(8)}
${sectionTitle('DONN\u00c9ES PLU')}
${sp(8)}
${twoCol('PARCELLE', vU('PLU_PARCELLE'), 'ZONE PLU', vU('PLU_ZONE'))}
${ifU('PLU_ADRESSE', infoBlk('ADRESSE', vU('PLU_ADRESSE')))}
${ifU('PLU_TYPEDOC', infoBlk('TYPE DE DOCUMENT', vU('PLU_TYPEDOC')))}
${ifU('PLU_DATAPPRO', infoBlk('DATE D\u2019APPROBATION', vU('PLU_DATAPPRO')))}
${ifU('PLU_LIBELONG', infoBlkProse('LIBELL\u00c9 DE ZONE', vU('PLU_LIBELONG')))}
${ifU('PLU_PRESCRIPTIONS', infoBlkProse('PRESCRIPTIONS', vU('PLU_PRESCRIPTIONS')))}
${ifU('PLU_SERVITUDES', infoBlkProse('SERVITUDES', vU('PLU_SERVITUDES')))}`;

  const coordsSection = `
${sp(8)}
${sectionTitle('VOS COORDONN\u00c9ES')}
${sp(8)}
${twoCol('NOM', vU('NOM'), 'EMAIL', vU('EMAIL'))}
${ifU('TEL', infoBlk('T\u00c9L\u00c9PHONE', vU('TEL')))}`;

  return wrap(`
${hdr}
${h1('R\u00e9capitulatif<br>de votre demande.')}
${sp(20)}
<table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding:0 40px;">
<p style="font-family:${SS};font-size:14px;color:${C.body};line-height:1.65;margin:0 0 6px;">Bonjour <strong style="color:${C.main};">${ifU('PRENOM', `${vU('PRENOM')} `)}${vU('NOM')}</strong>,</p>
<p style="font-family:${SS};font-size:14px;color:${C.body};line-height:1.65;margin:0;">Voici le r\u00e9capitulatif de votre demande. Nous revenons vers vous sous 48\u00a0h ouvr\u00e9es.</p>
</td></tr></table>
${sp(24)}
${ifU('NUMERO', reservationSection)}
${ifU('MODELE', configSection)}
${ifU('PACK_LABEL', terrainSection)}
${ifU('PLU_ZONE', pluSection)}
${coordsSection}
${foot}`);
}

export default function App() {
  const [tpl, setTpl] = useState(1);
  const [mood, setMood] = useState('sobre');
  const [tab, setTab] = useState('preview');
  const [copied, setCopied] = useState(false);
  const [modal, setModal] = useState(false);
  const taRef = React.useRef(null);

  const previewHTML = buildEmail(tpl, mood, 'preview');
  const brevoHTML   = buildEmail(tpl, mood, 'brevo');

  const copy = () => {
    const tryClipboard = navigator.clipboard?.writeText(brevoHTML);
    if (tryClipboard) {
      tryClipboard.then(() => { setCopied(true); setTimeout(() => setCopied(false), 2200); }).catch(() => setModal(true));
    } else { setModal(true); }
  };

  const onModalOpen = () => { setTimeout(() => { if (taRef.current) { taRef.current.focus(); taRef.current.select(); } }, 80); };

  const sBtn = (active) => ({
    display:'block', width:'100%', textAlign:'left', cursor:'pointer',
    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
    border: active ? '1px solid rgba(255,255,255,0.15)' : '1px solid transparent',
    borderRadius:4, padding:'10px 12px', marginBottom:5, color:'#fff'
  });

  const tabBtn = (active) => ({
    padding:'6px 16px', fontSize:10, borderRadius:3, cursor:'pointer', border:'none',
    background: active ? C.main : '#e8e8e4', color: active ? '#fff' : '#999',
    fontFamily:SS, letterSpacing:'1.2px', textTransform:'uppercase'
  });

  const subjects = {
    1: 'Votre message a bien \u00e9t\u00e9 re\u00e7u \u2014 Affinity House Factory',
    2: 'R\u00e9capitulatif de votre demande ARKO \u2014 Affinity House Factory',
  };

  return (
    <div style={{ display:'flex', height:'100vh', fontFamily:SS, background:'#eeedea' }}>

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.55)', zIndex:100, display:'flex', alignItems:'center', justifyContent:'center' }}
          onClick={() => setModal(false)}>
          <div style={{ background:'#fff', borderRadius:4, padding:28, width:'90%', maxWidth:620, boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()} ref={() => onModalOpen()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <div>
                <p style={{ margin:'0 0 2px', fontSize:13, fontFamily:SF, color:C.main }}>Copier le HTML Brevo</p>
                <p style={{ margin:0, fontSize:11, color:'#999' }}>Ctrl+A dans la zone puis Ctrl+C</p>
              </div>
              <button onClick={() => setModal(false)} style={{ background:'none', border:'none', fontSize:18, cursor:'pointer', color:'#aaa' }}>✕</button>
            </div>
            <textarea ref={taRef} readOnly value={brevoHTML}
              style={{ width:'100%', height:320, fontSize:11, fontFamily:'Consolas,Monaco,monospace', lineHeight:1.6,
                background:'#16191c', color:'#8ba5b8', border:'none', borderRadius:3, padding:14, resize:'none', outline:'none', boxSizing:'border-box' }} />
            <div style={{ marginTop:12, display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button onClick={() => setModal(false)} style={{ padding:'7px 18px', fontSize:11, borderRadius:3, cursor:'pointer', background:'#f0efe9', color:'#888', border:'none' }}>Fermer</button>
              <button onClick={() => { taRef.current?.select(); document.execCommand('copy'); setCopied(true); setModal(false); setTimeout(()=>setCopied(false),2200); }}
                style={{ padding:'7px 18px', fontSize:11, borderRadius:3, cursor:'pointer', background:C.main, color:'#fff', border:'none' }}>Copier</button>
            </div>
          </div>
        </div>
      )}

      <aside style={{ width:220, background:C.main, color:'#fff', padding:'24px 18px', flexShrink:0, display:'flex', flexDirection:'column', overflowY:'auto' }}>
        <div style={{ marginBottom:32 }}>
          <p style={{ margin:'0 0 3px', fontSize:9, letterSpacing:3.5, color:'#555', textTransform:'uppercase' }}>ARKO</p>
          <p style={{ margin:0, fontSize:15, fontFamily:SF }}>Email Studio</p>
        </div>

        <section style={{ marginBottom:26 }}>
          <p style={{ margin:'0 0 10px', fontSize:9, letterSpacing:2.5, color:'#555', textTransform:'uppercase' }}>TEMPLATE</p>
          {[
            { id:1, name:'Confirmation contact', sub:'/contact · BREVO_TEMPLATE_CONTACT' },
            { id:2, name:'Récap + Réservation', sub:'/configurer · BREVO_TEMPLATE_RECAP' },
          ].map(t => (
            <button key={t.id} onClick={() => setTpl(t.id)} style={sBtn(tpl===t.id)}>
              <p style={{ margin:'0 0 2px', fontSize:12, fontFamily:SF, color: tpl===t.id ? '#fff' : '#aaa' }}>{t.name}</p>
              <p style={{ margin:0, fontSize:9, color:'#555' }}>{t.sub}</p>
            </button>
          ))}
        </section>

        <section style={{ marginBottom:26 }}>
          <p style={{ margin:'0 0 10px', fontSize:9, letterSpacing:2.5, color:'#555', textTransform:'uppercase' }}>HUMEUR</p>
          {[
            { id:'sobre',     name:'Sobre',     desc:'Aéré · Minimaliste' },
            { id:'structure', name:'Structuré', desc:'Grille 2 col · Labels forts' },
            { id:'signature', name:'Signature', desc:'Header sombre · Exclusif' },
          ].map(m => (
            <button key={m.id} onClick={() => setMood(m.id)} style={sBtn(mood===m.id)}>
              <p style={{ margin:'0 0 2px', fontSize:12, fontFamily:SF, color: mood===m.id ? '#fff' : '#aaa' }}>{m.name}</p>
              <p style={{ margin:0, fontSize:9, color:'#555' }}>{m.desc}</p>
            </button>
          ))}
        </section>

        <div style={{ borderTop:'1px solid #2a2a27', paddingTop:18, marginTop:'auto' }}>
          <p style={{ margin:'0 0 8px', fontSize:9, letterSpacing:2.5, color:'#555', textTransform:'uppercase' }}>Données exemple</p>
          <div style={{ fontSize:10, color:'#555', lineHeight:1.9 }}>
            {tpl === 1 ? (<>
              <p style={{margin:0}}>Marie Dupont</p>
              <p style={{margin:0}}>Arko One (20 m²)</p>
              <p style={{margin:0}}>Message libre</p>
            </>) : (<>
              <p style={{margin:0}}>Jean Martin · n°02</p>
              <p style={{margin:0}}>Arko One · Anthracite</p>
              <p style={{margin:0}}>67 400 € TTC</p>
              <p style={{margin:0}}>Pays Basque · Landes</p>
            </>)}
          </div>
        </div>
      </aside>

      <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
        <div style={{ background:'#fff', borderBottom:'1px solid #e8e8e4', padding:'10px 20px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ display:'flex', gap:5, flex:1 }}>
            <button onClick={() => setTab('preview')} style={tabBtn(tab==='preview')}>Aperçu</button>
            <button onClick={() => setTab('code')} style={tabBtn(tab==='code')}>HTML Brevo</button>
          </div>
          <div style={{ fontSize:10, color:'#bbb', letterSpacing:0.5 }}>Template {tpl} · {mood}</div>
          <button onClick={copy} style={{
            padding:'7px 20px', fontSize:10, borderRadius:3, cursor:'pointer',
            background: copied ? '#2a5e24' : C.main, color:'#fff', border:'none',
            fontFamily:SS, letterSpacing:'0.8px', textTransform:'uppercase'
          }}>{copied ? '✓ Copié !' : '⧉ Copier HTML'}</button>
        </div>

        <div style={{ flex:1, overflow:'auto', background:'#eeedea', padding: tab==='preview' ? '28px 24px' : 0 }}>
          {tab === 'preview' ? (
            <div style={{ maxWidth:620, margin:'0 auto' }}>
              <div style={{ marginBottom:10, display:'flex', gap:12, alignItems:'center' }}>
                <span style={{ fontSize:9, color:'#aaa', letterSpacing:2, textTransform:'uppercase' }}>Aperçu · données exemple</span>
                <span style={{ fontSize:9, color:'#ccc' }}>·</span>
                <span style={{ fontSize:9, color:'#aaa', letterSpacing:2, textTransform:'uppercase' }}>{mood}</span>
              </div>
              <div style={{ boxShadow:'0 4px 24px rgba(0,0,0,0.09)', borderRadius:2 }}>
                <iframe srcDoc={previewHTML} style={{ width:'100%', border:'none', display:'block', borderRadius:2 }}
                  height={tpl === 1 ? 560 : 1520} sandbox="allow-same-origin" title="Email preview" />
              </div>
              <div style={{ marginTop:14, padding:'12px 16px', background:'#fff', borderRadius:2, border:'1px solid #e8e8e4' }}>
                <p style={{ margin:'0 0 4px', fontSize:10, color:C.subtle, letterSpacing:1.5, textTransform:'uppercase' }}>Sujet Brevo</p>
                <p style={{ margin:0, fontSize:13, fontFamily:SF, color:C.main }}>{subjects[tpl]}</p>
              </div>
            </div>
          ) : (
            <div style={{ height:'100%', display:'flex', flexDirection:'column', minHeight:0 }}>
              <div style={{ padding:'10px 20px', background:'#16191c', borderBottom:'1px solid #2a2e32', fontSize:9, color:'#555', letterSpacing:1.5, textTransform:'uppercase', display:'flex', justifyContent:'space-between', flexShrink:0 }}>
                <span>HTML · Syntaxe Brevo / Jinja2</span>
                <span style={{ color:'#444' }}>Brevo › Email Templates › New Template › HTML editor</span>
              </div>
              <pre style={{ margin:0, flex:1, padding:'18px 22px', fontSize:11, lineHeight:1.7, color:'#8ba5b8',
                background:'#16191c', fontFamily:'Consolas,Monaco,monospace', overflow:'auto', whiteSpace:'pre-wrap', wordBreak:'break-all' }}>
                {brevoHTML}
              </pre>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
