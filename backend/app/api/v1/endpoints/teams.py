"""
Teams and competition endpoints for HANU-YOUTH platform
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.core.database import get_db
from app.models import (
    User, Team, TeamMember, Competition, CompetitionParticipant,
    TeamCompetition, Leaderboard, LeaderboardEntry
)
from app.api.v1.endpoints.auth import get_current_user
from pydantic import BaseModel

router = APIRouter()

class TeamCreate(BaseModel):
    """Team creation model"""
    name: str
    description: Optional[str] = None
    tagline: Optional[str] = None
    is_private: bool = False
    max_members: int = 10
    require_approval: bool = True
    primary_color: str = "#8B5CF6"
    secondary_color: str = "#06B6D4"

class TeamResponse(BaseModel):
    """Team response model"""
    id: int
    name: str
    description: Optional[str]
    tagline: Optional[str]
    is_private: bool
    max_members: int
    require_approval: bool
    level: int
    total_xp: int
    total_coins: int
    logo_url: Optional[str]
    banner_url: Optional[str]
    primary_color: str
    secondary_color: str
    member_count: int
    user_role: Optional[str]
    is_member: bool

class CompetitionResponse(BaseModel):
    """Competition response model"""
    id: int
    title: str
    description: str
    competition_type: str
    start_time: datetime
    end_time: datetime
    max_participants: int
    is_team_based: bool
    max_team_size: int
    status: str
    prize_pool: dict
    is_registered: bool
    participant_count: int

class LeaderboardResponse(BaseModel):
    """Leaderboard response model"""
    id: int
    name: str
    description: Optional[str]
    leaderboard_type: str
    time_frame: str
    category: Optional[str]
    last_refreshed: datetime
    entries: List[dict]

@router.post("/teams", response_model=TeamResponse)
async def create_team(
    team_data: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new team"""
    # Check if user is already in a team
    existing_membership = db.query(TeamMember).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.is_active == True
    ).first()
    
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of a team"
        )
    
    # Create team
    team = Team(
        name=team_data.name,
        description=team_data.description,
        tagline=team_data.tagline,
        is_private=team_data.is_private,
        max_members=team_data.max_members,
        require_approval=team_data.require_approval,
        primary_color=team_data.primary_color,
        secondary_color=team_data.secondary_color
    )
    
    db.add(team)
    db.commit()
    db.refresh(team)
    
    # Add user as team leader
    team_member = TeamMember(
        user_id=current_user.id,
        team_id=team.id,
        role="leader",
        permissions=["manage_team", "invite_members", "kick_members", "edit_team"]
    )
    
    db.add(team_member)
    db.commit()
    
    return TeamResponse(
        id=team.id,
        name=team.name,
        description=team.description,
        tagline=team.tagline,
        is_private=team.is_private,
        max_members=team.max_members,
        require_approval=team.require_approval,
        level=team.level,
        total_xp=team.total_xp,
        total_coins=team.total_coins,
        logo_url=team.logo_url,
        banner_url=team.banner_url,
        primary_color=team.primary_color,
        secondary_color=team.secondary_color,
        member_count=1,
        user_role="leader",
        is_member=True
    )

@router.get("/teams", response_model=List[TeamResponse])
async def get_teams(
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available teams"""
    query = db.query(Team)
    
    if search:
        query = query.filter(Team.name.contains(search))
    
    teams = query.all()
    
    result = []
    for team in teams:
        # Get member count
        member_count = db.query(TeamMember).filter(
            TeamMember.team_id == team.id,
            TeamMember.is_active == True
        ).count()
        
        # Check if user is a member
        user_membership = db.query(TeamMember).filter(
            TeamMember.user_id == current_user.id,
            TeamMember.team_id == team.id,
            TeamMember.is_active == True
        ).first()
        
        result.append(TeamResponse(
            id=team.id,
            name=team.name,
            description=team.description,
            tagline=team.tagline,
            is_private=team.is_private,
            max_members=team.max_members,
            require_approval=team.require_approval,
            level=team.level,
            total_xp=team.total_xp,
            total_coins=team.total_coins,
            logo_url=team.logo_url,
            banner_url=team.banner_url,
            primary_color=team.primary_color,
            secondary_color=team.secondary_color,
            member_count=member_count,
            user_role=user_membership.role if user_membership else None,
            is_member=user_membership is not None
        ))
    
    return result

@router.get("/teams/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get team details"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Get member count
    member_count = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.is_active == True
    ).count()
    
    # Check if user is a member
    user_membership = db.query(TeamMember).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.team_id == team.id,
        TeamMember.is_active == True
    ).first()
    
    return TeamResponse(
        id=team.id,
        name=team.name,
        description=team.description,
        tagline=team.tagline,
        is_private=team.is_private,
        max_members=team.max_members,
        require_approval=team.require_approval,
        level=team.level,
        total_xp=team.total_xp,
        total_coins=team.total_coins,
        logo_url=team.logo_url,
        banner_url=team.banner_url,
        primary_color=team.primary_color,
        secondary_color=team.secondary_color,
        member_count=member_count,
        user_role=user_membership.role if user_membership else None,
        is_member=user_membership is not None
    )

@router.post("/teams/{team_id}/join")
async def join_team(
    team_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Join a team"""
    team = db.query(Team).filter(Team.id == team_id).first()
    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found"
        )
    
    # Check if user is already in a team
    existing_membership = db.query(TeamMember).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.is_active == True
    ).first()
    
    if existing_membership:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already a member of a team"
        )
    
    # Check if team is full
    member_count = db.query(TeamMember).filter(
        TeamMember.team_id == team.id,
        TeamMember.is_active == True
    ).count()
    
    if member_count >= team.max_members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Team is full"
        )
    
    # Check if user already has a pending request
    existing_request = db.query(TeamMember).filter(
        TeamMember.user_id == current_user.id,
        TeamMember.team_id == team.id,
        TeamMember.role == "invitee"
    ).first()
    
    if existing_request:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already have a pending request to join this team"
        )
    
    # Create team membership
    if team.require_approval:
        # Pending approval
        team_member = TeamMember(
            user_id=current_user.id,
            team_id=team.id,
            role="invitee"
        )
        message = "Join request sent successfully"
    else:
        # Auto-join
        team_member = TeamMember(
            user_id=current_user.id,
            team_id=team.id,
            role="member"
        )
        message = "Joined team successfully"
    
    db.add(team_member)
    db.commit()
    
    return {"message": message}

@router.get("/competitions", response_model=List[CompetitionResponse])
async def get_competitions(
    competition_type: Optional[str] = None,
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get available competitions"""
    query = db.query(Competition)
    
    if competition_type:
        query = query.filter(Competition.competition_type == competition_type)
    if status:
        query = query.filter(Competition.status == status)
    
    competitions = query.all()
    
    result = []
    for competition in competitions:
        # Check if user is registered
        user_participation = db.query(CompetitionParticipant).filter(
            CompetitionParticipant.user_id == current_user.id,
            CompetitionParticipant.competition_id == competition.id
        ).first()
        
        # Get participant count
        participant_count = db.query(CompetitionParticipant).filter(
            CompetitionParticipant.competition_id == competition.id
        ).count()
        
        result.append(CompetitionResponse(
            id=competition.id,
            title=competition.title,
            description=competition.description,
            competition_type=competition.competition_type,
            start_time=competition.start_time,
            end_time=competition.end_time,
            max_participants=competition.max_participants,
            is_team_based=competition.is_team_based,
            max_team_size=competition.max_team_size,
            status=competition.status,
            prize_pool=competition.prize_pool,
            is_registered=user_participation is not None,
            participant_count=participant_count
        ))
    
    return result

@router.post("/competitions/{competition_id}/register")
async def register_for_competition(
    competition_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Register for a competition"""
    competition = db.query(Competition).filter(Competition.id == competition_id).first()
    if not competition:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Competition not found"
        )
    
    # Check if competition is still open for registration
    if competition.status != "upcoming":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Competition is not open for registration"
        )
    
    # Check if user is already registered
    existing_registration = db.query(CompetitionParticipant).filter(
        CompetitionParticipant.user_id == current_user.id,
        CompetitionParticipant.competition_id == competition_id
    ).first()
    
    if existing_registration:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already registered for this competition"
        )
    
    # Check if competition is full
    participant_count = db.query(CompetitionParticipant).filter(
        CompetitionParticipant.competition_id == competition_id
    ).count()
    
    if participant_count >= competition.max_participants:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Competition is full"
        )
    
    # Create registration
    participant = CompetitionParticipant(
        user_id=current_user.id,
        competition_id=competition_id,
        status="registered"
    )
    
    db.add(participant)
    db.commit()
    
    return {"message": "Registered for competition successfully"}

@router.get("/leaderboards", response_model=List[LeaderboardResponse])
async def get_leaderboards(
    leaderboard_type: Optional[str] = None,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get leaderboards"""
    query = db.query(Leaderboard).filter(Leaderboard.is_active == True)
    
    if leaderboard_type:
        query = query.filter(Leaderboard.leaderboard_type == leaderboard_type)
    if category:
        query = query.filter(Leaderboard.category == category)
    
    leaderboards = query.all()
    
    result = []
    for leaderboard in leaderboards:
        # Get leaderboard entries
        entries = db.query(LeaderboardEntry).filter(
            LeaderboardEntry.leaderboard_id == leaderboard.id
        ).order_by(LeaderboardEntry.rank).limit(10).all()
        
        entry_data = []
        for entry in entries:
            entry_data.append({
                "rank": entry.rank,
                "user_id": entry.user_id,
                "username": entry.user.username,
                "score": entry.score,
                "value": entry.value,
                "country": entry.user.country,
                "level": entry.user.level
            })
        
        result.append(LeaderboardResponse(
            id=leaderboard.id,
            name=leaderboard.name,
            description=leaderboard.description,
            leaderboard_type=leaderboard.leaderboard_type,
            time_frame=leaderboard.time_frame,
            category=leaderboard.category,
            last_refreshed=leaderboard.last_refreshed,
            entries=entry_data
        ))
    
    return result

@router.get("/leaderboards/{leaderboard_id}")
async def get_leaderboard_details(
    leaderboard_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed leaderboard with user's position"""
    leaderboard = db.query(Leaderboard).filter(Leaderboard.id == leaderboard_id).first()
    if not leaderboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Leaderboard not found"
        )
    
    # Get all entries
    entries = db.query(LeaderboardEntry).filter(
        LeaderboardEntry.leaderboard_id == leaderboard_id
    ).order_by(LeaderboardEntry.rank).all()
    
    # Find user's position
    user_entry = None
    for entry in entries:
        if entry.user_id == current_user.id:
            user_entry = entry
            break
    
    # Format entries
    entry_data = []
    for entry in entries:
        entry_data.append({
            "rank": entry.rank,
            "user_id": entry.user_id,
            "username": entry.user.username,
            "score": entry.score,
            "value": entry.value,
            "country": entry.user.country,
            "level": entry.user.level,
            "is_current_user": entry.user_id == current_user.id
        })
    
    return {
        "leaderboard": {
            "id": leaderboard.id,
            "name": leaderboard.name,
            "description": leaderboard.description,
            "type": leaderboard.leaderboard_type,
            "time_frame": leaderboard.time_frame,
            "category": leaderboard.category
        },
        "entries": entry_data,
        "user_position": {
            "rank": user_entry.rank if user_entry else None,
            "score": user_entry.score if user_entry else None,
            "value": user_entry.value if user_entry else None
        }
    }