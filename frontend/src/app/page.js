// "use client";
// import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import {
//   ComposedChart, AreaChart, Area, Line, Bar, XAxis, YAxis,
//   Tooltip, ResponsiveContainer, CartesianGrid, Legend,
//   RadarChart, PolarGrid, PolarAngleAxis, Radar,
//   BarChart,
// } from 'recharts';

// const FONT_LINK = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap";

// /* ─── Day/Night detection ─────────────────────────────────────────────────── */
// function isCurrentlyDay(sunriseStr = '06:00', sunsetStr = '18:30') {
//   const extractTime = s => typeof s === 'string' && s.includes('T') ? s.split('T')[1].substring(0, 5) : String(s).substring(0, 5);
//   const toMins = s => { const [h, m] = extractTime(s).split(':').map(Number); return h * 60 + m; };
//   const now = new Date();
//   const cur = now.getHours() * 60 + now.getMinutes();
//   return cur >= toMins(sunriseStr) && cur <= toMins(sunsetStr);
// }

// /* ─── Theme map ───────────────────────────────────────────────────────────── */
// const THEMES = {
//   sunny: { day:{ g1:'#120d00', g2:'#241a00', g3:'#362600',accent:'#f59e0b',glow:'rgba(245,158,11,0.2)',label:'Sunny' },   night:{ g1:'#1c0a00',g2:'#2e1800',g3:'#3d2800',accent:'#f59e0b',glow:'rgba(245,158,11,0.15)',label:'Sunny' },   emoji:'☀️' },
//   cloudy:  { day:{ g1:'#3a4a5c',g2:'#4e6070',g3:'#627888',accent:'#94a3b8',glow:'rgba(148,163,184,0.2)',label:'Cloudy' }, night:{ g1:'#0b111d',g2:'#141e2e',g3:'#1c2b40',accent:'#94a3b8',glow:'rgba(148,163,184,0.1)',label:'Cloudy' }, emoji:'☁️' },
//   rainy:   { day:{ g1:'#1e3a4a',g2:'#284e64',g3:'#2e6278',accent:'#38bdf8',glow:'rgba(56,189,248,0.25)',label:'Rainy' },  night:{ g1:'#020917',g2:'#051828',g3:'#082238',accent:'#38bdf8',glow:'rgba(56,189,248,0.12)',label:'Rainy' },  emoji:'🌧️' },
//   stormy:  { day:{ g1:'#1e1040',g2:'#2a1855',g3:'#352060',accent:'#a855f7',glow:'rgba(168,85,247,0.25)',label:'Stormy' }, night:{ g1:'#07000f',g2:'#0f001a',g3:'#180025',accent:'#a855f7',glow:'rgba(168,85,247,0.15)',label:'Stormy' }, emoji:'⛈️' },
//   foggy:   { day:{ g1:'#4a4a50',g2:'#585860',g3:'#666670',accent:'#9ca3af',glow:'rgba(156,163,175,0.2)',label:'Foggy' },  night:{ g1:'#101010',g2:'#191920',g3:'#22222e',accent:'#9ca3af',glow:'rgba(156,163,175,0.1)',label:'Foggy' },  emoji:'🌫️' },
//   windy:   { day:{ g1:'#0a2a4a',g2:'#103866',g3:'#164478',accent:'#67e8f9',glow:'rgba(103,232,249,0.25)',label:'Windy' }, night:{ g1:'#020d1e',g2:'#061828',g3:'#0a2235',accent:'#67e8f9',glow:'rgba(103,232,249,0.12)',label:'Windy' }, emoji:'💨' },
//   humid:   { day:{ g1:'#0a3020',g2:'#104030',g3:'#185040',accent:'#34d399',glow:'rgba(52,211,153,0.25)',label:'Humid' },  night:{ g1:'#001510',g2:'#002218',g3:'#003020',accent:'#34d399',glow:'rgba(52,211,153,0.12)',label:'Humid' },  emoji:'🌿' },
//   clear: { day:{ g1:'#0a2040',g2:'#163060',g3:'#1e3e7a',accent:'#60a5fa',glow:'rgba(96,165,250,0.25)',label:'Clear' },  night:{ g1:'#050d1a',g2:'#0d1f35',g3:'#152d4a',accent:'#60a5fa',glow:'rgba(96,165,250,0.12)',label:'Clear' },  emoji:'🌤️' },
//   default: { day:{ g1:'#0a2040',g2:'#163060',g3:'#1e3e7a',accent:'#60a5fa',glow:'rgba(96,165,250,0.25)',label:'Weather' },night:{ g1:'#050d1a',g2:'#0d1f35',g3:'#152d4a',accent:'#60a5fa',glow:'rgba(96,165,250,0.12)',label:'Weather' },emoji:'🌡️' },
// };

// // function getTheme(condition = '', sunrise = '06:00', sunset = '18:30') {
// //   const c = condition.toLowerCase();
// //   const day = isCurrentlyDay(sunrise, sunset);
// //   for (const [key, val] of Object.entries(THEMES)) {
// //     if (c.includes(key)) {
// //       const variant = day ? val.day : val.night;
// //       return { ...variant, key, emoji: val.emoji, isDay: day };
// //     }
// //   }
// //   const def = THEMES.default;
// //   const variant = day ? def.day : def.night;
// //   return { ...variant, key: 'default', emoji: def.emoji, isDay: day };
// // }
// function getTheme(condition = '', sunrise = '06:00', sunset = '18:30') {
//   const c = condition.toLowerCase();
//   const day = isCurrentlyDay(sunrise, sunset);

//   // Group conditions to the correct theme key
//   let matchedKey = 'default';
//   if (c.match(/storm|thunder/)) matchedKey = 'stormy';
//   else if (c.match(/rain|drizzle|shower/)) matchedKey = 'rainy';
//   else if (c.match(/cloud|overcast/)) matchedKey = 'cloudy';
//   else if (c.match(/fog|mist|haze/)) matchedKey = 'foggy';
//   else if (c.match(/wind/)) matchedKey = 'windy';
//   else if (c.match(/clear|sun/)) matchedKey = day ? 'sunny' : 'clear';

//   // Apply the matched theme
//   const themeData = THEMES[matchedKey] || THEMES.default;
//   const variant = day ? themeData.day : themeData.night;
  
//   return { ...variant, key: matchedKey, emoji: themeData.emoji, isDay: day };
// }

// function getWeatherEmoji(condition = '', isDay = true) {
//   const c = condition.toLowerCase();
  
//   // 1. Severe weather conditions
//   if (c.match(/thunder|storm/)) return '⛈️';
//   if (c.match(/rain|drizzle|shower/)) return '🌧️';
//   if (c.match(/snow|sleet|hail/)) return '❄️';
//   if (c.match(/wind|breeze/)) return '💨';
  
//   // 2. Partly Cloudy (Sun or Moon peeking from behind a cloud)
//   if (c.match(/partly|partially|mostly/)) {
//     return isDay ? '⛅' : '☁️'; 
//   }
  
//   // 3. Fully Cloudy / Overcast / Fog (Just a solid cloud, no sun/moon visible)
//   if (c.match(/cloud|overcast|fog|mist|haze/)) {
//     return '☁️'; 
//   }
  
//   // 4. Completely clear skies fallback
//   return isDay ? '☀️' : '🌙';
// }

// /* ─── Utility labels ──────────────────────────────────────────────────────── */
// const uvInfo  = u => u<=2?{l:'Low',c:'#4ade80'}:u<=5?{l:'Moderate',c:'#facc15'}:u<=7?{l:'High',c:'#fb923c'}:u<=10?{l:'Very High',c:'#f87171'}:{l:'Extreme',c:'#c084fc'};
// const aqiInfo = a => !a?{l:'N/A',c:'#64748b'}:a<=50?{l:'Good',c:'#4ade80'}:a<=100?{l:'Moderate',c:'#facc15'}:a<=150?{l:'Sensitive',c:'#fb923c'}:a<=200?{l:'Unhealthy',c:'#f87171'}:{l:'Hazardous',c:'#c084fc'};
// const compassDir = d => ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(d/22.5)%16];
// const moonPhase = () => { const d=Math.floor((Date.now()/86400000-10)%29.53); return d<2?'🌑':d<6?'🌒':d<10?'🌓':d<14?'🌔':d<17?'🌕':d<21?'🌖':d<25?'🌗':'🌘'; };

// /* ─── GLOBAL CSS ──────────────────────────────────────────────────────────── */
// const GLOBAL_CSS = `
// @import url('${FONT_LINK}');
// *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
// ::-webkit-scrollbar{width:3px;height:3px;}
// ::-webkit-scrollbar-track{background:transparent;}
// ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:4px;}
// ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.35);}
// @keyframes rain{0%{transform:translateY(-10px) scaleY(0.8);opacity:0;}15%{opacity:0.6;}100%{transform:translateY(110vh) scaleY(1);opacity:0;}}
// @keyframes ticker{0%{transform:translateX(100vw);}100%{transform:translateX(-100%);}}
// @keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
// @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
// @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
// @keyframes slideRight{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
// @keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}
// @keyframes glow{0%,100%{box-shadow:0 0 8px var(--accent-glow);}50%{box-shadow:0 0 22px var(--accent-glow);}}
// @keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
// @keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:0.6;}100%{transform:translateY(-80px) scale(0.3);opacity:0;}}
// @keyframes cloud{0%{transform:translateX(-120px);}100%{transform:translateX(110vw);}}
// @keyframes blowWind {
//   0% { transform: translateX(120vw) scaleX(1); opacity: 0; }
//   15% { opacity: 0.3; }
//   85% { opacity: 0.3; }
//   100% { transform: translateX(-20vw) scaleX(2.5); opacity: 0; }
// }
// @keyframes voiceBar{from{transform:scaleY(0.3);opacity:0.5;}to{transform:scaleY(1);opacity:1;}}
// .city-row{transition:background 0.18s,transform 0.18s;cursor:pointer;}
// .city-row:hover{background:rgba(255,255,255,0.08)!important;transform:translateX(3px);}
// .tab{transition:all 0.2s ease;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;}
// .tab:hover{opacity:1!important;}
// .chip{transition:all 0.15s ease;cursor:pointer;}
// .chip:hover{opacity:1!important;transform:translateY(-1px);}
// .icon-btn{transition:all 0.2s ease;cursor:pointer;}
// .icon-btn:hover{opacity:1!important;background:rgba(255,255,255,0.15)!important;}
// .search-input:focus{outline:none;}
// .stat-card{transition:transform 0.2s,box-shadow 0.2s;}
// .stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3);}
// .state-header{transition:background 0.15s;cursor:pointer;}
// .state-header:hover{background:rgba(255,255,255,0.08)!important;}
// `;

// /* ─── Rain drops ──────────────────────────────────────────────────────────── */
// const DROPS = Array.from({length:35},()=>({
//   left:`${Math.random()*100}%`, h:`${Math.random()*22+8}px`,
//   dur:`${Math.random()*0.9+0.45}s`, del:`${Math.random()*2.5}s`,
//   op: Math.random()*0.3+0.2,
// }));

// const CLOUDS = Array.from({length:6},()=>({
//   top:`${Math.random()*25+2}%`, scale:Math.random()*0.6+0.6,
//   dur:`${Math.random()*30+40}s`, del:`${-Math.random()*40}s`,
//   opacity:Math.random()*0.25+0.15,
// }));

// const PARTICLES = Array.from({length:18},()=>({
//   left:`${Math.random()*100}%`, top:`${Math.random()*60+20}%`,
//   size:`${Math.random()*4+2}px`, dur:`${Math.random()*4+3}s`,
//   del:`${Math.random()*5}s`,
// }));

// function WeatherParticles({ accent }) {
//   return (
//     <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
//       {PARTICLES.map((p,i)=>(
//         <div key={i} style={{position:'absolute',left:p.left,top:p.top,
//           width:p.size,height:p.size,borderRadius:'50%',background:accent,opacity:0,
//           animation:`floatUp ${p.dur} ${p.del} ease-in infinite`}}/>
//       ))}
//     </div>
//   );
// }

// function CloudLayer() {
//   return (
//     <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
//       {CLOUDS.map((c,i)=>(
//         <div key={i} style={{position:'absolute',top:c.top,left:'-150px',
//           transform:`scale(${c.scale})`,opacity:c.opacity,
//           animation:`cloud ${c.dur} ${c.del} linear infinite`}}>
//           <svg width="180" height="70" viewBox="0 0 180 70">
//             <ellipse cx="90" cy="55" rx="85" ry="20" fill="rgba(200,220,255,0.9)"/>
//             <ellipse cx="65" cy="42" rx="42" ry="30" fill="rgba(200,220,255,0.9)"/>
//             <ellipse cx="110" cy="38" rx="50" ry="35" fill="rgba(200,220,255,0.9)"/>
//             <ellipse cx="140" cy="48" rx="32" ry="22" fill="rgba(200,220,255,0.9)"/>
//           </svg>
//         </div>
//       ))}
//     </div>
//   );
// }

// function RainEffect({ isDay }) {
//   const dropColor = isDay ? 'rgba(100,160,220,' : 'rgba(147,210,255,';
//   return (
//     <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
//       {DROPS.map((d,i)=>(
//         <div key={i} style={{position:'absolute',left:d.left,top:'-5%',width:'1.5px',height:d.h,
//           background:`${dropColor}${d.op})`,animationName:'rain',animationDuration:d.dur,
//           animationDelay:d.del,animationTimingFunction:'linear',animationIterationCount:'infinite'}}/>
//       ))}
//     </div>
//   );
// }

// const WIND_STREAKS = Array.from({ length: 12 }, () => ({
//   top: `${Math.random() * 85 + 5}%`,
//   width: `${Math.random() * 150 + 80}px`, // long streaks
//   dur: `${Math.random() * 1.2 + 0.8}s`, // fast moving
//   del: `${Math.random() * 2.5}s`,
//   op: Math.random() * 0.2 + 0.1,
// }));

// function WindEffect({ isDay }) {
//   // Streaks are white during the day, slight blue/gray at night
//   const color = isDay ? '255,255,255' : '170,200,240'; 
//   return (
//     <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
//       {WIND_STREAKS.map((w, i) => (
//         <div key={i} style={{
//           position: 'absolute', top: w.top, left: '-20%', width: w.width, height: '2px',
//           background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},${w.op}) 50%, rgba(${color},0) 100%)`,
//           borderRadius: '50%',
//           animation: `blowWind ${w.dur} ${w.del} linear infinite`
//         }} />
//       ))}
//     </div>
//   );
// }

// /* ─── Live Clock ──────────────────────────────────────────────────────────── */
// function LiveClock({ accent, format='12h' }) {
//   const [t, setT] = useState(new Date());
//   useEffect(()=>{ const id=setInterval(()=>setT(new Date()),1000); return ()=>clearInterval(id); },[]);
//   let hours = t.getHours();
//   const ampm = hours >= 12 ? ' PM' : ' AM';
//   if (format==='12h') hours = hours % 12 || 12;
//   const hh=String(hours).padStart(2,'0'), mm=String(t.getMinutes()).padStart(2,'0'), ss=String(t.getSeconds()).padStart(2,'0');
//   const date=t.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
//   return (
//     <div style={{textAlign:'right'}}>
//       <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:500,color:'#fff',letterSpacing:'0.04em',lineHeight:1}}>
//         {hh}<span style={{color:accent,animation:'blink 2s step-start infinite'}}>:</span>{mm}
//         <span style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginLeft:4}}>
//           {ss}{format==='12h'&&<span style={{fontSize:10,marginLeft:2}}>{ampm}</span>}
//         </span>
//       </div>
//       <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:3}}>{date}</div>
//     </div>
//   );
// }

// /* ─── Sun Arc ─────────────────────────────────────────────────────────────── */
// function SunArc({ sunrise='06:00', sunset='18:30', accent='#f59e0b' }) {
//   const extractTime = s => typeof s==='string'&&s.includes('T')?s.split('T')[1].substring(0,5):String(s).substring(0,5);
//   const safeSunrise=extractTime(sunrise), safeSunset=extractTime(sunset);
//   const now=new Date();
//   const toMins=s=>{ const [h,m]=s.split(':').map(Number); return h*60+m; };
//   const curMins=now.getHours()*60+now.getMinutes();
//   const sr=toMins(safeSunrise), ss=toMins(safeSunset);
//   const isDay=curMins>=sr&&curMins<=ss;
//   let progress, leftLabel, rightLabel, timeText;
//   if (isDay) {
//     progress=(curMins-sr)/(ss-sr); leftLabel=safeSunrise; rightLabel=safeSunset;
//     const ml=ss-curMins; timeText=`${Math.floor(ml/60)}h ${ml%60}m until sunset`;
//   } else {
//     const totalNight=(24*60-ss)+sr;
//     const elapsed=curMins>=ss?(curMins-ss):((24*60-ss)+curMins);
//     const ml=totalNight-elapsed;
//     progress=elapsed/totalNight; leftLabel=safeSunset; rightLabel=safeSunrise;
//     timeText=`${Math.floor(ml/60)}h ${ml%60}m until sunrise`;
//   }
//   progress=Math.max(0,Math.min(1,progress));
//   const W=220,H=90,cx=110,cy=90,R=75;
//   const angle=Math.PI-progress*Math.PI;
//   const sx=cx+R*Math.cos(Math.PI),sy=cy+R*Math.sin(Math.PI);
//   const ex=cx+R*Math.cos(0),ey=cy+R*Math.sin(0);
//   const mX=cx+R*Math.cos(angle), mY=cy-Math.abs(R*Math.sin(angle));
//   return (
//     <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
//       <svg width={W} height={H+16} viewBox={`0 0 ${W} ${H+16}`} style={{overflow:'visible'}}>
//         <path d={`M ${sx} ${cy} A ${R} ${R} 0 0 1 ${ex} ${ey}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" strokeLinecap="round"/>
//         <path d={`M ${sx} ${cy} A ${R} ${R} 0 0 1 ${ex} ${ey}`} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${progress*Math.PI*R} ${Math.PI*R}`} opacity={isDay?"0.8":"0.4"}/>
//         <line x1={sx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4"/>
//         <circle cx={mX} cy={mY} r="10" fill={accent} opacity={isDay?"0.25":"0.1"}/>
//         <circle cx={mX} cy={mY} r="6"  fill={accent} opacity={isDay?"1":"0.5"}/>
//         <circle cx={sx} cy={cy} r="3"  fill={accent} opacity="0.5"/>
//         <circle cx={ex} cy={ey} r="3"  fill={accent} opacity="0.5"/>
//         <text x={sx-4} y={cy+16} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{leftLabel}</text>
//         <text x={ex+4} y={cy+16} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{rightLabel}</text>
//       </svg>
//       <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:-4}}>{timeText}</div>
//     </div>
//   );
// }

// /* ─── Wind Rose ───────────────────────────────────────────────────────────── */
// function WindRose({ deg=0, speed=0, accent, gust=0 }) {
//   const dirs=['N','NE','E','SE','S','SW','W','NW'];
//   const nX=50+36*Math.sin(deg*Math.PI/180), nY=50-36*Math.cos(deg*Math.PI/180);
//   const tX=50-14*Math.sin(deg*Math.PI/180), tY=50+14*Math.cos(deg*Math.PI/180);
//   return (
//     <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
//       <svg width="120" height="120" viewBox="0 0 100 100">
//         <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
//         <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 4"/>
//         {[...Array(36)].map((_,i)=>{ const a=i*10*Math.PI/180,r1=i%9===0?38:i%3===0?41:43; return <line key={i} x1={50+r1*Math.sin(a)} y1={50-r1*Math.cos(a)} x2={50+45*Math.sin(a)} y2={50-45*Math.cos(a)} stroke="rgba(255,255,255,0.12)" strokeWidth={i%9===0?1.2:0.6}/>; })}
//         {dirs.map((d,i)=>{ const a=i*45*Math.PI/180; return <text key={d} x={50+40*Math.sin(a)} y={50-40*Math.cos(a)} textAnchor="middle" dominantBaseline="middle" fontSize={d.length===1?'8':'6'} fill={d==='N'?accent:'rgba(255,255,255,0.4)'} fontWeight={d==='N'?700:400} fontFamily="'JetBrains Mono',monospace">{d}</text>; })}
//         <defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><polygon points="0 0,6 3,0 6" fill={accent}/></marker></defs>
//         <line x1={tX} y1={tY} x2={nX*0.96+(50*0.04)} y2={nY*0.96+(50*0.04)} stroke={accent} strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrowhead)" opacity="0.9"/>
//         <circle cx="50" cy="50" r="4" fill={accent} opacity="0.4"/>
//         <circle cx="50" cy="50" r="2.5" fill={accent}/>
//       </svg>
//       <div style={{textAlign:'center'}}>
//         <div style={{fontSize:26,fontWeight:700,color:'#fff',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.02em'}}>{speed}<span style={{fontSize:13,color:'rgba(255,255,255,0.4)',fontWeight:400}}> km/h</span></div>
//         <div style={{fontSize:11,color:accent,marginTop:2}}>{compassDir(deg)} · Gusts {gust} km/h</div>
//       </div>
//     </div>
//   );
// }

// /* ─── Hourly Forecast ─────────────────────────────────────────────────────── */
// function HourlyForecast({ data, accent }) {
//   if (!data?.length) return null;
//   const max=Math.max(...data.map(d=>d.temp)), min=Math.min(...data.map(d=>d.temp));
//   return (
//     <div style={{overflowX:'auto',paddingBottom:6}}>
//       <div style={{display:'flex',gap:10,minWidth:'max-content'}}>
//         {data.map((h,i)=>{
//           const pct=max===min?50:((h.temp-min)/(max-min))*100;
//           return (
//             <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,minWidth:56,
//               background:'rgba(255,255,255,0.04)',borderRadius:12,padding:'10px 8px',
//               border:`1px solid rgba(255,255,255,${i===0?0.15:0.06})`}}>
//               <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:"'JetBrains Mono',monospace"}}>{h.hour}</div>
//               <div style={{fontSize:20}}>{h.icon}</div>
//               <div style={{height:44,width:4,background:'rgba(255,255,255,0.08)',borderRadius:4,position:'relative'}}>
//                 <div style={{position:'absolute',bottom:0,width:'100%',borderRadius:4,height:`${pct}%`,background:`linear-gradient(to top,${accent},${accent}88)`}}/>
//               </div>
//               <div style={{fontSize:13,fontWeight:600,color:'#fff'}}>{h.temp}°</div>
//               {h.pop!=null&&<div style={{fontSize:9,color:'#38bdf8',fontFamily:"'JetBrains Mono',monospace"}}>{h.pop}%</div>}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

// /* ─── Weekly Forecast ─────────────────────────────────────────────────────── */
// function WeekForecast({ data, accent }) {
//   if (!data?.length) return null;
//   const absMax=Math.max(...data.map(d=>d.high)), absMin=Math.min(...data.map(d=>d.low));
//   return (
//     <div style={{display:'flex',flexDirection:'column',gap:4}}>
//       {data.map((d,i)=>{
//         const lo=(d.low-absMin)/(absMax-absMin)*100, hi=(d.high-absMin)/(absMax-absMin)*100;
//         return (
//           <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,
//             background:i===0?`${accent}18`:'rgba(255,255,255,0.03)',
//             border:`1px solid ${i===0?`${accent}30`:'rgba(255,255,255,0.05)'}`,
//             animation:`slideRight 0.3s ${i*0.06}s both`}}>
//             <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',width:32,fontFamily:"'DM Sans',sans-serif"}}>{d.day}</div>
//             <div style={{fontSize:20}}>{d.icon}</div>
//             <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',width:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.condition}</div>
//             <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
//               <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',minWidth:28,textAlign:'right'}}>{d.low}°</span>
//               <div style={{flex:1,height:4,background:'rgba(255,255,255,0.07)',borderRadius:4,position:'relative'}}>
//                 <div style={{position:'absolute',left:`${lo}%`,width:`${hi-lo}%`,height:'100%',background:`linear-gradient(to right,#38bdf8,${accent})`,borderRadius:4}}/>
//               </div>
//               <span style={{fontSize:12,color:'#fff',fontWeight:600,minWidth:28}}>{d.high}°</span>
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// }

// /* ─── Search Bar ──────────────────────────────────────────────────────────── */
// function SearchBar({ value, onChange, onClear, accent, placeholder }) {
//   return (
//     <div style={{position:'relative',flex:1,maxWidth:440}}>
//       <div style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.35)',pointerEvents:'none',fontSize:15}}>
//         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
//       </div>
//       <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search city…"} className="search-input"
//         style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',
//           borderRadius:12,padding:'9px 36px 9px 38px',color:'#fff',fontSize:13,
//           fontFamily:"'DM Sans',sans-serif",transition:'all 0.25s',backdropFilter:'blur(10px)'}}
//         onFocus={e=>{e.target.style.border=`1px solid ${accent}66`;e.target.style.background='rgba(255,255,255,0.1)';}}
//         onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.12)';e.target.style.background='rgba(255,255,255,0.07)';}}/>
//       {value&&<button onClick={onClear} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
//         background:'rgba(255,255,255,0.12)',border:'none',borderRadius:'50%',width:18,height:18,
//         color:'rgba(255,255,255,0.7)',cursor:'pointer',display:'flex',alignItems:'center',
//         justifyContent:'center',fontSize:10}}>✕</button>}
//     </div>
//   );
// }

// /* ─── Stat Card ───────────────────────────────────────────────────────────── */
// function StatCard({ icon, label, value, sub, subColor, progress, accentColor }) {
//   return (
//     <div className="stat-card" style={{background:'rgba(255,255,255,0.05)',borderRadius:14,
//       padding:'16px 18px',border:'1px solid rgba(255,255,255,0.08)',overflow:'hidden',position:'relative'}}>
//       <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
//         <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
//         <span style={{fontSize:18,lineHeight:1}}>{icon}</span>
//       </div>
//       <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:"'Syne',sans-serif",lineHeight:1,letterSpacing:'-0.01em'}}>{value}</div>
//       {sub&&<div style={{fontSize:11,color:subColor||'rgba(255,255,255,0.45)',marginTop:5}}>{sub}</div>}
//       {progress!=null&&(
//         <div style={{marginTop:10,height:3,background:'rgba(255,255,255,0.07)',borderRadius:4}}>
//           <div style={{height:'100%',width:`${Math.min(100,progress)}%`,borderRadius:4,background:accentColor||'rgba(255,255,255,0.4)',transition:'width 0.5s ease'}}/>
//         </div>
//       )}
//     </div>
//   );
// }

// /* ─── Hot/Cold Chart ──────────────────────────────────────────────────────── */
// const ChartTooltip = ({ active, payload, label }) => {
//   if (!active||!payload?.length) return null;
//   return (
//     <div style={{background:'rgba(10,20,40,0.95)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'8px 12px',fontSize:12,backdropFilter:'blur(16px)'}}>
//       <div style={{color:'rgba(255,255,255,0.5)',marginBottom:4}}>{label}</div>
//       {payload.map((p,i)=>(
//         <div key={i} style={{color:p.color||'#fff',display:'flex',gap:8,alignItems:'center'}}>
//           <span style={{width:8,height:8,borderRadius:'50%',background:p.color||'#fff',flexShrink:0}}/>
//           <span style={{color:'rgba(255,255,255,0.6)'}}>{p.name}:</span>
//           <span style={{fontWeight:600,color:'#fff'}}>{p.value}</span>
//         </div>
//       ))}
//     </div>
//   );
// };

// function HotColdChart({ stats, accent }) {
//   if (!stats||stats.length===0) return null;
//   const sorted=[...stats].sort((a,b)=>b.temperature-a.temperature);
//   const hottest=sorted.slice(0,10).map(c=>({city:c.city,temp:c.temperature}));
//   const coldest=[...sorted].reverse().slice(0,10).map(c=>({city:c.city,temp:c.temperature}));
//   const HBar=({data,title,barColor})=>(
//     <div style={{flex:1}}>
//       <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>{title}</div>
//       <div style={{height:data.length*28}}>
//         <ResponsiveContainer width="100%" height="100%">
//           <BarChart data={data} layout="vertical" margin={{top:0,right:36,left:4,bottom:0}}>
//             <XAxis type="number" domain={['auto','auto']} hide/>
//             <YAxis type="category" dataKey="city" width={72} tick={{fontSize:11,fill:'rgba(255,255,255,0.6)',fontFamily:"'DM Sans',sans-serif"}} axisLine={false} tickLine={false}/>
//             <Tooltip content={<ChartTooltip/>} cursor={{fill:'rgba(255,255,255,0.04)'}}/>
//             <Bar dataKey="temp" name="Temp °C" fill={barColor} radius={[0,5,5,0]} barSize={14}
//               label={{position:'right',fontSize:10,fill:'rgba(255,255,255,0.55)',formatter:v=>`${v}°`}}/>
//           </BarChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
//   return (
//     <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:16}}>
//       <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>
//         🔥 Hottest &amp; ❄️ Coldest Cities
//       </div>
//       <div style={{display:'flex',gap:24}}>
//         <HBar data={hottest} title="Top 10 Hottest" barColor="#ef4444"/>
//         <div style={{width:'1px',background:'rgba(255,255,255,0.08)'}}/>
//         <HBar data={coldest} title="Top 10 Coldest" barColor="#38bdf8"/>
//       </div>
//     </div>
//   );
// }

// /* ─── Chat Message ────────────────────────────────────────────────────────── */
// const ChatMsg = React.memo(function ChatMsg({ role, text, accent }) {
//   const isUser=role==='user';
//   return (
//     <div style={{display:'flex',justifyContent:isUser?'flex-end':'flex-start',marginBottom:8,animation:'fadeUp 0.25s ease'}}>
//       {!isUser&&<div style={{width:28,height:28,borderRadius:'50%',background:`${accent}22`,border:`1px solid ${accent}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0,marginRight:8,marginTop:2}}>🌦</div>}
//       <div style={{maxWidth:'80%',padding:'9px 13px',borderRadius:isUser?'16px 4px 16px 16px':'4px 16px 16px 16px',
//         background:isUser?accent:'rgba(255,255,255,0.07)',color:isUser?'#000':'rgba(255,255,255,0.9)',
//         fontSize:13,lineHeight:1.55,border:isUser?'none':'1px solid rgba(255,255,255,0.08)',
//         wordBreak:'break-word',fontFamily:"'DM Sans',sans-serif"}}>
//         {text}
//       </div>
//     </div>
//   );
// });

// /* ─── Chat Panel with Voice ───────────────────────────────────────────────── */
// function ChatPanel({ accent, selected }) {
//   const [query, setQuery]             = useState('');
//   const [isTyping, setIsTyping]       = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [voiceSupported, setVoiceSupported] = useState(false);
//   const [voiceError, setVoiceError]   = useState('');
//   const [localLog, setLocalLog]       = useState([
//     { role:'ai', text:"Hi! I'm your AI meteorologist. Ask me about weather conditions, safety advisories, or forecasts for any Indian city." }
//   ]);
//   const chatBoxRef     = useRef(null);
//   const recognitionRef = useRef(null);

//   useEffect(()=>{
//     const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
//     if (!SR) return;
//     setVoiceSupported(true);
//     const rec=new SR();
//     rec.lang='en-IN'; rec.continuous=false; rec.interimResults=true;
//     rec.onstart  =()=>{ setIsListening(true); setVoiceError(''); };
//     rec.onresult =(e)=>{ let t=''; for(let i=0;i<e.results.length;i++) t+=e.results[i][0].transcript; setQuery(t); };
//     rec.onerror  =(e)=>{
//       setIsListening(false);
//       if(e.error==='not-allowed') setVoiceError('Microphone access denied. Allow mic in browser settings.');
//       else if(e.error==='no-speech') setVoiceError('No speech detected. Try again.');
//       else setVoiceError(`Voice error: ${e.error}`);
//       setTimeout(()=>setVoiceError(''),3000);
//     };
//     rec.onend=()=>setIsListening(false);
//     recognitionRef.current=rec;
//     return ()=>recognitionRef.current?.abort();
//   },[]);

//   const toggleVoice=useCallback(()=>{
//     if(!recognitionRef.current) return;
//     if(isListening){ recognitionRef.current.stop(); setIsListening(false); }
//     else { setQuery(''); try{ recognitionRef.current.start(); } catch{ recognitionRef.current.stop(); setTimeout(()=>recognitionRef.current?.start(),200); } }
//   },[isListening]);

//   const addMessage=useCallback(msg=>{
//     setLocalLog(prev=>{ const u=[...prev,msg]; return u.length>40?u.slice(-40):u; });
//   },[]);

//   useEffect(()=>{ if(chatBoxRef.current) chatBoxRef.current.scrollTop=chatBoxRef.current.scrollHeight; },[localLog,isTyping]);

//   const handleChat=useCallback(async()=>{
//     const m=query.trim();
//     if(!m||isTyping) return;
//     if(isListening&&recognitionRef.current) recognitionRef.current.stop();
//     addMessage({role:'user',text:m});
//     setQuery(''); setIsTyping(true);
//     try {
//       const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'}/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:m})});
//       if(!res.ok) throw new Error(`${res.status}`);
//       const data=await res.json();
//       let reply=typeof data.ai_response==='string'?data.ai_response:'Sorry, could not process that.';
//       reply=reply.replace(/(?:\s*End\.\s*)+$/gi,'').trim();
//       addMessage({role:'ai',text:reply});
//     } catch(err) {
//       addMessage({role:'ai',text:err.message.includes('fetch')?'Backend offline — start uvicorn to connect.':`Error: ${err.message}`});
//     } finally { setIsTyping(false); }
//   },[query,isTyping,isListening,addMessage]);

//   const handleKey=useCallback(e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleChat();} },[handleChat]);

//   const quickQs=selected
//     ?[`Rain in ${selected.city}?`,'Heatwave risk?','Best city today?','Safe to travel?','Air quality now?']
//     :['Which city is hottest?','Where is it raining now?','Worst AQI today?','Heatwave risk?'];

//   return (
//     <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
//       <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
//         <div style={{width:34,height:34,borderRadius:'50%',background:`${accent}22`,border:`1px solid ${accent}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:15,flexShrink:0,animation:'glow 3s ease infinite'}}>🌦</div>
//         <div>
//           <div style={{fontWeight:600,fontSize:13,fontFamily:"'Syne',sans-serif"}}>AI Meteorologist</div>
//           <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:1}}>
//             {isListening?<span style={{color:'#fca5a5'}}>● Listening…</span>:'Powered by Llama 3.1'}
//           </div>
//         </div>
//         <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
//           {isListening&&(
//             <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,padding:'3px 10px',fontSize:10,color:'#fca5a5'}}>
//               <span style={{width:6,height:6,borderRadius:'50%',background:'#ef4444',animation:'blink 1s ease infinite'}}/>REC
//             </div>
//           )}
//           <div style={{width:7,height:7,borderRadius:'50%',background:'#4ade80',animation:'blink 2.5s ease infinite'}}/>
//         </div>
//       </div>

//       <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:5,flexWrap:'wrap',flexShrink:0}}>
//         {quickQs.map(q=>(
//           <button key={q} className="chip" onClick={()=>setQuery(q)}
//             style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.65)',borderRadius:20,padding:'4px 10px',fontSize:10,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",opacity:0.85}}>
//             {q}
//           </button>
//         ))}
//       </div>

//       <div ref={chatBoxRef} style={{flex:1,minHeight:0,overflowY:'auto',padding:'14px 14px 6px',scrollBehavior:'smooth'}}>
//         {localLog.map((msg,i)=><ChatMsg key={`m-${i}`} role={msg.role} text={msg.text} accent={accent}/>)}
//         {isListening&&(
//           <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8,animation:'fadeIn 0.2s ease'}}>
//             <div style={{padding:'9px 13px',borderRadius:'16px 16px 4px 16px',background:`${accent}18`,border:`1px solid ${accent}35`,display:'flex',alignItems:'center',gap:8}}>
//               <div style={{display:'flex',alignItems:'center',gap:2,height:16}}>
//                 {[0.3,0.6,1,0.7,0.4,0.8,0.5].map((h,i)=>(
//                   <div key={i} style={{width:3,borderRadius:2,background:accent,height:`${h*100}%`,animation:`voiceBar 0.6s ease ${i*0.08}s infinite alternate`}}/>
//                 ))}
//               </div>
//               <span style={{fontSize:11,color:accent,fontStyle:'italic'}}>{query||'Listening…'}</span>
//             </div>
//           </div>
//         )}
//         {isTyping&&(
//           <div style={{display:'flex',gap:8,marginBottom:10,animation:'fadeIn 0.2s ease'}}>
//             <div style={{width:28,height:28,borderRadius:'50%',background:`${accent}22`,border:`1px solid ${accent}55`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,flexShrink:0}}>🌦</div>
//             <div style={{padding:'11px 14px',background:'rgba(255,255,255,0.06)',borderRadius:'4px 16px 16px 16px',border:'1px solid rgba(255,255,255,0.08)'}}>
//               <div style={{display:'flex',gap:4,alignItems:'center'}}>
//                 {[0,0.22,0.44].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:accent,animation:`blink 1.2s ease ${d}s infinite`}}/>)}
//               </div>
//             </div>
//           </div>
//         )}
//         <div style={{height:4}}/>
//       </div>

//       {voiceError&&(
//         <div style={{padding:'6px 14px',fontSize:11,color:'#fca5a5',background:'rgba(220,38,38,0.1)',borderTop:'1px solid rgba(220,38,38,0.2)',flexShrink:0}}>⚠ {voiceError}</div>
//       )}

//       <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
//         <div style={{display:'flex',gap:8,background:'rgba(255,255,255,0.06)',borderRadius:13,padding:'4px 4px 4px 14px',border:`1px solid ${isListening?`${accent}60`:'rgba(255,255,255,0.1)'}`,transition:'border-color 0.2s',backdropFilter:'blur(10px)'}}>
//           <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={handleKey} disabled={isTyping}
//             style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:13,fontFamily:"'DM Sans',sans-serif",opacity:isTyping?0.5:1}}
//             placeholder={isListening?'Listening — speak now…':isTyping?'Thinking…':'Ask anything about weather…'}/>
//           {voiceSupported&&(
//             <button onClick={toggleVoice} disabled={isTyping} title={isListening?'Stop':'Voice input'}
//               style={{background:isListening?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.08)',border:isListening?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'7px 10px',cursor:isTyping?'not-allowed':'pointer',fontSize:14,opacity:isTyping?0.4:1,transition:'background 0.2s,border 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>
//               {isListening?'⏹':'🎤'}
//             </button>
//           )}
//           <button onClick={handleChat} disabled={isTyping||!query.trim()}
//             style={{background:query.trim()?accent:'rgba(255,255,255,0.1)',border:'none',borderRadius:10,padding:'8px 16px',color:query.trim()?'#000':'rgba(255,255,255,0.3)',fontWeight:700,fontSize:13,cursor:(isTyping||!query.trim())?'not-allowed':'pointer',fontFamily:"'Syne',sans-serif",opacity:isTyping?0.45:1,transition:'all 0.2s',letterSpacing:'-0.01em'}}>
//             ↑
//           </button>
//         </div>
//         {voiceSupported&&!isListening&&<div style={{fontSize:10,color:'rgba(255,255,255,0.2)',marginTop:5,textAlign:'center'}}>🎤 tap mic to speak · Enter to send</div>}
//         {!voiceSupported&&<div style={{fontSize:10,color:'rgba(255,255,255,0.15)',marginTop:5,textAlign:'center'}}>Voice input not supported in this browser</div>}
//       </div>
//     </div>
//   );
// }

// /* ─── WMO Code Mapper ─────────────────────────────────────────────────────── */
// const WMO_MAP = {
//   0:{n:"Clear",i:"☀️"},1:{n:"Mostly Clear",i:"🌤"},2:{n:"Partly Cloudy",i:"⛅"},3:{n:"Cloudy",i:"☁️"},
//   45:{n:"Fog",i:"🌫"},48:{n:"Rime Fog",i:"🌫"},51:{n:"Light Drizzle",i:"🌦"},53:{n:"Drizzle",i:"🌧"},
//   55:{n:"Heavy Drizzle",i:"🌧"},61:{n:"Light Rain",i:"🌧"},63:{n:"Rain",i:"🌧"},65:{n:"Heavy Rain",i:"⛈"},
//   71:{n:"Light Snow",i:"🌨"},73:{n:"Snow",i:"❄️"},75:{n:"Heavy Snow",i:"❄️"},77:{n:"Snow Grains",i:"🌨"},
//   80:{n:"Rain Showers",i:"🌦"},81:{n:"Heavy Showers",i:"🌧"},82:{n:"Violent Showers",i:"⛈"},
//   85:{n:"Snow Showers",i:"🌨"},86:{n:"Heavy Snow",i:"❄️"},95:{n:"Thunderstorm",i:"⛈"},
//   96:{n:"Thunder/Hail",i:"⛈"},99:{n:"Heavy Thunder",i:"⛈"}
// };
// const getWMO = c => WMO_MAP[c]||{n:"Unknown",i:"🌡️"};

// /* ═══════════════════════════════════════════════════════════════════════════
//    MAIN DASHBOARD
//    ═══════════════════════════════════════════════════════════════════════════ */
// export default function WeatherDashboard() {
//   const [stats, setStats]               = useState([]);
//   const [selected, setSelected]         = useState(null);
//   const [search, setSearch]             = useState('');
//   const [activeTab, setActiveTab]       = useState('overview');
//   const [unit, setUnit]                 = useState('C');
//   const [transitioning, setTransitioning] = useState(false);
//   const [extended, setExtended]         = useState({ hourly:[], weekly:[] });
//   const [timeFormat, setTimeFormat]     = useState('12h');

//   // ── LEFT PANEL STATE ──────────────────────────────────────────────────────
//   const [leftView, setLeftView]                 = useState('all');   // 'all' | 'state'
//   const [expandedStates, setExpandedStates]     = useState(new Set());

//   const toF = c => Math.round(c*9/5+32);
//   const displayTemp = c => unit==='C'?`${c}°C`:`${toF(c)}°F`;

//   // Fetch extended forecast when city changes
//   useEffect(()=>{
//     if(!selected||!selected.lat||!selected.lon) return;
//     let active=true;
//     const url=`https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
//     fetch(url).then(r=>r.json()).then(data=>{
//       if(!active) return;
//       const nowMs=Date.now();
//       const startIdx=data.hourly.time.findIndex(t=>new Date(t).getTime()>=nowMs)||0;
//       const safeStart=Math.max(0,startIdx-1);
//       const newHourly=[];
//       for(let i=0;i<9;i++){
//         const idx=safeStart+(i*2);
//         if(idx>=data.hourly.time.length) break;
//         const d=new Date(data.hourly.time[idx]);
//         let h=d.getHours(); const ampm=h>=12?'PM':'AM'; h=h%12||12;
//         newHourly.push({hour:i===0?'Now':`${h}${ampm}`,temp:Math.round(data.hourly.temperature_2m[idx]),pop:data.hourly.precipitation_probability[idx]||0,icon: getWeatherEmoji(getWMO(data.hourly.weather_code[idx]).n, d.getHours() >= 6 && d.getHours() < 18)});
//       }
//       const daysArr=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
//       const newWeekly=[];
//       for(let i=0;i<7;i++){
//         if(i>=data.daily.time.length) break;
//         const d=new Date(data.daily.time[i]);
//         newWeekly.push({day:i===0?'Today':daysArr[d.getDay()],high:Math.round(data.daily.temperature_2m_max[i]),low:Math.round(data.daily.temperature_2m_min[i]),condition:getWMO(data.daily.weather_code[i]).n,icon:getWMO(data.daily.weather_code[i]).i});
//       }
//       setExtended({hourly:newHourly,weekly:newWeekly});
//     }).catch(err=>console.error("Forecast fetch error:",err));
//     return ()=>{ active=false; };
//   },[selected?.city,selected?.lat,selected?.lon]);

//   useEffect(()=>{
//     fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'}/weather-stats`)
//       .then(r=>r.json())
//       .then(data=>{ const e=data.map(enrichCity); setStats(e); setSelected(e[0]||null); })
//       .catch(()=>{ const d=generateDemoData(); setStats(d); setSelected(d[0]); });
//   },[]);

//   const selectCity=useCallback(city=>{
//     if(city.city===selected?.city) return;
//     setTransitioning(true);
//     setTimeout(()=>{ setSelected(city); setActiveTab('overview'); setTransitioning(false); },200);
//   },[selected]);

//   const filteredStats=useMemo(()=>{
//     if(!search.trim()) return stats;
//     const q=search.toLowerCase();
//     return stats.filter(s=>s.city.toLowerCase().includes(q)||(s.state||'').toLowerCase().includes(q)||s.condition.toLowerCase().includes(q));
//   },[stats,search]);

//   // Group by state for By State view
//   const stateGroups=useMemo(()=>{
//     const map={};
//     filteredStats.forEach(s=>{
//       const st=s.state||'Other';
//       if(!map[st]) map[st]=[];
//       map[st].push(s);
//     });
//     return Object.entries(map).sort(([a],[b])=>a.localeCompare(b));
//   },[filteredStats]);

//   // Auto-expand states when searching
//   useEffect(()=>{
//     if(search) setExpandedStates(new Set(stateGroups.map(([st])=>st)));
//   },[search,stateGroups]);

//   const toggleState=useCallback(st=>{
//     setExpandedStates(prev=>{ const n=new Set(prev); n.has(st)?n.delete(st):n.add(st); return n; });
//   },[]);

//   const theme  = selected?getTheme(selected.condition,selected.sunrise,selected.sunset):getTheme('','06:00','18:30');
//   const accent = theme.accent;
//   const glow   = theme.glow;
//   const isDay  = theme.isDay;
//   // const isRain = selected?.condition?.toLowerCase().match(/rain|storm/);
//   // const isCloudy = selected?.condition?.toLowerCase().match(/cloud|fog/);
//   const condStr = (selected?.condition || '').toLowerCase();
  
//   // Prioritize explicit database booleans first, fallback to robust text matching
//   const isRain = 
//     selected?.is_raining === true || 
//     condStr.match(/rain|drizzle|shower|storm|thunder|precipitation/);
    
//   const isThunderstorm = 
//     selected?.is_thunderstorm === true || 
//     condStr.match(/storm|thunder|lightning/);
    
//   const isCloudy = condStr.match(/cloud|fog|overcast|haze/);
//   const isWindy = condStr.match(/wind|breeze|gale|blustery|dust/) || (selected?.wind_speed >= 17);

//   const activeAlerts = stats.filter(s=>s.warning&&s.warning!=='None');

//   const radarData = selected?[
//     {m:'Humidity',  v:selected.humidity||0},
//     {m:'Cloud',     v:selected.cloud_cover||0},
//     {m:'UV Index',  v:(selected.uv_index||0)*10},
//     {m:'Wind',      v:Math.min((selected.wind_speed||0)*2,100)},
//     {m:'Visibility',v:Math.min((selected.visibility||10)*10,100)},
//     {m:'Pressure',  v:Math.min(((selected.pressure||1013)-980)*2,100)},
//   ]:[];

//   return (
//     <div style={{height:'100vh',display:'flex',flexDirection:'column',overflow:'hidden',
//       background:`linear-gradient(145deg,${theme.g1} 0%,${theme.g2} 50%,${theme.g3} 100%)`,
//       transition:'background 1.5s cubic-bezier(0.4,0,0.2,1)',
//       fontFamily:"'DM Sans',sans-serif",color:'#fff',
//       '--accent':accent,'--accent-glow':glow,position:'relative'}}>
//       <style>{GLOBAL_CSS}</style>

//       {isRain&&<RainEffect isDay={isDay}/>}
//       {(isRain||isCloudy)&&<CloudLayer/>}
//       {!isRain&&!isCloudy&&<WeatherParticles accent={accent}/>}
//       {/* Show wind streaks if it's windy, even if it is raining! */}
//       {isWindy && <WindEffect isDay={isDay} />}

//       {/* ALERT TICKER */}
//       {activeAlerts.length>0&&(
//         <div style={{background:'linear-gradient(90deg,#7f1d1d,#991b1b)',height:34,display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0,zIndex:20}}>
//           <div style={{background:'rgba(0,0,0,0.3)',height:'100%',padding:'0 14px',display:'flex',alignItems:'center',fontSize:10,fontWeight:700,letterSpacing:'0.12em',flexShrink:0,gap:6}}>
//             <span style={{width:6,height:6,borderRadius:'50%',background:'#fca5a5',animation:'blink 1.2s step-start infinite',display:'inline-block'}}/>ALERT
//           </div>
//           <div style={{flex:1,overflow:'hidden'}}>
//             <div style={{display:'inline-block',whiteSpace:'nowrap',animation:'ticker 100s linear infinite',fontSize:11,color:'#fecaca',fontFamily:"'DM Sans',sans-serif"}}>
//               &nbsp;&nbsp;&nbsp;{activeAlerts.map(a=>`⚠ ${a.city}: ${a.warning}`).join('   ·   ')}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{activeAlerts.map(a=>`⚠ ${a.city}: ${a.warning}`).join('   ·   ')}&nbsp;&nbsp;&nbsp;
//             </div>
//           </div>
//         </div>
//       )}

//       {/* HEADER */}
//       <div style={{padding:'12px 22px',display:'flex',alignItems:'center',gap:16,borderBottom:'1px solid rgba(255,255,255,0.07)',background:'rgba(0,0,0,0.25)',backdropFilter:'blur(20px)',flexShrink:0,zIndex:10}}>
//         <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
//           <div style={{width:34,height:34,borderRadius:10,background:`${accent}22`,border:`1px solid ${accent}44`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17}}>🌐</div>
//           <div>
//             <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,letterSpacing:'-0.02em',lineHeight:1}}>IMD AI Hub</div>
//             <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:1}}>India Meteorological Dept</div>
//           </div>
//         </div>
//         <SearchBar value={search} onChange={setSearch} onClear={()=>setSearch('')} accent={accent} placeholder="Search city, state or condition…"/>
//         <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
//           <LiveClock accent={accent} format={timeFormat}/>
//           <button onClick={()=>setTimeFormat(f=>f==='12h'?'24h':'12h')} className="icon-btn"
//             style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.8)',borderRadius:8,padding:'6px 13px',fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{timeFormat}</button>
//           <button onClick={()=>setUnit(u=>u==='C'?'F':'C')} className="icon-btn"
//             style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.8)',borderRadius:8,padding:'6px 13px',fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>°{unit}</button>
//           <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.06)',borderRadius:8,padding:'5px 11px',fontSize:11,border:'1px solid rgba(255,255,255,0.1)'}}>
//             <span>{isDay?'☀️':'🌙'}</span><span style={{color:'rgba(255,255,255,0.6)'}}>{isDay?'Day':'Night'}</span>
//           </div>
//           <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.06)',borderRadius:8,padding:'5px 11px',fontSize:11,border:'1px solid rgba(255,255,255,0.1)'}}>
//             <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',animation:'blink 2.5s ease infinite'}}/>Live
//           </div>
//         </div>
//       </div>

//       {/* MAIN GRID */}
//       <div style={{display:'grid',gridTemplateColumns:'230px 1fr 310px',flex:1,minHeight:0}}>

//         {/* ── LEFT: CITY LIST with State/All toggle ───────────────────── */}
//         <div style={{borderRight:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',overflow:'hidden'}}>

//           {/* View mode toggle */}
//           <div style={{padding:'10px 10px 6px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
//             <div style={{display:'flex',gap:4,background:'rgba(255,255,255,0.05)',borderRadius:9,padding:3}}>
//               {['all','state'].map(mode=>(
//                 <button key={mode} onClick={()=>setLeftView(mode)}
//                   style={{flex:1,padding:'5px 0',borderRadius:6,fontSize:10,fontWeight:500,border:'none',
//                     fontFamily:"'DM Sans',sans-serif",cursor:'pointer',
//                     background:leftView===mode?accent:'transparent',
//                     color:leftView===mode?'#000':'rgba(255,255,255,0.5)',
//                     textTransform:'capitalize',transition:'all 0.18s'}}>
//                   {mode==='all'?'All Cities':'By State'}
//                 </button>
//               ))}
//             </div>
//             <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',marginTop:5,paddingLeft:2,fontFamily:"'JetBrains Mono',monospace"}}>
//               {filteredStats.length} {filteredStats.length===1?'city':'cities'}
//               {leftView==='state'&&` · ${stateGroups.length} states`}
//             </div>
//           </div>

//           {/* Scrollable list */}
//           <div style={{flex:1,minHeight:0,overflowY:'auto',padding:'8px 10px'}}>

//             {/* ── ALL CITIES flat list ── */}
//             {leftView==='all'&&(
//               <>
//                 {filteredStats.length===0&&(
//                   <div style={{textAlign:'center',padding:'28px 10px',color:'rgba(255,255,255,0.3)',fontSize:13}}>
//                     No cities match "{search}"
//                   </div>
//                 )}
//                 {filteredStats.map((city,i)=>{
//                   const ct=getTheme(city.condition,city.sunrise,city.sunset);
//                   const isActive=selected?.city===city.city;
//                   return (
//                     <div key={i} className="city-row" onClick={()=>selectCity(city)}
//                       style={{padding:'11px 12px',borderRadius:12,marginBottom:3,
//                         background:isActive?`${ct.accent}18`:'rgba(255,255,255,0.03)',
//                         border:`1px solid ${isActive?`${ct.accent}40`:'rgba(255,255,255,0.04)'}`,
//                         animation:`slideRight 0.25s ${Math.min(i,15)*0.04}s both`}}>
//                       <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
//                         <div style={{fontWeight:600,fontSize:13,fontFamily:"'Syne',sans-serif"}}>{city.city}</div>
//                         <div style={{fontSize:17}}>{getWeatherEmoji(city.condition, ct.isDay)}</div>
//                       </div>
//                       <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:5}}>
//                         <div style={{fontSize:20,fontWeight:800,fontFamily:"'Syne',sans-serif",color:isActive?ct.accent:'#fff'}}>
//                           {unit==='C'?city.temperature:toF(city.temperature)}°
//                         </div>
//                         {city.warning&&city.warning!=='None'
//                           ?<div style={{fontSize:9,background:'#dc2626',color:'#fff',borderRadius:4,padding:'2px 6px',letterSpacing:'0.05em'}}>⚠ ALERT</div>
//                           :<div style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>{city.humidity}% hum</div>}
//                       </div>
//                       <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{city.condition}</div>
//                     </div>
//                   );
//                 })}
//               </>
//             )}

//             {/* ── BY STATE grouped list ── */}
//             {leftView==='state'&&(
//               <>
//                 {stateGroups.length===0&&(
//                   <div style={{textAlign:'center',padding:'28px 10px',color:'rgba(255,255,255,0.3)',fontSize:13}}>
//                     No cities match "{search}"
//                   </div>
//                 )}
//                 {stateGroups.map(([state,cities],si)=>{
//                   const isOpen=expandedStates.has(state);
//                   const hasAlert=cities.some(c=>c.warning&&c.warning!=='None');
//                   const avgTemp=Math.round(cities.reduce((s,c)=>s+c.temperature,0)/cities.length);
//                   const hasActiveCity=cities.some(c=>c.city===selected?.city);
//                   return (
//                     <div key={state} style={{marginBottom:5}}>
//                       {/* State header */}
//                       <div className="state-header" onClick={()=>toggleState(state)}
//                         style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:9,
//                           cursor:'pointer',
//                           background:isOpen
//                             ?hasActiveCity?`${accent}15`:'rgba(255,255,255,0.07)'
//                             :'rgba(255,255,255,0.04)',
//                           border:`1px solid ${hasActiveCity?`${accent}30`:'rgba(255,255,255,0.07)'}`,
//                           marginBottom:isOpen?4:0}}>
//                         <div style={{flex:1}}>
//                           <div style={{display:'flex',alignItems:'center',gap:5}}>
//                             <span style={{fontWeight:600,fontSize:12,fontFamily:"'Syne',sans-serif",color:hasActiveCity?accent:'rgba(255,255,255,0.85)'}}>
//                               {state}
//                             </span>
//                             {hasAlert&&<span style={{fontSize:8,background:'#dc2626',color:'#fff',borderRadius:3,padding:'1px 4px'}}>⚠</span>}
//                           </div>
//                           <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:1,fontFamily:"'JetBrains Mono',monospace"}}>
//                             {cities.length} {cities.length===1?'city':'cities'} · avg {unit==='C'?avgTemp:toF(avgTemp)}°
//                           </div>
//                         </div>
//                         <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',transform:isOpen?'rotate(90deg)':'rotate(0deg)',transition:'transform 0.18s'}}>›</div>
//                       </div>

//                       {/* Cities within this state */}
//                       {isOpen&&cities.map((city,i)=>{
//                         const ct=getTheme(city.condition,city.sunrise,city.sunset);
//                         const isActive=selected?.city===city.city;
//                         return (
//                           <div key={i} className="city-row" onClick={()=>selectCity(city)}
//                             style={{padding:'9px 12px 9px 18px',borderRadius:10,marginBottom:2,
//                               background:isActive?`${ct.accent}18`:'rgba(255,255,255,0.025)',
//                               border:`1px solid ${isActive?`${ct.accent}40`:'rgba(255,255,255,0.04)'}`,
//                               borderLeft:`3px solid ${isActive?ct.accent:'rgba(255,255,255,0.08)'}`}}>
//                             <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
//                               <div style={{fontWeight:600,fontSize:12,fontFamily:"'Syne',sans-serif"}}>{city.city}</div>
//                               {/* Fixed: Replaced ct.emoji with getWeatherEmoji helper */}
//                               <div style={{fontSize:15}}>{getWeatherEmoji(city.condition, ct.isDay)}</div>
//                             </div>
//                             <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:3}}>
//                               <div style={{fontSize:17,fontWeight:800,fontFamily:"'Syne',sans-serif",color:isActive?ct.accent:'#fff'}}>
//                                 {unit==='C'?city.temperature:toF(city.temperature)}°
//                               </div>
//                               {city.warning&&city.warning!=='None'
//                                 ?<div style={{fontSize:8,background:'#dc2626',color:'#fff',borderRadius:3,padding:'2px 5px'}}>⚠</div>
//                                 :<div style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>{city.humidity}%</div>}
//                             </div>
//                             <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',marginTop:1}}>{city.condition}</div>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   );
//                 })}
//               </>
//             )}
//           </div>
//         </div>

//         {/* ── CENTER: MAIN PANEL ──────────────────────────────────────── */}
//         <div style={{overflowY:'auto',padding:'22px 26px',opacity:transitioning?0:1,transition:'opacity 0.2s ease',scrollBehavior:'smooth'}}>
//           {selected&&(
//             <div style={{animation:'fadeUp 0.35s ease'}}>

//               {/* Hero */}
//               <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,gap:16}}>
//                 <div>
//                   <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',gap:5}}>
//                       <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
//                       {selected.city}{selected.state&&`, ${selected.state}`}
//                     </div>
//                     <span style={{width:3,height:3,borderRadius:'50%',background:'rgba(255,255,255,0.2)'}}/>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>Updated just now</div>
//                     <div style={{fontSize:13,marginLeft:4}}>{isDay?'☀️':moonPhase()}</div>
//                   </div>
//                   <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
//                     <div style={{fontFamily:"'Syne',sans-serif",fontSize:88,fontWeight:800,lineHeight:0.9,letterSpacing:'-0.04em',color:'#fff',textShadow:`0 0 60px ${glow}`}}>
//                       {unit==='C'?selected.temperature:toF(selected.temperature)}
//                     </div>
//                     <div style={{paddingBottom:14}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:32,color:'rgba(255,255,255,0.5)',fontWeight:400}}>°{unit}</div></div>
//                     <div style={{paddingBottom:12,fontSize:54}}>{getWeatherEmoji(selected.condition, isDay)}</div>
//                   </div>
//                   <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,color:'rgba(255,255,255,0.65)',marginTop:4,fontWeight:500}}>{selected.condition}</div>
//                   <div style={{display:'flex',gap:16,marginTop:8,fontSize:13,color:'rgba(255,255,255,0.4)'}}>
//                     <span>Feels like <b style={{color:'rgba(255,255,255,0.75)'}}>{displayTemp(selected.feels_like||selected.temperature-2)}</b></span>
//                     <span>H: <b style={{color:accent}}>{displayTemp(selected.high||selected.temperature+3)}</b></span>
//                     <span>L: <b style={{color:'#38bdf8'}}>{displayTemp(selected.low||selected.temperature-5)}</b></span>
//                   </div>
//                 </div>
//                 <div style={{display:'flex',flexDirection:'column',gap:10,flexShrink:0}}>
//                   {selected.warning&&selected.warning!=='None'&&(
//                     <div style={{background:'rgba(220,38,38,0.12)',border:'1px solid rgba(220,38,38,0.35)',borderRadius:14,padding:'12px 16px',maxWidth:190,backdropFilter:'blur(10px)'}}>
//                       <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:6}}>
//                         <span style={{fontSize:16}}>⚠️</span>
//                         <span style={{fontWeight:700,fontSize:11,color:'#fca5a5',letterSpacing:'0.06em',textTransform:'uppercase'}}>Active Alert</span>
//                       </div>
//                       <div style={{fontSize:11,color:'rgba(255,255,255,0.55)',lineHeight:1.5}}>{selected.warning}</div>
//                     </div>
//                   )}
//                   <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'12px 16px',backdropFilter:'blur(10px)'}}>
//                     <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.08em'}}>Sunrise / Sunset</div>
//                     <SunArc sunrise={selected.sunrise||'06:15'} sunset={selected.sunset||'18:40'} accent={accent}/>
//                   </div>
//                 </div>
//               </div>

//               {/* Tabs */}
//               <div style={{display:'flex',gap:3,marginBottom:20,background:'rgba(255,255,255,0.05)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.07)'}}>
//                 {['overview','hourly','weekly','analysis'].map(tab=>(
//                   <button key={tab} className="tab" onClick={()=>setActiveTab(tab)}
//                     style={{flex:1,padding:'8px 0',borderRadius:9,fontSize:12,fontWeight:activeTab===tab?600:400,
//                       background:activeTab===tab?accent:'transparent',
//                       color:activeTab===tab?'#000':'rgba(255,255,255,0.5)',
//                       textTransform:'capitalize',transition:'all 0.2s',letterSpacing:'0.01em'}}>
//                     {tab}
//                   </button>
//                 ))}
//               </div>

//               {/* OVERVIEW */}
//               {activeTab==='overview'&&(
//                 <div style={{animation:'fadeIn 0.3s ease'}}>
//                   <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
//                     <StatCard icon="💧" label="Humidity"    value={`${selected.humidity||65}%`}        sub={selected.humidity>80?'Feels muggy':'Comfortable'} progress={selected.humidity} accentColor="#38bdf8"/>
//                     <StatCard icon="💨" label="Wind"        value={`${selected.wind_speed||12} km/h`}   sub={`${selected.wind_dir||'SW'} · Gusts ${selected.wind_gust||Math.round((selected.wind_speed||12)*1.4)} km/h`} accentColor={accent}/>
//                     <StatCard icon="👁" label="Visibility"  value={`${selected.visibility||10} km`}     sub={selected.visibility<3?'Poor':selected.visibility<7?'Moderate':'Clear'} progress={(selected.visibility||10)*10} accentColor={accent}/>
//                     <StatCard icon="🌡" label="Pressure"    value={`${selected.pressure||1013}`}        sub={`hPa · ${selected.pressure>1020?'High pressure':'Normal range'}`} progress={Math.min(100,((selected.pressure||1013)-980)*3)} accentColor="#a855f7"/>
//                     <StatCard icon="☀️" label="UV Index"    value={`${selected.uv_index||5}`}           sub={uvInfo(selected.uv_index||5).l} subColor={uvInfo(selected.uv_index||5).c} progress={(selected.uv_index||5)*8.33} accentColor={uvInfo(selected.uv_index||5).c}/>
//                     <StatCard icon="🏭" label="Air Quality" value={selected.aqi||'—'}                   sub={aqiInfo(selected.aqi).l} subColor={aqiInfo(selected.aqi).c} progress={Math.min(100,((selected.aqi||0)/300)*100)} accentColor={aqiInfo(selected.aqi).c}/>
//                   </div>
//                   <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:16}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>Temperature &amp; Humidity — All Cities</div>
//                     <div style={{height:220}}>
//                       <ResponsiveContainer width="100%" height="100%">
//                         <ComposedChart data={stats} margin={{top:4,right:8,left:-10,bottom:0}}>
//                           <defs>
//                             <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="5%"  stopColor={accent} stopOpacity={0.35}/>
//                               <stop offset="95%" stopColor={accent} stopOpacity={0}/>
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
//                           <XAxis dataKey="city" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}} axisLine={false} tickLine={false}/>
//                           <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
//                           <Tooltip content={<ChartTooltip/>}/>
//                           <Bar dataKey="temperature" name="Temp °C" fill={accent} radius={[5,5,0,0]} opacity={0.8} maxBarSize={36}/>
//                           <Line dataKey="humidity" name="Humidity %" stroke="#38bdf8" strokeWidth={2} dot={{r:3,fill:'#38bdf8'}} activeDot={{r:5}}/>
//                         </ComposedChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                   <HotColdChart stats={stats} accent={accent}/>
//                   <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
//                     <div style={{background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(255,255,255,0.07)'}}>
//                       <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>{isDay?'Daytime':'Moon Phase'}</div>
//                       <div style={{fontSize:36,marginBottom:4}}>{isDay?theme.emoji:moonPhase()}</div>
//                       <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{isDay?`${selected.condition} day`:"Tonight's sky"}</div>
//                     </div>
//                     <div style={{background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(255,255,255,0.07)'}}>
//                       <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>Cloud Cover</div>
//                       <div style={{fontSize:28,fontWeight:800,fontFamily:"'Syne',sans-serif",color:'#fff',letterSpacing:'-0.02em'}}>{selected.cloud_cover||35}%</div>
//                       <div style={{marginTop:8,height:4,background:'rgba(255,255,255,0.07)',borderRadius:4}}>
//                         <div style={{height:'100%',width:`${selected.cloud_cover||35}%`,borderRadius:4,background:'rgba(148,163,184,0.6)',transition:'width 0.5s ease'}}/>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* HOURLY */}
//               {activeTab==='hourly'&&(
//                 <div style={{animation:'fadeIn 0.3s ease'}}>
//                   <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:16}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>24-Hour Forecast · {selected.city}</div>
//                     <HourlyForecast data={extended.hourly} accent={accent}/>
//                     <div style={{marginTop:20,height:160}}>
//                       <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={extended.hourly} margin={{top:4,right:8,left:-10,bottom:0}}>
//                           <defs>
//                             <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="5%"  stopColor={accent} stopOpacity={0.3}/>
//                               <stop offset="95%" stopColor={accent} stopOpacity={0}/>
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
//                           <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false}/>
//                           <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
//                           <Tooltip content={<ChartTooltip/>}/>
//                           <Area type="monotone" dataKey="temp" name="Temp °C" stroke={accent} fill="url(#hg)" strokeWidth={2.5} dot={false} activeDot={{r:4,fill:accent}}/>
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                   <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>Precipitation Probability</div>
//                     <div style={{height:120}}>
//                       <ResponsiveContainer width="100%" height="100%">
//                         <AreaChart data={extended.hourly} margin={{top:4,right:8,left:-10,bottom:0}}>
//                           <defs>
//                             <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3}/>
//                               <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
//                           <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false}/>
//                           <YAxis domain={[0,100]} stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
//                           <Tooltip content={<ChartTooltip/>}/>
//                           <Area type="monotone" dataKey="pop" name="Rain %" stroke="#38bdf8" fill="url(#pg)" strokeWidth={2} dot={false}/>
//                         </AreaChart>
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* WEEKLY */}
//               {activeTab==='weekly'&&(
//                 <div style={{animation:'fadeIn 0.3s ease'}}>
//                   <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>7-Day Forecast · {selected.city}</div>
//                     <WeekForecast data={extended.weekly} accent={accent}/>
//                   </div>
//                 </div>
//               )}

//               {/* ANALYSIS */}
//               {activeTab==='analysis'&&(
//                 <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,animation:'fadeIn 0.3s ease'}}>
//                   <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>Radar</div>
//                     <ResponsiveContainer width="100%" height={200}>
//                       <RadarChart data={radarData}>
//                         <PolarGrid stroke="rgba(255,255,255,0.08)"/>
//                         <PolarAngleAxis dataKey="m" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10,fontFamily:"'DM Sans',sans-serif"}}/>
//                         <Radar dataKey="v" stroke={accent} fill={accent} fillOpacity={0.2} strokeWidth={1.5}/>
//                       </RadarChart>
//                     </ResponsiveContainer>
//                   </div>
//                   <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>Wind · {selected.city}</div>
//                     <WindRose deg={selected.wind_deg||225} speed={selected.wind_speed||12} gust={selected.wind_gust||18} accent={accent}/>
//                   </div>
//                   <div style={{gridColumn:'1/-1',background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
//                     <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>All-City Comparison</div>
//                     <ResponsiveContainer width="100%" height={170}>
//                       <ComposedChart data={stats} margin={{top:4,right:8,left:-10,bottom:0}}>
//                         <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
//                         <XAxis dataKey="city" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}} axisLine={false} tickLine={false}/>
//                         <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
//                         <Tooltip content={<ChartTooltip/>}/>
//                         <Legend wrapperStyle={{fontSize:11,color:'rgba(255,255,255,0.5)',paddingTop:8}}/>
//                         <Bar dataKey="humidity" name="Humidity %" fill="#38bdf8" radius={[4,4,0,0]} opacity={0.65} maxBarSize={30}/>
//                         <Line dataKey="temperature" name="Temp °C" stroke={accent} strokeWidth={2.5} dot={{r:3,fill:accent}} activeDot={{r:5}}/>
//                       </ComposedChart>
//                     </ResponsiveContainer>
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* ── RIGHT: AI CHAT ──────────────────────────────────────────── */}
//         <div style={{borderLeft:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0,background:'rgba(0,0,0,0.15)'}}>
//           <ChatPanel accent={accent} selected={selected}/>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ─── Data Helpers ────────────────────────────────────────────────────────── */
// function enrichCity(d) {
//   const t=Number(d.temperature);
//   return {
//     ...d,
//     temperature:t, feels_like:Number(d.feels_like)||t-2, high:Number(d.high)||t+4, low:Number(d.low)||t-6,
//     humidity:Number(d.humidity), wind_speed:Number(d.wind_speed), wind_deg:Number(d.wind_deg),
//     wind_gust:Number(d.wind_gust)||Math.round(Number(d.wind_speed)*1.4),
//     pressure:Number(d.pressure), visibility:Number(d.visibility), uv_index:Number(d.uv_index),
//     aqi:Number(d.aqi), cloud_cover:Number(d.cloud_cover),
//     sunrise:d.sunrise||'06:15', sunset:d.sunset||'18:45',
//     state:d.state||'',
//     hourly:generateHourly(t,d.condition), weekly:generateWeekly(t,d.condition),
//   };
// }

// function generateHourly(base, condition) {
//   const hrs=['6AM','8AM','10AM','12PM','2PM','4PM','6PM','8PM','10PM'];
//   const offs=[-5,-3,0,4,5,4,2,-1,-3];
//   const pops=(condition||'').toLowerCase().includes('rain')?[20,30,50,65,70,60,45,35,25]:(condition||'').toLowerCase().includes('cloud')?[5,5,10,15,20,15,10,5,5]:[2,2,3,5,3,3,2,2,2];
  
//   return hrs.map((hour,i)=>{
//     const hNum = parseInt(hour);
//     const isPM = hour.includes('PM');
//     const h24 = isPM ? (hNum === 12 ? 12 : hNum + 12) : (hNum === 12 ? 0 : hNum);
//     const isHourDay = h24 >= 6 && h24 < 18;
//     return { hour, temp: base+offs[i], icon: getWeatherEmoji(condition, isHourDay), pop: pops[i] };
//   });
// }

// function generateWeekly(base, condition) {
//   const days=['Today','Mon','Tue','Wed','Thu','Fri','Sat'];
//   const conds=['Sunny','Partly Cloudy','Cloudy','Light Rain','Clear','Thunderstorm','Foggy'];
//   const icons=['☀️','🌤','☁️','🌧','🌤','⛈','🌫'];
//   return days.map((day,i)=>({day,condition:i===0?condition:conds[i%conds.length],icon:icons[i%icons.length],high:base+[4,5,3,-1,2,6,4][i],low:base-[6,7,5,8,6,4,7][i]}));
// }

// function generateDemoData() {
//   return [
//     {city:'New Delhi', state:'Delhi',       temperature:42,feels_like:46,high:47,low:36,condition:'Sunny', humidity:15,warning:'Heatwave Alert',wind_speed:18,wind_dir:'SW',wind_deg:225,wind_gust:26,pressure:1002,visibility:6, uv_index:11,aqi:187,cloud_cover:10,sunrise:'05:30',sunset:'19:15'},
//     {city:'Mumbai',    state:'Maharashtra', temperature:32,feels_like:36,high:34,low:27,condition:'Cloudy',humidity:85,warning:'None',           wind_speed:22,wind_dir:'W', wind_deg:270,wind_gust:32,pressure:1008,visibility:5, uv_index:4, aqi:94, cloud_cover:75,sunrise:'06:00',sunset:'19:00'},
//     {city:'Bengaluru', state:'Karnataka',   temperature:28,feels_like:27,high:31,low:22,condition:'Rainy', humidity:60,warning:'Yellow Alert',  wind_speed:14,wind_dir:'NE',wind_deg:45, wind_gust:20,pressure:1012,visibility:4, uv_index:3, aqi:58, cloud_cover:90,sunrise:'06:10',sunset:'18:45'},
//     {city:'Chennai',   state:'Tamil Nadu',  temperature:35,feels_like:38,high:37,low:29,condition:'Humid', humidity:75,warning:'None',           wind_speed:16,wind_dir:'SE',wind_deg:135,wind_gust:22,pressure:1006,visibility:7, uv_index:7, aqi:112,cloud_cover:60,sunrise:'05:50',sunset:'18:50'},
//     {city:'Kolkata',   state:'West Bengal', temperature:30,feels_like:33,high:33,low:25,condition:'Rainy', humidity:80,warning:'None',           wind_speed:20,wind_dir:'S', wind_deg:180,wind_gust:28,pressure:1009,visibility:4, uv_index:5, aqi:143,cloud_cover:85,sunrise:'05:00',sunset:'18:15'},
//     {city:'Hyderabad', state:'Telangana',   temperature:33,feels_like:35,high:36,low:27,condition:'Sunny', humidity:70,warning:'None',           wind_speed:12,wind_dir:'NW',wind_deg:315,wind_gust:17,pressure:1010,visibility:9, uv_index:8, aqi:76, cloud_cover:25,sunrise:'06:05',sunset:'18:55'},
//     {city:'Pune',      state:'Maharashtra', temperature:30,feels_like:29,high:33,low:23,condition:'Clear', humidity:55,warning:'None',           wind_speed:15,wind_dir:'W', wind_deg:265,wind_gust:21,pressure:1013,visibility:10,uv_index:6, aqi:62, cloud_cover:20,sunrise:'06:08',sunset:'18:52'},
//     {city:'Jaipur',    state:'Rajasthan',   temperature:40,feels_like:43,high:44,low:32,condition:'Sunny', humidity:20,warning:'None',           wind_speed:20,wind_dir:'SW',wind_deg:220,wind_gust:28,pressure:1004,visibility:7, uv_index:10,aqi:95, cloud_cover:5, sunrise:'05:40',sunset:'19:05'},
//   ].map(enrichCity);
// }





























"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  ComposedChart, AreaChart, Area, Line, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  BarChart,
} from 'recharts';
import {
  WiDaySunny, WiNightClear, WiHot,
  WiDayCloudy, WiNightAltCloudy, WiDayCloudyHigh,WiNightAltCloudyHigh,WiDaySunnyOvercast,
  WiCloudy, WiFog, WiDayFog, WiNightFog,
  WiRain, WiDayRain, WiShowers, WiSprinkle, WiRainWind,
  WiThunderstorm, WiDayThunderstorm, WiStormShowers, WiLightning,
  WiSnow, WiDaySnow, WiSnowWind, WiHail, WiSleet,
  WiStrongWind, WiWindy, WiDust, WiSandstorm,
  WiMoonNew, WiMoonWaxingCrescent3, WiMoonFirstQuarter,
  WiMoonWaxingGibbous3, WiMoonFull, WiMoonWaningGibbous3,
  WiMoonThirdQuarter, WiMoonWaningCrescent3,
  WiHumidity, WiBarometer, WiThermometer, WiSunrise, WiSunset,
  WiWindDeg, WiCloudRefresh,
} from 'react-icons/wi';

const FONT_LINK = "https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&family=JetBrains+Mono:wght@400;500&display=swap";

/* ─── Day/Night detection ─────────────────────────────────────────────────── */
function isCurrentlyDay(sunriseStr = '06:00', sunsetStr = '18:30') {
  const extractTime = s => typeof s === 'string' && s.includes('T') ? s.split('T')[1].substring(0, 5) : String(s).substring(0, 5);
  const toMins = s => { const [h, m] = extractTime(s).split(':').map(Number); return h * 60 + m; };
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= toMins(sunriseStr) && cur <= toMins(sunsetStr);
}

/* ─── Theme map ───────────────────────────────────────────────────────────── */
const THEMES = {
  sunny:   { day:{ g1:'#120d00',g2:'#241a00',g3:'#362600',accent:'#f59e0b',glow:'rgba(245,158,11,0.2)',label:'Sunny' },   night:{ g1:'#1c0a00',g2:'#2e1800',g3:'#3d2800',accent:'#f59e0b',glow:'rgba(245,158,11,0.15)',label:'Sunny' }   },
  cloudy:  { day:{ g1:'#3a4a5c',g2:'#4e6070',g3:'#627888',accent:'#94a3b8',glow:'rgba(148,163,184,0.2)',label:'Cloudy' }, night:{ g1:'#0b111d',g2:'#141e2e',g3:'#1c2b40',accent:'#94a3b8',glow:'rgba(148,163,184,0.1)',label:'Cloudy' } },
  rainy:   { day:{ g1:'#1e3a4a',g2:'#284e64',g3:'#2e6278',accent:'#38bdf8',glow:'rgba(56,189,248,0.25)',label:'Rainy' },  night:{ g1:'#020917',g2:'#051828',g3:'#082238',accent:'#38bdf8',glow:'rgba(56,189,248,0.12)',label:'Rainy' }  },
  stormy:  { day:{ g1:'#1e1040',g2:'#2a1855',g3:'#352060',accent:'#a855f7',glow:'rgba(168,85,247,0.25)',label:'Stormy' }, night:{ g1:'#07000f',g2:'#0f001a',g3:'#180025',accent:'#a855f7',glow:'rgba(168,85,247,0.15)',label:'Stormy' } },
  foggy:   { day:{ g1:'#4a4a50',g2:'#585860',g3:'#666670',accent:'#9ca3af',glow:'rgba(156,163,175,0.2)',label:'Foggy' },  night:{ g1:'#101010',g2:'#191920',g3:'#22222e',accent:'#9ca3af',glow:'rgba(156,163,175,0.1)',label:'Foggy' }  },
  windy:   { day:{ g1:'#0a2a4a',g2:'#103866',g3:'#164478',accent:'#67e8f9',glow:'rgba(103,232,249,0.25)',label:'Windy' }, night:{ g1:'#020d1e',g2:'#061828',g3:'#0a2235',accent:'#67e8f9',glow:'rgba(103,232,249,0.12)',label:'Windy' } },
  humid:   { day:{ g1:'#0a3020',g2:'#104030',g3:'#185040',accent:'#34d399',glow:'rgba(52,211,153,0.25)',label:'Humid' },  night:{ g1:'#001510',g2:'#002218',g3:'#003020',accent:'#34d399',glow:'rgba(52,211,153,0.12)',label:'Humid' }  },
  clear:   { day:{ g1:'#0a2040',g2:'#163060',g3:'#1e3e7a',accent:'#60a5fa',glow:'rgba(96,165,250,0.25)',label:'Clear' },  night:{ g1:'#050d1a',g2:'#0d1f35',g3:'#152d4a',accent:'#60a5fa',glow:'rgba(96,165,250,0.12)',label:'Clear' }  },
  default: { day:{ g1:'#0a2040',g2:'#163060',g3:'#1e3e7a',accent:'#60a5fa',glow:'rgba(96,165,250,0.25)',label:'Weather' },night:{ g1:'#050d1a',g2:'#0d1f35',g3:'#152d4a',accent:'#60a5fa',glow:'rgba(96,165,250,0.12)',label:'Weather' } },
};

function getTheme(condition = '', sunrise = '06:00', sunset = '18:30') {
  const c = condition.toLowerCase();
  const day = isCurrentlyDay(sunrise, sunset);
  let matchedKey = 'default';
  if      (c.match(/storm|thunder/))   matchedKey = 'stormy';
  else if (c.match(/rain|drizzle|shower/)) matchedKey = 'rainy';
  else if (c.match(/cloud|overcast/))  matchedKey = 'cloudy';
  else if (c.match(/fog|mist|haze/))   matchedKey = 'foggy';
  else if (c.match(/wind/))            matchedKey = 'windy';
  else if (c.match(/clear|sun/))       matchedKey = day ? 'sunny' : 'clear';
  const themeData = THEMES[matchedKey] || THEMES.default;
  const variant = day ? themeData.day : themeData.night;
  return { ...variant, key: matchedKey, isDay: day };
}

// /* ─── Weather Icon helper (replaces getWeatherEmoji) ──────────────────────── */
// function getWeatherIcon(condition = '', isDay = true, size = 32, color = 'currentColor') {
//   const c = condition.toLowerCase();
//   const p = { size, color };
//   if (c.match(/thunder|storm/))          return <WiThunderstorm {...p} />;
//   if (c.match(/hail/))                   return <WiHail {...p} />;
//   if (c.match(/sleet/))                  return <WiSleet {...p} />;
//   if (c.match(/snow|blizzard/))          return isDay ? <WiDaySnow {...p} /> : <WiSnow {...p} />;
//   if (c.match(/rain.*wind|wind.*rain/))  return <WiRainWind {...p} />;
//   if (c.match(/drizzle|sprinkle/))       return <WiSprinkle {...p} />;
//   if (c.match(/shower/))                 return <WiShowers {...p} />;
//   if (c.match(/rain/))                   return isDay ? <WiDayRain {...p} /> : <WiRain {...p} />;
//   if (c.match(/sandstorm/))              return <WiSandstorm {...p} />;
//   if (c.match(/dust/))                   return <WiDust {...p} />;
//   if (c.match(/fog|mist/))              return isDay ? <WiDayFog {...p} /> : <WiNightFog {...p} />;
//   if (c.match(/haze/))                   return <WiFog {...p} />;
//   if (c.match(/wind|breeze/))            return <WiStrongWind {...p} />;
//   if (c.match(/overcast/))               return <WiCloudy {...p} />;
//   if (c.match(/partly|mostly/))          return isDay ? <WiDayCloudy {...p} /> : <WiNightAltCloudy {...p} />;
//   if (c.match(/cloud/))                  return isDay ? <WiDayCloudyHigh {...p} /> : <WiNightAltCloudy {...p} />;
//   if (c.match(/hot/))                    return <WiHot {...p} />;
//   if (c.match(/humid/))                  return isDay ? <WiDaySunny {...p} /> : <WiNightClear {...p} />;
//   return isDay ? <WiDaySunny {...p} /> : <WiNightClear {...p} />;
// }

/* ─── Weather Icon helper (Colored with Hover Tooltip) ───────────────────── */
function getWeatherIcon(condition = '', isDay = true, size = 32) {
  const c = condition.toLowerCase();
  
  // Clean up the text for the hover tooltip (Capitalizes first letter)
  const tooltipText = condition ? condition.charAt(0).toUpperCase() + condition.slice(1) : "Weather";
  
  // Color Palette
  const colors = {
    sun: "#facc15",       // Bright Yellow
    moon: "#93c5fd",      // Soft Silver-Blue
    rain: "#38bdf8",      // Bright Sky Blue
    storm: "#c084fc",     // Electric Purple
    snow: "#e0f2fe",      // Frost White
    cloud: "#cbd5e1",     // Light Slate Gray
    wind: "#a5f3fc",      // Bright Cyan
    dust: "#d97706",      // Amber/Sand
    hot: "#f87171"        // Vibrant Red
  };

  // Base props object shared by all icons, including the hover title!
  const p = { size, title: tooltipText };

  if (c.match(/thunder|storm/))          return <WiThunderstorm {...p} color={colors.storm} />;
  if (c.match(/hail/))                   return <WiHail {...p} color={colors.snow} />;
  if (c.match(/sleet/))                  return <WiSleet {...p} color={colors.snow} />;
  if (c.match(/snow|blizzard/))          return isDay ? <WiDaySnow {...p} color={colors.snow} /> : <WiSnow {...p} color={colors.snow} />;
  if (c.match(/rain.*wind|wind.*rain/))  return <WiRainWind {...p} color={colors.rain} />;
  if (c.match(/drizzle|sprinkle/))       return <WiSprinkle {...p} color="#7dd3fc" />; 
  if (c.match(/shower/))                 return <WiShowers {...p} color={colors.rain} />;
  if (c.match(/rain/))                   return isDay ? <WiDayRain {...p} color={colors.rain} /> : <WiRain {...p} color={colors.rain} />;
  if (c.match(/sandstorm/))              return <WiSandstorm {...p} color={colors.dust} />;
  if (c.match(/dust/))                   return <WiDust {...p} color="#b45309" />;
  if (c.match(/fog|mist/))               return isDay ? <WiDayFog {...p} color={colors.cloud} /> : <WiNightFog {...p} color="#94a3b8" />;
  if (c.match(/haze/))                   return <WiFog {...p} color={colors.cloud} />;
  if (c.match(/wind|breeze/))            return <WiStrongWind {...p} color={colors.wind} />;
  if (c.match(/overcast/))               return <WiCloudy {...p} color={colors.cloud} />;
  
  // Mixed conditions
  if (c.match(/partly|mostly/))          return isDay ? <WiDayCloudy {...p} color="#fde047" /> : <WiNightAltCloudy {...p} color={colors.moon} />;
  if (c.match(/cloud/))                  return isDay ? <WiDayCloudyHigh {...p} color={colors.cloud} /> : <WiNightAltCloudyHigh {...p} color={colors.moon} />;
  
  // Temperature extremes
  if (c.match(/hot/))                    return <WiHot {...p} color={colors.hot} />;
  if (c.match(/humid/))                  return isDay ? <WiDaySunny {...p} color={colors.sun} /> : <WiNightClear {...p} color={colors.moon} />;
  
  // Default clear skies
  return isDay ? <WiDaySunny {...p} color={colors.sun} /> : <WiNightClear {...p} color={colors.moon} />;
}

// /* ─── Moon phase icon (replaces moonPhase emoji) ──────────────────────────── */
// function getMoonPhaseIcon(size = 28, color = 'currentColor') {
//   const p = { size, color };
//   const d = Math.floor((Date.now() / 86400000 - 10) % 29.53);
//   if (d < 2)  return <WiMoonNew {...p} />;
//   if (d < 6)  return <WiMoonWaxingCrescent3 {...p} />;
//   if (d < 10) return <WiMoonFirstQuarter {...p} />;
//   if (d < 14) return <WiMoonWaxingGibbous3 {...p} />;
//   if (d < 17) return <WiMoonFull {...p} />;
//   if (d < 21) return <WiMoonWaningGibbous3 {...p} />;
//   if (d < 25) return <WiMoonThirdQuarter {...p} />;
//   return <WiMoonWaningCrescent3 {...p} />;
// }

/* ─── Moon phase icon (Colored with Hover Tooltip) ───────────────────────── */
function getMoonPhaseIcon(size = 28) {
  const moonColor = "#93c5fd"; // Matching soft silver-blue from our palette
  const d = Math.floor((Date.now() / 86400000 - 10) % 29.53);
  
  // Determine text label for hover tooltip based on phase calculation
  let phaseName = "Moon Phase";
  if (d < 2)       phaseName = "New Moon";
  else if (d < 6)  phaseName = "Waxing Crescent";
  else if (d < 10) phaseName = "First Quarter Moon";
  else if (d < 14) phaseName = "Waxing Gibbous";
  else if (d < 17) phaseName = "Full Moon";
  else if (d < 21) phaseName = "Waning Gibbous";
  else if (d < 25) phaseName = "Third Quarter Moon";
  else             phaseName = "Waning Crescent";

  // Base props configuration
  const p = { size, color: moonColor, title: phaseName };

  if (d < 2)   return <WiMoonNew {...p} />;
  if (d < 6)   return <WiMoonWaxingCrescent3 {...p} />;
  if (d < 10)  return <WiMoonFirstQuarter {...p} />;
  if (d < 14)  return <WiMoonWaxingGibbous3 {...p} />;
  if (d < 17)  return <WiMoonFull {...p} />;
  if (d < 21)  return <WiMoonWaningGibbous3 {...p} />;
  if (d < 25)  return <WiMoonThirdQuarter {...p} />;
  return <WiMoonWaningCrescent3 {...p} />;
}

/* ─── WMO Code Mapper ─────────────────────────────────────────────────────── */
const WMO_MAP = {
  0:  { n: 'Clear',           Icon: (p) => <WiDaySunny {...p} />         },
  1:  { n: 'Mostly Clear',    Icon: (p) => <WiDaySunnyOvercast {...p} /> },
  2:  { n: 'Partly Cloudy',   Icon: (p) => <WiDayCloudy {...p} />        },
  3:  { n: 'Cloudy',          Icon: (p) => <WiCloudy {...p} />           },
  45: { n: 'Fog',             Icon: (p) => <WiFog {...p} />              },
  48: { n: 'Rime Fog',        Icon: (p) => <WiFog {...p} />              },
  51: { n: 'Light Drizzle',   Icon: (p) => <WiSprinkle {...p} />         },
  53: { n: 'Drizzle',         Icon: (p) => <WiSprinkle {...p} />         },
  55: { n: 'Heavy Drizzle',   Icon: (p) => <WiShowers {...p} />          },
  61: { n: 'Light Rain',      Icon: (p) => <WiDayRain {...p} />          },
  63: { n: 'Rain',            Icon: (p) => <WiRain {...p} />             },
  65: { n: 'Heavy Rain',      Icon: (p) => <WiRainWind {...p} />         },
  71: { n: 'Light Snow',      Icon: (p) => <WiDaySnow {...p} />          },
  73: { n: 'Snow',            Icon: (p) => <WiSnow {...p} />             },
  75: { n: 'Heavy Snow',      Icon: (p) => <WiSnowWind {...p} />         },
  77: { n: 'Snow Grains',     Icon: (p) => <WiSnow {...p} />             },
  80: { n: 'Rain Showers',    Icon: (p) => <WiShowers {...p} />          },
  81: { n: 'Heavy Showers',   Icon: (p) => <WiStormShowers {...p} />     },
  82: { n: 'Violent Showers', Icon: (p) => <WiThunderstorm {...p} />     },
  85: { n: 'Snow Showers',    Icon: (p) => <WiDaySnow {...p} />          },
  86: { n: 'Heavy Snow',      Icon: (p) => <WiSnowWind {...p} />         },
  95: { n: 'Thunderstorm',    Icon: (p) => <WiThunderstorm {...p} />     },
  96: { n: 'Thunder/Hail',    Icon: (p) => <WiHail {...p} />             },
  99: { n: 'Heavy Thunder',   Icon: (p) => <WiThunderstorm {...p} />     },
};
const getWMO = c => WMO_MAP[c] || { n: 'Unknown', Icon: (p) => <WiThermometer {...p} /> };

/* ─── Utility labels ──────────────────────────────────────────────────────── */
const uvInfo  = u => u<=2?{l:'Low',c:'#4ade80'}:u<=5?{l:'Moderate',c:'#facc15'}:u<=7?{l:'High',c:'#fb923c'}:u<=10?{l:'Very High',c:'#f87171'}:{l:'Extreme',c:'#c084fc'};
const aqiInfo = a => !a?{l:'N/A',c:'#64748b'}:a<=50?{l:'Good',c:'#4ade80'}:a<=100?{l:'Moderate',c:'#facc15'}:a<=150?{l:'Sensitive',c:'#fb923c'}:a<=200?{l:'Unhealthy',c:'#f87171'}:{l:'Hazardous',c:'#c084fc'};
const compassDir = d => ['N','NNE','NE','ENE','E','ESE','SE','SSE','S','SSW','SW','WSW','W','WNW','NW','NNW'][Math.round(d/22.5)%16];

/* ─── GLOBAL CSS ──────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
@import url('${FONT_LINK}');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.18);border-radius:4px;}
::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.35);}
@keyframes rain{0%{transform:translateY(-10px) scaleY(0.8);opacity:0;}15%{opacity:0.6;}100%{transform:translateY(110vh) scaleY(1);opacity:0;}}
@keyframes ticker{0%{transform:translateX(100vw);}100%{transform:translateX(-100%);}}
@keyframes blink{0%,100%{opacity:1;}50%{opacity:0.2;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes slideRight{from{opacity:0;transform:translateX(-12px);}to{opacity:1;transform:translateX(0);}}
@keyframes pulse{0%,100%{transform:scale(1);}50%{transform:scale(1.08);}}
@keyframes glow{0%,100%{box-shadow:0 0 8px var(--accent-glow);}50%{box-shadow:0 0 22px var(--accent-glow);}}
@keyframes shimmer{0%{background-position:-400px 0;}100%{background-position:400px 0;}}
@keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:0.6;}100%{transform:translateY(-80px) scale(0.3);opacity:0;}}
@keyframes cloud{0%{transform:translateX(-120px);}100%{transform:translateX(110vw);}}
@keyframes blowWind{0%{transform:translateX(120vw) scaleX(1);opacity:0;}15%{opacity:0.3;}85%{opacity:0.3;}100%{transform:translateX(-20vw) scaleX(2.5);opacity:0;}}
@keyframes voiceBar{from{transform:scaleY(0.3);opacity:0.5;}to{transform:scaleY(1);opacity:1;}}
.city-row{transition:background 0.18s,transform 0.18s;cursor:pointer;}
.city-row:hover{background:rgba(255,255,255,0.08)!important;transform:translateX(3px);}
.tab{transition:all 0.2s ease;cursor:pointer;border:none;font-family:'DM Sans',sans-serif;}
.tab:hover{opacity:1!important;}
.chip{transition:all 0.15s ease;cursor:pointer;}
.chip:hover{opacity:1!important;transform:translateY(-1px);}
.icon-btn{transition:all 0.2s ease;cursor:pointer;}
.icon-btn:hover{opacity:1!important;background:rgba(255,255,255,0.15)!important;}
.search-input:focus{outline:none;}
.stat-card{transition:transform 0.2s,box-shadow 0.2s;}
.stat-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.3);}
.state-header{transition:background 0.15s;cursor:pointer;}
.state-header:hover{background:rgba(255,255,255,0.08)!important;}
`;

/* ─── Rain drops ──────────────────────────────────────────────────────────── */
const DROPS = Array.from({length:35},()=>({
  left:`${Math.random()*100}%`, h:`${Math.random()*22+8}px`,
  dur:`${Math.random()*0.9+0.45}s`, del:`${Math.random()*2.5}s`,
  op: Math.random()*0.3+0.2,
}));
const CLOUDS = Array.from({length:6},()=>({
  top:`${Math.random()*25+2}%`, scale:Math.random()*0.6+0.6,
  dur:`${Math.random()*30+40}s`, del:`${-Math.random()*40}s`,
  opacity:Math.random()*0.25+0.15,
}));
const PARTICLES = Array.from({length:18},()=>({
  left:`${Math.random()*100}%`, top:`${Math.random()*60+20}%`,
  size:`${Math.random()*4+2}px`, dur:`${Math.random()*4+3}s`,
  del:`${Math.random()*5}s`,
}));
const WIND_STREAKS = Array.from({length:12},()=>({
  top:`${Math.random()*85+5}%`, width:`${Math.random()*150+80}px`,
  dur:`${Math.random()*1.2+0.8}s`, del:`${Math.random()*2.5}s`,
  op: Math.random()*0.2+0.1,
}));

function WeatherParticles({ accent }) {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {PARTICLES.map((p,i)=>(
        <div key={i} style={{position:'absolute',left:p.left,top:p.top,
          width:p.size,height:p.size,borderRadius:'50%',background:accent,opacity:0,
          animation:`floatUp ${p.dur} ${p.del} ease-in infinite`}}/>
      ))}
    </div>
  );
}

function CloudLayer() {
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {CLOUDS.map((c,i)=>(
        <div key={i} style={{position:'absolute',top:c.top,left:'-150px',
          transform:`scale(${c.scale})`,opacity:c.opacity,
          animation:`cloud ${c.dur} ${c.del} linear infinite`}}>
          <svg width="180" height="70" viewBox="0 0 180 70">
            <ellipse cx="90" cy="55" rx="85" ry="20" fill="rgba(200,220,255,0.9)"/>
            <ellipse cx="65" cy="42" rx="42" ry="30" fill="rgba(200,220,255,0.9)"/>
            <ellipse cx="110" cy="38" rx="50" ry="35" fill="rgba(200,220,255,0.9)"/>
            <ellipse cx="140" cy="48" rx="32" ry="22" fill="rgba(200,220,255,0.9)"/>
          </svg>
        </div>
      ))}
    </div>
  );
}

function RainEffect({ isDay }) {
  const dropColor = isDay ? 'rgba(100,160,220,' : 'rgba(147,210,255,';
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {DROPS.map((d,i)=>(
        <div key={i} style={{position:'absolute',left:d.left,top:'-5%',width:'1.5px',height:d.h,
          background:`${dropColor}${d.op})`,animationName:'rain',animationDuration:d.dur,
          animationDelay:d.del,animationTimingFunction:'linear',animationIterationCount:'infinite'}}/>
      ))}
    </div>
  );
}

function WindEffect({ isDay }) {
  const color = isDay ? '255,255,255' : '170,200,240';
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {WIND_STREAKS.map((w,i)=>(
        <div key={i} style={{
          position:'absolute',top:w.top,left:'-20%',width:w.width,height:'2px',
          background:`linear-gradient(90deg,rgba(${color},0) 0%,rgba(${color},${w.op}) 50%,rgba(${color},0) 100%)`,
          borderRadius:'50%',animation:`blowWind ${w.dur} ${w.del} linear infinite`}}/>
      ))}
    </div>
  );
}

/* ─── Live Clock ──────────────────────────────────────────────────────────── */
function LiveClock({ accent, format='12h' }) {
  const [t, setT] = useState(new Date());
  useEffect(()=>{ const id=setInterval(()=>setT(new Date()),1000); return ()=>clearInterval(id); },[]);
  let hours = t.getHours();
  const ampm = hours >= 12 ? ' PM' : ' AM';
  if (format==='12h') hours = hours % 12 || 12;
  const hh=String(hours).padStart(2,'0'), mm=String(t.getMinutes()).padStart(2,'0'), ss=String(t.getSeconds()).padStart(2,'0');
  const date=t.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
  return (
    <div style={{textAlign:'right'}}>
      <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:20,fontWeight:500,color:'#fff',letterSpacing:'0.04em',lineHeight:1}}>
        {hh}<span style={{color:accent,animation:'blink 2s step-start infinite'}}>:</span>{mm}
        <span style={{fontSize:13,color:'rgba(255,255,255,0.4)',marginLeft:4}}>
          {ss}{format==='12h'&&<span style={{fontSize:10,marginLeft:2}}>{ampm}</span>}
        </span>
      </div>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',marginTop:3}}>{date}</div>
    </div>
  );
}

/* ─── Sun Arc ─────────────────────────────────────────────────────────────── */
function SunArc({ sunrise='06:00', sunset='18:30', accent='#f59e0b' }) {
  const extractTime = s => typeof s==='string'&&s.includes('T')?s.split('T')[1].substring(0,5):String(s).substring(0,5);
  const safeSunrise=extractTime(sunrise), safeSunset=extractTime(sunset);
  const now=new Date();
  const toMins=s=>{ const [h,m]=s.split(':').map(Number); return h*60+m; };
  const curMins=now.getHours()*60+now.getMinutes();
  const sr=toMins(safeSunrise), ss=toMins(safeSunset);
  const isDay=curMins>=sr&&curMins<=ss;
  let progress, leftLabel, rightLabel, timeText;
  if (isDay) {
    progress=(curMins-sr)/(ss-sr); leftLabel=safeSunrise; rightLabel=safeSunset;
    const ml=ss-curMins; timeText=`${Math.floor(ml/60)}h ${ml%60}m until sunset`;
  } else {
    const totalNight=(24*60-ss)+sr;
    const elapsed=curMins>=ss?(curMins-ss):((24*60-ss)+curMins);
    const ml=totalNight-elapsed;
    progress=elapsed/totalNight; leftLabel=safeSunset; rightLabel=safeSunrise;
    timeText=`${Math.floor(ml/60)}h ${ml%60}m until sunrise`;
  }
  progress=Math.max(0,Math.min(1,progress));
  const W=220,H=90,cx=110,cy=90,R=75;
  const angle=Math.PI-progress*Math.PI;
  const sx=cx+R*Math.cos(Math.PI),sy=cy+R*Math.sin(Math.PI);
  const ex=cx+R*Math.cos(0),ey=cy+R*Math.sin(0);
  const mX=cx+R*Math.cos(angle), mY=cy-Math.abs(R*Math.sin(angle));
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      <svg width={W} height={H+16} viewBox={`0 0 ${W} ${H+16}`} style={{overflow:'visible'}}>
        <path d={`M ${sx} ${cy} A ${R} ${R} 0 0 1 ${ex} ${ey}`} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="2.5" strokeLinecap="round"/>
        <path d={`M ${sx} ${cy} A ${R} ${R} 0 0 1 ${ex} ${ey}`} fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${progress*Math.PI*R} ${Math.PI*R}`} opacity={isDay?"0.8":"0.4"}/>
        <line x1={sx} y1={cy} x2={ex} y2={ey} stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4 4"/>
        <circle cx={mX} cy={mY} r="10" fill={accent} opacity={isDay?"0.25":"0.1"}/>
        <circle cx={mX} cy={mY} r="6"  fill={accent} opacity={isDay?"1":"0.5"}/>
        <circle cx={sx} cy={cy} r="3"  fill={accent} opacity="0.5"/>
        <circle cx={ex} cy={ey} r="3"  fill={accent} opacity="0.5"/>
        <text x={sx-4} y={cy+16} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{leftLabel}</text>
        <text x={ex+4} y={cy+16} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.4)">{rightLabel}</text>
      </svg>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginTop:-4}}>{timeText}</div>
    </div>
  );
}

/* ─── Wind Rose ───────────────────────────────────────────────────────────── */
function WindRose({ deg=0, speed=0, accent, gust=0 }) {
  const dirs=['N','NE','E','SE','S','SW','W','NW'];
  const nX=50+36*Math.sin(deg*Math.PI/180), nY=50-36*Math.cos(deg*Math.PI/180);
  const tX=50-14*Math.sin(deg*Math.PI/180), tY=50+14*Math.cos(deg*Math.PI/180);
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:10}}>
      <svg width="120" height="120" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
        <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 4"/>
        {[...Array(36)].map((_,i)=>{ const a=i*10*Math.PI/180,r1=i%9===0?38:i%3===0?41:43; return <line key={i} x1={50+r1*Math.sin(a)} y1={50-r1*Math.cos(a)} x2={50+45*Math.sin(a)} y2={50-45*Math.cos(a)} stroke="rgba(255,255,255,0.12)" strokeWidth={i%9===0?1.2:0.6}/>; })}
        {dirs.map((d,i)=>{ const a=i*45*Math.PI/180; return <text key={d} x={50+40*Math.sin(a)} y={50-40*Math.cos(a)} textAnchor="middle" dominantBaseline="middle" fontSize={d.length===1?'8':'6'} fill={d==='N'?accent:'rgba(255,255,255,0.4)'} fontWeight={d==='N'?700:400} fontFamily="'JetBrains Mono',monospace">{d}</text>; })}
        <defs><marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><polygon points="0 0,6 3,0 6" fill={accent}/></marker></defs>
        <line x1={tX} y1={tY} x2={nX*0.96+(50*0.04)} y2={nY*0.96+(50*0.04)} stroke={accent} strokeWidth="2.5" strokeLinecap="round" markerEnd="url(#arrowhead)" opacity="0.9"/>
        <circle cx="50" cy="50" r="4" fill={accent} opacity="0.4"/>
        <circle cx="50" cy="50" r="2.5" fill={accent}/>
      </svg>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:26,fontWeight:700,color:'#fff',fontFamily:"'Syne',sans-serif",letterSpacing:'-0.02em'}}>{speed}<span style={{fontSize:13,color:'rgba(255,255,255,0.4)',fontWeight:400}}> km/h</span></div>
        <div style={{fontSize:11,color:accent,marginTop:2}}>{compassDir(deg)} · Gusts {gust} km/h</div>
      </div>
    </div>
  );
}

/* ─── Hourly Forecast ─────────────────────────────────────────────────────── */
function HourlyForecast({ data, accent }) {
  if (!data?.length) return null;
  const max=Math.max(...data.map(d=>d.temp)), min=Math.min(...data.map(d=>d.temp));
  return (
    <div style={{paddingBottom:6}}>
      <div style={{display:'grid',gridTemplateColumns:`repeat(${data.length},1fr)`,gap:10}}>
        {data.map((h,i)=>{
          const pct=max===min?50:((h.temp-min)/(max-min))*100;
          return (
            <div key={i} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5,minWidth:56,
              background:'rgba(255,255,255,0.04)',borderRadius:12,padding:'10px 8px',
              border:`1px solid rgba(255,255,255,${i===0?0.15:0.06})`}}>
              <div style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontFamily:"'JetBrains Mono',monospace"}}>{h.hour}</div>
              <div style={{fontSize:28,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {h.icon}
              </div>
              <div style={{height:44,width:4,background:'rgba(255,255,255,0.08)',borderRadius:4,position:'relative'}}>
                <div style={{position:'absolute',bottom:0,width:'100%',borderRadius:4,height:`${pct}%`,background:`linear-gradient(to top,${accent},${accent}88)`}}/>
              </div>
              <div style={{fontSize:13,fontWeight:600,color:'#fff'}}>{h.temp}°</div>
              {h.pop!=null&&<div style={{fontSize:9,color:'#38bdf8',fontFamily:"'JetBrains Mono',monospace"}}>{h.pop}%</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Weekly Forecast ─────────────────────────────────────────────────────── */
function WeekForecast({ data, accent }) {
  if (!data?.length) return null;
  const absMax=Math.max(...data.map(d=>d.high)), absMin=Math.min(...data.map(d=>d.low));
  return (
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {data.map((d,i)=>{
        const lo=(d.low-absMin)/(absMax-absMin)*100, hi=(d.high-absMin)/(absMax-absMin)*100;
        return (
          <div key={i} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,
            background:i===0?`${accent}18`:'rgba(255,255,255,0.03)',
            border:`1px solid ${i===0?`${accent}30`:'rgba(255,255,255,0.05)'}`,
            animation:`slideRight 0.3s ${i*0.06}s both`}}>
            <div style={{fontSize:13,color:'rgba(255,255,255,0.6)',width:32,fontFamily:"'DM Sans',sans-serif"}}>{d.day}</div>
            <div style={{fontSize:26,lineHeight:1,display:'flex',alignItems:'center',justifyContent:'center',width:32}}>
              {d.icon}
            </div>
            <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',width:90,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.condition}</div>
            <div style={{flex:1,display:'flex',alignItems:'center',gap:8}}>
              <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',minWidth:28,textAlign:'right'}}>{d.low}°</span>
              <div style={{flex:1,height:4,background:'rgba(255,255,255,0.07)',borderRadius:4,position:'relative'}}>
                <div style={{position:'absolute',left:`${lo}%`,width:`${hi-lo}%`,height:'100%',background:`linear-gradient(to right,#38bdf8,${accent})`,borderRadius:4}}/>
              </div>
              <span style={{fontSize:12,color:'#fff',fontWeight:600,minWidth:28}}>{d.high}°</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Search Bar ──────────────────────────────────────────────────────────── */
function SearchBar({ value, onChange, onClear, accent, placeholder }) {
  return (
    <div style={{position:'relative',flex:1,maxWidth:440}}>
      <div style={{position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'rgba(255,255,255,0.35)',pointerEvents:'none',fontSize:15}}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      </div>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||"Search city…"} className="search-input"
        style={{width:'100%',background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',
          borderRadius:12,padding:'9px 36px 9px 38px',color:'#fff',fontSize:13,
          fontFamily:"'DM Sans',sans-serif",transition:'all 0.25s',backdropFilter:'blur(10px)'}}
        onFocus={e=>{e.target.style.border=`1px solid ${accent}66`;e.target.style.background='rgba(255,255,255,0.1)';}}
        onBlur={e=>{e.target.style.border='1px solid rgba(255,255,255,0.12)';e.target.style.background='rgba(255,255,255,0.07)';}}/>
      {value&&<button onClick={onClear} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',
        background:'rgba(255,255,255,0.12)',border:'none',borderRadius:'50%',width:18,height:18,
        color:'rgba(255,255,255,0.7)',cursor:'pointer',display:'flex',alignItems:'center',
        justifyContent:'center',fontSize:10}}>✕</button>}
    </div>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────────────────── */
function StatCard({ icon, label, value, sub, subColor, progress, accentColor }) {
  return (
    <div className="stat-card" style={{background:'rgba(255,255,255,0.05)',borderRadius:14,
      padding:'16px 18px',border:'1px solid rgba(255,255,255,0.08)',overflow:'hidden',position:'relative'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'DM Sans',sans-serif"}}>{label}</div>
        <span style={{fontSize:24,lineHeight:1,display:'flex',alignItems:'center'}}>{icon}</span>
      </div>
      <div style={{fontSize:24,fontWeight:700,color:'#fff',fontFamily:"'Syne',sans-serif",lineHeight:1,letterSpacing:'-0.01em'}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:subColor||'rgba(255,255,255,0.45)',marginTop:5}}>{sub}</div>}
      {progress!=null&&(
        <div style={{marginTop:10,height:3,background:'rgba(255,255,255,0.07)',borderRadius:4}}>
          <div style={{height:'100%',width:`${Math.min(100,progress)}%`,borderRadius:4,background:accentColor||'rgba(255,255,255,0.4)',transition:'width 0.5s ease'}}/>
        </div>
      )}
    </div>
  );
}

/* ─── Chart Tooltip ───────────────────────────────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active||!payload?.length) return null;
  return (
    <div style={{background:'rgba(10,20,40,0.95)',border:'1px solid rgba(255,255,255,0.12)',borderRadius:10,padding:'8px 12px',fontSize:12,backdropFilter:'blur(16px)'}}>
      <div style={{color:'rgba(255,255,255,0.5)',marginBottom:4}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||'#fff',display:'flex',gap:8,alignItems:'center'}}>
          <span style={{width:8,height:8,borderRadius:'50%',background:p.color||'#fff',flexShrink:0}}/>
          <span style={{color:'rgba(255,255,255,0.6)'}}>{p.name}:</span>
          <span style={{fontWeight:600,color:'#fff'}}>{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Hot/Cold Chart ──────────────────────────────────────────────────────── */
function HotColdChart({ stats, accent }) {
  if (!stats||stats.length===0) return null;
  const sorted=[...stats].sort((a,b)=>b.temperature-a.temperature);
  const hottest=sorted.slice(0,10).map(c=>({city:c.city,temp:c.temperature}));
  const coldest=[...sorted].reverse().slice(0,10).map(c=>({city:c.city,temp:c.temperature}));
  const HBar=({data,title,barColor})=>(
    <div style={{flex:1}}>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>{title}</div>
      <div style={{height:data.length*28}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{top:0,right:36,left:4,bottom:0}}>
            <XAxis type="number" domain={['auto','auto']} hide/>
            <YAxis type="category" dataKey="city" width={72} tick={{fontSize:11,fill:'rgba(255,255,255,0.6)',fontFamily:"'DM Sans',sans-serif"}} axisLine={false} tickLine={false}/>
            <Tooltip content={<ChartTooltip/>} cursor={{fill:'rgba(255,255,255,0.04)'}}/>
            <Bar dataKey="temp" name="Temp °C" fill={barColor} radius={[0,5,5,0]} barSize={14}
              label={{position:'right',fontSize:10,fill:'rgba(255,255,255,0.55)',formatter:v=>`${v}°`}}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
  return (
    <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:16}}>
      <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace",display:'flex',alignItems:'center',gap:8}}>
        <WiHot size={18} color="#ef4444"/> Hottest &amp; <WiSnow size={18} color="#38bdf8"/> Coldest Cities
      </div>
      <div style={{display:'flex',gap:24}}>
        <HBar data={hottest} title="Top 10 Hottest" barColor="#ef4444"/>
        <div style={{width:'1px',background:'rgba(255,255,255,0.08)'}}/>
        <HBar data={coldest} title="Top 10 Coldest" barColor="#38bdf8"/>
      </div>
    </div>
  );
}

/* ─── Chat Message ────────────────────────────────────────────────────────── */
const ChatMsg = React.memo(function ChatMsg({ role, text, accent }) {
  const isUser=role==='user';
  return (
    <div style={{display:'flex',justifyContent:isUser?'flex-end':'flex-start',marginBottom:8,animation:'fadeUp 0.25s ease'}}>
      {!isUser&&(
        <div style={{width:28,height:28,borderRadius:'50%',background:`${accent}22`,border:`1px solid ${accent}55`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,marginRight:8,marginTop:2}}>
          <WiCloudRefresh size={18} color={accent}/>
        </div>
      )}
      <div style={{maxWidth:'80%',padding:'9px 13px',borderRadius:isUser?'16px 4px 16px 16px':'4px 16px 16px 16px',
        background:isUser?accent:'rgba(255,255,255,0.07)',color:isUser?'#000':'rgba(255,255,255,0.9)',
        fontSize:13,lineHeight:1.55,border:isUser?'none':'1px solid rgba(255,255,255,0.08)',
        wordBreak:'break-word',fontFamily:"'DM Sans',sans-serif"}}>
        {text}
      </div>
    </div>
  );
});

/* ─── Chat Panel ──────────────────────────────────────────────────────────── */
function ChatPanel({ accent, selected }) {
  const [query, setQuery]             = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceError, setVoiceError]   = useState('');
  const [localLog, setLocalLog]       = useState([
    { role:'ai', text:"Hi! I'm your AI meteorologist. Ask me about weather conditions, safety advisories, or forecasts for any Indian city." }
  ]);
  const chatBoxRef     = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if (!SR) return;
    setVoiceSupported(true);
    const rec=new SR();
    rec.lang='en-IN'; rec.continuous=false; rec.interimResults=true;
    rec.onstart  =()=>{ setIsListening(true); setVoiceError(''); };
    rec.onresult =(e)=>{ let t=''; for(let i=0;i<e.results.length;i++) t+=e.results[i][0].transcript; setQuery(t); };
    rec.onerror  =(e)=>{
      setIsListening(false);
      if(e.error==='not-allowed') setVoiceError('Microphone access denied. Allow mic in browser settings.');
      else if(e.error==='no-speech') setVoiceError('No speech detected. Try again.');
      else setVoiceError(`Voice error: ${e.error}`);
      setTimeout(()=>setVoiceError(''),3000);
    };
    rec.onend=()=>setIsListening(false);
    recognitionRef.current=rec;
    return ()=>recognitionRef.current?.abort();
  },[]);

  const toggleVoice=useCallback(()=>{
    if(!recognitionRef.current) return;
    if(isListening){ recognitionRef.current.stop(); setIsListening(false); }
    else { setQuery(''); try{ recognitionRef.current.start(); } catch{ recognitionRef.current.stop(); setTimeout(()=>recognitionRef.current?.start(),200); } }
  },[isListening]);

  const addMessage=useCallback(msg=>{
    setLocalLog(prev=>{ const u=[...prev,msg]; return u.length>40?u.slice(-40):u; });
  },[]);

  useEffect(()=>{ if(chatBoxRef.current) chatBoxRef.current.scrollTop=chatBoxRef.current.scrollHeight; },[localLog,isTyping]);

  const handleChat=useCallback(async()=>{
    const m=query.trim();
    if(!m||isTyping) return;
    if(isListening&&recognitionRef.current) recognitionRef.current.stop();
    addMessage({role:'user',text:m});
    setQuery(''); setIsTyping(true);
    try {
      const res=await fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'}/chat`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:m})});
      if(!res.ok) throw new Error(`${res.status}`);
      const data=await res.json();
      let reply=typeof data.ai_response==='string'?data.ai_response:'Sorry, could not process that.';
      reply=reply.replace(/(?:\s*End\.\s*)+$/gi,'').trim();
      addMessage({role:'ai',text:reply});
    } catch(err) {
      addMessage({role:'ai',text:err.message.includes('fetch')?'Backend offline — start uvicorn to connect.':`Error: ${err.message}`});
    } finally { setIsTyping(false); }
  },[query,isTyping,isListening,addMessage]);

  const handleKey=useCallback(e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleChat();} },[handleChat]);

  const quickQs=selected
    ?[`Rain in ${selected.city}?`,'Heatwave risk?','Best city today?','Safe to travel?','Air quality now?']
    :['Which city is hottest?','Where is it raining now?','Worst AQI today?','Heatwave risk?'];

  return (
    <div style={{display:'flex',flexDirection:'column',height:'100%',overflow:'hidden'}}>
      <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,0.07)',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
        <div style={{width:34,height:34,borderRadius:'50%',background:`${accent}22`,border:`1px solid ${accent}55`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,animation:'glow 3s ease infinite'}}>
          <WiCloudRefresh size={20} color={accent}/>
        </div>
        <div>
          <div style={{fontWeight:600,fontSize:13,fontFamily:"'Syne',sans-serif"}}>AI Meteorologist</div>
          <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:1}}>
            {isListening?<span style={{color:'#fca5a5'}}>● Listening…</span>:'Powered by Llama 3.1'}
          </div>
        </div>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8}}>
          {isListening&&(
            <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:20,padding:'3px 10px',fontSize:10,color:'#fca5a5'}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:'#ef4444',animation:'blink 1s ease infinite'}}/>REC
            </div>
          )}
          <div style={{width:7,height:7,borderRadius:'50%',background:'#4ade80',animation:'blink 2.5s ease infinite'}}/>
        </div>
      </div>
      <div style={{padding:'10px 12px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',gap:5,flexWrap:'wrap',flexShrink:0}}>
        {quickQs.map(q=>(
          <button key={q} className="chip" onClick={()=>setQuery(q)}
            style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.65)',borderRadius:20,padding:'4px 10px',fontSize:10,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",opacity:0.85}}>
            {q}
          </button>
        ))}
      </div>
      <div ref={chatBoxRef} style={{flex:1,minHeight:0,overflowY:'auto',padding:'14px 14px 6px',scrollBehavior:'smooth'}}>
        {localLog.map((msg,i)=><ChatMsg key={`m-${i}`} role={msg.role} text={msg.text} accent={accent}/>)}
        {isListening&&(
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8,animation:'fadeIn 0.2s ease'}}>
            <div style={{padding:'9px 13px',borderRadius:'16px 16px 4px 16px',background:`${accent}18`,border:`1px solid ${accent}35`,display:'flex',alignItems:'center',gap:8}}>
              <div style={{display:'flex',alignItems:'center',gap:2,height:16}}>
                {[0.3,0.6,1,0.7,0.4,0.8,0.5].map((h,i)=>(
                  <div key={i} style={{width:3,borderRadius:2,background:accent,height:`${h*100}%`,animation:`voiceBar 0.6s ease ${i*0.08}s infinite alternate`}}/>
                ))}
              </div>
              <span style={{fontSize:11,color:accent,fontStyle:'italic'}}>{query||'Listening…'}</span>
            </div>
          </div>
        )}
        {isTyping&&(
          <div style={{display:'flex',gap:8,marginBottom:10,animation:'fadeIn 0.2s ease'}}>
            <div style={{width:28,height:28,borderRadius:'50%',background:`${accent}22`,border:`1px solid ${accent}55`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <WiCloudRefresh size={18} color={accent}/>
            </div>
            <div style={{padding:'11px 14px',background:'rgba(255,255,255,0.06)',borderRadius:'4px 16px 16px 16px',border:'1px solid rgba(255,255,255,0.08)'}}>
              <div style={{display:'flex',gap:4,alignItems:'center'}}>
                {[0,0.22,0.44].map((d,i)=><div key={i} style={{width:6,height:6,borderRadius:'50%',background:accent,animation:`blink 1.2s ease ${d}s infinite`}}/>)}
              </div>
            </div>
          </div>
        )}
        <div style={{height:4}}/>
      </div>
      {voiceError&&(
        <div style={{padding:'6px 14px',fontSize:11,color:'#fca5a5',background:'rgba(220,38,38,0.1)',borderTop:'1px solid rgba(220,38,38,0.2)',flexShrink:0}}>⚠ {voiceError}</div>
      )}
      <div style={{padding:'12px 14px',borderTop:'1px solid rgba(255,255,255,0.07)',flexShrink:0}}>
        <div style={{display:'flex',gap:8,background:'rgba(255,255,255,0.06)',borderRadius:13,padding:'4px 4px 4px 14px',border:`1px solid ${isListening?`${accent}60`:'rgba(255,255,255,0.1)'}`,transition:'border-color 0.2s',backdropFilter:'blur(10px)'}}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={handleKey} disabled={isTyping}
            style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#fff',fontSize:13,fontFamily:"'DM Sans',sans-serif",opacity:isTyping?0.5:1}}
            placeholder={isListening?'Listening — speak now…':isTyping?'Thinking…':'Ask anything about weather…'}/>
          {voiceSupported&&(
            <button onClick={toggleVoice} disabled={isTyping} title={isListening?'Stop':'Voice input'}
              style={{background:isListening?'rgba(239,68,68,0.25)':'rgba(255,255,255,0.08)',border:isListening?'1px solid rgba(239,68,68,0.5)':'1px solid rgba(255,255,255,0.12)',borderRadius:8,padding:'7px 10px',cursor:isTyping?'not-allowed':'pointer',fontSize:14,opacity:isTyping?0.4:1,transition:'background 0.2s,border 0.2s',display:'flex',alignItems:'center',justifyContent:'center'}}>
              {isListening?'⏹':'🎤'}
            </button>
          )}
          <button onClick={handleChat} disabled={isTyping||!query.trim()}
            style={{background:query.trim()?accent:'rgba(255,255,255,0.1)',border:'none',borderRadius:10,padding:'8px 16px',color:query.trim()?'#000':'rgba(255,255,255,0.3)',fontWeight:700,fontSize:13,cursor:(isTyping||!query.trim())?'not-allowed':'pointer',fontFamily:"'Syne',sans-serif",opacity:isTyping?0.45:1,transition:'all 0.2s',letterSpacing:'-0.01em'}}>
            ↑
          </button>
        </div>
        {voiceSupported&&!isListening&&<div style={{fontSize:10,color:'rgba(255,255,255,0.2)',marginTop:5,textAlign:'center'}}>🎤 tap mic to speak · Enter to send</div>}
        {!voiceSupported&&<div style={{fontSize:10,color:'rgba(255,255,255,0.15)',marginTop:5,textAlign:'center'}}>Voice input not supported in this browser</div>}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ═══════════════════════════════════════════════════════════════════════════ */
export default function WeatherDashboard() {
  const [stats, setStats]               = useState([]);
  const [selected, setSelected]         = useState(null);
  const [search, setSearch]             = useState('');
  const [activeTab, setActiveTab]       = useState('overview');
  const [unit, setUnit]                 = useState('C');
  const [transitioning, setTransitioning] = useState(false);
  const [extended, setExtended]         = useState({ hourly:[], weekly:[] });
  const [timeFormat, setTimeFormat]     = useState('12h');
  const [leftView, setLeftView]         = useState('all');
  const [expandedStates, setExpandedStates] = useState(new Set());

  const toF = c => Math.round(c*9/5+32);
  const displayTemp = c => unit==='C'?`${c}°C`:`${toF(c)}°F`;

  // Fetch extended forecast when city changes
  useEffect(()=>{
    if(!selected||!selected.lat||!selected.lon) return;
    let active=true;
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;
    fetch(url).then(r=>r.json()).then(data=>{
      if(!active) return;
      const nowMs=Date.now();
      const startIdx=data.hourly.time.findIndex(t=>new Date(t).getTime()>=nowMs)||0;
      const safeStart=Math.max(0,startIdx-1);
      const newHourly=[];
      for(let i=0;i<9;i++){
        const idx=safeStart+(i*2);
        if(idx>=data.hourly.time.length) break;
        const d=new Date(data.hourly.time[idx]);
        const hNum=d.getHours();
        const isHourDay=hNum>=6&&hNum<18;
        let h=hNum%12||12; const ampm=hNum>=12?'PM':'AM';
        const wmo=getWMO(data.hourly.weather_code[idx]);
        newHourly.push({
          hour:i===0?'Now':`${h}${ampm}`,
          temp:Math.round(data.hourly.temperature_2m[idx]),
          pop:data.hourly.precipitation_probability[idx]||0,
          icon:getWeatherIcon(wmo.n,isHourDay,24,'rgba(255,255,255,0.85)'),
        });
      }
      const daysArr=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const newWeekly=[];
      for(let i=0;i<7;i++){
        if(i>=data.daily.time.length) break;
        const d=new Date(data.daily.time[i]);
        const wmo=getWMO(data.daily.weather_code[i]);
        newWeekly.push({
          day:i===0?'Today':daysArr[d.getDay()],
          high:Math.round(data.daily.temperature_2m_max[i]),
          low:Math.round(data.daily.temperature_2m_min[i]),
          condition:wmo.n,
          icon: getWeatherIcon(wmo.n, true, 26),
        });
      }
      setExtended({hourly:newHourly,weekly:newWeekly});
    }).catch(err=>console.error("Forecast fetch error:",err));
    return ()=>{ active=false; };
  },[selected?.city,selected?.lat,selected?.lon]);

  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_API_URL||'http://localhost:8000'}/weather-stats`)
      .then(r=>r.json())
      .then(data=>{ const e=data.map(enrichCity); setStats(e); setSelected(e[0]||null); })
      .catch(()=>{ const d=generateDemoData(); setStats(d); setSelected(d[0]); });
  },[]);

  const selectCity=useCallback(city=>{
    if(city.city===selected?.city) return;
    setTransitioning(true);
    setTimeout(()=>{ setSelected(city); setActiveTab('overview'); setTransitioning(false); },200);
  },[selected]);

  const filteredStats=useMemo(()=>{
    if(!search.trim()) return stats;
    const q=search.toLowerCase();
    return stats.filter(s=>s.city.toLowerCase().includes(q)||(s.state||'').toLowerCase().includes(q)||s.condition.toLowerCase().includes(q));
  },[stats,search]);

  const stateGroups=useMemo(()=>{
    const map={};
    filteredStats.forEach(s=>{
      const st=s.state||'Other';
      if(!map[st]) map[st]=[];
      map[st].push(s);
    });
    return Object.entries(map).sort(([a],[b])=>a.localeCompare(b));
  },[filteredStats]);

  useEffect(()=>{
    if(search) setExpandedStates(new Set(stateGroups.map(([st])=>st)));
  },[search,stateGroups]);

  const toggleState=useCallback(st=>{
    setExpandedStates(prev=>{ const n=new Set(prev); n.has(st)?n.delete(st):n.add(st); return n; });
  },[]);

  const theme  = selected?getTheme(selected.condition,selected.sunrise,selected.sunset):getTheme('','06:00','18:30');
  const accent = theme.accent;
  const glow   = theme.glow;
  const isDay  = theme.isDay;

  const condStr=(selected?.condition||'').toLowerCase();
  const isRain   = selected?.is_raining===true || condStr.match(/rain|drizzle|shower|storm|thunder|precipitation/);
  const isCloudy = condStr.match(/cloud|fog|overcast|haze/);
  const isWindy  = condStr.match(/wind|breeze|gale|blustery|dust/)||(selected?.wind_speed>=17);

  const activeAlerts = stats.filter(s=>s.warning&&s.warning!=='None');

  const radarData = selected?[
    {m:'Humidity',  v:selected.humidity||0},
    {m:'Cloud',     v:selected.cloud_cover||0},
    {m:'UV Index',  v:(selected.uv_index||0)*10},
    {m:'Wind',      v:Math.min((selected.wind_speed||0)*2,100)},
    {m:'Visibility',v:Math.min((selected.visibility||10)*10,100)},
    {m:'Pressure',  v:Math.min(((selected.pressure||1013)-980)*2,100)},
  ]:[];

  return (
    <div style={{height:'100vh',display:'flex',flexDirection:'column',overflow:'hidden',
      background:`linear-gradient(145deg,${theme.g1} 0%,${theme.g2} 50%,${theme.g3} 100%)`,
      transition:'background 1.5s cubic-bezier(0.4,0,0.2,1)',
      fontFamily:"'DM Sans',sans-serif",color:'#fff',
      '--accent':accent,'--accent-glow':glow,position:'relative'}}>
      <style>{GLOBAL_CSS}</style>
      {isRain&&<RainEffect isDay={isDay}/>}
      {(isRain||isCloudy)&&<CloudLayer/>}
      {!isRain&&!isCloudy&&<WeatherParticles accent={accent}/>}
      {isWindy&&<WindEffect isDay={isDay}/>}

      {/* ALERT TICKER */}
      {activeAlerts.length>0&&(
        <div style={{background:'linear-gradient(90deg,#7f1d1d,#991b1b)',height:34,display:'flex',alignItems:'center',overflow:'hidden',flexShrink:0,zIndex:20}}>
          <div style={{background:'rgba(0,0,0,0.3)',height:'100%',padding:'0 14px',display:'flex',alignItems:'center',fontSize:10,fontWeight:700,letterSpacing:'0.12em',flexShrink:0,gap:6}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#fca5a5',animation:'blink 1.2s step-start infinite',display:'inline-block'}}/>ALERT
          </div>
          <div style={{flex:1,overflow:'hidden'}}>
            <div style={{display:'inline-block',whiteSpace:'nowrap',animation:'ticker 100s linear infinite',fontSize:11,color:'#fecaca',fontFamily:"'DM Sans',sans-serif"}}>
              &nbsp;&nbsp;&nbsp;{activeAlerts.map(a=>`⚠ ${a.city}: ${a.warning}`).join('   ·   ')}&nbsp;&nbsp;&nbsp;·&nbsp;&nbsp;&nbsp;{activeAlerts.map(a=>`⚠ ${a.city}: ${a.warning}`).join('   ·   ')}&nbsp;&nbsp;&nbsp;
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{padding:'12px 22px',display:'flex',alignItems:'center',gap:16,borderBottom:'1px solid rgba(255,255,255,0.07)',background:'rgba(0,0,0,0.25)',backdropFilter:'blur(20px)',flexShrink:0,zIndex:10}}>
        <div style={{display:'flex',alignItems:'center',gap:9,flexShrink:0}}>
          <div style={{width:34,height:34,borderRadius:10,background:`${accent}22`,border:`1px solid ${accent}44`,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          </div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif",fontWeight:700,fontSize:14,letterSpacing:'-0.02em',lineHeight:1}}>IMD AI Hub</div>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:1}}>India Meteorological Dept</div>
          </div>
        </div>
        <SearchBar value={search} onChange={setSearch} onClear={()=>setSearch('')} accent={accent} placeholder="Search city, state or condition…"/>
        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
          <LiveClock accent={accent} format={timeFormat}/>
          <button onClick={()=>setTimeFormat(f=>f==='12h'?'24h':'12h')} className="icon-btn"
            style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.8)',borderRadius:8,padding:'6px 13px',fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>{timeFormat}</button>
          <button onClick={()=>setUnit(u=>u==='C'?'F':'C')} className="icon-btn"
            style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.12)',color:'rgba(255,255,255,0.8)',borderRadius:8,padding:'6px 13px',fontSize:12,fontFamily:"'JetBrains Mono',monospace"}}>°{unit}</button>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.06)',borderRadius:8,padding:'5px 11px',fontSize:11,border:'1px solid rgba(255,255,255,0.1)'}}>
            {isDay
              ? <WiDaySunny size={18} color={accent}/>
              : getMoonPhaseIcon(18,accent)
            }
            <span style={{color:'rgba(255,255,255,0.6)'}}>{isDay?'Day':'Night'}</span>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:5,background:'rgba(255,255,255,0.06)',borderRadius:8,padding:'5px 11px',fontSize:11,border:'1px solid rgba(255,255,255,0.1)'}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#4ade80',animation:'blink 2.5s ease infinite'}}/>Live
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div style={{display:'grid',gridTemplateColumns:'230px 1fr 310px',flex:1,minHeight:0}}>

        {/* ── LEFT: CITY LIST ─────────────────────────────────────────── */}
        <div style={{borderRight:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',overflow:'hidden'}}>
          <div style={{padding:'10px 10px 6px',flexShrink:0,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{display:'flex',gap:4,background:'rgba(255,255,255,0.05)',borderRadius:9,padding:3}}>
              {['all','state'].map(mode=>(
                <button key={mode} onClick={()=>setLeftView(mode)}
                  style={{flex:1,padding:'5px 0',borderRadius:6,fontSize:10,fontWeight:500,border:'none',
                    fontFamily:"'DM Sans',sans-serif",cursor:'pointer',
                    background:leftView===mode?accent:'transparent',
                    color:leftView===mode?'#000':'rgba(255,255,255,0.5)',
                    textTransform:'capitalize',transition:'all 0.18s'}}>
                  {mode==='all'?'All Cities':'By State'}
                </button>
              ))}
            </div>
            <div style={{fontSize:9,color:'rgba(255,255,255,0.25)',marginTop:5,paddingLeft:2,fontFamily:"'JetBrains Mono',monospace"}}>
              {filteredStats.length} {filteredStats.length===1?'city':'cities'}
              {leftView==='state'&&` · ${stateGroups.length} states`}
            </div>
          </div>

          <div style={{flex:1,minHeight:0,overflowY:'auto',padding:'8px 10px'}}>
            {/* ALL CITIES */}
            {leftView==='all'&&(
              <>
                {filteredStats.length===0&&(
                  <div style={{textAlign:'center',padding:'28px 10px',color:'rgba(255,255,255,0.3)',fontSize:13}}>
                    No cities match "{search}"
                  </div>
                )}
                {filteredStats.map((city,i)=>{
                  const ct=getTheme(city.condition,city.sunrise,city.sunset);
                  const isActive=selected?.city===city.city;
                  return (
                    <div key={i} className="city-row" onClick={()=>selectCity(city)}
                      style={{padding:'11px 12px',borderRadius:12,marginBottom:3,
                        background:isActive?`${ct.accent}18`:'rgba(255,255,255,0.03)',
                        border:`1px solid ${isActive?`${ct.accent}40`:'rgba(255,255,255,0.04)'}`,
                        animation:`slideRight 0.25s ${Math.min(i,15)*0.04}s both`}}>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <div style={{fontWeight:600,fontSize:13,fontFamily:"'Syne',sans-serif"}}>{city.city}</div>
                        <div style={{display:'flex',alignItems:'center'}}>
                          {getWeatherIcon(city.condition,ct.isDay,22,isActive?ct.accent:'rgba(255,255,255,0.75)')}
                        </div>
                      </div>
                      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:5}}>
                        <div style={{fontSize:20,fontWeight:800,fontFamily:"'Syne',sans-serif",color:isActive?ct.accent:'#fff'}}>
                          {unit==='C'?city.temperature:toF(city.temperature)}°
                        </div>
                        {city.warning&&city.warning!=='None'
                          ?<div style={{fontSize:9,background:'#dc2626',color:'#fff',borderRadius:4,padding:'2px 6px',letterSpacing:'0.05em'}}>⚠ ALERT</div>
                          :<div style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>{city.humidity}% hum</div>}
                      </div>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginTop:2}}>{city.condition}</div>
                    </div>
                  );
                })}
              </>
            )}

            {/* BY STATE */}
            {leftView==='state'&&(
              <>
                {stateGroups.length===0&&(
                  <div style={{textAlign:'center',padding:'28px 10px',color:'rgba(255,255,255,0.3)',fontSize:13}}>
                    No cities match "{search}"
                  </div>
                )}
                {stateGroups.map(([state,cities],si)=>{
                  const isOpen=expandedStates.has(state);
                  const hasAlert=cities.some(c=>c.warning&&c.warning!=='None');
                  const avgTemp=Math.round(cities.reduce((s,c)=>s+c.temperature,0)/cities.length);
                  const hasActiveCity=cities.some(c=>c.city===selected?.city);
                  return (
                    <div key={state} style={{marginBottom:5}}>
                      <div className="state-header" onClick={()=>toggleState(state)}
                        style={{display:'flex',alignItems:'center',gap:8,padding:'8px 10px',borderRadius:9,cursor:'pointer',
                          background:isOpen?hasActiveCity?`${accent}15`:'rgba(255,255,255,0.07)':'rgba(255,255,255,0.04)',
                          border:`1px solid ${hasActiveCity?`${accent}30`:'rgba(255,255,255,0.07)'}`,
                          marginBottom:isOpen?4:0}}>
                        <div style={{flex:1}}>
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <span style={{fontWeight:600,fontSize:12,fontFamily:"'Syne',sans-serif",color:hasActiveCity?accent:'rgba(255,255,255,0.85)'}}>
                              {state}
                            </span>
                            {hasAlert&&<span style={{fontSize:8,background:'#dc2626',color:'#fff',borderRadius:3,padding:'1px 4px'}}>⚠</span>}
                          </div>
                          <div style={{fontSize:9,color:'rgba(255,255,255,0.3)',marginTop:1,fontFamily:"'JetBrains Mono',monospace"}}>
                            {cities.length} {cities.length===1?'city':'cities'} · avg {unit==='C'?avgTemp:toF(avgTemp)}°
                          </div>
                        </div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.35)',transform:isOpen?'rotate(90deg)':'rotate(0deg)',transition:'transform 0.18s'}}>›</div>
                      </div>
                      {isOpen&&cities.map((city,i)=>{
                        const ct=getTheme(city.condition,city.sunrise,city.sunset);
                        const isActive=selected?.city===city.city;
                        return (
                          <div key={i} className="city-row" onClick={()=>selectCity(city)}
                            style={{padding:'9px 12px 9px 18px',borderRadius:10,marginBottom:2,
                              background:isActive?`${ct.accent}18`:'rgba(255,255,255,0.025)',
                              border:`1px solid ${isActive?`${ct.accent}40`:'rgba(255,255,255,0.04)'}`,
                              borderLeft:`3px solid ${isActive?ct.accent:'rgba(255,255,255,0.08)'}`}}>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                              <div style={{fontWeight:600,fontSize:12,fontFamily:"'Syne',sans-serif"}}>{city.city}</div>
                              <div style={{display:'flex',alignItems:'center'}}>
                                {getWeatherIcon(city.condition,ct.isDay,18,isActive?ct.accent:'rgba(255,255,255,0.7)')}
                              </div>
                            </div>
                            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:3}}>
                              <div style={{fontSize:17,fontWeight:800,fontFamily:"'Syne',sans-serif",color:isActive?ct.accent:'#fff'}}>
                                {unit==='C'?city.temperature:toF(city.temperature)}°
                              </div>
                              {city.warning&&city.warning!=='None'
                                ?<div style={{fontSize:8,background:'#dc2626',color:'#fff',borderRadius:3,padding:'2px 5px'}}>⚠</div>
                                :<div style={{fontSize:10,color:'rgba(255,255,255,0.3)'}}>{city.humidity}%</div>}
                            </div>
                            <div style={{fontSize:9,color:'rgba(255,255,255,0.35)',marginTop:1}}>{city.condition}</div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>

        {/* ── CENTER: MAIN PANEL ──────────────────────────────────────── */}
        <div style={{overflowY:'auto',padding:'22px 26px',opacity:transitioning?0:1,transition:'opacity 0.2s ease',scrollBehavior:'smooth'}}>
          {selected&&(
            <div style={{animation:'fadeUp 0.35s ease'}}>
              {/* Hero */}
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28,gap:16}}>
                <div>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',display:'flex',alignItems:'center',gap:5}}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                      {selected.city}{selected.state&&`, ${selected.state}`}
                    </div>
                    <span style={{width:3,height:3,borderRadius:'50%',background:'rgba(255,255,255,0.2)'}}/>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.35)'}}>Updated just now</div>
                    <div style={{display:'flex',alignItems:'center',marginLeft:4}}>
                      {isDay ? <WiDaySunny size={18} color={accent}/> : getMoonPhaseIcon(18,accent)}
                    </div>
                  </div>
                  <div style={{display:'flex',alignItems:'flex-end',gap:8}}>
                    <div style={{fontFamily:"'Syne',sans-serif",fontSize:88,fontWeight:800,lineHeight:0.9,letterSpacing:'-0.04em',color:'#fff',textShadow:`0 0 60px ${glow}`}}>
                      {unit==='C'?selected.temperature:toF(selected.temperature)}
                    </div>
                    <div style={{paddingBottom:14}}><div style={{fontFamily:"'Syne',sans-serif",fontSize:32,color:'rgba(255,255,255,0.5)',fontWeight:400}}>°{unit}</div></div>
                    <div style={{paddingBottom:8,display:'flex',alignItems:'center'}}>
                      {getWeatherIcon(selected.condition,isDay,60,'rgba(255,255,255,0.88)')}
                    </div>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:20,color:'rgba(255,255,255,0.65)',marginTop:4,fontWeight:500}}>{selected.condition}</div>
                  <div style={{display:'flex',gap:16,marginTop:8,fontSize:13,color:'rgba(255,255,255,0.4)'}}>
                    <span>Feels like <b style={{color:'rgba(255,255,255,0.75)'}}>{displayTemp(selected.feels_like||selected.temperature-2)}</b></span>
                    <span>H: <b style={{color:accent}}>{displayTemp(selected.high||selected.temperature+3)}</b></span>
                    <span>L: <b style={{color:'#38bdf8'}}>{displayTemp(selected.low||selected.temperature-5)}</b></span>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',gap:10,flexShrink:0}}>
                  {selected.warning&&selected.warning!=='None'&&(
                    <div style={{background:'rgba(220,38,38,0.12)',border:'1px solid rgba(220,38,38,0.35)',borderRadius:14,padding:'12px 16px',maxWidth:190,backdropFilter:'blur(10px)'}}>
                      <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:6}}>
                        {(w=>{
                          const c=selected.warning.toLowerCase();
                          if(c.match(/heat|hot|temperature/))   return <WiHot size={20} color="#f87171"/>;
                          if(c.match(/cold|frost|freeze/))      return <WiSnow size={20} color="#93c5fd"/>;
                          if(c.match(/rain|flood|shower/))      return <WiRain size={20} color="#38bdf8"/>;
                          if(c.match(/thunder|lightning/))      return <WiThunderstorm size={20} color="#c084fc"/>;
                          if(c.match(/wind|gale|cyclone/))      return <WiStrongWind size={20} color="#67e8f9"/>;
                          if(c.match(/fog|mist|visibility/))    return <WiFog size={20} color="#94a3b8"/>;
                          if(c.match(/snow|hail|sleet/))        return <WiHail size={20} color="#bae6fd"/>;
                          if(c.match(/aqi|air|pollution|smog|smoke/))  return <WiDust size={20} color="#d97706"/>;
                          if(c.match(/storm|hurricane|typhoon/))return <WiStormShowers size={20} color="#c084fc"/>;
                          return <WiThunderstorm size={20} color="#fca5a5"/>;
                        })(selected.warning)}
                        <span style={{fontWeight:700,fontSize:11,color:'#fca5a5',letterSpacing:'0.06em',textTransform:'uppercase'}}>Active Alert</span>
                      </div>
                      <div style={{fontSize:11,color:'rgba(255,255,255,0.55)',lineHeight:1.5}}>{selected.warning}</div>
                    </div>
                  )}
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:'12px 16px',backdropFilter:'blur(10px)'}}>
                    <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',marginBottom:8,textTransform:'uppercase',letterSpacing:'0.08em',display:'flex',alignItems:'center',gap:6}}>
                      <WiSunrise size={16} color={accent}/> Sunrise / <WiSunset size={16} color={accent}/> Sunset
                    </div>
                    <SunArc sunrise={selected.sunrise||'06:15'} sunset={selected.sunset||'18:40'} accent={accent}/>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div style={{display:'flex',gap:3,marginBottom:20,background:'rgba(255,255,255,0.05)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.07)'}}>
                {['overview','hourly','weekly','analysis'].map(tab=>(
                  <button key={tab} className="tab" onClick={()=>setActiveTab(tab)}
                    style={{flex:1,padding:'8px 0',borderRadius:9,fontSize:12,fontWeight:activeTab===tab?600:400,
                      background:activeTab===tab?accent:'transparent',
                      color:activeTab===tab?'#000':'rgba(255,255,255,0.5)',
                      textTransform:'capitalize',transition:'all 0.2s',letterSpacing:'0.01em'}}>
                    {tab}
                  </button>
                ))}
              </div>

              {/* OVERVIEW */}
              {activeTab==='overview'&&(
                <div style={{animation:'fadeIn 0.3s ease'}}>
                  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,marginBottom:20}}>
                    <StatCard
                      icon={<WiHumidity size={26} color="#38bdf8"/>}
                      label="Humidity" value={`${selected.humidity||65}%`}
                      sub={selected.humidity>80?'Feels muggy':'Comfortable'}
                      progress={selected.humidity} accentColor="#38bdf8"/>
                    <StatCard
                      icon={<WiStrongWind size={26} color={accent}/>}
                      label="Wind" value={`${selected.wind_speed||12} km/h`}
                      sub={`${selected.wind_dir||'SW'} · Gusts ${selected.wind_gust||Math.round((selected.wind_speed||12)*1.4)} km/h`}
                      accentColor={accent}/>
                    <StatCard
                      icon={<WiFog size={26} color={accent}/>}
                      label="Visibility" value={`${selected.visibility||10} km`}
                      sub={selected.visibility<3?'Poor':selected.visibility<7?'Moderate':'Clear'}
                      progress={(selected.visibility||10)*10} accentColor={accent}/>
                    <StatCard
                      icon={<WiBarometer size={26} color="#a855f7"/>}
                      label="Pressure" value={`${selected.pressure||1013}`}
                      sub={`hPa · ${selected.pressure>1020?'High pressure':'Normal range'}`}
                      progress={Math.min(100,((selected.pressure||1013)-980)*3)} accentColor="#a855f7"/>
                    <StatCard
                      icon={<WiDaySunny size={26} color={uvInfo(selected.uv_index||5).c}/>}
                      label="UV Index" value={`${selected.uv_index||5}`}
                      sub={uvInfo(selected.uv_index||5).l} subColor={uvInfo(selected.uv_index||5).c}
                      progress={(selected.uv_index||5)*8.33} accentColor={uvInfo(selected.uv_index||5).c}/>
                    <StatCard
                      icon={<WiDust size={26} color={aqiInfo(selected.aqi).c}/>}
                      label="Air Quality" value={selected.aqi||'—'}
                      sub={aqiInfo(selected.aqi).l} subColor={aqiInfo(selected.aqi).c}
                      progress={Math.min(100,((selected.aqi||0)/300)*100)} accentColor={aqiInfo(selected.aqi).c}/>
                  </div>

                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:16}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:16,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>Temperature &amp; Humidity — All Cities</div>
                    <div style={{height:220}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={stats} margin={{top:4,right:8,left:-10,bottom:0}}>
                          <defs>
                            <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={accent} stopOpacity={0.35}/>
                              <stop offset="95%" stopColor={accent} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                          <XAxis dataKey="city" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}} axisLine={false} tickLine={false}/>
                          <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          <Bar dataKey="temperature" name="Temp °C" fill={accent} radius={[5,5,0,0]} opacity={0.8} maxBarSize={36}/>
                          <Line dataKey="humidity" name="Humidity %" stroke="#38bdf8" strokeWidth={2} dot={{r:3,fill:'#38bdf8'}} activeDot={{r:5}}/>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <HotColdChart stats={stats} accent={accent}/>

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                    <div style={{background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(255,255,255,0.07)'}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10}}>{isDay?'Daytime':'Moon Phase'}</div>
                      <div style={{marginBottom:4,display:'flex',alignItems:'center'}}>
                        {isDay
                          ? getWeatherIcon(selected.condition,true,40,accent)
                          : getMoonPhaseIcon(40,accent)
                        }
                      </div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,0.5)'}}>{isDay?`${selected.condition} day`:"Tonight's sky"}</div>
                    </div>
                    <div style={{background:'rgba(255,255,255,0.04)',borderRadius:14,padding:'14px 16px',border:'1px solid rgba(255,255,255,0.07)'}}>
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.35)',textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:10,display:'flex',alignItems:'center',gap:6}}>
                        <WiCloudRefresh size={16} color="rgba(255,255,255,0.35)"/> Cloud Cover
                      </div>
                      <div style={{fontSize:28,fontWeight:800,fontFamily:"'Syne',sans-serif",color:'#fff',letterSpacing:'-0.02em'}}>{selected.cloud_cover||35}%</div>
                      <div style={{marginTop:8,height:4,background:'rgba(255,255,255,0.07)',borderRadius:4}}>
                        <div style={{height:'100%',width:`${selected.cloud_cover||35}%`,borderRadius:4,background:'rgba(148,163,184,0.6)',transition:'width 0.5s ease'}}/>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HOURLY */}
              {activeTab==='hourly'&&(
                <div style={{animation:'fadeIn 0.3s ease'}}>
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)',marginBottom:16}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>24-Hour Forecast · {selected.city}</div>
                    <HourlyForecast data={extended.hourly} accent={accent}/>
                    <div style={{marginTop:20,height:160}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={extended.hourly} margin={{top:4,right:8,left:-10,bottom:0}}>
                          <defs>
                            <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor={accent} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={accent} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                          <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false}/>
                          <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          <Area type="monotone" dataKey="temp" name="Temp °C" stroke={accent} fill="url(#hg)" strokeWidth={2.5} dot={false} activeDot={{r:4,fill:accent}}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>Precipitation Probability</div>
                    <div style={{height:120}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={extended.hourly} margin={{top:4,right:8,left:-10,bottom:0}}>
                          <defs>
                            <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%"  stopColor="#38bdf8" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                          <XAxis dataKey="hour" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'JetBrains Mono',monospace"}} axisLine={false} tickLine={false}/>
                          <YAxis domain={[0,100]} stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                          <Tooltip content={<ChartTooltip/>}/>
                          <Area type="monotone" dataKey="pop" name="Rain %" stroke="#38bdf8" fill="url(#pg)" strokeWidth={2} dot={false}/>
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* WEEKLY */}
              {activeTab==='weekly'&&(
                <div style={{animation:'fadeIn 0.3s ease'}}>
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:14,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>7-Day Forecast · {selected.city}</div>
                    <WeekForecast data={extended.weekly} accent={accent}/>
                  </div>
                </div>
              )}

              {/* ANALYSIS */}
              {activeTab==='analysis'&&(
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,animation:'fadeIn 0.3s ease'}}>
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>Radar</div>
                    <ResponsiveContainer width="100%" height={200}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="rgba(255,255,255,0.08)"/>
                        <PolarAngleAxis dataKey="m" tick={{fill:'rgba(255,255,255,0.4)',fontSize:10,fontFamily:"'DM Sans',sans-serif"}}/>
                        <Radar dataKey="v" stroke={accent} fill={accent} fillOpacity={0.2} strokeWidth={1.5}/>
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:10,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace",display:'flex',alignItems:'center',gap:6}}>
                      <WiWindDeg size={16} color={accent}/> Wind · {selected.city}
                    </div>
                    <WindRose deg={selected.wind_deg||225} speed={selected.wind_speed||12} gust={selected.wind_gust||18} accent={accent}/>
                  </div>
                  <div style={{gridColumn:'1/-1',background:'rgba(255,255,255,0.04)',borderRadius:16,padding:'18px 20px',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',marginBottom:12,textTransform:'uppercase',letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace"}}>All-City Comparison</div>
                    <ResponsiveContainer width="100%" height={170}>
                      <ComposedChart data={stats} margin={{top:4,right:8,left:-10,bottom:0}}>
                        <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false}/>
                        <XAxis dataKey="city" stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)',fontFamily:"'DM Sans',sans-serif"}} axisLine={false} tickLine={false}/>
                        <YAxis stroke="rgba(255,255,255,0.2)" tick={{fontSize:10,fill:'rgba(255,255,255,0.4)'}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<ChartTooltip/>}/>
                        <Legend wrapperStyle={{fontSize:11,color:'rgba(255,255,255,0.5)',paddingTop:8}}/>
                        <Bar dataKey="humidity" name="Humidity %" fill="#38bdf8" radius={[4,4,0,0]} opacity={0.65} maxBarSize={30}/>
                        <Line dataKey="temperature" name="Temp °C" stroke={accent} strokeWidth={2.5} dot={{r:3,fill:accent}} activeDot={{r:5}}/>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT: AI CHAT ──────────────────────────────────────────── */}
        <div style={{borderLeft:'1px solid rgba(255,255,255,0.07)',display:'flex',flexDirection:'column',overflow:'hidden',minHeight:0,background:'rgba(0,0,0,0.15)'}}>
          <ChatPanel accent={accent} selected={selected}/>
        </div>
      </div>
    </div>
  );
}

/* ─── Data Helpers ────────────────────────────────────────────────────────── */
function enrichCity(d) {
  const t=Number(d.temperature);
  return {
    ...d,
    temperature:t, feels_like:Number(d.feels_like)||t-2, high:Number(d.high)||t+4, low:Number(d.low)||t-6,
    humidity:Number(d.humidity), wind_speed:Number(d.wind_speed), wind_deg:Number(d.wind_deg),
    wind_gust:Number(d.wind_gust)||Math.round(Number(d.wind_speed)*1.4),
    pressure:Number(d.pressure), visibility:Number(d.visibility), uv_index:Number(d.uv_index),
    aqi:Number(d.aqi), cloud_cover:Number(d.cloud_cover),
    sunrise:d.sunrise||'06:15', sunset:d.sunset||'18:45',
    state:d.state||'',
  };
}

function generateDemoData() {
  return [
    {city:'New Delhi', state:'Delhi',       temperature:42,feels_like:46,high:47,low:36,condition:'Sunny',         humidity:15,warning:'Heatwave Alert',wind_speed:18,wind_dir:'SW',wind_deg:225,wind_gust:26,pressure:1002,visibility:6, uv_index:11,aqi:187,cloud_cover:10, sunrise:'05:30',sunset:'19:15',lat:28.61,lon:77.23},
    {city:'Mumbai',    state:'Maharashtra', temperature:32,feels_like:36,high:34,low:27,condition:'Cloudy',        humidity:85,warning:'None',           wind_speed:22,wind_dir:'W', wind_deg:270,wind_gust:32,pressure:1008,visibility:5, uv_index:4, aqi:94, cloud_cover:75, sunrise:'06:00',sunset:'19:00',lat:19.07,lon:72.88},
    {city:'Bengaluru', state:'Karnataka',   temperature:28,feels_like:27,high:31,low:22,condition:'Light Rain',    humidity:60,warning:'Yellow Alert',   wind_speed:14,wind_dir:'NE',wind_deg:45, wind_gust:20,pressure:1012,visibility:4, uv_index:3, aqi:58, cloud_cover:90, sunrise:'06:10',sunset:'18:45',lat:12.97,lon:77.59},
    {city:'Chennai',   state:'Tamil Nadu',  temperature:35,feels_like:38,high:37,low:29,condition:'Humid',         humidity:75,warning:'None',           wind_speed:16,wind_dir:'SE',wind_deg:135,wind_gust:22,pressure:1006,visibility:7, uv_index:7, aqi:112,cloud_cover:60, sunrise:'05:50',sunset:'18:50',lat:13.08,lon:80.27},
    {city:'Kolkata',   state:'West Bengal', temperature:30,feels_like:33,high:33,low:25,condition:'Rain Showers',  humidity:80,warning:'None',           wind_speed:20,wind_dir:'S', wind_deg:180,wind_gust:28,pressure:1009,visibility:4, uv_index:5, aqi:143,cloud_cover:85, sunrise:'05:00',sunset:'18:15',lat:22.57,lon:88.36},
    {city:'Hyderabad', state:'Telangana',   temperature:33,feels_like:35,high:36,low:27,condition:'Mostly Clear',  humidity:70,warning:'None',           wind_speed:12,wind_dir:'NW',wind_deg:315,wind_gust:17,pressure:1010,visibility:9, uv_index:8, aqi:76, cloud_cover:25, sunrise:'06:05',sunset:'18:55',lat:17.39,lon:78.49},
    {city:'Pune',      state:'Maharashtra', temperature:30,feels_like:29,high:33,low:23,condition:'Clear',         humidity:55,warning:'None',           wind_speed:15,wind_dir:'W', wind_deg:265,wind_gust:21,pressure:1013,visibility:10,uv_index:6, aqi:62, cloud_cover:20, sunrise:'06:08',sunset:'18:52',lat:18.52,lon:73.86},
    {city:'Jaipur',    state:'Rajasthan',   temperature:40,feels_like:43,high:44,low:32,condition:'Sunny',         humidity:20,warning:'None',           wind_speed:20,wind_dir:'SW',wind_deg:220,wind_gust:28,pressure:1004,visibility:7, uv_index:10,aqi:95, cloud_cover:5,  sunrise:'05:40',sunset:'19:05',lat:26.91,lon:75.79},
  ].map(enrichCity);
}