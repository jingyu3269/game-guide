#!/usr/bin/env node
/**
 * 生成各游戏「分站」静态页：game-guide/g/<slug>/index.html
 * 文章数据直接从 index.html 的 var ARTICLES = [...] 抽取（eval 字面量），
 * 与主站 ?a= 固定链接同一套 djb2 → base36 id，保证链接互通。
 * 用法: node tools/build_subsites.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

/* ---- 抽取 ARTICLES ---- */
const sVar = html.indexOf('var ARTICLES =');
const sArr = html.indexOf('[', sVar);
const eArr = html.indexOf('\n];', sArr);
if (sVar < 0 || eArr < 0) { console.error('找不到 ARTICLES 数组'); process.exit(1); }
const ARTICLES = eval(html.slice(sArr, eArr + 3));
console.log('共解析文章', ARTICLES.length, '篇');

/* ---- 与主站一致的短 id ---- */
function hashKey(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
/* 站内固定链接 ?a=<id> 用的是不带前缀的短码（stats.html 的计数器 key 才是 'a-' + id） */
const articleId = a => hashKey(a.game + '|' + a.title);

/* ---- 露娜2 官网式头图（参考 luna2.8zy.com 预约页） ---- */
const LUNA_SITE = {
  eyebrow: 'LUNA2 ONLINE · 十六年之约',
  title: '拾光之约',
  badge: '12.10 公测',
  desc: '从阿克勒平原的风车下出发，人类与精灵两族、战士 / 魔法师 / 刺客三职业起步。副本、野外 BOSS、摆摊交易，再加上农场种菜、河边钓鱼、小屋装扮。不改版、原汁原味，当年一起熬夜的那批人，该回来了。',
  tags: ['PC 端游', '原汁原味', 'Q 萌画风', '自由转职', '生活玩法', '约会配对'],
  cdLabel: '12.10',
  cdTarget: '2026-12-10T00:00:00+08:00',
  art: '../../assets/luna-hero.webp',
  feat: [
    ['../../assets/luna-f1.webp', '露娜2 社交满格：家族温暖 亲密配对'],
    ['../../assets/luna-f2.webp', '露娜2 自由转职：技能自由 转职丰富'],
  ],
  cta: '预约公测 · 领预约礼包',
  wx: 'LYLOVEZLL1314999',
};

/* ---- 英雄连城：官网式头图 + 六大职业 + 登录实拍 ---- */
const HEROES_SITE = {
  theme: {
    g1: '#131A2C', g2: '#2A3B5E', g3: '#7B8FB0',
    l1: '#FFC24D', l2: '#EE7D24',
    b1: '#F5BE4A', b2: '#D07E16', bs: 'rgba(200,130,20,.85)',
  },
  eyebrow: 'HEROES FORTRESS · 奇迹 MU 情怀',
  title: '英雄连城',
  badge: '11.20 正式服',
  desc: '从勇者大陆出发，六个职业、卓越套装、行会攻城。装备靠打、全部位强化继承，换装不清零；11 月 20 日正式服开放，进度握在自己手里。',
  tags: ['经典回归', '奇迹情怀', '装备靠打', '自由交易', '强化继承', '行会攻城'],
  cdLabel: '11.20',
  cdSuffix: '正式开服',
  cdTarget: '2026-11-20T00:00:00+08:00',
  cdDone: '正式服已开启，进游戏见 🗡️',
  art: '../../assets/heroes-ship.webp',
  cta: '领取下载与攻略',
  wx: 'LYLOVEZLL1314999',
  modalDesc: '加客服微信，发送「英雄连城」即可领取下载链接、开服礼包与开局攻略，11.20 开服当天还会收到上线提醒。',
  jobs: {
    title: '六大职业 · 创建界面实拍',
    sub: '数值为创建角色时的初始属性，进阶职业需角色卡片解锁',
    items: [
      { img: 'heroes-job-1.webp', name: '剑士', desc: '战士的王国 · 近战物理，剑 / 斧 / 杖', stat: '力 28 · 敏 20 · 智 10 · 体 25' },
      { img: 'heroes-job-2.webp', name: '魔法师', desc: '阿尔卡的后台 · 自由施放攻击魔法', stat: '力 18 · 敏 18 · 智 30 · 体 15' },
      { img: 'heroes-job-3.webp', name: '弓箭手', desc: '精灵的王国 · 弓弩 + 辅助 / 召唤魔法', stat: '力 22 · 敏 25 · 智 15 · 体 20' },
      { img: 'heroes-job-4.webp', name: '魔剑士', desc: '复合型角色 · 近战攻击 + 自由施法', stat: '力 26 · 敏 26 · 智 26 · 体 26' },
      { img: 'heroes-job-5.webp', name: '圣导师', desc: '君主型角色 · 统率团队，天鹰与黑王马为宠', stat: '力 26 · 敏 20 · 智 15 · 体 20' },
      { img: 'heroes-job-6.webp', name: '召唤师', desc: '诅咒魔法 + 召唤异界召唤兽', stat: '力 21 · 敏 21 · 智 23 · 体 18' },
    ],
  },
  shot: { img: 'heroes-login.webp', cap: '登录界面实拍 · 英雄 1 区（测试服）' },
};

/* ---- 游戏配置 ---- */
const GAMES = [
  {
    slug: 'taoyuan', name: '桃园·将帅录', gameFilter: '桃园将帅录', acc: '#E0457B', accSoft: '#FDECEA',
    cover: '../../assets/cover-taoyuan-wide.webp',
    chips: [['热门', true], ['Q版3D', false], ['回合制', false]],
    tagline: 'Q版三国 · ATB回合策略',
    desc: '幻想三国ATB半即时回合制：云职业转职、将星收集、三端互通。胜负更多取决于阵容结构与站位，而不是单纯数值堆砌；赛季沙盘大地图上，联盟攻城占都城定天下。',
    facts: [['游戏类型', 'Q版三国 · 回合策略'], ['平台', '安卓 / iOS / PC 三端互通'], ['核心特色', '云职业转职 · 将星收集'], ['重点玩法', '赛季沙盘 · 联盟攻城']],
  },
  {
    slug: 'xxtl', name: '小小屠龙·冰雪复古', acc: '#C98A16', accSoft: '#FFF4DC',
    cover: '../../assets/cover-legend.webp',
    chips: [['打金', true], ['复古传奇', false], ['高爆率', false]],
    tagline: '冰雪复古 · 打金攻沙',
    desc: '经典冰雪复古传奇：从起源冰城起步，攒够转生材料进二大陆冰雪之城。装备不过商城、毕业装全靠野外掉落，散人自由交易，打金变现无门槛。',
    facts: [['游戏类型', '冰雪复古 · 单职业'], ['平台', '安卓 / iOS 双端'], ['核心特色', '装备全靠打 · 自由交易'], ['重点玩法', '转生进阶 · 打金攻沙']],
  },
  {
    slug: 'jingling', name: '精灵永恒', acc: '#7B5BD6', accSoft: '#F0EAFE',
    cover: '../../assets/cover-jingling2.webp',
    chips: [['热门', true], ['3D精灵', false], ['MMO打宝', false]],
    tagline: '怀旧精灵 · 3D MMO',
    desc: '怀旧精灵3D MMO：精灵切换配队、技能把控定胜负，摆摊打金、圣物养成，三端互通。第二赛季圣物系统解锁后战力大幅提升，开荒期基础材料最值钱。',
    facts: [['游戏类型', '3D精灵 · MMO'], ['平台', '安卓 / iOS / PC 三端互通'], ['核心特色', '精灵切换 · 圣物养成'], ['重点玩法', '摆摊打金 · 赛季玩法']],
  },
  {
    slug: 'luna2', name: '露娜2：拾光之约', acc: '#3A7DA1', accSoft: '#E7F2F8',
    cover: '../../assets/luna-card.webp',
    chips: [['12.10 公测', true], ['PC端游', false], ['萌系MMO', false]],
    tagline: '经典露娜IP · 奇幻冒险',
    desc: '首款萌世代官方正版，经典露娜IP回归：自由转职、社交满格，情侣配对与家族玩法原汁原味。12 月 10 日公测——开服前把魔附、摆摊、挂机与转职加点先看明白，上线直接照着做。',
    facts: [['平台', 'PC 端游'], ['公测', '2026.12.10（以官方公告为准）'], ['核心特色', '自由转职 · 社交满格'], ['IP 背景', '经典露娜正统续作']],
    heroSite: LUNA_SITE,
  },
  {
    slug: 'liancheng', name: '英雄连城', acc: '#12A87A', accSoft: '#E6F7F2',
    cover: '../../assets/cover-liancheng-wide.webp',
    chips: [['经典回归', true], ['奇迹情怀', false], ['打宝PK', false]],
    tagline: '奇迹MU情怀 · 怀旧打宝',
    desc: '情怀向经典回归，只为奇迹老玩家而生：装备靠打、自由交易、行会攻城。全部位强化继承，换装不清零；卓越与套装可攒碎片合成，进度回到自己手里。',
    facts: [['平台', '安卓 / iOS 双端互通'], ['开服', '2026.11.20 正式服'], ['核心特色', '装备靠打 · 强化继承'], ['重点玩法', '行会攻城 · 卓越套装']],
    heroSite: HEROES_SITE,
  },
  {
    slug: 'cq3d', name: '传奇盛世移动版-3D点卡', gameFilter: '传奇3D点卡版', acc: '#D25A1E', accSoft: '#FDEEE2',
    cover: '../../assets/cssj-slide.jpg',
    chips: [['点卡计时', true], ['3D 传奇', false], ['移动互通', false]],
    tagline: '点卡计时 · 3D 传奇 · 移动互通',
    desc: '传奇盛世 3D 点卡版：真 3D 画面，点卡只买时长不卖强度，装备全靠打、野外爆装自由交易，移动端畅玩，点一下封面图即可直接下载。',
    facts: [['游戏类型', '3D 传奇 · 点卡版'], ['计费', '点卡计时 · 时长购买'], ['平台', '移动端'], ['下载', '点击本站封面图直达']],
    shot: { img: 'cssj-slide.jpg', cap: '传奇盛世3D点卡版 · 主视觉' },
  },
];

/* ---- 文章分组 ---- */
const readMinutes = a => {
  const chars = a.full.reduce((n, x) => n + (x.p || '').length, 0);
  return Math.max(1, Math.round(chars / 380));
};
for (const g of GAMES) {
  g.arts = ARTICLES.filter(a => a.game === (g.gameFilter || g.name))
    .sort((a, b) => (a.date === b.date ? 0 : a.date < b.date ? 1 : -1));
  if (!g.arts.length) console.warn('警告：', g.name, '没有文章');
}

/* ---- 页面模板 ---- */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ---- 露娜2 定制头图：样式 ---- */
const LUNA_CSS = `
/* ===== 官网式头图 ===== */
.lhero{
  position:relative;overflow:hidden;border-radius:24px;color:#fff;
  background:linear-gradient(135deg,var(--hg1,#5E9BBC) 0%,var(--hg2,#8CC0D6) 42%,var(--hg3,#CBE8F0) 100%);
  border:3px solid #fff;box-shadow:0 16px 34px -14px rgba(40,92,120,.55);
}
.lhero::before{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:
    radial-gradient(circle at 82% 6%,rgba(255,255,255,.42),transparent 44%),
    radial-gradient(circle at 12% 94%,rgba(255,255,255,.22),transparent 42%);
}
.lhero-in{position:relative;display:flex;align-items:stretch}
.lhero-txt{position:relative;z-index:2;flex:1 1 58%;min-width:0;padding:24px 10px 26px 24px}
.eyebrow{font-size:11px;font-weight:800;letter-spacing:2.2px;color:rgba(255,255,255,.86);margin-bottom:10px}
.lhero h1{
  display:flex;align-items:center;gap:10px;flex-wrap:wrap;
  font-size:31px;font-weight:900;letter-spacing:1.5px;line-height:1.2;
  text-shadow:0 3px 10px rgba(18,60,84,.38);
}
.ld-badge{
  display:inline-flex;align-items:center;height:24px;padding:0 10px;border-radius:7px;
  background:linear-gradient(160deg,var(--hl1,#FFB84D),var(--hl2,#FF7F26));
  font-size:12px;font-weight:900;letter-spacing:.5px;text-shadow:none;
  box-shadow:0 4px 12px -3px rgba(208,96,10,.65);
}
.ldesc{margin-top:12px;max-width:430px;font-size:12.8px;line-height:1.85;color:rgba(255,255,255,.94)}
.ltags{display:flex;flex-wrap:wrap;gap:5px;margin-top:13px;list-style:none}
.ltags li{
  display:inline-flex;align-items:center;height:23px;padding:0 8px;border-radius:999px;
  font-size:10.5px;font-weight:700;color:#fff;letter-spacing:0;
  background:rgba(255,255,255,.18);border:1px solid rgba(255,255,255,.42);
  backdrop-filter:blur(2px);
}
.cd{margin-top:16px}
.cd-label{font-size:12.5px;font-weight:700;color:rgba(255,255,255,.9);letter-spacing:.3px}
.cd-label b{font-weight:900;color:#fff}
.cd-nums{display:flex;gap:8px;margin-top:8px}
.cd-u{
  width:50px;height:54px;border-radius:10px;
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:rgba(255,255,255,.16);border:1.5px solid rgba(255,255,255,.4);
  backdrop-filter:blur(3px);
  box-shadow:0 5px 14px -8px rgba(20,60,84,.6),inset 0 1px 0 rgba(255,255,255,.35);
}
.cd-u em{
  font-style:normal;font-size:20px;font-weight:900;line-height:1;
  letter-spacing:.5px;font-variant-numeric:tabular-nums;
  text-shadow:0 2px 6px rgba(20,60,84,.32);
}
.cd-u i{font-style:normal;font-size:10px;margin-top:5px;opacity:.85}
.cd-open{
  margin-top:10px;font-size:13.5px;font-weight:800;
  background:rgba(255,255,255,.2);border:1.5px solid rgba(255,255,255,.45);
  border-radius:12px;padding:10px 14px;display:inline-block;
}
.lbtn{
  margin-top:18px;display:inline-flex;align-items:center;gap:7px;
  border:0;cursor:pointer;padding:12px 26px;border-radius:999px;
  font-family:inherit;font-size:14px;font-weight:900;letter-spacing:.4px;color:#fff;
  background:linear-gradient(135deg,var(--hb1,#FF7FB0),var(--hb2,#F0437C));
  box-shadow:0 12px 24px -10px var(--hbs,rgba(232,52,112,.9)),inset 0 1px 0 rgba(255,255,255,.42);
  transition:transform .16s,filter .16s;
}
.lbtn:hover{filter:brightness(1.05)}
.lbtn:active{transform:scale(.97)}
.lbtn i{font-style:normal;font-size:13px}
.lhero-art{position:relative;z-index:1;flex:0 0 44%;align-self:stretch;min-width:0}
.lhero-art img{
  width:100%;height:100%;object-fit:cover;object-position:center bottom;display:block;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 30%);
  mask-image:linear-gradient(to right,transparent 0,#000 30%);
}
.lfeat{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.lfeat img{
  width:100%;height:auto;display:block;border-radius:16px;
  border:3px solid #fff;box-shadow:0 10px 24px -16px rgba(40,92,120,.9);
}
/* 职业一览 */
.ljobs{margin:22px 0 6px}
.ljobs-h{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap}
.ljobs-h h2{font-size:16px;font-weight:900}
.ljobs-h span{font-size:11.5px;color:var(--ink2)}
.jgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}
.jcard{
  background:#fff;border:2px solid var(--line);border-radius:16px;overflow:hidden;
  box-shadow:0 8px 20px -16px rgba(80,50,30,.45);
}
.jcard img{width:100%;height:auto;display:block;aspect-ratio:1.51/1;object-fit:cover;object-position:center top}
.jbody{padding:9px 11px 11px}
.jbody b{display:block;font-size:13.5px;font-weight:900}
.jbody em{display:block;font-style:normal;font-size:11px;color:var(--ink2);margin-top:2px;line-height:1.5}
.jbody i{
  display:inline-block;font-style:normal;margin-top:6px;
  font-size:10px;font-weight:800;color:var(--ac);
  background:var(--ac-soft);border-radius:6px;padding:2px 7px;
  font-variant-numeric:tabular-nums;
}
/* 登录界面实拍 */
.lshot{margin:18px 0 4px}
.lshot img{
  width:100%;height:auto;display:block;border-radius:18px;
  border:3px solid #fff;box-shadow:0 12px 26px -18px rgba(40,60,90,.9);
}
.lshot figcaption{margin-top:8px;text-align:center;font-size:11.5px;color:var(--ink2)}
/* 预约弹层 */
.bk{
  position:fixed;inset:0;z-index:120;display:flex;align-items:center;justify-content:center;padding:20px;
  background:rgba(16,32,46,.52);backdrop-filter:blur(5px);
}
.bk[hidden]{display:none}
.bk-card{
  position:relative;width:100%;max-width:352px;background:#fff;
  border-radius:22px;padding:22px 20px 6px;
  box-shadow:0 26px 60px -20px rgba(8,28,42,.75);
  animation:bkIn .22s ease-out;
}
@keyframes bkIn{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
.bk-x{
  position:absolute;right:8px;top:6px;width:32px;height:32px;border:0;background:none;
  font-size:20px;line-height:1;color:#BFAFA2;cursor:pointer;border-radius:50%;
}
.bk-x:focus{outline:none}
.bk-x:focus-visible{outline:2px solid #2C7A9E;outline-offset:2px}
.bk-eyebrow{font-size:10.5px;font-weight:800;letter-spacing:2px;color:#9FB3C0}
.bk-card h3{margin-top:6px;font-size:19px;font-weight:900;color:#2D3A2E}
.bk-desc{margin-top:8px;font-size:12.5px;line-height:1.75;color:#6B7A6C}
.bk-id{
  margin-top:14px;display:flex;align-items:center;justify-content:space-between;gap:8px;
  width:100%;box-sizing:border-box;font-family:inherit;text-align:left;
  background:#F4FAFD;border:1.5px dashed #B7D8E8;border-radius:14px;padding:10px 12px;
  cursor:pointer;-webkit-tap-highlight-color:transparent;
  transition:background .16s,border-color .16s,transform .12s;
}
.bk-id:hover{background:#EAF5FB;border-color:#8FC7E0}
.bk-id:active{transform:scale(.985)}
.bk-id:focus{outline:none}
.bk-id:focus-visible{outline:2px solid #2C7A9E;outline-offset:2px}
.bk-id.done{background:#EAF9F1;border-color:#9FDCBB}
.bk-id span{
  font-size:14.5px;font-weight:900;color:#2C7A9E;letter-spacing:.6px;
  font-variant-numeric:tabular-nums;word-break:break-all;
}
.bk-id em{
  flex:0 0 auto;font-style:normal;font-size:11.5px;font-weight:800;color:#2C7A9E;
  background:#fff;border:1.5px solid #B7D8E8;border-radius:999px;padding:5px 12px;
  white-space:nowrap;
}
.bk-id.done em{color:#1E9A63;border-color:#9FDCBB}
.bk-tip{margin:10px 0 16px;font-size:11.5px;color:#B7A597;text-align:center;line-height:1.6}
@media (max-width:620px){
  .lhero{border-radius:20px}
  .lhero-in{flex-direction:column-reverse}
  .lhero-art{flex:0 0 auto;height:auto}
  .lhero-art img{
    height:auto;object-fit:fill;
    -webkit-mask-image:linear-gradient(to bottom,#000 78%,transparent 100%);
    mask-image:linear-gradient(to bottom,#000 78%,transparent 100%);
  }
  .lhero-txt{padding:14px 16px 20px}
  .lhero h1{font-size:26px}
  .ldesc{font-size:12.5px;line-height:1.8}
  .cd-u{width:46px;height:50px}
  .cd-u em{font-size:18px}
  .lbtn{width:100%;justify-content:center;padding:12px 18px}
  .lfeat{gap:8px}
  .jgrid{grid-template-columns:1fr 1fr;gap:8px}
  .jbody{padding:8px 9px 10px}
  .jbody b{font-size:12.5px}
  .jbody em{font-size:10.5px;margin-top:1px}
  .jbody i{font-size:9.5px;margin-top:5px}
  .ljobs-h h2{font-size:15px}
  .lshot img{border-radius:14px}
}

/* ===== 官网式头图里的各个框：流光 ===== */
.lhero{--flA:0deg;border-color:transparent;
  background-image:linear-gradient(135deg,var(--hg1,#5E9BBC) 0%,var(--hg2,#8CC0D6) 42%,var(--hg3,#CBE8F0) 100%),
    conic-gradient(from var(--flA),
      #FF7FB2 0deg,#FF5FA2 30deg,#fff 46deg,#FFC178 64deg,#FF7FB2 82deg,
      #FF7FB2 212deg,#FF5FA2 242deg,#fff 258deg,#FFC178 276deg,#FF7FB2 294deg,#FF7FB2 360deg);
  background-origin:padding-box,border-box;
  background-clip:padding-box,border-box;
  animation:flowBorder 5s linear infinite;
}
.ltags li,.cd-u,.cd-open,.lbtn{position:relative}
.ltags li::after,.cd-u::after,.cd-open::after,.lbtn::after{
  content:"";position:absolute;border-radius:inherit;
  --flA:0deg;
  background:conic-gradient(from var(--flA),
    rgba(255,150,192,.9) 0deg,rgba(255,150,192,.9) 26deg,
    #FF2E85 42deg,#FF7FB8 50deg,#FFFFFF 58deg,#FFB05C 68deg,rgba(255,150,192,.9) 86deg,
    rgba(255,150,192,.9) 206deg,
    #FF2E85 222deg,#FF7FB8 230deg,#FFFFFF 238deg,#FFB05C 248deg,rgba(255,150,192,.9) 266deg,
    rgba(255,150,192,.9) 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
          mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
          mask-composite:exclude;
  animation:flowBorder 5s linear infinite;pointer-events:none;
}
.ltags li::after{inset:-1px;padding:1.2px}
.cd-u::after,.cd-open::after{inset:-1.5px;padding:1.7px}
.lbtn::after{inset:-2.4px;padding:2.6px}
/* 图片外的框：图片本身没有伪元素，靠外层 .lframe 画环 */
.lframe{position:relative;border-radius:18px;line-height:0}
.lframe img{border:0;border-radius:18px}
.lframe::after{
  content:"";position:absolute;inset:-1px;border-radius:inherit;padding:3px;
  --flA:0deg;
  background:conic-gradient(from var(--flA),
    #FF7FB2 0deg,#FF5FA2 30deg,#fff 46deg,#FFC178 64deg,#FF7FB2 82deg,
    #FF7FB2 212deg,#FF5FA2 242deg,#fff 258deg,#FFC178 276deg,#FF7FB2 294deg,#FF7FB2 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
          mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
          mask-composite:exclude;
  animation:flowBorder 5s linear infinite;pointer-events:none;
}
@media (prefers-reduced-motion:reduce){
  .lhero,.lframe::after,.ltags li::after,.cd-u::after,.cd-open::after,.lbtn::after{animation:none}
}
`;

/* ---- 官网式头图：结构 ---- */
function siteHero(s, name) {
  const tags = s.tags.map(t => `<li>${esc(t)}</li>`).join('');
  const feat = (s.feat || []).map(([src, alt]) =>
    `<div class="lframe"><img src="${src}" alt="${esc(alt)}" loading="lazy" decoding="async"></div>`).join('');
  const t = s.theme || {};
  const styleVars = [
    t.g1 && `--hg1:${t.g1}`, t.g2 && `--hg2:${t.g2}`, t.g3 && `--hg3:${t.g3}`,
    t.l1 && `--hl1:${t.l1}`, t.l2 && `--hl2:${t.l2}`,
    t.b1 && `--hb1:${t.b1}`, t.b2 && `--hb2:${t.b2}`, t.bs && `--hbs:${t.bs}`,
  ].filter(Boolean).join(';');
  const suffix = s.cdSuffix || '公测（暂定）';
  return `<section class="lhero"${styleVars ? ` style="${styleVars}"` : ''}>
  <div class="lhero-in">
    <div class="lhero-txt">
      <p class="eyebrow">${esc(s.eyebrow)}</p>
      <h1>${esc(s.title)}<span class="ld-badge">${esc(s.badge)}</span></h1>
      <p class="ldesc">${esc(s.desc)}</p>
      <ul class="ltags">${tags}</ul>
      <div class="cd" id="cdBox">
        <p class="cd-label">距 <b>${esc(s.cdLabel)}</b> ${esc(suffix)}</p>
        <div class="cd-nums">
          <div class="cd-u"><em id="cdD">--</em><i>天</i></div>
          <div class="cd-u"><em id="cdH">--</em><i>时</i></div>
          <div class="cd-u"><em id="cdM">--</em><i>分</i></div>
          <div class="cd-u"><em id="cdS">--</em><i>秒</i></div>
        </div>
      </div>
      <button class="lbtn" type="button" onclick="openBooking()"><i>🎁</i>${esc(s.cta)}</button>
    </div>
    <div class="lhero-art">
      <img src="${s.art}" alt="${esc(name)} 主视觉" fetchpriority="high">
    </div>
  </div>
</section>
<section class="lfeat">${feat}</section>`;
}

function bookingModal(s) {
  const desc = s.modalDesc || `加客服微信，发送「${s.gameKeyword || s.title}」即可领取礼包，开服当天还会收到上线提醒。`;
  return `<div class="bk" id="bkModal" hidden onclick="if(event.target===this)closeBooking()">
  <div class="bk-card" role="dialog" aria-modal="true" aria-labelledby="bkTitle">
    <button class="bk-x" type="button" onclick="closeBooking()" aria-label="关闭">×</button>
    <p class="bk-eyebrow">PRE-REGISTER</p>
    <h3 id="bkTitle">${esc(s.cta)}</h3>
    <p class="bk-desc">${esc(desc)}</p>
    <button class="bk-id" type="button" onclick="copyWx(this)"><span>${esc(s.wx)}</span><em class="bk-copy">点击复制</em></button>
    <p class="bk-tip" id="bkTip">点一下上面的微信号即可复制，再到微信搜索添加</p>
  </div>
</div>`;
}

/* ---- 职业一览 ---- */
function jobsBlock(j) {
  if (!j) return '';
  const cards = j.items.map(it => `<div class="jcard">
      <img src="../../assets/${it.img}" alt="${esc(it.name)} 创建界面" loading="lazy" decoding="async">
      <div class="jbody"><b>${esc(it.name)}</b><em>${esc(it.desc)}</em><i>${esc(it.stat)}</i></div>
    </div>`).join('');
  return `<section class="ljobs">
    <div class="ljobs-h"><h2>${esc(j.title)}</h2><span>${esc(j.sub)}</span></div>
    <div class="jgrid">${cards}</div>
  </section>`;
}

/* ---- 登录界面实拍 ---- */
function shotBlock(sh) {
  if (!sh) return '';
  return `<figure class="lshot">
    <div class="lframe"><img src="../../assets/${sh.img}" alt="${esc(sh.cap)}" loading="lazy" decoding="async"></div>
    <figcaption>${esc(sh.cap)}</figcaption>
  </figure>`;
}

/* ---- 露娜2 定制头图：脚本（倒计时 / 弹层 / 复制） ---- */
const LUNA_JS = `
(function(){
  var box = document.getElementById('cdBox');
  if (!box) return;
  var target = new Date('TARGET_ISO').getTime();
  var D = document.getElementById('cdD'), H = document.getElementById('cdH'),
      M = document.getElementById('cdM'), S = document.getElementById('cdS');
  function pad(n){ return n < 10 ? '0' + n : '' + n; }
  function tick(){
    var diff = target - Date.now();
    if (diff <= 0){
      box.innerHTML = '<p class="cd-open">CD_DONE</p>';
      return;
    }
    var t = Math.floor(diff / 1000);
    D.textContent = Math.floor(t / 86400);
    H.textContent = pad(Math.floor(t % 86400 / 3600));
    M.textContent = pad(Math.floor(t % 3600 / 60));
    S.textContent = pad(t % 60);
    setTimeout(tick, 1000 - (Date.now() % 1000) + 10);
  }
  tick();
})();

function openBooking(){
  var m = document.getElementById('bkModal');
  if (!m) return;
  m.hidden = false;
  document.body.style.overflow = 'hidden';
  var b = m.querySelector('.bk-x');
  if (b) b.focus();
}
function closeBooking(){
  var m = document.getElementById('bkModal');
  if (!m) return;
  m.hidden = true;
  document.body.style.overflow = '';
}
function copyWx(btn){
  var id = WX_ID;
  var label = btn ? btn.querySelector('.bk-copy') : null;
  function ok(){
    var tip = document.getElementById('bkTip');
    if (tip) tip.textContent = '已复制：' + id + ' · 打开微信搜索添加';
    if (label) label.textContent = '已复制 ✓';
    if (btn && btn.classList) btn.classList.add('done');
  }
  function fallback(){
    var ta = document.createElement('textarea');
    ta.value = id;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
    ok();
  }
  if (navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(id).then(ok).catch(fallback);
  } else {
    fallback();
  }
}
document.addEventListener('keydown', function(e){
  if (e.key === 'Escape') closeBooking();
});
`;
function pageTpl(g) {
  const n = g.arts.length;
  const site = g.heroSite || null;
  const chips = g.chips.map(([t, hot]) =>
    `<span class="chip${hot ? ' hot' : ''}">${esc(t)}</span>`).join('');
  const extraCss = site ? LUNA_CSS : '';
  const extraJs = site
    ? '<script>' + LUNA_JS
        .replace('TARGET_ISO', site.cdTarget)
        .replace('CD_DONE', (site.cdDone || '公测已开启，进游戏见 🎉'))
        .replace('WX_ID', JSON.stringify(site.wx)) + '</' + 'script>'
    : '';
  const extraBlocks = site ? jobsBlock(site.jobs) + shotBlock(site.shot) : '';
  const heroBlock = site
    ? siteHero(site, g.name)
    : `<section class="hero">
    <img src="${g.cover}" alt="${esc(g.name)}" fetchpriority="high">
  </section>
  <div class="hero-head">
    <div class="chips">${chips}</div>
    <h1>${esc(g.name)}</h1>
    <p class="tagline">${esc(g.tagline)} · 收录 ${n} 篇攻略</p>
  </div>`;
  const facts = g.facts.map(([k, v]) =>
    `<div class="fact"><span class="fk">${esc(k)}</span><span class="fv">${esc(v)}</span></div>`).join('');
  const entries = g.arts.map(a => {
    const d = a.date.split('-');
    return `<a class="entry" href="../../index.html?a=${articleId(a)}">
      <span class="e-date"><i>${d[1]}.${d[2]}</i><em>${d[0]}</em></span>
      <span class="e-body">
        <span class="e-meta"><span class="e-tag">${esc(a.tag || g.name)}</span><span>${esc(a.date)}</span></span>
        <span class="e-title">${esc(a.title)}</span>
        <span class="e-dek">${esc(a.summary)}</span>
        <span class="e-foot">约 ${readMinutes(a)} 分钟 · ${a.full.length} 节 · 点击展开全文</span>
      </span>
      <span class="e-arrow" aria-hidden="true">→</span>
    </a>`;
  }).join('\n');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(g.name)}攻略合集 · 精品手游攻略站</title>
<meta name="description" content="${esc(g.name)}攻略共 ${n} 篇：${esc(g.tagline)}。${esc(g.desc).slice(0, 60)}…">
<meta name="robots" content="index,follow">
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--ac:${g.acc};--ac-soft:${g.accSoft};--ink:#2D3A2E;--ink2:#6B7A6C;--line:#F0E4D6;--paper:#FFFBF3}
body{
  font-family:"PingFang SC","Hiragino Sans GB","Microsoft YaHei",-apple-system,sans-serif;
  color:var(--ink);line-height:1.65;
  background:
    radial-gradient(circle at 10% 0%, ${g.accSoft} 0%, transparent 42%),
    radial-gradient(circle at 94% 4%, #FFF3E2 0%, transparent 40%),
    var(--paper);
  min-height:100vh;padding:0 14px 56px;
}
.wrap{max-width:760px;margin:0 auto}
/* 顶栏 */
.top{
  position:sticky;top:0;z-index:20;
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  padding:10px 2px;margin:0 -14px 14px;padding:10px 16px;
  background:rgba(255,251,243,.92);backdrop-filter:blur(8px);
  border-bottom:1.5px solid var(--line);
}
.back{
  display:inline-flex;align-items:center;gap:4px;
  font-size:12.5px;color:var(--ink2);text-decoration:none;
  background:#fff;border:2px solid var(--line);border-radius:999px;
  padding:4px 12px;font-weight:700;
}
.back:hover{color:var(--ac);border-color:var(--ac)}
.brand{font-size:13px;font-weight:900;color:var(--ink);letter-spacing:.5px}
.brand i{font-style:normal;color:var(--ac)}
/* 头图：按原图比例展示，不裁切，避免切头 */
.hero{
  position:relative;border-radius:22px;overflow:hidden;
  background:#1B1526;
  border:3px solid #fff;box-shadow:0 12px 26px -10px rgba(80,50,30,.35);
}
.hero img{width:100%;height:auto;display:block}
.hero-head{padding:14px 4px 0}
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px}
.chip{
  display:inline-flex;align-items:center;height:22px;padding:0 10px;
  font-size:11.5px;font-weight:800;border-radius:999px;
  background:var(--ac-soft);color:var(--ac);
  border:1.5px solid rgba(0,0,0,.04);
}
.chip.hot{background:#FF4444;color:#fff;border-color:#FF4444}
.hero-head h1{font-size:25px;font-weight:900;letter-spacing:.5px;line-height:1.3}
.tagline{font-size:12.5px;color:var(--ink2);margin-top:4px}
/* 简介 & 信息卡 */
.intro{
  margin:16px 2px 14px;font-size:13.5px;color:var(--ink2);
  background:#fff;border:2px solid var(--line);border-radius:16px;padding:14px 16px;
}
.facts{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:22px}
.fact{
  background:#fff;border:2px solid var(--line);border-radius:14px;padding:11px 13px;
  box-shadow:0 6px 16px -12px rgba(80,50,30,.3);
}
.fk{display:block;font-size:11px;color:var(--ink2);letter-spacing:.4px}
.fv{font-size:13px;font-weight:800;color:var(--ac)}
/* 文章列表 */
.list h2{font-size:16px;display:flex;align-items:baseline;gap:8px}
.list h2 small{font-size:11.5px;color:var(--ink2);font-weight:400}
.entries{margin-top:12px;display:flex;flex-direction:column;gap:10px}
.entry{
  display:flex;align-items:stretch;gap:12px;
  background:#fff;border:2px solid var(--line);border-radius:16px;
  padding:13px 14px;text-decoration:none;color:var(--ink);
  transition:transform .18s,box-shadow .18s,border-color .18s;
}
.entry:hover{transform:translateY(-3px);border-color:var(--ac);box-shadow:0 10px 22px -14px var(--ac)}
.e-date{
  flex:0 0 52px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:var(--ac-soft);border-radius:12px;color:var(--ac);
}
.e-date i{font-style:normal;font-size:14.5px;font-weight:900;font-variant-numeric:tabular-nums}
.e-date em{font-style:normal;font-size:10px;opacity:.75}
.e-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
.e-meta{display:flex;align-items:center;gap:8px;font-size:10.5px;color:var(--ink2)}
.e-tag{
  display:inline-flex;align-items:center;height:17px;padding:0 7px;
  background:var(--ac);color:#fff;border-radius:6px;
  font-size:10.5px;font-weight:800;line-height:1;
}
.e-title{font-size:14.5px;font-weight:800;line-height:1.45}
.e-dek{
  font-size:12px;color:var(--ink2);line-height:1.55;
  display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
}
.e-foot{font-size:10.5px;color:#B7A597;margin-top:2px}
.e-arrow{
  flex:0 0 auto;align-self:center;color:var(--ac);
  font-weight:900;font-size:16px;opacity:.55;transition:transform .18s,opacity .18s;
}
.entry:hover .e-arrow{transform:translateX(3px);opacity:1}
/* 底部 CTA & 页脚 */
.cta{margin:26px 0 8px;text-align:center}
.cta-btn{
  display:inline-flex;align-items:center;gap:6px;
  background:linear-gradient(160deg,var(--ac),var(--ac));
  color:#fff;text-decoration:none;font-weight:900;font-size:14px;
  padding:12px 26px;border-radius:999px;
  box-shadow:0 8px 18px -6px var(--ac);
}
.cta-btn:hover{filter:brightness(1.06)}
.cta p{margin-top:10px;font-size:11.5px;color:var(--ink2)}
.foot{margin-top:22px;text-align:center;font-size:11.5px;color:#B7A597;line-height:1.9}
.foot a{color:#B7A597;text-decoration:none;border-bottom:1px dashed #E0D2C4}
.foot a:hover{color:var(--ac)}
${extraCss}
@media (max-width:560px){
  .hero-head h1{font-size:21px}
  .facts{grid-template-columns:1fr 1fr;gap:8px}
  .fact{padding:9px 11px}
  .fv{font-size:12px}
  .e-dek{-webkit-line-clamp:2}
}
/* ========== 方框 · 流光边框（光带绕框旋转，与首页一致） ========== */
@property --flA{syntax:'<angle>';inherits:false;initial-value:0deg}
@keyframes flowBorder{to{--flA:360deg}}
.back,.chip,.intro,.fact,.entry,.jv-card,.bk-card,.cta-btn{position:relative}
.back::after,.intro::after,.fact::after,.entry::after,.jv-card::after{inset:-2px;padding:2.2px}
.chip::after,.bk-id::after{inset:-1.5px;padding:1.7px}
.cta-btn::after{inset:-2.4px;padding:2.6px}
.bk-card::after{inset:0;padding:2.2px}
.back::after,.chip::after,.intro::after,.fact::after,.entry::after,.jv-card::after,.bk-id::after,.cta-btn::after,.bk-card::after{
  content:"";position:absolute;border-radius:inherit;
  --flA:0deg;
  background:conic-gradient(from var(--flA),
    rgba(255,150,192,.9) 0deg,rgba(255,150,192,.9) 26deg,
    #FF2E85 42deg,#FF7FB8 50deg,#FFFFFF 58deg,#FFB05C 68deg,rgba(255,150,192,.9) 86deg,
    rgba(255,150,192,.9) 206deg,
    #FF2E85 222deg,#FF7FB8 230deg,#FFFFFF 238deg,#FFB05C 248deg,rgba(255,150,192,.9) 266deg,
    rgba(255,150,192,.9) 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;
          mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
          mask-composite:exclude;
  animation:flowBorder 5s linear infinite;pointer-events:none;
}
.back:hover::after,.chip:hover::after,.entry:hover::after{animation-duration:2s}
.hero,.jcard{
  --flA:0deg;border-color:transparent;
  background-image:linear-gradient(#1B1526,#1B1526),
    conic-gradient(from var(--flA),
      #FF7FB2 0deg,#FF5FA2 30deg,#fff 46deg,#FFC178 64deg,#FF7FB2 82deg,
      #FF7FB2 212deg,#FF5FA2 242deg,#fff 258deg,#FFC178 276deg,#FF7FB2 294deg,#FF7FB2 360deg);
  background-origin:padding-box,border-box;
  background-clip:padding-box,border-box;
  animation:flowBorder 5s linear infinite;
}
.jcard{
  background-image:linear-gradient(#fff,#fff),
    conic-gradient(from var(--flA),
      #FF7FB2 0deg,#FF5FA2 30deg,#fff 46deg,#FFC178 64deg,#FF7FB2 82deg,
      #FF7FB2 212deg,#FF5FA2 242deg,#fff 258deg,#FFC178 276deg,#FF7FB2 294deg,#FF7FB2 360deg);
}
@media (prefers-reduced-motion:reduce){
  .hero,.jcard,.back::after,.chip::after,.intro::after,.fact::after,.entry::after,.jv-card::after,.bk-id::after,.cta-btn::after,.bk-card::after{animation:none}
}
</style>
</head>
<body>
<header class="top">
  <a class="back" href="../../">← 返回首页</a>
  <span class="brand">精品<i>手游</i>攻略站</span>
</header>

<main class="wrap">
  ${heroBlock}

  <p class="intro">${esc(g.desc)}</p>

  <section class="facts">${facts}</section>
${extraBlocks}

  <section class="list">
    <h2>${esc(g.name)} · 全部 ${n} 篇<small>点开任意一篇直接展开全文</small></h2>
    <div class="entries">
${entries}
    </div>
  </section>

  <section class="cta">
    <a class="cta-btn" href="../../">← 回首页看全部游戏与攻略</a>
    <p>客服一对一发下载链接与专属礼包 · 本页已被逛过 <b id="subHits" hidden>—</b> 次</p>
  </section>
</main>
${site ? bookingModal(site) : ''}
<footer class="foot">
  <a href="../../">精品手游攻略站</a> · <a href="../../stats.html">站点数据</a><br>
  本页面为推广信息聚合，游戏内容版权归各开发商所有
</footer>

<script>
/* 分站浏览计数：失败静默 */
try{
  fetch('https://abacus.jasoncameron.dev/hit/jingyu3269.github.io/g-${g.slug}', {cache:'no-store'})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(d){
      if (d && typeof d.value === 'number'){
        var el = document.getElementById('subHits');
        if (el){ el.textContent = d.value; el.hidden = false; }
      }
    }).catch(function(){});
}catch(e){}
</script>
${extraJs}
</body>
</html>
`;
}

/* ---- 生成 ---- */
const made = [];
for (const g of GAMES) {
  const dir = path.join(ROOT, 'g', g.slug);
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, 'index.html');
  fs.writeFileSync(file, pageTpl(g), 'utf8');
  made.push(`g/${g.slug}/index.html`);
  console.log(`OK  g/${g.slug}/  ${g.name}  ${g.arts.length} 篇  ${fs.statSync(file).size}B`);
}
console.log('生成完成:', made.join(', '));
