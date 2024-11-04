import React from 'react';
import { defineMessages, useIntl } from 'react-intl';

import SvgIcon from 'soapbox/components/ui/icon/svg-icon';

const messages = defineMessages({
  load_more: { id: 'status.load_more', defaultMessage: 'Load more' },
});

interface ILoadGap {
  disabled?: boolean;
  maxId: string;
  onClick: (id: string) => void;
}

const LoadGap: React.FC<ILoadGap> = ({ disabled, maxId, onClick }) => {
  const intl = useIntl();

  const handleClick = () => onClick(maxId);

  return (
    <button className='m-0 box-border block w-full border-0 bg-transparent p-4 text-gray-900' disabled={disabled} onClick={handleClick} aria-label={intl.formatMessage(messages.load_more)}>
      <SvgIcon className='mx-auto' src={require('@tabler/icons/outline/dots.svg')} />
    </button>
  );
};

export default LoadGap;
