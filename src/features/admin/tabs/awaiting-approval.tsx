import { useState, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';

import { fetchUsers } from 'soapbox/actions/admin.ts';
import ScrollableList from 'soapbox/components/scrollable-list.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import UnapprovedAccount from '../components/unapproved-account.tsx';

const messages = defineMessages({
  heading: { id: 'column.admin.awaiting_approval', defaultMessage: 'Awaiting Approval' },
  emptyMessage: { id: 'admin.awaiting_approval.empty_message', defaultMessage: 'There is nobody waiting for approval. When a new user signs up, you can review them here.' },
});

const AwaitingApproval: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const accountIds = useAppSelector(state => state.admin.awaitingApproval);

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(fetchUsers({ pending: true }))
      .then(() => setLoading(false))
      .catch(() => {});
  }, []);

  const showLoading = isLoading && accountIds.count() === 0;

  return (
    <ScrollableList
      isLoading={isLoading}
      showLoading={showLoading}
      scrollKey='awaiting-approval'
      emptyMessage={intl.formatMessage(messages.emptyMessage)}
      listClassName='divide-y divide-solid divide-gray-200 dark:divide-gray-800'
    >
      {accountIds.map(id => (
        <div key={id} className='px-5 py-4'>
          <UnapprovedAccount accountId={id} />
        </div>
      ))}
    </ScrollableList>
  );
};

export default AwaitingApproval;
