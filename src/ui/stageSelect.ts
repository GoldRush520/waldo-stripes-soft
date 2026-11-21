import './stageSelect.css';
import { formatRunTime } from '../../shared/leaderboard';
import { Campaign, FINAL_STAGE, STAGES } from '../game/campaign';
import { el, setText } from './dom';

export function showStageSelect(host: HTMLElement, campaign: Campaign, enter: (stage: number) => void): void {
  const completed = campaign.best.size;
  const meter = el('progress', { attrs: { value: String(completed), max: String(FINAL_STAGE), 'aria-label': '已通关' } });
  const cover = el('aside', { className: 'stage-cover' }, [
    el('div', { className: 'stage-art', attrs: { 'aria-hidden': 'true' } }),
    el('div', { className: 'stage-summary' }, [
      el('h1', { text: '人海小镇' }),
      el('div', { className: 'stage-progress' }, [el('span', { text: '已通关' }), el('b', { text: completed + ' / ' + FINAL_STAGE })]),
      meter,
      el('p', { text: '单指拖动，双指缩放，点中条纹衫旅人。' }),
    ]),
  ]);
  const rule = el('p', { text: '不看广告通关，即可解锁下一关。', attrs: { role: 'status' } });
  const grid = el('div', { className: 'stage-grid' });
  const main = el('section', { className: 'stage-list' }, [el('h2', { text: '选择关卡' }), rule, grid]);
  STAGES.forEach(([, name], index) => {
    const number = index + 1;
    const final = number === FINAL_STAGE;
    const best = campaign.best.get(number);
    const unlocked = campaign.canPlay(number);
    const state = best !== undefined ? 'done' : unlocked ? 'current' : 'locked';
    const status = best !== undefined ? '最佳 ' + formatRunTime(best) : unlocked ? '开始挑战' : '未解锁';
    const label = '第 ' + number + ' 关';
    const icon = el('span', {
      className: state === 'locked' ? 'stage-lock' : 'stage-icon',
      text: state === 'done' ? '✓' : unlocked ? '➜' : '',
      attrs: { 'aria-hidden': 'true' },
    });
    const tile = el('button', {
      className: 'stage-tile' + (final ? ' stage-final' : ''),
      attrs: { type: 'button', 'data-state': state, 'aria-label': label + ' · ' + name + '，' + (best !== undefined ? '已通关，' : '') + status },
    });
    if (final) {
      tile.append(el('span', {}, [el('strong', { text: label + ' · ' + name }), el('small', { text: '完整地图 · 孤勇者榜' })]),
        el('span', { className: 'stage-end' }, [el('span', { text: status }), icon]));
      main.append(tile);
    } else {
      tile.append(el('span', { className: 'stage-number' }, [el('span', { text: label }), icon]),
        el('strong', { text: name }), el('small', { text: status }));
      grid.append(tile);
    }
    tile.addEventListener('click', () => {
      if (unlocked) enter(number);
      else setText(rule, '不看广告通关第 ' + index + ' 关「' + STAGES[index - 1][1] + '」后解锁。');
    });
  });
  const page = el('main', { className: 'stage-home' }, [el('div', { className: 'stage-board' }, [cover, main])]);
  host.replaceChildren(page);
}
