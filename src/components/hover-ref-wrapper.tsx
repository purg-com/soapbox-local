import clsx from 'clsx';
import { debounce } from 'es-toolkit';
import { useRef } from 'react';

import { fetchAccount } from 'soapbox/actions/accounts.ts';
import {
  openProfileHoverCard,
  closeProfileHoverCard,
} from 'soapbox/actions/profile-hover-card.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { isMobile } from 'soapbox/is-mobile.ts';

const showProfileHoverCard = debounce((dispatch, ref, accountId) => {
  dispatch(openProfileHoverCard(ref, accountId));
}, 600);

interface IHoverRefWrapper {
  accountId: string;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

/** Makes a profile hover card appear when the wrapped element is hovered. */
export const HoverRefWrapper: React.FC<IHoverRefWrapper> = ({ accountId, children, inline = false, className }) => {
  const dispatch = useAppDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const Elem: keyof JSX.IntrinsicElements = inline ? 'span' : 'div';

  const handleMouseEnter = () => {
    if (!isMobile(window.innerWidth)) {
      dispatch(fetchAccount(accountId));
      showProfileHoverCard(dispatch, ref, accountId);
    }
  };

  const handleMouseLeave = () => {
    showProfileHoverCard.cancel();
    setTimeout(() => dispatch(closeProfileHoverCard()), 300);
  };

  const handleClick = () => {
    showProfileHoverCard.cancel();
    dispatch(closeProfileHoverCard(true));
  };

  return (
    <Elem
      ref={ref}
      className={clsx(className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      {children}
    </Elem>
  );
};

export { HoverRefWrapper as default, showProfileHoverCard };
