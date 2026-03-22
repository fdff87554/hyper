import {produce} from 'immer';
import {v4 as uuidv4} from 'uuid';

import {SESSION_ADD, SESSION_SET_ACTIVE} from '../../typings/constants/sessions';
import type {SessionAddAction} from '../../typings/constants/sessions';
import {TERM_GROUP_EXIT, TERM_GROUP_RESIZE} from '../../typings/constants/term-groups';
import type {ITermGroup, ITermState, ITermGroups, ITermGroupReducer} from '../../typings/hyper';
import {decorateTermGroupsReducer} from '../utils/plugins';
import findBySession from '../utils/term-groups';

const MIN_SIZE = 0.05;
const initialState: ITermState = {
  termGroups: {},
  activeSessions: {},
  activeRootGroup: null
};

function TermGroup(obj: Partial<ITermGroup>): ITermGroup {
  return {
    uid: '',
    sessionUid: null,
    parentUid: null,
    direction: null,
    sizes: null,
    children: [],
    ...obj
  };
}

// Recurse upwards until we find a root term group (no parent).
const findRootGroup = (termGroups: ITermGroups, uid: string): ITermGroup => {
  const current = termGroups[uid];
  if (!current.parentUid) {
    return current;
  }

  return findRootGroup(termGroups, current.parentUid);
};

const setActiveGroup = (state: ITermState, action: {uid: string}) => {
  if (!action.uid) {
    state.activeRootGroup = null;
    return;
  }

  const childGroup = findBySession(state, action.uid)!;
  const rootGroup = findRootGroup(state.termGroups, childGroup.uid);
  state.activeRootGroup = rootGroup.uid;
  state.activeSessions[rootGroup.uid] = action.uid;
};

// Reduce existing sizes to fit a new split:
const insertRebalance = (oldSizes: number[], index: number) => {
  const newSize = 1 / (oldSizes.length + 1);
  // We spread out how much each pane should be reduced
  // with based on their existing size:
  const balanced = oldSizes.map((size) => size - newSize * size);
  return [...balanced.slice(0, index), newSize, ...balanced.slice(index)];
};

// Spread out the removed size to all the existing sizes:
const removalRebalance = (oldSizes: number[], index: number) => {
  const removedSize = oldSizes[index];
  const increase = removedSize / (oldSizes.length - 1);
  return oldSizes.filter((_size, i) => i !== index).map((size) => size + increase);
};

const splitGroup = (state: ITermState, action: SessionAddAction) => {
  const {splitDirection, uid, activeUid} = action;
  const activeGroup = findBySession(state, activeUid!)!;
  // If we're splitting in the same direction as the current active
  // group's parent - or if it's the first split for that group -
  // we want the parent to get another child:
  let parentGroup = activeGroup.parentUid ? state.termGroups[activeGroup.parentUid] : activeGroup;
  // If we're splitting in a different direction, we want the current
  // active group to become a new parent instead:
  if (parentGroup.direction && parentGroup.direction !== splitDirection) {
    parentGroup = activeGroup;
  }

  // If the group has a session (i.e. we're creating a new parent)
  // we need to create two new groups,
  // one for the existing session and one for the new split:
  //                          P
  //      P      ->         /   \
  //                       G     G
  const newSession = TermGroup({
    uid: uuidv4(),
    sessionUid: uid,
    parentUid: parentGroup.uid
  });

  state.termGroups[newSession.uid] = newSession;
  if (parentGroup.sessionUid) {
    const existingSession = TermGroup({
      uid: uuidv4(),
      sessionUid: parentGroup.sessionUid,
      parentUid: parentGroup.uid
    });

    state.termGroups[existingSession.uid] = existingSession;
    Object.assign(state.termGroups[parentGroup.uid], {
      sessionUid: '',
      direction: splitDirection,
      children: [existingSession.uid, newSession.uid]
    });
    return;
  }

  const {children} = parentGroup;
  // Insert the new child pane right after the active one:
  const index = children.indexOf(activeGroup.uid) + 1;
  const newChildren = [...children.slice(0, index), newSession.uid, ...children.slice(index)];
  Object.assign(state.termGroups[parentGroup.uid], {
    direction: splitDirection,
    children: newChildren
  });

  if (parentGroup.sizes) {
    const newSizes = insertRebalance(parentGroup.sizes, index);
    state.termGroups[parentGroup.uid].sizes = newSizes;
  }
};

// Replace the parent by the given child in the tree,
// used when we remove another child and we're left
// with a one-to-one mapping between parent and child.
const replaceParent = (state: ITermState, parent: ITermGroup, child: ITermGroup) => {
  if (parent.parentUid) {
    const parentParent = state.termGroups[parent.parentUid];
    // If the parent we're replacing has a parent,
    // we need to change the uid in its children array
    // with `child`:
    parentParent.children = parentParent.children.map((uid: string) => (uid === parent.uid ? child.uid : uid));
  } else {
    // This means the given child will be
    // a root group, so we need to set it up as such:
    const activeSession = state.activeSessions[parent.uid];
    delete state.activeSessions[parent.uid];
    state.activeSessions[child.uid] = activeSession;
    state.activeRootGroup = child.uid;
  }

  delete state.termGroups[parent.uid];
  state.termGroups[child.uid].parentUid = parent.parentUid;
};

const removeGroup = (state: ITermState, uid: string) => {
  const group = state.termGroups[uid];
  // when close tab with multiple panes, it remove group from parent to child. so maybe the parentUid exists but parent group have removed.
  // it's safe to remove the group.
  if (group.parentUid && state.termGroups[group.parentUid]) {
    const parent = state.termGroups[group.parentUid];
    const newChildren = parent.children.filter((childUid) => childUid !== uid);
    if (newChildren.length === 1) {
      // Since we only have one child left,
      // we can merge the parent and child into one group:
      const child = state.termGroups[newChildren[0]];
      replaceParent(state, parent, child);
    } else {
      state.termGroups[group.parentUid].children = newChildren;
      if (parent.sizes) {
        const childIndex = parent.children.indexOf(uid);
        const newSizes = removalRebalance(parent.sizes, childIndex);
        state.termGroups[group.parentUid].sizes = newSizes;
      }
    }
  }

  delete state.termGroups[uid];
  delete state.activeSessions[uid];
};

const resizeGroup = (state: ITermState, uid: string, sizes: number[]) => {
  // Make sure none of the sizes fall below MIN_SIZE:
  if (sizes.find((size) => size < MIN_SIZE)) {
    return;
  }

  state.termGroups[uid].sizes = sizes;
};

const reducer: ITermGroupReducer = (state = initialState, action) =>
  produce(state, (draft) => {
    switch (action.type) {
      case SESSION_ADD: {
        if (action.splitDirection) {
          splitGroup(draft, action);
          setActiveGroup(draft, action);
          return;
        }

        const uid = uuidv4();
        const termGroup = TermGroup({
          uid,
          sessionUid: action.uid
        });

        draft.termGroups[uid] = termGroup;
        draft.activeSessions[uid] = action.uid;
        draft.activeRootGroup = uid;
        return;
      }
      case SESSION_SET_ACTIVE:
        setActiveGroup(draft, action);
        return;
      case TERM_GROUP_RESIZE:
        resizeGroup(draft, action.uid, action.sizes);
        return;
      case TERM_GROUP_EXIT:
        removeGroup(draft, action.uid);
        return;
      default:
        return;
    }
  });

export default decorateTermGroupsReducer(reducer);
