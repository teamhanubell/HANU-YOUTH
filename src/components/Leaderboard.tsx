'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Header, 
  Table, 
  Pagination, 
  Container, 
  Tabs, 
  SpaceBetween,
  Badge,
  TextFilter,
  Spinner,
  StatusIndicator,
  Select
} from '@cloudscape-design/components';
import '@cloudscape-design/global-styles/index.css';

type RankType = 'global' | 'country' | 'regional';
type SortDirection = 'asc' | 'desc';

interface LeaderboardUser {
  id: string;
  rank: number;
  username: string;
  fullName: string;
  country: string;
  avatarUrl: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  dailyStreak: number;
  totalSearches: number;
  totalQuizzes: number;
  totalInnovations: number;
  achievementCount: number;
  change?: 'up' | 'down' | 'same' | 'new';
}

interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  userRank?: number;
}

interface UserRank {
  id: string;
  rank: number;
  name: string;
  country: string;
  region: string;
  score: number;
  change?: 'up' | 'down' | 'same' | 'new';
}

const SORT_OPTIONS = [
  { value: 'rank', label: 'Rank' },
  { value: 'xp', label: 'XP' },
  { value: 'level', label: 'Level' },
  { value: 'dailyStreak', label: 'Daily Streak' },
  { value: 'totalSearches', label: 'Total Searches' },
  { value: 'totalQuizzes', label: 'Quizzes Taken' },
  { value: 'totalInnovations', label: 'Innovations' },
  { value: 'achievementCount', label: 'Achievements' },
];

const ITEMS_PER_PAGE = 10;

// Mock data - Replace with real data from your API
const MOCK_DATA: Record<RankType, UserRank[]> = {
  global: Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    rank: i + 1,
    name: `User ${i + 1}`,
    country: ['US', 'IN', 'UK', 'JP', 'DE', 'FR', 'BR', 'CA', 'AU', 'SG'][i % 10],
    region: ['NA', 'EU', 'APAC', 'LATAM', 'MEA'][i % 5],
    score: 10000 - (i * 50) + Math.floor(Math.random() * 100),
    change: ['up', 'down', 'same', 'new'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'same' | 'new',
  })),
  country: Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    rank: i + 1,
    name: `User ${i + 1}`,
    country: 'US', // Default country, will be filtered
    region: ['NA', 'EU', 'APAC', 'LATAM', 'MEA'][i % 5],
    score: 5000 - (i * 25) + Math.floor(Math.random() * 50),
    change: ['up', 'down', 'same', 'new'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'same' | 'new',
  })),
  regional: Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    rank: i + 1,
    name: `User ${i + 1}`,
    country: ['US', 'IN', 'UK', 'JP', 'DE', 'FR', 'BR', 'CA', 'AU', 'SG'][i % 10],
    region: 'NA', // Default region, will be filtered
    score: 3000 - (i * 15) + Math.floor(Math.random() * 30),
    change: ['up', 'down', 'same', 'new'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'same' | 'new',
  })),
};

const getChangeBadge = (change?: string) => {
  if (!change) return null;
  
  const badgeProps = {
    up: { color: 'green' as const, children: '↑ Up' },
    down: { color: 'red' as const, children: '↓ Down' },
    same: { color: 'grey' as const, children: '→ Same' },
    new: { color: 'blue' as const, children: 'New' },
  }[change];

  return <Badge {...badgeProps} />;
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<RankType>('global');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [filterText, setFilterText] = useState('');
  
  const itemsPerPage = 10;
  const filteredItems = MOCK_DATA[activeTab]
    .filter(item => 
      item.name.toLowerCase().includes(filterText.toLowerCase()) ||
      item.country.toLowerCase().includes(filterText.toLowerCase())
    );
  
  const paginatedItems = filteredItems.slice(
    (currentPageIndex - 1) * itemsPerPage,
    currentPageIndex * itemsPerPage
  );

  return (
    <Container header={<Header variant="h1">Leaderboard</Header>}>
      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => setActiveTab(detail.activeTabId as RankType)}
        tabs={[
          { id: 'global', label: 'Global Ranking' },
          { id: 'country', label: 'Country Ranking' },
          { id: 'regional', label: 'Regional Ranking' },
        ]}
      />
      
      <SpaceBetween size="m">
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder="Filter by name or country"
          filteringAriaLabel="Filter leaderboard"
          onChange={({ detail }) => setFilterText(detail.filteringText)}
          countText={`${filteredItems.length} ${filteredItems.length === 1 ? 'match' : 'matches'}`}
        />
        
        <Table
          columnDefinitions={[
            {
              id: 'rank',
              header: 'Rank',
              cell: item => item.rank,
              width: 80,
            },
            {
              id: 'name',
              header: 'Name',
              cell: item => item.name,
              width: 200,
            },
            {
              id: 'country',
              header: 'Country',
              cell: item => item.country,
              width: 120,
            },
            {
              id: 'region',
              header: 'Region',
              cell: item => item.region,
              width: 120,
            },
            {
              id: 'score',
              header: 'Score',
              cell: item => item.score.toLocaleString(),
              width: 120,
              isRowHeader: true,
            },
            {
              id: 'change',
              header: 'Change',
              cell: item => getChangeBadge(item.change),
              width: 100,
            },
          ]}
          items={paginatedItems}
          loadingText="Loading leaderboard..."
          empty={
            <Box textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No matches found</b>
                <Box variant="p" color="text-body-secondary">
                  No results match your query.
                </Box>
              </SpaceBetween>
            </Box>
          }
          header={
            <Header
              counter={`(${filteredItems.length} ${filteredItems.length === 1 ? 'user' : 'users'})`}
            >
              {activeTab === 'global' 
                ? 'Global Leaderboard' 
                : activeTab === 'country' 
                  ? 'Country Leaderboard' 
                  : 'Regional Leaderboard'}
            </Header>
          }
          pagination={
            <Pagination
              currentPageIndex={currentPageIndex}
              onChange={({ detail }) => setCurrentPageIndex(detail.currentPageIndex)}
              pagesCount={Math.ceil(filteredItems.length / itemsPerPage)}
              ariaLabels={{
                nextPageLabel: 'Next page',
                previousPageLabel: 'Previous page',
                pageLabel: pageNumber => `Page ${pageNumber}`,
              }}
            />
          }
        />
      </SpaceBetween>
    </Container>
  );
}
