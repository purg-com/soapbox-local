/**
 * Group normalizer:
 * Converts API groups into our internal format.
 */
import {
  Map as ImmutableMap,
  List as ImmutableList,
  Record as ImmutableRecord,
  fromJS,
} from 'immutable';

import avatarMissing from 'soapbox/assets/images/avatar-missing.png';
import headerMissing from 'soapbox/assets/images/header-missing.png';
import { normalizeEmoji } from 'soapbox/normalizers/emoji.ts';

import type { Emoji, GroupRelationship } from 'soapbox/types/entities.ts';

export const GroupRecord = ImmutableRecord({
  avatar: '',
  avatar_static: '',
  created_at: '',
  deleted_at: null,
  display_name: '',
  domain: '',
  emojis: [] as Emoji[],
  group_visibility: '',
  header: '',
  header_static: '',
  id: '',
  locked: false,
  membership_required: false,
  members_count: 0,
  owner: {
    id: '',
  },
  note: '',
  statuses_visibility: 'public',
  slug: '',
  tags: [],
  uri: '',
  url: '',

  // Internal fields
  relationship: null as GroupRelationship | null,
});

/** Add avatar, if missing */
const normalizeAvatar = (group: ImmutableMap<string, any>) => {
  const avatar = group.get('avatar');
  const avatarStatic = group.get('avatar_static');

  return group.withMutations(group => {
    group.set('avatar', avatar || avatarStatic || avatarMissing);
    group.set('avatar_static', avatarStatic || avatar || avatarMissing);
  });
};

/** Add header, if missing */
const normalizeHeader = (group: ImmutableMap<string, any>) => {
  const header = group.get('header');
  const headerStatic = group.get('header_static');

  return group.withMutations(group => {
    group.set('header', header || headerStatic || headerMissing);
    group.set('header_static', headerStatic || header || headerMissing);
  });
};

/** Normalize emojis */
const normalizeEmojis = (entity: ImmutableMap<string, any>) => {
  const emojis = entity.get('emojis', ImmutableList()).map(normalizeEmoji);
  return entity.set('emojis', emojis.toArray());
};

/** Set display name from username, if applicable */
const fixDisplayName = (group: ImmutableMap<string, any>) => {
  const displayName = group.get('display_name') || '';
  return group.set('display_name', displayName.trim().length === 0 ? group.get('username') : displayName);
};

const getDomainFromURL = (group: ImmutableMap<string, any>): string => {
  try {
    const url = group.get('url');
    return new URL(url).host;
  } catch {
    return '';
  }
};

export const guessFqn = (group: ImmutableMap<string, any>): string => {
  const acct = group.get('acct', '');
  const [user, domain] = acct.split('@');

  if (domain) {
    return acct;
  } else {
    return [user, getDomainFromURL(group)].join('@');
  }
};

const normalizeFqn = (group: ImmutableMap<string, any>) => {
  const fqn = group.get('fqn') || guessFqn(group);
  return group.set('fqn', fqn);
};

const normalizeLocked = (group: ImmutableMap<string, any>) => {
  const locked = group.get('locked') || group.get('group_visibility') === 'members_only';
  return group.set('locked', locked);
};

/** Rewrite `<p></p>` to empty string. */
const fixNote = (group: ImmutableMap<string, any>) => {
  if (group.get('note') === '<p></p>') {
    return group.set('note', '');
  } else {
    return group;
  }
};

export const normalizeGroup = (group: Record<string, any>) => {
  return GroupRecord(
    ImmutableMap(fromJS(group)).withMutations(group => {
      normalizeEmojis(group);
      normalizeAvatar(group);
      normalizeHeader(group);
      normalizeFqn(group);
      normalizeLocked(group);
      fixDisplayName(group);
      fixNote(group);
    }),
  );
};
