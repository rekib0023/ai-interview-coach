"""Authentication service layer - handles OAuth and user management business logic."""

from typing import Optional, Tuple

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.modules.users import user_crud
from app.modules.users.models import User


class AuthService:
    """Service for authentication and user management operations."""

    def extract_google_user_info(
        self, user_info: dict
    ) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Extract and validate user information from Google OAuth token.

        Args:
            user_info: User info dict from Google OAuth token

        Returns:
            Tuple of (email, full_name, provider_id)

        Raises:
            ValueError: If issuer is invalid
        """
        # Validate issuer for security
        iss = user_info.get("iss")
        if iss not in ["https://accounts.google.com", "accounts.google.com"]:
            raise ValueError("Invalid Google issuer")

        email = user_info.get("email")
        full_name = user_info.get("name")
        provider_id = user_info.get("sub")

        return email, full_name, provider_id

    async def extract_github_user_info(
        self, client, token: dict, profile: dict
    ) -> Tuple[Optional[str], Optional[str], Optional[str]]:
        """
        Extract and validate user information from GitHub OAuth token.

        Args:
            client: OAuth client for GitHub API calls
            token: OAuth access token
            profile: GitHub user profile data

        Returns:
            Tuple of (email, full_name, provider_id)

        Raises:
            ValueError: If user identity validation fails or provider_id is missing
        """
        email = profile.get("email")
        full_name = profile.get("name")
        provider_id = str(profile.get("id"))

        # Revalidate user identity as recommended by GitHub
        user_validation_resp = await client.get(
            "https://api.github.com/user", token=token
        )
        if (
            user_validation_resp.status_code == 200
            and str(user_validation_resp.json().get("id")) != provider_id
        ):
            raise ValueError("User identity mismatch")

        # GitHub doesn't always provide email in the user profile
        # Need to fetch from the user/emails endpoint
        if not email:
            emails_resp = await client.get(
                "https://api.github.com/user/emails", token=token
            )
            if emails_resp.status_code == 200:
                emails = emails_resp.json()
                # Get primary and verified email as per GitHub recommendations
                for e in emails:
                    if e.get("primary") and e.get("verified"):
                        email = e.get("email")
                        break

                # If still no email, try to get any verified email
                if not email:
                    for e in emails:
                        if e.get("verified"):
                            email = e.get("email")
                            break

        # Validate that we got essential user information
        if not provider_id:
            raise ValueError("Missing GitHub provider ID")

        return email, full_name, provider_id

    def get_or_create_oauth_user(
        self,
        db: Session,
        *,
        email: str,
        full_name: Optional[str],
        provider: str,
        provider_id: str,
    ) -> User:
        """
        Get existing user by email or create new OAuth user.

        Handles:
        - User lookup by email
        - Provider ID conflict detection (user changed email on OAuth provider)
        - New user creation with OAuth credentials
        - Account linking validation

        Args:
            db: Database session
            email: User's email address
            full_name: User's full name (optional)
            provider: OAuth provider name ('google' or 'github')
            provider_id: Unique ID from OAuth provider

        Returns:
            User object (existing or newly created)

        Raises:
            HTTPException: If account conflicts or security issues are detected
        """
        # Check if user exists by email
        user = user_crud.get_by_email(db, email=email)

        if not user:
            # Check if user with this provider_id already exists (prevents duplicate accounts)
            existing_user = user_crud.get_by_provider_id(
                db, provider=provider, provider_id=provider_id
            )

            if existing_user:
                # User changed their email on GitHub/Google but same account
                existing_user.email = email
                existing_user.full_name = full_name or existing_user.full_name
                db.commit()
                db.refresh(existing_user)
                return existing_user
            else:
                # Create new user with OAuth info
                user = User(
                    email=email,
                    full_name=full_name or email.split("@")[0],  # Fallback name
                    hashed_password="",  # OAuth users don't have passwords
                    provider=provider,
                    provider_id=provider_id,
                    is_active=True,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                return user
        else:
            # User exists - validate and update provider info if needed
            return self._handle_existing_user(
                db,
                user=user,
                provider=provider,
                provider_id=provider_id,
                full_name=full_name,
            )

    def _handle_existing_user(
        self,
        db: Session,
        *,
        user: User,
        provider: str,
        provider_id: str,
        full_name: Optional[str],
    ) -> User:
        """
        Handle existing user OAuth login and account linking.

        Args:
            db: Database session
            user: Existing user object
            provider: OAuth provider name
            provider_id: Unique ID from OAuth provider
            full_name: User's full name (optional)

        Returns:
            Updated user object

        Raises:
            HTTPException: If account conflicts are detected
        """
        if user.provider and user.provider != provider:
            # User is trying to login with different OAuth provider
            raise HTTPException(
                status_code=400,
                detail=f"Account already exists with provider: {user.provider}",
            )
        elif not user.provider:
            # Link OAuth account to existing email/password account
            user.provider = provider
            user.provider_id = provider_id
            db.commit()
            db.refresh(user)
        elif user.provider_id != provider_id:
            # Same provider but different provider_id - suspicious
            raise HTTPException(
                status_code=400,
                detail="Provider ID mismatch - security verification failed",
            )
        else:
            # Update user info in case it changed on the OAuth provider
            user.full_name = full_name or user.full_name
            user.is_active = True  # Reactivate if was deactivated
            db.commit()
            db.refresh(user)

        return user


def get_auth_service() -> AuthService:
    """Dependency injection for AuthService."""
    return AuthService()
