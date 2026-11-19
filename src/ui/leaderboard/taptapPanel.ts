import { formatRunTime } from '../../../shared/leaderboard';
import { el, setHidden, setText } from '../dom';
import type { HudContext, HudPart } from '../types';
import { createCompletionCard } from '../winCard';
import { createTapTapLeaderboard } from './taptap';

export function createTapTapWinCard(ctx: HudContext, leaderboardId: string): HudPart {
  const board = createTapTapLeaderboard(leaderboardId);
  const note = el('p', { className: 'wss-board-note', attrs: { role: 'status' } });
  const openNote = el('p', { className: 'wss-board-note', attrs: { role: 'status' } });
  const open = el('button', { className: 'wss-btn', text: '查看排行榜', attrs: { type: 'button' } });
  const again = el('button', { className: 'wss-btn wss-btn-primary', text: '再玩一局', attrs: { type: 'button' } });
  const retry = el('button', { className: 'wss-btn', text: '重试提交', attrs: { type: 'button' } });
  let current: { readonly elapsedMs: number; readonly hintsUsed: number; submitting: boolean } | null = null;

  async function submit(): Promise<void> {
    const run = current;
    if (!run || run.hintsUsed > 0 || run.submitting) return;
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

  ctx.disposer.listen(retry, 'click', () => void submit());
  ctx.disposer.listen(again, 'click', () => {
    if (ctx.api.getState().status !== 'won') return;
    again.disabled = true;
    ctx.api.newPuzzle();
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
    elements: [again, el('div', { className: 'wss-board' }, [note, open, retry, openNote])],
    open(state): void {
      const unavailable = board.unavailable();
      current = { elapsedMs: state.elapsedMs, hintsUsed: state.hintsUsed, submitting: false };
      again.disabled = false;
      setHidden(retry, true);
      setHidden(open, unavailable !== null);
      open.disabled = false;
      setText(openNote, '');
      if (state.hintsUsed > 0) setText(note, `练习成绩 · 使用 ${state.hintsUsed} 次提示 · 不计入竞速排名`);
      else if (unavailable) setText(note, unavailable);
      else void submit();
    },
    close: clearRun,
  }, true);
}
