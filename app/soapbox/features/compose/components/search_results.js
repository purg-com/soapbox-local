import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import ImmutablePropTypes from 'react-immutable-proptypes';
import AccountContainer from '../../../containers/account_container';
import StatusContainer from '../../../containers/status_container';
import ImmutablePureComponent from 'react-immutable-pure-component';
import Hashtag from '../../../components/hashtag';
import FilterBar from '../../search/components/filter_bar';
import BundleContainer from 'soapbox/features/ui/containers/bundle_container';
import { WhoToFollowPanel } from 'soapbox/features/ui/util/async-components';
import ScrollableList from 'soapbox/components/scrollable_list';
import PlaceholderAccount from 'soapbox/features/placeholder/components/placeholder_account';
import PlaceholderHashtag from 'soapbox/features/placeholder/components/placeholder_hashtag';
import PlaceholderStatus from 'soapbox/features/placeholder/components/placeholder_status';

export default class SearchResults extends ImmutablePureComponent {

  static propTypes = {
    value: PropTypes.string,
    results: ImmutablePropTypes.map.isRequired,
    submitted: PropTypes.bool,
    expandSearch: PropTypes.func.isRequired,
    selectedFilter: PropTypes.string.isRequired,
    selectFilter: PropTypes.func.isRequired,
    features: PropTypes.object.isRequired,
  };

  handleLoadMore = () => this.props.expandSearch(this.props.selectedFilter);

  handleSelectFilter = newActiveFilter => this.props.selectFilter(newActiveFilter);

  render() {
    const { value, results, submitted, selectedFilter, features } = this.props;

    if (!submitted && features.suggestions && results.isEmpty()) {
      return (
        <BundleContainer fetchComponent={WhoToFollowPanel}>
          {Component => <Component limit={5} />}
        </BundleContainer>
      );
    }

    let searchResults;
    let hasMore = false;
    let loaded;
    let noResultsMessage;
    let placeholderComponent = PlaceholderStatus;

    if (selectedFilter === 'accounts' && results.get('accounts')) {
      hasMore = results.get('accountsHasMore');
      loaded = results.get('accountsLoaded');
      placeholderComponent = PlaceholderAccount;

      if (results.get('accounts').size > 0) {
        searchResults = results.get('accounts').map(accountId => <AccountContainer key={accountId} id={accountId} />);
      } else {
        noResultsMessage = (
          <div className='empty-column-indicator'>
            <FormattedMessage
              id='empty_column.search.accounts'
              defaultMessage='There are no people results for "{term}"'
              values={{ term: value }}
            />
          </div>
        );
      }
    }

    if (selectedFilter === 'statuses' && results.get('statuses')) {
      hasMore = results.get('statusesHasMore');
      loaded = results.get('statusesLoaded');

      if (results.get('statuses').size > 0) {
        searchResults = results.get('statuses').map(statusId => <StatusContainer key={statusId} id={statusId} />);
      } else {
        noResultsMessage = (
          <div className='empty-column-indicator'>
            <FormattedMessage
              id='empty_column.search.statuses'
              defaultMessage='There are no posts results for "{term}"'
              values={{ term: value }}
            />
          </div>
        );
      }
    }

    if (selectedFilter === 'hashtags' && results.get('hashtags')) {
      hasMore = results.get('hashtagsHasMore');
      loaded = results.get('hashtagsLoaded');
      placeholderComponent = PlaceholderHashtag;

      if (results.get('hashtags').size > 0) {
        searchResults = results.get('hashtags').map(hashtag => <Hashtag key={hashtag.get('name')} hashtag={hashtag} />);
      } else {
        noResultsMessage = (
          <div className='empty-column-indicator'>
            <FormattedMessage
              id='empty_column.search.hashtags'
              defaultMessage='There are no hashtags results for "{term}"'
              values={{ term: value }}
            />
          </div>
        );
      }
    }

    return (
      <>
        {submitted && <FilterBar selectedFilter={submitted ? selectedFilter : null} selectFilter={this.handleSelectFilter} />}

        {noResultsMessage || (
          <ScrollableList
            key={selectedFilter}
            scrollKey={`${selectedFilter}:${value}`}
            isLoading={submitted && !loaded}
            showLoading={submitted && !loaded && results.isEmpty()}
            hasMore={hasMore}
            onLoadMore={this.handleLoadMore}
            placeholderComponent={placeholderComponent}
            placeholderCount={20}
          >
            {searchResults}
          </ScrollableList>
        )}
      </>
    );
  }

}
