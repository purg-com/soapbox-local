import mapPinIcon from '@tabler/icons/outline/map-pin.svg';
import trashIcon from '@tabler/icons/outline/trash.svg';
import xIcon from '@tabler/icons/outline/x.svg';
import { useEffect, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';

import {
  changeEditEventApprovalRequired,
  changeEditEventDescription,
  changeEditEventEndTime,
  changeEditEventHasEndTime,
  changeEditEventName,
  changeEditEventStartTime,
  changeEditEventLocation,
  uploadEventBanner,
  undoUploadEventBanner,
  submitEvent,
  fetchEventParticipationRequests,
  rejectEventParticipationRequest,
  authorizeEventParticipationRequest,
  cancelEventCompose,
} from 'soapbox/actions/events.ts';
import { closeModal, openModal } from 'soapbox/actions/modals.ts';
import { ADDRESS_ICONS } from 'soapbox/components/autosuggest-location.tsx';
import LocationSearch from 'soapbox/components/location-search.tsx';
import { checkEventComposeContent } from 'soapbox/components/modal-root.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import { Datetime } from 'soapbox/components/ui/datetime.tsx';
import FormGroup from 'soapbox/components/ui/form-group.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Icon from 'soapbox/components/ui/icon.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Modal from 'soapbox/components/ui/modal.tsx';
import Spinner from 'soapbox/components/ui/spinner.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Tabs from 'soapbox/components/ui/tabs.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Toggle from 'soapbox/components/ui/toggle.tsx';
import AccountContainer from 'soapbox/containers/account-container.tsx';
import { ComposeEditor } from 'soapbox/features/ui/util/async-components.ts';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

import UploadButton from './upload-button.tsx';

const messages = defineMessages({
  eventNamePlaceholder: { id: 'compose_event.fields.name_placeholder', defaultMessage: 'Name' },
  eventDescriptionPlaceholder: { id: 'compose_event.fields.description_placeholder', defaultMessage: 'Description' },
  eventStartTimePlaceholder: { id: 'compose_event.fields.start_time_placeholder', defaultMessage: 'Event begins on…' },
  eventEndTimePlaceholder: { id: 'compose_event.fields.end_time_placeholder', defaultMessage: 'Event ends on…' },
  resetLocation: { id: 'compose_event.reset_location', defaultMessage: 'Reset location' },
  edit: { id: 'compose_event.tabs.edit', defaultMessage: 'Edit details' },
  pending: { id: 'compose_event.tabs.pending', defaultMessage: 'Manage requests' },
  authorize: { id: 'compose_event.participation_requests.authorize', defaultMessage: 'Authorize' },
  reject: { id: 'compose_event.participation_requests.reject', defaultMessage: 'Reject' },
  confirm: { id: 'confirmations.delete.confirm', defaultMessage: 'Delete' },
  cancelEditing: { id: 'confirmations.cancel_editing.confirm', defaultMessage: 'Cancel editing' },
});

interface IAccount {
  eventId: string;
  id: string;
  participationMessage: string | null;
}

const Account: React.FC<IAccount> = ({ eventId, id, participationMessage }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const handleAuthorize = () => {
    dispatch(authorizeEventParticipationRequest(eventId, id));
  };

  const handleReject = () => {
    dispatch(rejectEventParticipationRequest(eventId, id));
  };

  return (
    <AccountContainer
      id={id}
      note={participationMessage || undefined}
      action={
        <HStack space={2}>
          <Button
            theme='secondary'
            size='sm'
            text={intl.formatMessage(messages.authorize)}
            onClick={handleAuthorize}
          />
          <Button
            theme='danger'
            size='sm'
            text={intl.formatMessage(messages.reject)}
            onClick={handleReject}
          />
        </HStack>
      }
    />
  );
};

interface IComposeEventModal {
  onClose: (type?: string) => void;
}

const ComposeEventModal: React.FC<IComposeEventModal> = ({ onClose }) => {
  const intl = useIntl();
  const dispatch = useAppDispatch();

  const [tab, setTab] = useState<'edit' | 'pending'>('edit');
  const [text, setText] = useState('');

  const banner = useAppSelector((state) => state.compose_event.banner);
  const isUploading = useAppSelector((state) => state.compose_event.is_uploading);

  const name = useAppSelector((state) => state.compose_event.name);
  const startTime = useAppSelector((state) => state.compose_event.start_time);
  const endTime = useAppSelector((state) => state.compose_event.end_time);
  const approvalRequired = useAppSelector((state) => state.compose_event.approval_required);
  const location = useAppSelector((state) => state.compose_event.location);

  const id = useAppSelector((state) => state.compose_event.id);

  const isSubmitting = useAppSelector((state) => state.compose_event.is_submitting);

  const onChangeName: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeEditEventName(target.value));
  };

  const onChangeStartTime = (date: Date) => {
    dispatch(changeEditEventStartTime(date));
  };

  const onChangeEndTime = (date: Date) => {
    dispatch(changeEditEventEndTime(date));
  };

  const onChangeHasEndTime: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeEditEventHasEndTime(target.checked));
  };

  const onChangeApprovalRequired: React.ChangeEventHandler<HTMLInputElement> = ({ target }) => {
    dispatch(changeEditEventApprovalRequired(target.checked));
  };

  const onChangeLocation = (value: string | null) => {
    dispatch(changeEditEventLocation(value));
  };

  const onClickClose = () => {
    dispatch((dispatch, getState) => {
      if (checkEventComposeContent(getState().compose_event)) {
        dispatch(openModal('CONFIRM', {
          icon: trashIcon,
          heading: id
            ? <FormattedMessage id='confirmations.cancel_event_editing.heading' defaultMessage='Cancel event editing' />
            : <FormattedMessage id='confirmations.delete_event.heading' defaultMessage='Delete event' />,
          message: id
            ? <FormattedMessage id='confirmations.cancel_event_editing.message' defaultMessage='Are you sure you want to cancel editing this event? All changes will be lost.' />
            : <FormattedMessage id='confirmations.delete_event.message' defaultMessage='Are you sure you want to delete this event?' />,
          confirm: intl.formatMessage(messages.confirm),
          onConfirm: () => {
            dispatch(closeModal('COMPOSE_EVENT'));
            dispatch(cancelEventCompose());
          },
        }));
      } else {
        onClose('COMPOSE_EVENT');
      }
    });
  };

  const handleFiles = (files: FileList) => {
    dispatch(uploadEventBanner(files[0], intl));
  };

  const handleClearBanner = () => {
    dispatch(undoUploadEventBanner());
  };

  const handleSubmit = () => {
    dispatch(changeEditEventDescription(text));
    dispatch(submitEvent());
  };

  const accounts = useAppSelector((state) => state.user_lists.event_participation_requests.get(id!)?.items);

  useEffect(() => {
    if (id) dispatch(fetchEventParticipationRequests(id));
  }, []);

  const renderLocation = () => location && (
    <HStack className='h-[38px] text-gray-700 dark:text-gray-500' alignItems='center' space={2}>
      <Icon src={ADDRESS_ICONS[location.type] || mapPinIcon} />
      <Stack className='grow'>
        <Text>{location.description}</Text>
        <Text theme='muted' size='xs'>{[location.street, location.locality, location.country].filter(val => val?.trim()).join(' · ')}</Text>
      </Stack>
      <IconButton title={intl.formatMessage(messages.resetLocation)} src={xIcon} onClick={() => onChangeLocation(null)} />
    </HStack>
  );

  const renderTabs = () => {
    const items = [
      {
        text: intl.formatMessage(messages.edit),
        action: () => setTab('edit'),
        name: 'edit',
      },
      {
        text: intl.formatMessage(messages.pending),
        action: () => setTab('pending'),
        name: 'pending',
      },
    ];

    return <Tabs items={items} activeItem={tab} />;
  };

  let body;
  if (tab === 'edit') body = (
    <Form>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.banner_label' defaultMessage='Event banner' />}
      >
        <div className='dark:sm:shadow-inset relative flex h-24 items-center justify-center overflow-hidden rounded-lg bg-primary-100 text-primary-500 dark:bg-gray-800 dark:text-white sm:h-32 sm:shadow'>
          {banner ? (
            <>
              <img className='size-full object-cover' src={banner.url} alt='' />
              <IconButton className='absolute right-2 top-2' src={xIcon} onClick={handleClearBanner} />
            </>
          ) : (
            <UploadButton disabled={isUploading} onSelectFile={handleFiles} />
          )}
        </div>
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.name_label' defaultMessage='Event name' />}
      >
        <Input
          type='text'
          placeholder={intl.formatMessage(messages.eventNamePlaceholder)}
          value={name}
          onChange={onChangeName}
        />
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.description_label' defaultMessage='Event description' />}
      >
        <ComposeEditor
          className='block w-full rounded-md border border-gray-400 bg-white px-3 py-2 text-base text-gray-900 ring-1 placeholder:text-gray-600 focus-within:border-primary-500 focus-within:ring-primary-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-800 dark:placeholder:text-gray-600 dark:focus-within:border-primary-500 dark:focus-within:ring-primary-500 sm:text-sm'
          placeholderClassName='pt-2'
          composeId='compose-event-modal'
          placeholder={intl.formatMessage(messages.eventDescriptionPlaceholder)}
          handleSubmit={handleSubmit}
          onChange={setText}
        />
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.location_label' defaultMessage='Event location' />}
      >
        {location ? renderLocation() : (
          <LocationSearch
            onSelected={onChangeLocation}
          />
        )}
      </FormGroup>
      <FormGroup
        labelText={<FormattedMessage id='compose_event.fields.start_time_label' defaultMessage='Event start date' />}
      >
        <Datetime
          value={startTime}
          onChange={onChangeStartTime}
          placeholder={intl.formatMessage(messages.eventStartTimePlaceholder)}
        />
      </FormGroup>
      <HStack alignItems='center' space={2}>
        <Toggle
          checked={!!endTime}
          onChange={onChangeHasEndTime}
        />
        <Text tag='span' theme='muted'>
          <FormattedMessage id='compose_event.fields.has_end_time' defaultMessage='The event has end date' />
        </Text>
      </HStack>
      {endTime && (
        <FormGroup
          labelText={<FormattedMessage id='compose_event.fields.end_time_label' defaultMessage='Event end date' />}
        >
          <Datetime
            value={endTime}
            onChange={onChangeEndTime}
            placeholder={intl.formatMessage(messages.eventEndTimePlaceholder)}
          />
        </FormGroup>
      )}
      {!id && (
        <HStack alignItems='center' space={2}>
          <Toggle
            checked={approvalRequired}
            onChange={onChangeApprovalRequired}
          />
          <Text tag='span' theme='muted'>
            <FormattedMessage id='compose_event.fields.approval_required' defaultMessage='I want to approve participation requests manually' />
          </Text>
        </HStack>
      )}
    </Form>
  );
  else body = accounts ? (
    <Stack space={3}>
      {accounts.size > 0 ? (
        accounts.map(({ account, participation_message }) =>
          <Account key={account} eventId={id!} id={account} participationMessage={participation_message} />,
        )
      ) : (
        <FormattedMessage id='empty_column.event_participant_requests' defaultMessage='There are no pending event participation requests.' />
      )}
    </Stack>
  ) : <Spinner />;

  return (
    <Modal
      title={id
        ? <FormattedMessage id='navigation_bar.compose_event' defaultMessage='Manage event' />
        : <FormattedMessage id='navigation_bar.create_event' defaultMessage='Create new event' />}
      confirmationAction={tab === 'edit' ? handleSubmit : undefined}
      confirmationText={id
        ? <FormattedMessage id='compose_event.update' defaultMessage='Update' />
        : <FormattedMessage id='compose_event.create' defaultMessage='Create' />}
      confirmationDisabled={isSubmitting}
      onClose={onClickClose}
    >
      <Stack space={2}>
        {id && renderTabs()}
        {body}
      </Stack>
    </Modal>
  );
};

export default ComposeEventModal;
