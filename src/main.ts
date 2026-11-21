import { loadCampaign } from './game/campaign';
import { debugParams } from './dev/debugParams';
import { el } from './ui/dom';
import { showStageSelect } from './ui/stageSelect';

const ui = document.getElementById('ui')!;
const campaign = import.meta.env.MODE === 'taptap' ? loadCampaign() : undefined;
let disposeGame: (() => void) | undefined;
let loading = false;

function leaveGame(): void {
  disposeGame?.();
  disposeGame = undefined;
  ui.replaceChildren();
}

function showStages(): void {
  if (!campaign || loading) return;
  leaveGame();
  showStageSelect(ui, campaign, enterStage);
}

function enterStage(stage: number): void {
  if (!campaign?.canPlay(stage) || loading) return;
  leaveGame();
  campaign.stage = stage;
  void play();
}

function fail(error: unknown): void {
  leaveGame();
  const english = !campaign;
  const box = el('div', { className: 'game-load-error', attrs: { role: 'alert' } });
  box.append(el('p', { text: english ? 'The festival town could not be set up this time.' : '小镇加载失败，请重试。' }));
  const detail = error instanceof Error ? error.message : String(error);
  if (english || debugParams(location).has('dev')) box.append(el('p', { text: detail }));
  const boot = (window as unknown as { __boot?: { stage: string } }).__boot;
  if (boot) boot.stage = 'failed: ' + detail;
  const retry = el('button', { text: english ? 'Try a new scene' : '重试' });
  retry.onclick = () => {
    const url = new URL(location.href);
    url.searchParams.delete('seed');
    history.replaceState(history.state, '', url);
    void play();
  };
  box.append(retry);
  if (campaign) {
    const back = el('button', { text: '返回选关' });
    back.onclick = showStages;
    box.append(back);
  }
  ui.replaceChildren(box);
  retry.focus();
}

async function play(): Promise<void> {
  if (loading) return;
  loading = true;
  ui.replaceChildren();
  const message = el('p', { className: 'stage-loading', text: campaign ? '正在载入' + campaign.name + '…' : 'Loading the festival town…', attrs: { role: 'status' } });
  ui.append(message);
  try {
    const { startGame } = await import('./play');
    disposeGame = await startGame(campaign, campaign ? { enterStage, showStages } : undefined, fail);
    message.remove();
  } catch (error) {
    fail(error);
  } finally {
    loading = false;
  }
}

if (campaign) showStages();
else void play();
