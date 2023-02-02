import React from 'react';

import Blurhash from 'soapbox/components/blurhash';
import { Icon } from 'soapbox/components/ui';

import type { Attachment } from 'soapbox/types/entities';

interface IChatUpload {
  attachment: Attachment,
  onDelete?(): void,
}

/** An attachment uploaded to the chat composer, before sending. */
const ChatUpload: React.FC<IChatUpload> = ({ attachment, onDelete }) => {
  return (
    <div className='relative inline-block rounded-lg overflow-hidden isolate'>
      <Blurhash hash={attachment.blurhash} className='absolute inset-0 w-full h-full -z-10' />

      <div className='absolute right-[6px] top-[6px]'>
        <RemoveButton onClick={onDelete} />
      </div>

      <img
        className='w-24 h-24'
        key={attachment.id}
        src={attachment.url}
        alt=''
      />
    </div>
  );
};

interface IRemoveButton {
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

/** Floating button to remove an attachment. */
const RemoveButton: React.FC<IRemoveButton> = ({ onClick }) => {
  return (
    <button
      type='button'
      onClick={onClick}
      className='bg-secondary-500 w-5 h-5 p-1 rounded-full flex items-center justify-center'
    >
      <Icon
        className='w-4 h-4 text-white'
        src={require('@tabler/icons/x.svg')}
      />
    </button>
  );
};

export default ChatUpload;