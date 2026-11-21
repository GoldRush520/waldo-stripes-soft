import { formatRunTime } from '../../../shared/leaderboard';
import { el, setHidden, setText } from '../dom';
import type { HudContext, HudPart } from '../types';
import { createCompletionCard } from '../winCard';
import { createTapTapLeaderboard } from './taptap';
import { STAGES } from '../../game/campaign';

export interface CampaignNavigation {
  enterStage(stage: number): void;
  showStages(): void;
}

export function createTapTapWinCard(ctx: HudContext, navigation?: CampaignNavigation): HudPart {
  const board = createTapTapLeaderboard();
  const note = el('p', { className: 'wss-board-note', attrs: { role: 'status' } });
  const openNote = el('p', { className: 'wss-board-note', attrs: { role: 'status' } });
  const open = el('button', { className: 'wss-btn', text: '查看排行榜', attrs: { type: 'button' } });
  const again = el('button', { className: 'wss-btn wss-btn-primary', text: '再玩一局', attrs: { type: 'button' } });
  const retry = el('button', { className: 'wss-btn', text: '重试提交', attrs: { type: 'button' } });
  const campaign = ctx.api.campaign;
  let current: { readonly elapsedMs: number; readonly practice: boolean; submitting: boolean } | null = null;

  async function submit(): Promise<void> {
    const run = current;
    if (!run || campaign?.district || run.practice || run.submitting) return;
    run.submitting = true;
    setHidden(retry, true);
    setText(note, '正在提交成绩…');
    let best: number;
    try {
      best = await board.submitTime(run.elapsedMs);
    } catch {
      if (run === current) {
        setText(note, '成绩提交失败，本局成绩仍可查看。');
        setHidden(retry, false);
      }
      return;
    } finally {
      run.submitting = false;
    }
    if (run !== current) return;
    const bestText = `个人最佳 ${formatRunTime(best)}`;
    setText(note, bestText);
    const rank = await board.loadRank().catch(() => null);
    if (run === current && rank) setText(note, `${bestText} · 排名 ${rank}`);
  }

  function clearRun(): void {
    current = null;
  }

  const back = el('button', { className: 'wss-btn', text: '返回选关', attrs: { type: 'button' } });
  setHidden(back, !navigation);
  if (navigation) ctx.disposer.listen(back, 'click', navigation.showStages);
  ctx.disposer.listen(retry, 'click', () => void submit());
  ctx.disposer.listen(again, 'click', () => {
    if (ctx.api.getState().status !== 'won') return;
    again.disabled = true;
    const state = ctx.api.getState();
    if (campaign?.district && !state.adPlayed) navigation?.enterStage(campaign.stage + 1);
    else ctx.api.newPuzzle();
  });
  ctx.disposer.listen(open, 'click', async () => {
    const run = current;
    if (!run || open.disabled) return;
    open.disabled = true;
    setText(openNote, '');
    try {
      await board.open();
    } catch {
      if (run === current) setText(openNote, '暂时无法打开 TapTap 排行榜，请重试。');
    } finally {
      if (run === current) open.disabled = false;
    }
  });
  ctx.disposer.add(clearRun);

  return createCompletionCard(ctx, {
    elements: [again, back, el('div', { className: 'wss-board' }, [note, open, retry, openNote])],
    open(state): void {
      const unavailable = board.unavailable();
      current = { elapsedMs: state.elapsedMs, practice: !!state.adPlayed || state.hintsUsed > 0, submitting: false };
      again.disabled = false;
      setHidden(retry, true);
      setHidden(open, unavailable !== null);
      open.disabled = false;
      setText(openNote, '');
      if (campaign?.district) {
        setHidden(open, true);
        const nextStage = campaign.stage+1;
        setText(again, current.practice ? '重试本关' : `下一关 · ${STAGES[nextStage-1]![1]}`);
        const best = campaign.best.get(campaign.stage);
        setText(note, current.practice ? '练习成绩 · 观看过广告，本局无法解锁下一关。' :
          `已解锁第 ${nextStage} 关 · 本关最佳 ${formatRunTime(best ?? state.elapsedMs)}`);
        if (!campaign.saved) setText(openNote, '本机存档不可用，离开游戏可能丢失进度。');
      }
      else if (current.practice) setText(note, '练习成绩 · 本局不计入孤勇者榜');
      else if (unavailable) setText(note, unavailable);
      else void submit();
    },
    close: clearRun,
  }, true);
}
