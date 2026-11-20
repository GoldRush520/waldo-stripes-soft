/**
 * The how-to-play card shown once when the game is ready. Until the player presses Start the
 * clock waits and the town cannot be moved or clicked, so reading the card costs no time and
 * nobody can search with the clock stopped.
 */
import type { GameState } from '../game/api';
import { el, setHidden } from './dom';
import { enteredStatus } from './diff';
import { STAGES } from '../game/campaign';
import { formatRunTime } from '../../shared/leaderboard';
import type { HudContext, HudPart } from './types';

const COPY = import.meta.env.MODE === 'taptap' ? {
  start: '开始游戏',
  title: '寻找条纹衫旅人',
  steps: [
    '条纹衫旅人藏在海滨小镇的人群里。',
    '拖动屏幕浏览小镇，找到旅人后点中他。',
    '未使用提示的成绩可参与竞速排行。',
  ],
  clock: '点击「开始游戏」后开始计时。',
  announcement: '计时已开始。请寻找条纹衫旅人。',
} : {
  start: 'Start',
  title: 'Find Waldo',
  steps: [
    'Waldo is hiding somewhere in the crowd.',
    'Drag to look around the town. You can also scroll or use the arrow keys.',
    'Click him when you spot him. The fastest times go on the leaderboard.',
  ],
  clock: 'The clock starts when you press Start.',
  announcement: 'The clock is running. Find Waldo.',
};

export function createHowToPlay(ctx: HudContext): HudPart {
  const start = el('button', { className: 'wss-btn wss-btn-primary wss-howto-start', text: COPY.start, attrs: { type: 'button' } });
  const card = el('div', { className: 'wss-howto-card', attrs: { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'wss-howto-title' } }, [
    el('h2', { className: 'wss-howto-title', text: COPY.title, attrs: { id: 'wss-howto-title' } }),
    el('ol', { className: 'wss-howto-steps' }, COPY.steps.map((text) => el('li', { text }))),
    el('p', { className: 'wss-howto-clock', text: COPY.clock }),
    start,
  ]);
  /* the layer covers the whole screen so the town underneath cannot be dragged or clicked */
  const campaign = ctx.api.campaign;
  if (campaign) {
    card.querySelector('h2')!.textContent = `第 ${campaign.stage} 关 · ${campaign.name}`;
    const steps = card.querySelector('ol')!;
    steps.replaceChildren(...[
      '单指拖动，双指缩放，点中条纹衫旅人。',
      campaign.district ? '不看广告通关，解锁下一关。' : '不看广告通关，挑战孤勇者榜。',
    ].map(text => el('li', {text})));
    if (campaign.unlocked > 1) {
      const select = el('select', {className:'wss-stage-select', attrs:{'aria-label':'选择已解锁关卡'}});
      for (let i = 1; i <= campaign.unlocked; i++) {
        const best = campaign.best.get(i);
        select.append(el('option', {attrs:{value:String(i)}, text:`第 ${i} 关 · ${STAGES[i-1]![1]}${best ? ' · 最佳 '+formatRunTime(best) : ''}`}));
      }
      select.value = String(campaign.stage);
      ctx.disposer.listen(select, 'change', () => ctx.api.enterStage?.(Number(select.value)));
      card.insertBefore(select, start);
    }
  }
  const root = el('div', { className: 'wss-howto-root' }, [card]);
  root.hidden = true;
  let shown = false;
  /* hold the game from the outset, not from the first frame the card appears on: the clock must
   * read exactly zero when Start is pressed */
  ctx.api.setWaiting(true);

  start.addEventListener('click', () => {
    setHidden(root, true);
    ctx.api.setWaiting(false);
    ctx.announce(COPY.announcement);
  });

  return {
    el: root,
    update(prev: GameState | null, next: GameState): void {
      /* once per visit, the first time a puzzle is ready */
      if (shown || !enteredStatus(prev, next, 'playing')) return;
      shown = true;
      setHidden(root, false);
      start.focus({ preventScroll: true });
    },
  };
}
