import helpIcon from '@tabler/icons/outline/help.svg';
import clsx from 'clsx';
import { useRef, useState } from 'react';
import { defineMessages, FormattedMessage, useIntl } from 'react-intl';
import { Link, Redirect } from 'react-router-dom';

import { logIn, MfaRequiredError, verifyCredentials } from 'soapbox/actions/auth.ts';
import { fetchInstance } from 'soapbox/actions/instance.ts';
import { openModal } from 'soapbox/actions/modals.ts';
import { openSidebar } from 'soapbox/actions/sidebar.ts';
import SiteLogo from 'soapbox/components/site-logo.tsx';
import Avatar from 'soapbox/components/ui/avatar.tsx';
import Button from 'soapbox/components/ui/button.tsx';
import Counter from 'soapbox/components/ui/counter.tsx';
import Form from 'soapbox/components/ui/form.tsx';
import HStack from 'soapbox/components/ui/hstack.tsx';
import IconButton from 'soapbox/components/ui/icon-button.tsx';
import Input from 'soapbox/components/ui/input.tsx';
import Tooltip from 'soapbox/components/ui/tooltip.tsx';
import Search from 'soapbox/features/compose/components/search.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useFeatures } from 'soapbox/hooks/useFeatures.ts';
import { useInstance } from 'soapbox/hooks/useInstance.ts';
import { useOwnAccount } from 'soapbox/hooks/useOwnAccount.ts';
import { useRegistrationStatus } from 'soapbox/hooks/useRegistrationStatus.ts';
import { useSettingsNotifications } from 'soapbox/hooks/useSettingsNotifications.ts';

import ProfileDropdown from './profile-dropdown.tsx';

const messages = defineMessages({
  login: { id: 'navbar.login.action', defaultMessage: 'Log in' },
  username: { id: 'navbar.login.username.placeholder', defaultMessage: 'Email or username' },
  email: { id: 'navbar.login.email.placeholder', defaultMessage: 'E-mail address' },
  password: { id: 'navbar.login.password.label', defaultMessage: 'Password' },
  forgotPassword: { id: 'navbar.login.forgot_password', defaultMessage: 'Forgot password?' },
});

const Navbar = () => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const features = useFeatures();
  const instance = useInstance();
  const { isOpen } = useRegistrationStatus();
  const { account } = useOwnAccount();
  const node = useRef(null);
  const settingsNotifications = useSettingsNotifications();

  const [isLoading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [mfaToken, setMfaToken] = useState<string>();

  const onOpenSidebar = () => dispatch(openSidebar());

  const handleNostrLogin = async () => {
    dispatch(openModal('NOSTR_LOGIN'));
  };

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    setLoading(true);

    dispatch(logIn(username, password) as any)
      .then(({ access_token }: { access_token: string }) => {
        setLoading(false);

        return (
          dispatch(verifyCredentials(access_token) as any)
            // Refetch the instance for authenticated fetch
            .then(() => dispatch(fetchInstance()))
        );
      })
      .catch((error: unknown) => {
        setLoading(false);

        if (error instanceof MfaRequiredError) {
          setMfaToken(error.token);
        }
      });
  };

  if (mfaToken) {
    return <Redirect to={`/login?token=${encodeURIComponent(mfaToken)}`} />;
  }

  return (
    <nav
      className='border-b border-gray-200 bg-white shadow black:border-gray-800 black:bg-black dark:border-gray-800 dark:bg-primary-900'
      ref={node}
      data-testid='navbar'
    >
      <div className='mx-auto max-w-7xl px-2 sm:px-6 lg:px-8'>
        <div className='relative flex h-12 justify-between lg:h-16'>
          {account && (
            <div className='absolute inset-y-0 left-0 flex items-center lg:hidden rtl:left-auto rtl:right-0'>
              <button onClick={onOpenSidebar} className='relative'>
                {settingsNotifications.size ? (
                  <span className='absolute -right-3 -top-1 z-10 flex h-5 min-w-[20px] shrink-0 items-center justify-center whitespace-nowrap break-words'>
                    <Counter count={settingsNotifications.size} />
                  </span>
                ) : null}
                <Avatar src={account.avatar} size={34} />
              </button>
            </div>
          )}

          <HStack
            space={4}
            alignItems='center'
            className={clsx('flex-1 lg:items-stretch', {
              'justify-center lg:justify-start': account,
              'justify-start': !account,
            })}
          >
            <Link key='logo' to='/' data-preview-title-id='column.home' className='ml-4 flex shrink-0 items-center'>
              <SiteLogo alt='Logo' className='h-5 w-auto cursor-pointer' />
              <span className='hidden'><FormattedMessage id='tabs_bar.home' defaultMessage='Home' /></span>
            </Link>

            {account && (
              <div className='hidden flex-1 items-center justify-center px-2 lg:ml-6 lg:flex lg:justify-start'>
                <div className='hidden w-full max-w-xl lg:block lg:max-w-xs'>
                  <Search openInRoute autosuggest />
                </div>
              </div>
            )}
          </HStack>

          {instance.isSuccess && (
            <HStack space={3} alignItems='center' className='absolute inset-y-0 right-0 pr-2 lg:static lg:inset-auto lg:ml-6 lg:pr-0'>
              {account ? (
                <div className='relative hidden items-center lg:flex'>
                  <ProfileDropdown account={account}>
                    <Avatar src={account.avatar} size={34} />
                  </ProfileDropdown>
                </div>
              ) : (
                <>
                  {features.nostrSignup ? (
                    <div className='hidden items-center xl:flex'>
                      <Button
                        theme='primary'
                        onClick={handleNostrLogin}
                        disabled={isLoading}
                      >
                        {intl.formatMessage(messages.login)}
                      </Button>
                    </div>
                  ) : (
                    <Form className='hidden items-center space-x-2 xl:flex rtl:space-x-reverse' onSubmit={handleSubmit}>
                      <Input
                        required
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        type='text'
                        placeholder={intl.formatMessage(features.logInWithUsername ? messages.username : messages.email)}
                        className='max-w-[200px]'
                      />

                      <Input
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        type='password'
                        placeholder={intl.formatMessage(messages.password)}
                        className='max-w-[200px]'
                      />

                      <Link to='/reset-password'>
                        <Tooltip text={intl.formatMessage(messages.forgotPassword)}>
                          <IconButton
                            src={helpIcon}
                            className='cursor-pointer bg-transparent text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-200'
                            iconClassName='h-5 w-5'
                          />
                        </Tooltip>
                      </Link>

                      <Button
                        theme='primary'
                        type='submit'
                        disabled={isLoading}
                      >
                        {intl.formatMessage(messages.login)}
                      </Button>
                    </Form>
                  )}

                  <div className='space-x-1.5 xl:hidden'>
                    <Button
                      theme='tertiary'
                      size='sm'
                      {...(features.nostrSignup ? { onClick: handleNostrLogin } : { to: '/login' })}
                    >
                      <FormattedMessage id='account.login' defaultMessage='Log in' />
                    </Button>

                    {(isOpen) && (
                      <Button theme='primary' to='/signup' size='sm'>
                        <FormattedMessage id='account.register' defaultMessage='Sign up' />
                      </Button>
                    )}
                  </div>
                </>
              )}
            </HStack>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
