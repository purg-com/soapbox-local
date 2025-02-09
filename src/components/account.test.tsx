import { describe, expect, it } from 'vitest';

import { buildAccount } from 'soapbox/jest/factory.ts';
import { render, screen } from 'soapbox/jest/test-helpers.tsx';

import Account from './account.tsx';

describe('<Account />', () => {
  it('renders account name and username', () => {
    const account = buildAccount({
      id: '1',
      acct: 'justin-username',
      display_name: 'Justin L',
      avatar: 'test.jpg',
    });

    const store = {
      accounts: {
        '1': account,
      },
    };

    render(<Account account={account} />, undefined, store);
    expect(screen.getByTestId('account')).toHaveTextContent('Justin L');
    expect(screen.getByTestId('account')).toHaveTextContent(/justin-username/i);
  });

  describe('verification badge', () => {
    it('renders verification badge', () => {
      const account = buildAccount({
        id: '1',
        acct: 'justin-username',
        display_name: 'Justin L',
        avatar: 'test.jpg',
        verified: true,
      });

      const store = {
        accounts: {
          '1': account,
        },
      };

      render(<Account account={account} />, undefined, store);
      expect(screen.getByTestId('verified-badge')).toBeInTheDocument();
    });

    it('does not render verification badge', () => {
      const account = buildAccount({
        id: '1',
        acct: 'justin-username',
        display_name: 'Justin L',
        avatar: 'test.jpg',
        verified: false,
      });

      const store = {
        accounts: {
          '1': account,
        },
      };

      render(<Account account={account} />, undefined, store);
      expect(screen.queryAllByTestId('verified-badge')).toHaveLength(0);
    });
  });
});
