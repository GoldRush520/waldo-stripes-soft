/** PropDefs for harbour gear. */
import type { PropDef } from '../registry';
import { def, feet } from './defs';
import { bollard, cleat, fender, fishCrate, fishCrateStack, lobsterPot, lobsterPotStack, mooringPile, netHeap, ropeCoil } from './harbour-small';
import { anchor, canBuoy, gangway, lifeRingPost, markerBuoy, netFrame, oarRack, tideBoard, wheelSign, winch } from './harbour-gear';
import { CRANE_BASE, barrelRaft, harbourCrane } from './harbour-crane';

export const HARBOUR_PROPS: readonly PropDef[] = [
  def({ key: 'harbour.bollard', build: bollard, footprint: [0.34, 0.34], family: 'harbour', size: 'clutter', tags: ['quay'] }),
  def({ key: 'harbour.cleat', build: cleat, footprint: [0.14, 0.42], family: 'harbour', size: 'clutter', tags: ['quay'] }),
  def({ key: 'harbour.ropeCoil', build: ropeCoil, footprint: [0.8, 0.75], family: 'harbour', size: 'furniture', tags: ['quay', 'clutter'] }),
  def({ key: 'harbour.lobsterPot', build: (q) => lobsterPot(q), footprint: [0.62, 0.5], family: 'harbour', size: 'clutter', tags: ['quay', 'fishing'] }),
  def({ key: 'harbour.lobsterPots', build: lobsterPotStack, footprint: [1.4, 0.7], family: 'harbour', size: 'furniture', tags: ['quay', 'fishing'] }),
  def({ key: 'harbour.netHeap', build: netHeap, footprint: [1.5, 1.2], family: 'harbour', size: 'furniture', tags: ['quay', 'fishing'] }),
  def({ key: 'harbour.fishCrate', build: (q) => fishCrate(q), footprint: [0.6, 0.4], family: 'harbour', size: 'clutter', tags: ['quay', 'fishing', 'market'] }),
  def({ key: 'harbour.fishCrates', build: fishCrateStack, footprint: [1.25, 0.82], family: 'harbour', size: 'furniture', tags: ['quay', 'fishing', 'market'] }),
  def({ key: 'harbour.anchor', build: anchor, footprint: [0.95, 0.4], family: 'harbour', size: 'furniture', tags: ['quay', 'decor'] }),
  def({ key: 'harbour.buoy.can', build: canBuoy, footprint: [0.7, 0.7], family: 'harbour', size: 'furniture', waterline: true, tags: ['water'] }),
  def({ key: 'harbour.buoy.marker', build: markerBuoy, footprint: [0.75, 0.75], family: 'harbour', size: 'furniture', waterline: true, tags: ['water'] }),
  def({ key: 'harbour.lifeRingPost', build: lifeRingPost, footprint: [0.7, 0.3], family: 'harbour', size: 'furniture', tags: ['quay', 'safety'] }),
  def({ key: 'harbour.wheelSign', build: wheelSign, footprint: [1.25, 0.2], family: 'harbour', size: 'furniture', tags: ['quay', 'sign'] }),
  def({ key: 'harbour.winch', build: winch, footprint: [0.85, 0.6], family: 'harbour', size: 'furniture', tags: ['quay'] }),
  def({ key: 'harbour.gangway', build: gangway, footprint: [0.75, 4.0], family: 'harbour', size: 'furniture', tags: ['quay'] }),
  def({ key: 'harbour.oarRack', build: oarRack, footprint: [1.4, 0.3], family: 'harbour', size: 'furniture', tint: 'coral', tags: ['quay'] }),
  def({ key: 'harbour.netFrame', build: netFrame, footprint: [2.7, 0.2], family: 'harbour', size: 'furniture', tags: ['quay', 'fishing', 'laundry'] }),
  def({ key: 'harbour.tideBoard', build: tideBoard, footprint: [0.3, 0.12], family: 'harbour', size: 'furniture', tags: ['quay'] }),
  def({ key: 'harbour.pile', build: mooringPile, footprint: [0.45, 0.45], family: 'harbour', size: 'clutter', tags: ['quay'] }),
  def({ key: 'harbour.fender', build: fender, footprint: [0.24, 0.24], family: 'harbour', size: 'clutter', tags: ['quay'] }),
  def({ key: 'harbour.crane', build: harbourCrane, footprint: CRANE_BASE, family: 'harbour', size: 'small', baseFootprint: true, tags: ['quay', 'landmark'] }),
  def({ key: 'harbour.barrelRaft', build: barrelRaft, footprint: [1.9, 1.9], family: 'harbour', size: 'small', waterline: true, tags: ['water'], seats: [feet(-0.4, 0.42, 0, 0), feet(0.4, 0.42, 0, 0)] }),
];
