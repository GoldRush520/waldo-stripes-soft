import type { GameState, HintReward } from '../../game/api';
import { el, setHidden, setText } from '../dom';
import type { HudContext, HudPart } from '../types';
import type { AdOutcome, RewardedVideo } from './taptap';

const REWARD_COPY: Readonly<Record<HintReward, string>> = {
  range: '圈出条纹衫旅人所在的搜索范围。',
  shrink: '把搜索范围内的候选人数缩减约一半。',
  reveal: '直接标出条纹衫旅人，由你亲手点中他。',
};

const RESULT_COPY: Readonly<Record<Exclude<AdOutcome, 'completed'>, string>> = {
  closed: '看完视频才能领取下一条提示。',
  failed: '暂时没有可播放的视频，可以继续找。',
  timeout: '视频响应超时，可以继续找。',
};

function action(text: string, primary = false): HTMLButtonElement {
  return el('button', {
    className: `wss-btn${primary ? ' wss-btn-primary' : ''}`,
    text, attrs: { type: 'button' },
  });
}

function record(event: string, state: GameState, detail: Record<string, string | number | boolean> = {}): void {
  window.dispatchEvent(new CustomEvent('waldo:ad-metric', {
    detail: { event, runId: state.runId, hintsUsed: state.hintsUsed, elapsedMs: Math.round(state.elapsedMs), ...detail },
  }));
}

interface HintAttempt {
  readonly state: GameState;
  readonly reward: HintReward;
  playing: boolean;
}

export function createSearchHintPanel(ctx: HudContext, video: RewardedVideo | null): HudPart {
  const mock = video === null;
  const entry = action('搜索提示');
  const review = action('查看提示');
  const note = el('p', { className: 'wss-hint-note', attrs: { role: 'status' } });
  const controls = el('div', { className: 'wss-hint-controls' }, [note, entry, review]);
  const message = el('p', { attrs: { id: 'wss-hint-message', role: 'status' } });
  const detail = el('p', { text: '领取提示后，本局成绩不参与无提示竞速排名。' });
  const watch = action('观看视频', true);
  const cancel = action('继续找');
  const complete = action('模拟完整观看', true);
  const dismiss = action('模拟提前关闭');
  const fail = action('模拟播放失败');
  const consent = el('div', { className: 'wss-hint-dialog-actions' }, [watch, cancel]);
  const mockActions = el('div', { className: 'wss-hint-dialog-actions' }, [complete, dismiss, fail]);
  const dialog = el('dialog', {
    className: 'wss-hint-dialog', attrs: { 'aria-labelledby': 'wss-hint-message' },
  }, [message, detail, consent, mockActions]);
  const outline = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  const marker = el('div', { className: 'wss-hint-target', attrs: { 'aria-hidden': 'true' } });
  outline.classList.add('wss-hint-outline');
  outline.setAttribute('aria-hidden', 'true');
  outline.append(polygon);
  const root = el('div', {}, [outline, marker, controls, dialog]);
  let attempt: HintAttempt | null = null;
  let trackedRun = 0;
  let views = 0;

  function canWatch(state: GameState): boolean {
    return state.status === 'playing' && !state.waiting && !state.paused && state.hintReward !== null;
  }

  function refresh(state = ctx.api.getState()): void {
    const playing = state.status === 'playing' && !state.waiting;
    const available = canWatch(state);
    const reveal = playing && state.marker?.kind === 'reveal' ? state.marker : null;
    setHidden(entry, !available);
    setHidden(review, !playing || state.hintsUsed === 0);
    setHidden(controls, !playing || (!available && state.hintsUsed === 0 && !note.textContent));
    const label = state.hintReward === 'reveal' ? '标出旅人' : state.hintsUsed ? '缩小范围' : '搜索提示';
    if (entry.textContent !== label) setText(entry, label);
    setHidden(marker, reveal === null);
    if (reveal) marker.style.transform = `translate(${reveal.x}px, ${reveal.y}px) translate(-50%, -50%)`;
    polygon.setAttribute('points', playing && state.hintOutline ? state.hintOutline.map(([x, y]) => `${x},${y}`).join(' ') : '');
  }

  function close(): void {
    attempt = null;
    dialog.close();
    ctx.api.setHintAdActive(false);
    refresh();
    if (!entry.hidden) entry.focus({ preventScroll: true });
    else if (!review.hidden) review.focus({ preventScroll: true });
  }

  function finish(current: HintAttempt, outcome: AdOutcome): void {
    if (attempt !== current) return;
    const state = ctx.api.getState();
    record('ad_result', current.state, { outcome, reward: current.reward });
    if (mock && (outcome === 'completed' || outcome === 'closed')) ctx.api.markAdPlayed?.(current.state.runId);
    if (outcome === 'completed' && state.runId === current.state.runId) views++;
    if (state.runId === current.state.runId && state.status === 'playing') {
      if (outcome === 'completed') {
        if (ctx.api.requestHint(current.state.runId)) {
          const hint = ctx.api.getState();
          const text = current.reward === 'reveal' ? '已标出条纹衫旅人，点中他完成本局。' : '已圈出新的搜索范围。';
          setText(note, text);
          record('hint_granted', hint, { reward: current.reward });
        }
      } else {
        setText(note, RESULT_COPY[outcome]);
      }
    }
    close();
  }

  ctx.disposer.listen(entry, 'click', () => {
    const state = ctx.api.getState();
    if (attempt || !canWatch(state) || !state.hintReward) return;
    if (video && !video.available()) { setText(note, RESULT_COPY.failed); return; }
    attempt = { state, reward: state.hintReward, playing: false };
    record('hint_clicked', state, { reward: state.hintReward });
    setText(note, '');
    setText(message, REWARD_COPY[state.hintReward]);
    setHidden(consent, false);
    setText(detail, ctx.api.campaign?.district ? '视频开始播放后，本局无法解锁下一关。' : '视频开始播放后，本局不计入孤勇者榜。');
    setHidden(detail, state.adPlayed === true);
    setHidden(mockActions, true);
    ctx.api.setHintAdActive(true);
    dialog.showModal();
    cancel.focus();
  });

  ctx.disposer.listen(watch, 'click', () => {
    const current = attempt;
    if (!current || current.playing) return;
    current.playing = true;
    setHidden(consent, true);
    setHidden(detail, true);
    setText(message, mock ? '本地模拟激励视频' : '正在播放激励视频…');
    const shown = (): void => {
      ctx.api.markAdPlayed?.(current.state.runId);
      record('ad_shown', current.state, { reward: current.reward });
    };
    if (mock) {
      setHidden(mockActions, false);
      complete.focus();
    } else {
      void video.play(shown).then((outcome) => finish(current, outcome));
    }
  });

  ctx.disposer.listen(cancel, 'click', close);
  ctx.disposer.listen(review, 'click', () => ctx.api.focusHint());
  ctx.disposer.listen(complete, 'click', () => { if (attempt) finish(attempt, 'completed'); });
  ctx.disposer.listen(dismiss, 'click', () => { if (attempt) finish(attempt, 'closed'); });
  ctx.disposer.listen(fail, 'click', () => { if (attempt) finish(attempt, 'failed'); });
  ctx.disposer.listen(dialog, 'cancel', (event) => {
    event.preventDefault();
    if (!attempt?.playing) close();
    else if (mock) finish(attempt, 'closed');
  });
  ctx.disposer.listen(window, 'pagehide', (event) => {
    const state = ctx.api.getState();
    if (!(event as PageTransitionEvent).persisted && trackedRun === state.runId && state.status === 'playing') {
      record('run_abandoned', state, { views });
    }
  });
  ctx.disposer.add(() => {
    if (attempt) close();
  });

  refresh();
  return {
    el: root,
    update(previous, state) {
      if (attempt && (state.status !== 'playing' || attempt.state.runId !== state.runId)) close();
      if (previous?.status === 'playing' && trackedRun === previous.runId &&
        (state.status === 'loading' || state.runId !== previous.runId)) {
        record('run_abandoned', previous, { views });
      }
      if (state.status === 'playing' && !state.waiting && trackedRun !== state.runId) {
        trackedRun = state.runId;
        views = 0;
        setText(note, '');
        record('run_started', state);
      }
      if (state.status === 'won' && previous?.status !== 'won') record('run_completed', state, { views });
      refresh(state);
    },
  };
}
