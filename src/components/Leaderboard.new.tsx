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
  region: string;
  avatarUrl: string;
  level: number;
  xp: number;
  coins: number;
  gems: number;
  dailyStreak: number;
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

const SORT_OPTIONS = [
  { value: 'rank', label: 'Rank' },
  { value: 'xp', label: 'XP' },
  { value: 'level', label: 'Level' },
  { value: 'dailyStreak', label: 'Daily Streak' },
  { value: 'achievementCount', label: 'Achievements' },
];

const ITEMS_PER_PAGE = 10;

// Mock data - Replace with real API call
const MOCK_DATA: Record<RankType, LeaderboardUser[]> = {
  global: Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    rank: i + 1,
    username: `user${i + 1}`,
    fullName: `User ${i + 1}`,
    country: ['US', 'IN', 'UK', 'JP', 'DE', 'FR', 'BR', 'CA', 'AU', 'SG'][i % 10],
    region: ['NA', 'EU', 'APAC', 'LATAM', 'MEA'][i % 5],
    avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
    level: Math.floor(Math.random() * 100) + 1,
    xp: 10000 - (i * 50) + Math.floor(Math.random() * 100),
    coins: Math.floor(Math.random() * 1000),
    gems: Math.floor(Math.random() * 100),
    dailyStreak: Math.floor(Math.random() * 30) + 1,
    achievementCount: Math.floor(Math.random() * 50),
    change: ['up', 'down', 'same', 'new'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'same' | 'new',
  })),
  country: Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    rank: i + 1,
    username: `user${i + 1}`,
    fullName: `User ${i + 1}`,
    country: 'US',
    region: ['NA', 'EU', 'APAC', 'LATAM', 'MEA'][i % 5],
    avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
    level: Math.floor(Math.random() * 100) + 1,
    xp: 5000 - (i * 25) + Math.floor(Math.random() * 50),
    coins: Math.floor(Math.random() * 1000),
    gems: Math.floor(Math.random() * 100),
    dailyStreak: Math.floor(Math.random() * 30) + 1,
    achievementCount: Math.floor(Math.random() * 50),
    change: ['up', 'down', 'same', 'new'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'same' | 'new',
  })),
  regional: Array.from({ length: 50 }, (_, i) => ({
    id: `user-${i + 1}`,
    rank: i + 1,
    username: `user${i + 1}`,
    fullName: `User ${i + 1}`,
    country: ['US', 'IN', 'UK', 'JP', 'DE', 'FR', 'BR', 'CA', 'AU', 'SG'][i % 10],
    region: 'NA',
    avatarUrl: `https://i.pravatar.cc/150?u=${i}`,
    level: Math.floor(Math.random() * 100) + 1,
    xp: 3000 - (i * 15) + Math.floor(Math.random() * 30),
    coins: Math.floor(Math.random() * 1000),
    gems: Math.floor(Math.random() * 100),
    dailyStreak: Math.floor(Math.random() * 30) + 1,
    achievementCount: Math.floor(Math.random() * 50),
    change: ['up', 'down', 'same', 'new'][Math.floor(Math.random() * 4)] as 'up' | 'down' | 'same' | 'new',
  })),
};

const getChangeBadge = (change?: string) => {
  if (!change) return null;
  
  const badgeProps = {
    up: { type: 'success' as const, content: '↑ Up' },
    down: { type: 'error' as const, content: '↓ Down' },
    same: { type: 'inverted' as const, content: '→ Same' },
    new: { type: 'info' as const, content: 'New' },
  }[change];

  return <Badge {...badgeProps} />;
};

export default function Leaderboard() {
  const [activeTab, setActiveTab] = useState<RankType>('global');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [filterText, setFilterText] = useState('');
  const [sortBy, setSortBy] = useState('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardResponse>({
    leaderboard: [],
    pagination: {
      total: 0,
      limit: ITEMS_PER_PAGE,
      offset: 0,
      hasMore: false,
    },
  });

  // Simulate API call
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Sort and filter mock data
        const filtered = MOCK_DATA[activeTab]
          .filter(user => 
            user.fullName.toLowerCase().includes(filterText.toLowerCase()) ||
            user.username.toLowerCase().includes(filterText.toLowerCase()) ||
            user.country.toLowerCase().includes(filterText.toLowerCase())
          )
          .sort((a, b) => {
            const aValue = a[sortBy as keyof LeaderboardUser];
            const bValue = b[sortBy as keyof LeaderboardUser];
            
            if (aValue === undefined || bValue === undefined) return 0;
            
            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
          });
        
        const paginated = filtered.slice(
          (currentPageIndex - 1) * ITEMS_PER_PAGE,
          currentPageIndex * ITEMS_PER_PAGE
        );
        
        setLeaderboardData({
          leaderboard: paginated,
          pagination: {
            total: filtered.length,
            limit: ITEMS_PER_PAGE,
            offset: (currentPageIndex - 1) * ITEMS_PER_PAGE,
            hasMore: currentPageIndex * ITEMS_PER_PAGE < filtered.length,
          },
        });
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [activeTab, currentPageIndex, filterText, sortBy, sortDirection]);

  const handleSort = (columnId: string) => {
    if (sortBy === columnId) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnId);
      setSortDirection('desc');
    }
    setCurrentPageIndex(1);
  };

  if (isLoading) {
    return (
      <Container>
        <Spinner size="large" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <StatusIndicator type="error">{error}</StatusIndicator>
      </Container>
    );
  }

  return (
    <Container header={<Header variant="h1">Leaderboard</Header>}>
      <Tabs
        activeTabId={activeTab}
        onChange={({ detail }) => {
          setActiveTab(detail.activeTabId as RankType);
          setCurrentPageIndex(1);
        }}
        tabs={[
          { id: 'global', label: 'Global Ranking' },
          { id: 'country', label: 'Country Ranking' },
          { id: 'regional', label: 'Regional Ranking' },
        ]}
      />
      
      <SpaceBetween size="m">
        <TextFilter
          filteringText={filterText}
          filteringPlaceholder="Search by name or country"
          filteringAriaLabel="Filter leaderboard"
          onChange={({ detail }) => {
            setFilterText(detail.filteringText);
            setCurrentPageIndex(1);
          }}
          countText={`${leaderboardData.pagination.total} ${leaderboardData.pagination.total === 1 ? 'user' : 'users'}`}
        />
        
        <Select
          selectedOption={SORT_OPTIONS.find(opt => opt.value === sortBy) || SORT_OPTIONS[0]}
          onChange={({ detail }) => {
            setSortBy(detail.selectedOption.value || 'rank');
            setCurrentPageIndex(1);
          }}
          options={SORT_OPTIONS}
          selectedAriaLabel="Selected sort option"
          placeholder="Sort by"
        />
        
        <Table
          columnDefinitions={[
            {
              id: 'rank',
              header: 'Rank',
              cell: item => `#${item.rank}`,
              width: 80,
              isRowHeader: true,
              sortingField: 'rank',
            },
            {
              id: 'user',
              header: 'User',
              cell: item => (
                <div className="flex items-center">
                  <img 
                    src={item.avatarUrl} 
                    alt={item.fullName} 
                    className="w-8 h-8 rounded-full mr-3"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40';
                    }}
                  />
                  <div>
                    <div className="font-medium">{item.fullName}</div>
                    <div className="text-sm text-gray-500">@{item.username}</div>
                  </div>
                </div>
              ),
              minWidth: 200,
            },
            {
              id: 'level',
              header: 'Level',
              cell: item => `Lv. ${item.level}`,
              width: 100,
              sortingField: 'level',
            },
            {
              id: 'xp',
              header: 'XP',
              cell: item => item.xp.toLocaleString(),
              width: 120,
              sortingField: 'xp',
            },
            {
              id: 'streak',
              header: 'Streak',
              cell: item => `${item.dailyStreak} days`,
              width: 120,
              sortingField: 'dailyStreak',
            },
            {
              id: 'achievements',
              header: 'Achievements',
              cell: item => item.achievementCount,
              width: 120,
              sortingField: 'achievementCount',
            },
            {
              id: 'change',
              header: 'Change',
              cell: item => getChangeBadge(item.change),
              width: 100,
            },
          ]}
          items={leaderboardData.leaderboard}
          loadingText="Loading leaderboard..."
          empty={
            <Box textAlign="center" color="inherit">
              <SpaceBetween size="m">
                <b>No users found</b>
                <Box variant="p" color="text-body-secondary">
                  No users match your search criteria.
                </Box>
              </SpaceBetween>
            </Box>
          }
          header={
            <Header
              counter={`(${leaderboardData.pagination.total} ${leaderboardData.pagination.total === 1 ? 'user' : 'users'})`}
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
              pagesCount={Math.ceil(leaderboardData.pagination.total / ITEMS_PER_PAGE)}
              ariaLabels={{
                nextPageLabel: 'Next page',
                previousPageLabel: 'Previous page',
                pageLabel: pageNumber => `Page ${pageNumber}`,
              }}
            />
          }
          sortingColumn={{
            sortingField: sortBy,
            sortingDescending: sortDirection === 'desc',
          }}
          onSortingChange={({ detail }) => {
            setSortBy(detail.sortingColumn.sortingField || 'rank');
            setSortDirection(detail.isDescending ? 'desc' : 'asc');
          }}
        />
      </SpaceBetween>
    </Container>
  );
}
