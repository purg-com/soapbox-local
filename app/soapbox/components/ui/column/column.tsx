import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import Helmet from 'soapbox/components/helmet';

import { Card, CardBody, CardHeader, CardTitle } from '../card/card';

interface IColumn extends RouteComponentProps {
  backHref?: string,
  label?: string,
  transparent?: boolean,
  withHeader?: boolean,
}

const Column: React.FC<IColumn> = React.forwardRef((props, ref: React.ForwardedRef<HTMLDivElement>): JSX.Element => {
  const { backHref, children, label, history, transparent = false, withHeader = true } = props;

  const handleBackClick = () => {
    if (backHref) {
      history.push(backHref);
      return;
    }

    if (history.length === 1) {
      history.push('/');
    } else {
      history.goBack();
    }
  };

  const renderChildren = () => {
    if (transparent) {
      return <div className='bg-white sm:bg-transparent'>{children}</div>;
    }

    return (
      <Card variant='rounded'>
        {withHeader ? (
          <CardHeader onBackClick={handleBackClick}>
            <CardTitle title={label} />
          </CardHeader>
        ) : null}

        <CardBody>
          {children}
        </CardBody>
      </Card>
    );
  };

  return (
    <div role='region' ref={ref} aria-label={label} column-type={transparent ? 'transparent' : 'filled'}>
      <Helmet><title>{label}</title></Helmet>

      {renderChildren()}
    </div>
  );
});

export default withRouter(Column);
