"""
Team and competition models for HANU-YOUTH platform
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import datetime

class Team(Base):
    """Team model"""
    
    __tablename__ = "teams"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    tagline = Column(String, nullable=True)
    
    # Team settings
    is_private = Column(Boolean, default=False)
    max_members = Column(Integer, default=10)
    require_approval = Column(Boolean, default=True)
    
    # Team stats
    total_xp = Column(Integer, default=0)
    total_coins = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    # Branding
    logo_url = Column(String, nullable=True)
    banner_url = Column(String, nullable=True)
    primary_color = Column(String, default="#8B5CF6")
    secondary_color = Column(String, default="#06B6D4")
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    members = relationship("TeamMember", back_populates="team")
    competitions = relationship("TeamCompetition", back_populates="team")
    achievements = relationship("TeamAchievement", back_populates="team")
    
    def __repr__(self):
        return f"<Team(id={self.id}, name={self.name}, level={self.level})>"

class TeamMember(Base):
    """Team member model"""
    
    __tablename__ = "team_members"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    
    # Member role
    role = Column(String, default="member")  # leader, co_leader, member, invitee
    permissions = Column(JSON, default=[])  # Custom permissions
    
    # Member stats
    xp_contribution = Column(Integer, default=0)
    coins_contribution = Column(Integer, default=0)
    
    # Status
    is_active = Column(Boolean, default=True)
    joined_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="team_memberships")
    team = relationship("Team", back_populates="members")
    
    def __repr__(self):
        return f"<TeamMember(user_id={self.user_id}, team_id={self.team_id}, role={self.role})>"

class Competition(Base):
    """Competition model"""
    
    __tablename__ = "competitions"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    competition_type = Column(String, nullable=False)  # hackathon, quiz, innovation, coding
    
    # Competition settings
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    max_participants = Column(Integer, default=100)
    is_team_based = Column(Boolean, default=False)
    max_team_size = Column(Integer, default=5)
    
    # Competition rules
    rules = Column(JSON, default=[])
    judging_criteria = Column(JSON, default=[])
    
    # Prizes
    prize_pool = Column(JSON, default=[])
    xp_rewards = Column(JSON, default=[])
    badge_rewards = Column(JSON, default=[])
    
    # Status
    status = Column(String, default="upcoming")  # upcoming, ongoing, completed, cancelled
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    participants = relationship("CompetitionParticipant", back_populates="competition")
    team_competitions = relationship("TeamCompetition", back_populates="competition")
    
    def __repr__(self):
        return f"<Competition(id={self.id}, title={self.title}, type={self.competition_type})>"

class CompetitionParticipant(Base):
    """Competition participant model"""
    
    __tablename__ = "competition_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    competition_id = Column(Integer, ForeignKey("competitions.id"), nullable=False)
    
    # Participant stats
    score = Column(Float, default=0.0)
    rank = Column(Integer, default=0)
    submissions_count = Column(Integer, default=0)
    
    # Status
    status = Column(String, default="registered")  # registered, participating, completed, disqualified
    
    # Timestamps
    registered_at = Column(DateTime, default=func.now())
    last_activity = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User")
    competition = relationship("Competition", back_populates="participants")
    
    def __repr__(self):
        return f"<CompetitionParticipant(user_id={self.user_id}, competition_id={self.competition_id}, score={self.score})>"

class TeamCompetition(Base):
    """Team competition model"""
    
    __tablename__ = "team_competitions"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    competition_id = Column(Integer, ForeignKey("competitions.id"), nullable=False)
    
    # Team stats
    score = Column(Float, default=0.0)
    rank = Column(Integer, default=0)
    submissions_count = Column(Integer, default=0)
    
    # Status
    status = Column(String, default="registered")  # registered, participating, completed, disqualified
    
    # Timestamps
    registered_at = Column(DateTime, default=func.now())
    last_activity = Column(DateTime, default=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="competitions")
    competition = relationship("Competition", back_populates="team_competitions")
    
    def __repr__(self):
        return f"<TeamCompetition(team_id={self.team_id}, competition_id={self.competition_id}, score={self.score})>"

class TeamAchievement(Base):
    """Team achievement model"""
    
    __tablename__ = "team_achievements"
    
    id = Column(Integer, primary_key=True, index=True)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)
    achievement_name = Column(String, nullable=False)
    achievement_description = Column(Text, nullable=False)
    icon = Column(String, nullable=False)
    
    # Achievement details
    achievement_type = Column(String, nullable=False)  # milestone, competition, collaboration
    rarity = Column(String, default="common")  # common, rare, epic, legendary
    
    # Rewards
    xp_reward = Column(Integer, default=1000)
    coin_reward = Column(Integer, default=500)
    
    # Timestamps
    unlocked_at = Column(DateTime, default=func.now())
    
    # Relationships
    team = relationship("Team", back_populates="achievements")
    
    def __repr__(self):
        return f"<TeamAchievement(team_id={self.team_id}, achievement_name={self.achievement_name})>"

class Leaderboard(Base):
    """Leaderboard model"""
    
    __tablename__ = "leaderboards"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    leaderboard_type = Column(String, nullable=False)  # global, country, category, competition
    
    # Leaderboard settings
    time_frame = Column(String, default="all_time")  # daily, weekly, monthly, all_time
    category = Column(String, nullable=True)  # xp, coins, innovations, quizzes
    country_filter = Column(String, nullable=True)
    
    # Refresh settings
    refresh_interval = Column(Integer, default=3600)  # Refresh every hour
    last_refreshed = Column(DateTime, default=func.now())
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    entries = relationship("LeaderboardEntry", back_populates="leaderboard")
    
    def __repr__(self):
        return f"<Leaderboard(id={self.id}, name={self.name}, type={self.leaderboard_type})>"

class LeaderboardEntry(Base):
    """Leaderboard entry model"""
    
    __tablename__ = "leaderboard_entries"
    
    id = Column(Integer, primary_key=True, index=True)
    leaderboard_id = Column(Integer, ForeignKey("leaderboards.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Entry details
    rank = Column(Integer, default=0)
    score = Column(Float, default=0.0)
    value = Column(Float, default=0.0)  # The actual value being ranked (xp, coins, etc.)
    
    # Metadata
    metadata = Column(JSON, default={})  # Additional data like country, team, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    leaderboard = relationship("Leaderboard", back_populates="entries")
    user = relationship("User")
    
    def __repr__(self):
        return f"<LeaderboardEntry(leaderboard_id={self.leaderboard_id}, user_id={self.user_id}, rank={self.rank})>"