import { useEffect } from 'react';
import { FormattedMessage } from 'react-intl';

import { fetchPatronInstance } from 'soapbox/actions/patron.ts';
import Button from 'soapbox/components/ui/button.tsx';
import ProgressBar from 'soapbox/components/ui/progress-bar.tsx';
import Stack from 'soapbox/components/ui/stack.tsx';
import Text from 'soapbox/components/ui/text.tsx';
import Widget from 'soapbox/components/ui/widget.tsx';
import { useAppDispatch } from 'soapbox/hooks/useAppDispatch.ts';
import { useAppSelector } from 'soapbox/hooks/useAppSelector.ts';

/** Open link in a new tab. */
// https://stackoverflow.com/a/28374344/8811886
const openInNewTab = (href: string): void => {
  Object.assign(document.createElement('a'), {
    target: '_blank',
    href: href,
  }).click();
};

/** Formats integer to USD string. */
const moneyFormat = (amount: number): string => (
  new Intl
    .NumberFormat('en-US', {
      style: 'currency',
      currency: 'usd',
      notation: 'compact',
    })
    .format(amount / 100)
);

const FundingPanel: React.FC = () => {
  const dispatch = useAppDispatch();
  const patron = useAppSelector(state => state.patron.instance);

  useEffect(() => {
    dispatch(fetchPatronInstance());
  }, []);

  if (patron.funding.isEmpty() || patron.goals.isEmpty()) return null;

  const amount = patron.getIn(['funding', 'amount']) as number;
  const goal = patron.getIn(['goals', '0', 'amount']) as number;
  const goalText = patron.getIn(['goals', '0', 'text']) as string;
  const goalReached = amount >= goal;
  let ratioText;

  if (goalReached) {
    // eslint-disable-next-line formatjs/no-literal-string-in-jsx
    ratioText = <><strong>{moneyFormat(goal)}</strong> per month <span>&mdash; reached!</span></>;
  } else {
    // eslint-disable-next-line formatjs/no-literal-string-in-jsx
    ratioText = <><strong>{moneyFormat(amount)} out of {moneyFormat(goal)}</strong> per month</>;
  }

  const handleDonateClick = () => {
    openInNewTab(patron.url);
  };

  return (
    <Widget
      title={<FormattedMessage id='patron.title' defaultMessage='Funding Goal' />}
      onActionClick={handleDonateClick}
    >
      <Stack space={4}>
        <Stack space={2}>
          <Text>{ratioText}</Text>
          <ProgressBar progress={amount / goal} />
        </Stack>

        <Stack space={2}>
          <Text theme='muted'>{goalText}</Text>
          <Button block theme='primary' onClick={handleDonateClick}>
            <FormattedMessage id='patron.donate' defaultMessage='Donate' />
          </Button>
        </Stack>
      </Stack>
    </Widget>
  );
};

export default FundingPanel;
