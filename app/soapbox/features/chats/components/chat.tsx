import React from 'react';

import RelativeTimestamp from 'soapbox/components/relative_timestamp';
import { Avatar, HStack, Stack, Text } from 'soapbox/components/ui';
import VerificationBadge from 'soapbox/components/verification_badge';

import type { IChat } from 'soapbox/queries/chats';

interface IChatInterface {
  chat: IChat,
  onClick: (chat: any) => void,
}

const Chat: React.FC<IChatInterface> = ({ chat, onClick }) => {
  // Temporary: remove once bad Staging data is removed.
  if (!chat.account) {
    return null;
  }

  return (
    <button
      key={chat.id}
      type='button'
      onClick={() => onClick(chat)}
      className='px-4 py-2 w-full flex flex-col hover:bg-gray-100 dark:hover:bg-gray-800'
    >
      <HStack alignItems='center' justifyContent='between' space={2} className='w-full'>
        <HStack alignItems='center' space={2}>
          <Avatar src={chat.account?.avatar} size={40} />

          <Stack alignItems='start'>
            <div className='flex items-center space-x-1 flex-grow'>
              <Text weight='bold' size='sm' truncate>{chat.account?.display_name || `@${chat.account.username}`}</Text>
              {chat.account?.verified && <VerificationBadge />}
            </div>

            {chat.last_message?.content && (
              <Text size='sm' weight='medium' theme='muted' truncate className='max-w-[200px]'>
                {chat.last_message?.content}
              </Text>
            )}
          </Stack>
        </HStack>

        {chat.last_message && (
          <HStack alignItems='center' space={2}>
            {chat.last_message.unread && (
              <div className='w-2 h-2 rounded-full bg-secondary-500' />
            )}

            <RelativeTimestamp timestamp={chat.last_message.created_at} size='sm' />
          </HStack>
        )}
      </HStack>
    </button>
  );
};

export default Chat;
